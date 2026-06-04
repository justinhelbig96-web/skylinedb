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
    <div className="space-y-6 animate-fade-in">
      {/* Engine context */}
      <div className="flex items-center gap-3 p-3 bg-jdm-surface rounded-lg border border-jdm-border">
        <span className="text-xl">⚙️</span>
        <div className="text-sm">
          <span className="text-jdm-muted">Suche optimiert für: </span>
          <span className="font-mono font-bold text-jdm-red-bright">{vehicle.engine.code}</span>
          <span className="text-jdm-muted ml-2">({vehicle.fullName})</span>
        </div>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          className="flex-1 bg-jdm-surface border border-jdm-border rounded-lg px-4 py-3
                     text-jdm-text placeholder:text-jdm-muted/60
                     focus:border-jdm-red focus:outline-none transition-colors"
          placeholder='Deutsch oder Englisch, z.B. "Zahnriemen" oder "Timing Belt"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
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
        <div className="flex flex-wrap gap-2">
          {PARTS_SYNONYMS.slice(0, 8).map((syn) => (
            <button
              key={syn.id}
              type="button"
              onClick={() => { setQuery(syn.german); }}
              className="text-xs px-3 py-1.5 rounded-full border border-jdm-border
                         text-jdm-muted hover:text-jdm-red hover:border-jdm-red/60
                         transition-all duration-150"
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
          <div className="card p-4 space-y-3">
            <p className="section-title">Suchbegriffe</p>
            <div className="space-y-2">
              <TermRow label="Deutsch" terms={[result.searchTerm]} color="text-jdm-text" />
              <TermRow label="Englisch (allgemein)" terms={result.translations} color="text-jdm-blue" />
              {result.engineSpecificTerms.length > 0 && (
                <TermRow
                  label={`Motor-spezifisch (${vehicle.engine.code})`}
                  terms={result.engineSpecificTerms}
                  color="text-jdm-red-bright"
                />
              )}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <p className="section-title">Shops durchsuchen ({result.shopLinks.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.shopLinks.map(({ shop, searchUrl, query: q }) => (
                <a
                  key={shop.id}
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-4 flex items-center gap-4 hover:border-jdm-red/60
                             transition-all duration-150 group"
                >
                  {/* Logo placeholder */}
                  <div className="w-10 h-10 rounded-lg bg-jdm-surface border border-jdm-border
                                  flex items-center justify-center text-lg shrink-0">
                    🛒
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-jdm-text group-hover:text-jdm-red-bright transition-colors">
                      {shop.name}
                    </p>
                    <p className="text-xs text-jdm-muted truncate">{q}</p>
                    <p className="text-xs text-jdm-muted/60">{shop.country}</p>
                  </div>
                  <span className="text-jdm-muted group-hover:text-jdm-red-bright transition-colors text-sm">
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TermRow({
  label,
  terms,
  color,
}: {
  label: string;
  terms: string[];
  color: string;
}) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      <span className="text-xs text-jdm-muted w-44 shrink-0 self-center">{label}:</span>
      <div className="flex flex-wrap gap-1.5">
        {terms.map((t) => (
          <span
            key={t}
            className={`text-xs px-2.5 py-1 rounded-full bg-jdm-surface border border-jdm-border ${color}`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
