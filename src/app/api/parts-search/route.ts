import { NextRequest, NextResponse } from 'next/server';
import { SHOPS } from '@/data/shops';
import { resolveSearchTerms } from '@/data/partsSynonyms';
import type { ShopSearchLink } from '@/types';

/**
 * GET /api/parts-search?q=Zahnriemen&engine=RB25DET
 *
 * Returns translated search terms + shop search links.
 * TODO: extend with actual shop scraping / API calls when shops provide APIs.
 */
export async function GET(request: NextRequest) {
  const query      = request.nextUrl.searchParams.get('q')?.trim();
  const engineCode = request.nextUrl.searchParams.get('engine')?.trim();

  if (!query) {
    return NextResponse.json(
      { error: 'Missing search query.' },
      { status: 400 },
    );
  }

  const { translations, engineTerms } = resolveSearchTerms(query, engineCode ?? undefined);

  // Use the most specific search term available
  const primaryTerm = engineTerms[0] ?? translations[0] ?? query;

  const shopLinks: ShopSearchLink[] = SHOPS.map((shop) => ({
    shop,
    searchUrl: shop.searchUrlTemplate.replace('{query}', encodeURIComponent(primaryTerm)),
    query:     primaryTerm,
  }));

  return NextResponse.json({
    searchTerm:          query,
    translations,
    engineSpecificTerms: engineTerms,
    shopLinks,
  });
}
