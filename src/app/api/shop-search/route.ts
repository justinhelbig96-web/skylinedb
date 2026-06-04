import { NextRequest, NextResponse } from 'next/server';

export interface ShopProduct {
  name:     string;
  url:      string;
  imageUrl: string | null;
  price:    string | null;
  shop:     'jdmheart';
}

const BASE_JDMHEART = 'https://www.jdmheart.com';

// Simple in-memory cache (30 min TTL per serverless instance)
const _cache = new Map<string, { products: ShopProduct[]; ts: number }>();
const TTL = 30 * 60 * 1000;

async function fetchJdmHeart(query: string): Promise<ShopProduct[]> {
  const cacheKey = `jdmheart:${query}`;
  const hit = _cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < TTL) return hit.products;

  const url = `${BASE_JDMHEART}/de/catalogsearch/result/?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept:          'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        Referer:         BASE_JDMHEART + '/de/',
      },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const products = parseJdmHeartProducts(html);
    _cache.set(cacheKey, { products, ts: Date.now() });
    return products;
  } catch {
    return [];
  }
}

function parseJdmHeartProducts(html: string): ShopProduct[] {
  const products: ShopProduct[] = [];

  // Magento 2 product-item pattern — captures the entire product-item block
  const itemRe = /<li[^>]*class="[^"]*product[^"]*product-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let item: RegExpExecArray | null;

  while ((item = itemRe.exec(html)) !== null && products.length < 12) {
    const block = item[1];

    // Product URL + name from the photo anchor
    const urlM = block.match(/href="([^"]*\/de\/[^"]+\.html)"/i);
    const url   = urlM ? urlM[1] : null;

    // Product name
    const nameM = block.match(/class="[^"]*product-item-name[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i)
      ?? block.match(/aria-label="([^"]+)"/i)
      ?? block.match(/alt="([^"]+)"/i);
    const name = nameM ? nameM[1].trim() : null;

    // Image source
    const imgM = block.match(/src="([^"]*(?:catalog\/product|media)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i)
      ?? block.match(/data-src="([^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    const imageUrl = imgM
      ? (imgM[1].startsWith('http') ? imgM[1] : BASE_JDMHEART + imgM[1])
      : null;

    // Price
    const priceM = block.match(/<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/span>/i);
    const price  = priceM ? priceM[1].trim() : null;

    if (url && name) {
      products.push({
        name,
        url:      url.startsWith('http') ? url : BASE_JDMHEART + url,
        imageUrl,
        price,
        shop:     'jdmheart',
      });
    }
  }

  return products;
}

export async function GET(request: NextRequest) {
  const q    = request.nextUrl.searchParams.get('q')?.trim();
  const shop = request.nextUrl.searchParams.get('shop') ?? 'jdmheart';

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter q.' }, { status: 400 });
  }

  if (shop === 'jdmheart') {
    const products = await fetchJdmHeart(q);
    return NextResponse.json({ products, query: q, shop });
  }

  return NextResponse.json({ error: 'Unknown shop.' }, { status: 400 });
}
