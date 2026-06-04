'use client';

import { useState, FormEvent } from 'react';

interface Props {
  onSearch: (chassis: string) => void;
  loading:  boolean;
}

const EXAMPLES = ['ER34-030828', 'BNR34-100001', 'BCNR33-020000', 'BNR32-001001'];

export default function VinInput({ onSearch, loading }: Props) {
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length >= 5) onSearch(trimmed);
  }

  return (
    <section className="bg-white border border-jdm-border rounded-xl shadow-card p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-jdm-text">Fahrgestellnummer eingeben</h2>
        <p className="text-jdm-muted text-sm mt-0.5">
          Nissan Skyline Chassis-Nummer — z.B.{' '}
          <code className="font-mono text-jdm-red bg-red-50 px-1 py-0.5 rounded text-xs">ER34-030828</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row">
        <input
          type="text"
          className="input-vin flex-1"
          placeholder="z.B. ER34-030828"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          disabled={loading}
          maxLength={20}
          autoComplete="off"
          spellCheck={false}
          aria-label="Chassis Number"
        />
        <button
          type="submit"
          className="btn-primary sm:w-auto w-full text-sm"
          disabled={loading || value.trim().length < 5}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Suche…
            </span>
          ) : (
            'Suchen'
          )}
        </button>
      </form>

      {/* Quick examples */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-xs text-jdm-muted self-center">Beispiele:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => { setValue(ex); onSearch(ex); }}
            disabled={loading}
            className="text-xs font-mono px-2.5 py-1 rounded border border-jdm-border
                       text-jdm-muted hover:text-jdm-red hover:border-jdm-red/50
                       bg-jdm-bg transition-all duration-150 disabled:opacity-40"
          >
            {ex}
          </button>
        ))}
      </div>
    </section>
  );
}
