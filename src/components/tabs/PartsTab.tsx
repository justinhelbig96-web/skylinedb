'use client';

import { useState, FormEvent } from 'react';
import { PARTS_SYNONYMS } from '@/data/partsSynonyms';
import type { VehicleData, PartsSearchResult } from '@/types';
import type { ShopProduct } from '@/app/api/shop-search/route';

interface Props { vehicle: VehicleData }

export default function PartsTab({ vehicle }: Props) {
  const [query,        setQuery]        = useState('');
  const [result,       setResult]       = useState<PartsSearchResult | null>(null);
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [loading,      setLoading]      = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setShopProducts([]);

    try {
      // Step 1: get translations
      const mainRes = await fetch(
        `/api/parts-search?q=${encodeURIComponent(query)}&engine=${encodeURIComponent(vehicle.engine.code)}`
      );
      if (!mainRes.ok) return;
      const mainData: PartsSearchResult = await mainRes.json();
      setResult(mainData);

      // Step 2: search shops with English term for better matches
      const searchTerm = mainData.translations[0] ?? query;
      const shopRes = await fetch(`/api/shop-search?q=${encodeURIComponent(searchTerm)}`);
      if (shopRes.ok) {
        const shopData = await shopRes.json();
        setShopProducts(shopData.products ?? []);
      }
    } catch {
      // silently ignore — show empty state
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Engine context */}
      <div className="flex items-center gap-3 p-3 bg-jdm-bg rounded-lg border border-jdm-border text-sm">
        <span>⚙️</span>
        <span className="text-jdm-muted">Suche optimiert für:</span>
        <span className="font-mono font-bold text-jdm-red">{vehicle.engine.code}</span>
        <span className="text-jdm-muted hidden sm:inline">({vehicle.fullName})</span>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          className="flex-1 bg-white border border-jdm-border rounded-lg px-4 py-2.5
                     text-jdm-text placeholder:text-jdm-muted/60 text-sm
                     focus:border-jdm-red focus:outline-none transition-colors"
          placeholder='z.B. "Zahnriemen" oder "Nockenwellenrad"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary text-sm" disabled={loading || !query.trim()}>
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
          ) : (
            'Suchen'
          )}
        </button>
      </form>

      {/* Quick suggestions */}
      <div>
        <p className="section-title">Häufige Teile</p>
        <div className="flex flex-wrap gap-1.5">
          {PARTS_SYNONYMS.slice(0, 8).map((syn) => (
            <button
              key={syn.id}
              type="button"
              onClick={() => setQuery(syn.german)}
              className="text-xs px-2.5 py-1 rounded-full border border-jdm-border
                         text-jdm-muted hover:text-jdm-red hover:border-jdm-red/50
                         bg-white transition-all duration-150"
            >
              {syn.german}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-slide-up">
          {/* Translations */}
          <div className="border border-jdm-border rounded-lg p-4 space-y-3 bg-white">
            <p className="section-title">Suchbegriffe</p>
            <div className="space-y-2">
              <TermRow label="Deutsch"                 terms={[result.searchTerm]} color="text-jdm-text font-medium" />
              <TermRow label="Englisch"                terms={result.translations} color="text-blue-600" />
              {result.engineSpecificTerms.length > 0 && (
                <TermRow
                  label={`${vehicle.engine.code} spezifisch`}
                  terms={result.engineSpecificTerms}
                  color="text-jdm-red"
                />
              )}
            </div>
          </div>

          {/* Product cards from multiple shops */}
          {shopProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="section-title">Produkte ({shopProducts.length})</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {shopProducts.map((p, i) => (
                  <a
                    key={i}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col bg-white border border-jdm-border rounded-xl
                               overflow-hidden hover:border-jdm-red/50 hover:shadow-card-hover
                               transition-all duration-150"
                  >
                    {/* Product image with price + shop badge */}
                    <div className="aspect-square bg-jdm-bg overflow-hidden flex items-center justify-center relative">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            el.style.display = 'none';
                            if (el.parentElement) {
                              el.parentElement.innerHTML = '<span class="text-3xl opacity-30">📦</span>';
                            }
                          }}
                        />
                      ) : (
                        <span className="text-3xl opacity-30">📦</span>
                      )}
                      {/* Price badge */}
                      {p.price && (
                        <span className="absolute bottom-1 right-1 bg-jdm-red text-white text-[11px] font-bold
                                         px-1.5 py-0.5 rounded shadow-sm leading-tight">
                          {p.price}
                        </span>
                      )}
                      {/* Shop badge */}
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-medium
                                       px-1.5 py-0.5 rounded leading-tight">
                        {p.shopName}
                      </span>
                    </div>
                    {/* Product name */}
                    <div className="p-2 flex-1">
                      <p className="text-xs text-jdm-text font-medium leading-snug line-clamp-2 group-hover:text-jdm-red transition-colors">
                        {p.name}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Shop links */}
          <div>
            <p className="section-title">Alle Shops ({result.shopLinks.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.shopLinks.map(({ shop, searchUrl, query: q }) => (
                <a
                  key={shop.id}
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white border border-jdm-border
                             rounded-lg hover:border-jdm-red/50 hover:shadow-card-hover
                             transition-all duration-150 group"
                >
                  <div className="w-8 h-8 rounded bg-jdm-bg border border-jdm-border
                                  flex items-center justify-center text-sm shrink-0">
                    🛒
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-jdm-text group-hover:text-jdm-red transition-colors">
                      {shop.name}
                    </p>
                    <p className="text-xs text-jdm-muted truncate">{q}</p>
                  </div>
                  <span className="text-jdm-muted text-xs shrink-0">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TermRow({ label, terms, color }: { label: string; terms: string[]; color: string }) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      <span className="text-xs text-jdm-muted w-40 shrink-0 self-center">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {terms.map((t) => (
          <span key={t} className={`text-xs px-2 py-0.5 rounded bg-jdm-bg border border-jdm-border ${color}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

