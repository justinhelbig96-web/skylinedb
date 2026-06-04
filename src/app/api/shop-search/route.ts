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
const TTL = 30 * 60 * 1000;
const _cache = new Map<string, { products: ShopProduct[]; ts: number }>();

async function safeFetch(url: string, headers: Record<string, string> = {}): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':    UA,
        Accept:          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        ...headers,
      },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ── JSON-LD Schema.org Product extraction (works on any site) ──────────────
function jsonLdProducts(
  html: string,
  shopId: string,
  shopName: string,
  base: string,
): ShopProduct[] {
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
        const type = n['@type'];
        // Single product
        if (type === 'Product') {
          const name = String(n.name ?? '');
          const rawUrl = String(n.url ?? '');
          if (!name || !rawUrl) continue;
          const img   = Array.isArray(n.image) ? String(n.image[0]) : typeof n.image === 'string' ? n.image : null;
          const off   = n.offers as Record<string, unknown> | undefined;
          const price = off?.price
            ? `${off.priceCurrency ?? ''} ${off.price}`.trim()
            : null;
          out.push({
            name,
            url: rawUrl.startsWith('http') ? rawUrl : base + rawUrl,
            imageUrl: img,
            price,
            shop: shopId,
            shopName,
          });
        }
        // ItemList of products
        if (type === 'ItemList' && Array.isArray(n.itemListElement)) {
          for (const el of n.itemListElement as Record<string, unknown>[]) {
            const prod = (el.item ?? el) as Record<string, unknown>;
            const name = String(prod.name ?? '');
            const rawUrl = String(prod.url ?? '');
            if (!name || !rawUrl) continue;
            out.push({
              name,
              url: rawUrl.startsWith('http') ? rawUrl : base + rawUrl,
              imageUrl: typeof prod.image === 'string' ? prod.image : null,
              price: null,
              shop: shopId,
              shopName,
            });
          }
        }
      }
    } catch { /* skip invalid JSON */ }
  }
  return out;
}

// ── Nengun scraper ─────────────────────────────────────────────────────────
const NENGUN_BASE = 'https://www.nengun.com';

function parseNengunHtml(html: string): ShopProduct[] {
  const products: ShopProduct[] = [];
  // Nengun product grid: each item is typically an <li> or <div> with class containing "product"
  const blockRe = /<(?:li|div|article)[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/(?:li|div|article)>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null && products.length < 12) {
    const block = m[1];
    if (!block.includes('href=')) continue;

    const urlM = block.match(/href="(\/[^"?#]+)"/);
    if (!urlM) continue;
    const url = NENGUN_BASE + urlM[1];

    const nameM =
      block.match(/<(?:h[1-4]|strong)[^>]*>([\s\S]*?)<\/(?:h[1-4]|strong)>/i) ??
      block.match(/class="[^"]*(?:name|title|product-name)[^"]*"[^>]*>([^<]+)</i) ??
      block.match(/alt="([^"]{5,})"/i);
    const name = nameM ? nameM[1].replace(/<[^>]+>/g, '').trim() : null;
    if (!name || name.length < 3) continue;

    const imgM = block.match(/(?:src|data-src)="(https?:\/\/[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    const imageUrl = imgM ? imgM[1] : null;

    const priceM =
      block.match(/¥\s*[\d,]+/) ??
      block.match(/class="[^"]*price[^"]*"[^>]*>\s*([^<]+)</i);
    const price = priceM ? priceM[0].replace(/<[^>]+>/g, '').trim() : null;

    products.push({ name, url, imageUrl, price, shop: 'nengun', shopName: 'Nengun' });
  }
  return products;
}

async function fetchNengun(query: string): Promise<ShopProduct[]> {
  const cacheKey = `nengun:${query}`;
  const hit = _cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < TTL) return hit.products;

  const url  = `${NENGUN_BASE}/search?q=${encodeURIComponent(query)}`;
  const html = await safeFetch(url, { Referer: NENGUN_BASE + '/' });
  if (!html) return [];

  let products = jsonLdProducts(html, 'nengun', 'Nengun', NENGUN_BASE);
  if (products.length === 0) products = parseNengunHtml(html);

  const result = products.slice(0, 12);
  _cache.set(cacheKey, { products: result, ts: Date.now() });
  return result;
}

// ── Amayama scraper ────────────────────────────────────────────────────────
const AMAYAMA_BASE = 'https://amayama.com';

function parseAmayamaHtml(html: string): ShopProduct[] {
  const products: ShopProduct[] = [];
  // Amayama search results page — OEM parts list rows
  const rowRe = /<(?:div|tr|li)[^>]*class="[^"]*(?:search-result|result-item|catalog-item|part-row)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|tr|li)>/gi;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(html)) !== null && products.length < 12) {
    const block = m[1];
    const urlM  = block.match(/href="((?:https?:\/\/amayama\.com)?\/en\/[^"]+)"/i);
    if (!urlM) continue;
    const url = urlM[1].startsWith('http') ? urlM[1] : AMAYAMA_BASE + urlM[1];

    const nameM =
      block.match(/class="[^"]*(?:description|part-name|name)[^"]*"[^>]*>([\s\S]*?)<\//i) ??
      block.match(/alt="([^"]{5,})"/i);
    const name = nameM ? nameM[1].replace(/<[^>]+>/g, '').trim() : null;
    if (!name || name.length < 3) continue;

    const imgM = block.match(/src="(https?:\/\/[^"]*\.(?:jpg|jpeg|png|webp|gif)[^"]*)"/i);
    const imageUrl = imgM ? imgM[1] : null;

    const priceM = block.match(/(?:\$|USD|€|EUR)\s*[\d,.]+/i);
    const price  = priceM ? priceM[0].trim() : null;

    products.push({ name, url, imageUrl, price, shop: 'amayama', shopName: 'Amayama (OEM)' });
  }
  return products;
}

async function fetchAmayama(query: string): Promise<ShopProduct[]> {
  const cacheKey = `amayama:${query}`;
  const hit = _cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < TTL) return hit.products;

  const url  = `${AMAYAMA_BASE}/en/search.html?search_str=${encodeURIComponent(query)}`;
  const html = await safeFetch(url, { Referer: AMAYAMA_BASE + '/en/' });
  if (!html) return [];

  let products = jsonLdProducts(html, 'amayama', 'Amayama (OEM)', AMAYAMA_BASE);
  if (products.length === 0) products = parseAmayamaHtml(html);

  const result = products.slice(0, 8);
  _cache.set(cacheKey, { products: result, ts: Date.now() });
  return result;
}

// ── API Route ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ error: 'Missing query parameter q.' }, { status: 400 });

  const [nengun, amayama] = await Promise.all([fetchNengun(q), fetchAmayama(q)]);

  // Interleave: nengun first, then amayama
  const products: ShopProduct[] = [];
  const max = Math.max(nengun.length, amayama.length);
  for (let i = 0; i < max; i++) {
    if (nengun[i])  products.push(nengun[i]);
    if (amayama[i]) products.push(amayama[i]);
  }

  return NextResponse.json({ products, query: q });
}
