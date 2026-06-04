import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://nissan.epc-data.com';

/**
 * Map chassis prefix → epc-data.com model path.
 * URL pattern: https://nissan.epc-data.com/{section}/{slug}/
 */
const CHASSIS_EPC: Record<string, string> = {
  BNR32:  'skyline/nissan_skyline-bnr32',
  HCR32:  'skyline/nissan_skyline-hcr32',
  HNR32:  'skyline/nissan_skyline-hnr32',
  HR32:   'skyline/nissan_skyline-hr32',
  ECR33:  'skyline/nissan_skyline-ecr33',
  HCR33:  'skyline/nissan_skyline-hcr33',
  BCNR33: 'skyline/nissan_skyline-bcnr33',
  HR34:   'skyline/nissan_skyline-hr34',
  ENR34:  'skyline/nissan_skyline-enr34',
  ER34:   'skyline/nissan_skyline-er34',
  BNR34:  'skyline/nissan_skyline-bnr34',
};

// ── In-memory cache (per serverless instance, 30 min TTL) ──────────────────
const _cache = new Map<string, { html: string; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000;

async function fetchHtml(url: string): Promise<string | null> {
  const hit = _cache.get(url);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.html;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
        Referer: BASE + '/',
      },
      // Next.js fetch cache: revalidate after 30 min
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    _cache.set(url, { html, ts: Date.now() });
    return html;
  } catch {
    return null;
  }
}

// ── HTML parsers ────────────────────────────────────────────────────────────

/** Extract all <a href="...">text</a> where href starts with a given prefix. */
function extractLinks(html: string, hrefPrefix: string) {
  const results: { href: string; text: string }[] = [];
  const re = /<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, ''));
    if (!text || href === hrefPrefix) continue;
    if (href.startsWith(hrefPrefix) && !results.find((r) => r.href === href)) {
      results.push({ href, text });
    }
  }
  return results;
}

/** Decode common HTML entities to plain text. */
function decodeEntities(str: string): string {
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parse the vehicle info table (key-value pairs in <td> cells). */
function parseInfoTable(html: string): Record<string, string> {
  const info: Record<string, string> = {};
  // Find all table rows
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowM: RegExpExecArray | null;
  while ((rowM = rowRe.exec(html)) !== null) {
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let cellM: RegExpExecArray | null;
    while ((cellM = cellRe.exec(rowM[1])) !== null) {
      const text = decodeEntities(cellM[1].replace(/<[^>]+>/g, ''));
      cells.push(text);
    }
    // Rows with 2+ cells: odd = label, even = value
    for (let i = 0; i + 1 < cells.length; i += 2) {
      const k = cells[i];
      const v = cells[i + 1];
      // Skip rows that are empty after decoding
      // Skip nav-list entries: sidebar menus have many space-separated tokens
      if (k && v && k.length < 60 && k !== v && v.trim().split(/\s+/).length <= 6) info[k] = v;
    }
  }
  return info;
}

/** Find the first meaningful diagram image in a page. */
function findDiagramImage(html: string): string | null {
  // EPC diagrams are commonly .gif files served from /img/
  const patterns = [
    /src="([^"]*\/img\/[^"]+\.gif)"/i,
    /src="([^"]*\/img\/[^"]+\.(?:jpg|png))"/i,
    /src="([^"]*diagram[^"]*\.(?:gif|jpg|png))"/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) {
      const src = m[1];
      return src.startsWith('http') ? src : `${BASE}${src}`;
    }
  }
  return null;
}

/** Parse a parts table: rows like [item#, partNumber, description, qty]. */
function parsePartsTable(html: string) {
  const parts: {
    item: string;
    partNumber: string;
    description: string;
    quantity: string;
  }[] = [];

  // Find all <table> blocks and look for the one with part numbers
  const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tbl: RegExpExecArray | null;
  while ((tbl = tableRe.exec(html)) !== null) {
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let row: RegExpExecArray | null;
    const rowBuf: string[][] = [];
    while ((row = rowRe.exec(tbl[1])) !== null) {
      const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let cell: RegExpExecArray | null;
      while ((cell = cellRe.exec(row[1])) !== null) {
        cells.push(cell[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
      }
      if (cells.length >= 3) rowBuf.push(cells);
    }
    // Heuristic: if rows have a numeric first col and part-number-like second col
    const validRows = rowBuf.filter(
      (r) => /^\d+$/.test(r[0]) && /\d{5}/.test(r[1]),
    );
    if (validRows.length > 0) {
      for (const r of validRows) {
        parts.push({
          item:        r[0],
          partNumber:  r[1],
          description: r[2] ?? '',
          quantity:    r[3] ?? '1',
        });
      }
      break; // found the parts table
    }
  }
  return parts;
}

/** Icon for each parts group. */
function groupIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('engine') || n.includes('fuel'))        return '⚙️';
  if (n.includes('body'))                                return '🚗';
  if (n.includes('chassis') || n.includes('suspension')) return '🔧';
  if (n.includes('transmission'))                        return '⚙️';
  if (n.includes('electr') || n.includes('wiring'))      return '⚡';
  if (n.includes('accessor'))                            return '🎛️';
  if (n.includes('brake'))                               return '🔴';
  if (n.includes('cooling'))                             return '❄️';
  if (n.includes('exhaust'))                             return '💨';
  return '📦';
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const sp      = request.nextUrl.searchParams;
  const type    = sp.get('type');
  const chassis = sp.get('chassis')?.toUpperCase().replace(/[-\s]/g, '');
  const path    = sp.get('path'); // relative epc-data.com path

  // ── type=groups  ─────────────────────────────────────────────────────────
  // Returns vehicle info table + parts groups list for a chassis prefix.
  if (type === 'groups' && chassis) {
    const epcSlug = CHASSIS_EPC[
      Object.keys(CHASSIS_EPC).find((k) => chassis.startsWith(k)) ?? ''
    ];
    if (!epcSlug) {
      return NextResponse.json(
        { error: 'Chassis not mapped to EPC catalog.' },
        { status: 404 },
      );
    }

    const modelPath = `/${epcSlug}/`;
    const url       = `${BASE}${modelPath}`;
    const html      = await fetchHtml(url);
    if (!html) {
      return NextResponse.json(
        { error: 'EPC catalog unreachable. Try again later.' },
        { status: 502 },
      );
    }

    const groups     = extractLinks(html, modelPath).map((l) => ({
      ...l,
      icon: groupIcon(l.text),
    }));
    const vehicleInfo = parseInfoTable(html);

    return NextResponse.json({ groups, vehicleInfo, sourceUrl: url });
  }

  // ── type=diagrams  ───────────────────────────────────────────────────────
  // Returns list of diagram sub-pages for a group path.
  if (type === 'diagrams' && path) {
    const url  = `${BASE}${path}`;
    const html = await fetchHtml(url);
    if (!html) {
      return NextResponse.json(
        { error: 'Group page unreachable.' },
        { status: 502 },
      );
    }
    const diagrams = extractLinks(html, path).map((l) => ({
      ...l,
      icon: '📐',
    }));
    return NextResponse.json({ diagrams, sourceUrl: url });
  }

  // ── type=diagram  ────────────────────────────────────────────────────────
  // Returns diagram image URL + parts list for a single diagram page.
  if (type === 'diagram' && path) {
    const url  = `${BASE}${path}`;
    const html = await fetchHtml(url);
    if (!html) {
      return NextResponse.json(
        { error: 'Diagram page unreachable.' },
        { status: 502 },
      );
    }
    const imageUrl = findDiagramImage(html);
    const parts    = parsePartsTable(html);
    return NextResponse.json({ imageUrl, parts, sourceUrl: url });
  }

  return NextResponse.json({ error: 'Invalid request parameters.' }, { status: 400 });
}
