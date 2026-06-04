import { NextRequest, NextResponse } from 'next/server';

export interface ShopProduct {
  name:     string;
  url:      string;
  imageUrl: string | null;
  price:    string | null;
  shop:     string;
  shopName: string;
}

const UA  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const TTL = 20 * 60 * 1000;
const _cache = new Map<string, { products: ShopProduct[]; ts: number }>();

async function safeFetch(url: string, extra: Record<string, string> = {}): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        ...extra,
      },
      next: { revalidate: 1200 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// â”€â”€ Magento 2 HTML parser (works for Nengun) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function parseMagento2(html: string, shopId: string, shopName: string, base: string): ShopProduct[] {
  const products: ShopProduct[] = [];
  const seen = new Set<string>();

  // Step 1: collect all product URLs from <a> tags pointing to product paths
  // Magento 2 URLs look like /some-product-name/ or /category/product-name.html
  const allLinks: Array<{ url: string; pos: number }> = [];
  const linkRe = /href="((?:https?:\/\/[^"]*|\/[^"?#]{5,})(?:\.html|\/[a-z0-9-]+\/?)?)"/gi;
  let lm: RegExpExecArray | null;
  while ((lm = linkRe.exec(html)) !== null) {
    const raw = lm[1];
    const full = raw.startsWith('http') ? raw : base + raw;
    // Filter: must look like a product page (not category, search, account, checkout)
    if (/\/(catalogsearch|customer|checkout|account|cart|wishlist|compare)/.test(full)) continue;
    if (!seen.has(full)) {
      seen.add(full);
      allLinks.push({ url: full, pos: lm.index });
    }
  }

  // Step 2: for each link, look at surrounding HTML (Â±1000 chars) for name, price, image
  for (const { url, pos } of allLinks) {
    if (products.length >= 12) break;
    const ctx = html.slice(Math.max(0, pos - 100), pos + 1500);

    // Product name: from <strong class="...product...name..."> or <h2> or title attr
    const nameM =
      ctx.match(/<strong[^>]*class="[^"]*product[^"]*name[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]{4,})<\/a>/i) ??
      ctx.match(/<span[^>]*class="[^"]*product[^"]*name[^"]*"[^>]*>([^<]{4,})<\/span>/i) ??
      ctx.match(/class="[^"]*product[-_](?:name|title)[^"]*"[^>]*>([^<]{4,})</i) ??
      ctx.match(/title="([^"]{5,})"/) ??
      ctx.match(/alt="([^"]{5,})"/);
    const name = nameM ? nameM[1].replace(/<[^>]+>/g, '').trim() : null;
    if (!name || name.length < 4) continue;

    // Price: Â¥ or â‚¬ or $ followed by digits
    const priceM =
      ctx.match(/<span[^>]*class="[^"]*price[^"]*"[^>]*>\s*([^<]{3,20})\s*<\/span>/i) ??
      ctx.match(/((?:Â¥|â‚¬|\$|USD|EUR|JPY)\s*[\d,.]+(?:\s*[\d,.]+)?)/);
    const price = priceM ? priceM[1].replace(/<[^>]+>/g, '').trim() : null;

    // Image
    const imgM =
      ctx.match(/data-src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i) ??
      ctx.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    const imageUrl = imgM ? imgM[1] : null;

    // Dedupe by name
    if (products.some((p) => p.name === name)) continue;

    products.push({ name, url, imageUrl, price, shop: shopId, shopName });
  }

  return products;
}

// â”€â”€ JSON-LD Schema.org Product extraction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function jsonLdProducts(html: string, shopId: string, shopName: string, base: string): ShopProduct[] {
  const out: ShopProduct[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const d = JSON.parse(m[1]);
      const nodes: unknown[] = Array.isArray(d) ? d : d?.['@graph'] ? d['@graph'] : [d];
      for (const node of nodes) {
        if (!node || typeof node !== 'object') continue;
        const n = node as Record<string, unknown>;
        if (n['@type'] !== 'Product') continue;
        const name = String(n.name ?? '');
        const rawUrl = String(n.url ?? '');
        if (!name || !rawUrl) continue;
        const img = Array.isArray(n.image) ? String(n.image[0]) : typeof n.image === 'string' ? n.image : null;
        const off = n.offers as Record<string, unknown> | undefined;
        const priceVal = off?.price ?? (off as Record<string, unknown> | undefined)?.lowPrice;
        const price = priceVal ? `${off?.priceCurrency ?? ''} ${priceVal}`.trim() : null;
        out.push({
          name,
          url: rawUrl.startsWith('http') ? rawUrl : base + rawUrl,
          imageUrl: img,
          price,
          shop: shopId,
          shopName,
        });
        if (out.length >= 8) break;
      }
    } catch { /* skip */ }
  }
  return out;
}

// â”€â”€ Nengun â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NENGUN_BASE = 'https://www.nengun.com';

async function fetchNengun(query: string): Promise<ShopProduct[]> {
  const key = `nengun:${query}`;
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.products;

  const url  = `${NENGUN_BASE}/search?q=${encodeURIComponent(query)}`;
  const html = await safeFetch(url, { Referer: NENGUN_BASE + '/' });
  if (!html) return [];

  let products = jsonLdProducts(html, 'nengun', 'Nengun', NENGUN_BASE);
  if (products.length === 0) products = parseMagento2(html, 'nengun', 'Nengun', NENGUN_BASE);

  const result = products.slice(0, 10);
  _cache.set(key, { products: result, ts: Date.now() });
  return result;
}

// â”€â”€ Japanparts (server-rendered catalog) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const JPARTS_BASE = 'https://www.japanparts.net';

function parseJapanparts(html: string): ShopProduct[] {
  const products: ShopProduct[] = [];
  // Japanparts uses simple product-card divs
  const blockRe = /<div[^>]*class="[^"]*(?:product[-_]card|item[-_]card|product[-_]block)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null && products.length < 8) {
    const b = m[1];
    const urlM = b.match(/href="((?:https?:\/\/[^"]*|\/[^"?#]+))"/i);
    if (!urlM) continue;
    const url = urlM[1].startsWith('http') ? urlM[1] : JPARTS_BASE + urlM[1];
    const nameM = b.match(/<(?:h[1-4]|strong|span)[^>]*>([^<]{5,})<\/(?:h[1-4]|strong|span)>/i) ?? b.match(/alt="([^"]{5,})"/i);
    const name = nameM ? nameM[1].trim() : null;
    if (!name) continue;
    const imgM = b.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    const priceM = b.match(/((?:â‚¬|\$|USD|EUR)\s*[\d,.]+)/i);
    products.push({ name, url, imageUrl: imgM ? imgM[1] : null, price: priceM ? priceM[1] : null, shop: 'japanparts', shopName: 'JapanParts' });
  }
  return products;
}

async function fetchJapanparts(query: string): Promise<ShopProduct[]> {
  const key = `japanparts:${query}`;
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.products;

  const url  = `${JPARTS_BASE}/search?q=${encodeURIComponent(query)}+nissan`;
  const html = await safeFetch(url, { Referer: JPARTS_BASE + '/' });
  if (!html) return [];

  let products = jsonLdProducts(html, 'japanparts', 'JapanParts', JPARTS_BASE);
  if (products.length === 0) products = parseMagento2(html, 'japanparts', 'JapanParts', JPARTS_BASE);
  if (products.length === 0) products = parseJapanparts(html);

  const result = products.slice(0, 8);
  _cache.set(key, { products: result, ts: Date.now() });
  return result;
}

// â”€â”€ API Route â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ error: 'Missing query parameter q.' }, { status: 400 });

  const [nengun, japanparts] = await Promise.all([fetchNengun(q), fetchJapanparts(q)]);

  // Interleave results from both shops
  const products: ShopProduct[] = [];
  const max = Math.max(nengun.length, japanparts.length);
  for (let i = 0; i < max; i++) {
    if (nengun[i])     products.push(nengun[i]);
    if (japanparts[i]) products.push(japanparts[i]);
  }

  return NextResponse.json({ products, query: q });
}
