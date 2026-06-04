'use client';

import { useState, FormEvent } from 'react';
import { PARTS_SYNONYMS } from '@/data/partsSynonyms';
import { SHOPS } from '@/data/shops';
import type { VehicleData, PartsSearchResult } from '@/types';

interface Props { vehicle: VehicleData }

export default function PartsTab({ vehicle }: Props) {
  const [query,   setQuery]   = useState('');
  const [result,  setResult]  = useState<PartsSearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res  = await fetch(
        `/api/parts-search?q=${encodeURIComponent(query)}&engine=${encodeURIComponent(vehicle.engine.code)}`,
      );
      const json = await res.json();
      setResult(json);
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
          placeholder='z.B. "Zahnriemen" oder "Timing Belt"'
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
        <div className="space-y-4 animate-slide-up">
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

          {/* Shop links */}
          <div>
            <p className="section-title">Shops ({result.shopLinks.length})</p>
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
