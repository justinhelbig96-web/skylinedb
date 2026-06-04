'use client';

import { useState, useEffect } from 'react';
import type { VehicleData } from '@/types';

interface Props { vehicle: VehicleData }

// ── Types for live EPC data ──────────────────────────────────────────────────

interface EpcLink  { href: string; text: string; icon?: string }
interface EpcPart  { item: string; partNumber: string; description: string; quantity: string }

type EpcState =
  | { stage: 'idle' }
  | { stage: 'loading' }
  | { stage: 'error'; message: string }
  | { stage: 'groups';   groups: EpcLink[]; vehicleInfo: Record<string, string>; sourceUrl: string }
  | { stage: 'diagrams'; groupName: string; diagrams: EpcLink[]; sourceUrl: string; parentGroups: EpcLink[]; parentInfo: Record<string, string>; parentSourceUrl: string }
  | { stage: 'diagram';  diagramName: string; imageUrl: string | null; parts: EpcPart[]; sourceUrl: string; parentState: EpcState };

export default function EpcTab({ vehicle }: Props) {
  const [state, setState] = useState<EpcState>({ stage: 'idle' });

  // Auto-load groups when vehicle changes
  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.chassisNumber]);

  async function loadGroups() {
    setState({ stage: 'loading' });
    try {
      const chassis = vehicle.chassisNumber.replace(/[-\s]/g, '').toUpperCase();
      const res  = await fetch(`/api/epc-proxy?type=groups&chassis=${encodeURIComponent(chassis)}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setState({ stage: 'error', message: json.error ?? 'EPC nicht erreichbar.' });
        return;
      }
      setState({
        stage: 'groups',
        groups:      json.groups,
        vehicleInfo: json.vehicleInfo,
        sourceUrl:   json.sourceUrl,
      });
    } catch {
      setState({ stage: 'error', message: 'Verbindungsfehler zur EPC-Datenbank.' });
    }
  }

  async function loadDiagrams(group: EpcLink, parentState: EpcState & { stage: 'groups' }) {
    setState({ stage: 'loading' });
    try {
      const res  = await fetch(`/api/epc-proxy?type=diagrams&path=${encodeURIComponent(group.href)}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setState({ stage: 'error', message: json.error });
        return;
      }
      setState({
        stage:        'diagrams',
        groupName:    group.text,
        diagrams:     json.diagrams,
        sourceUrl:    json.sourceUrl,
        parentGroups: parentState.groups,
        parentInfo:   parentState.vehicleInfo,
        parentSourceUrl: parentState.sourceUrl,
      });
    } catch {
      setState({ stage: 'error', message: 'Verbindungsfehler.' });
    }
  }

  async function loadDiagram(diag: EpcLink, parentState: EpcState) {
    setState({ stage: 'loading' });
    try {
      const res  = await fetch(`/api/epc-proxy?type=diagram&path=${encodeURIComponent(diag.href)}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setState({ stage: 'error', message: json.error });
        return;
      }
      setState({
        stage:       'diagram',
        diagramName: diag.text,
        imageUrl:    json.imageUrl,
        parts:       json.parts ?? [],
        sourceUrl:   json.sourceUrl,
        parentState,
      });
    } catch {
      setState({ stage: 'error', message: 'Verbindungsfehler.' });
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm">
          {/* Breadcrumb */}
          <button
            type="button"
            onClick={loadGroups}
            className="text-jdm-muted hover:text-jdm-red transition-colors"
          >
            EPC
          </button>
          {state.stage === 'diagrams' && (
            <>
              <span className="text-jdm-border">/</span>
              <span className="text-jdm-text font-medium">{state.groupName}</span>
            </>
          )}
          {state.stage === 'diagram' && (
            <>
              <span className="text-jdm-border">/</span>
              <button
                type="button"
                onClick={() => setState(state.parentState)}
                className="text-jdm-muted hover:text-jdm-red transition-colors"
              >
                {(state.parentState as { groupName?: string }).groupName ?? 'Gruppe'}
              </button>
              <span className="text-jdm-border">/</span>
              <span className="text-jdm-text font-medium">{state.diagramName}</span>
            </>
          )}
        </div>

        {/* Source link */}
        {'sourceUrl' in state && state.sourceUrl && (
          <a
            href={state.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-jdm-muted hover:text-jdm-red transition-colors flex items-center gap-1"
          >
            epc-data.com ↗
          </a>
        )}
      </div>

      {/* Source notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-600">
        Daten via{' '}
        <a href="https://nissan.epc-data.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
          nissan.epc-data.com
        </a>
        {' '}— öffentlicher Nissan Teilekatalog. Explosionszeichnungen werden direkt von dort geladen.
      </div>

      {/* ── Loading ── */}
      {state.stage === 'loading' && (
        <div className="flex items-center justify-center py-16 gap-3 text-jdm-muted">
          <span className="w-5 h-5 border-2 border-jdm-border border-t-jdm-red rounded-full animate-spin" />
          <span className="text-sm">Lade EPC-Daten…</span>
        </div>
      )}

      {/* ── Error ── */}
      {state.stage === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
          <p className="text-red-600 font-medium text-sm">⚠ {state.message}</p>
          <p className="text-red-400 text-xs">
            Die EPC-Datenbank ist möglicherweise vorübergehend nicht erreichbar.
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary text-xs py-2 px-4" onClick={loadGroups}>
              Erneut versuchen
            </button>
            <a
              href={`https://nissan.epc-data.com/skyline/nissan_skyline-${vehicle.chassisNumber.replace(/[-\s].*/,'').toLowerCase()}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-xs py-2 px-4"
            >
              Direkt auf epc-data.com öffnen ↗
            </a>
          </div>
        </div>
      )}

      {/* ── Parts Groups ── */}
      {state.stage === 'groups' && (
        <div className="space-y-4">
          {/* Vehicle info from EPC */}
          {Object.keys(state.vehicleInfo).length > 0 && (
            <div className="border border-jdm-border rounded-lg overflow-hidden">
              <div className="bg-jdm-bg px-4 py-2.5 border-b border-jdm-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-jdm-muted">
                  Fahrzeugdaten laut EPC
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-x divide-y divide-jdm-border">
                {Object.entries(state.vehicleInfo).slice(0, 12).map(([k, v]) => (
                  <div key={k} className="px-3 py-2 bg-white">
                    <p className="text-[10px] text-jdm-muted uppercase tracking-wide">{k}</p>
                    <p className="text-sm text-jdm-text font-medium mt-0.5 truncate">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Groups */}
          <div>
            <p className="section-title">Teilekategorien</p>
            {state.groups.length === 0 ? (
              <div className="text-center py-8 text-jdm-muted text-sm">
                Keine Kategorien gefunden.{' '}
                <a href={state.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-jdm-red underline">
                  Direkt auf epc-data.com öffnen ↗
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {state.groups.map((group) => (
                  <button
                    key={group.href}
                    type="button"
                    onClick={() => loadDiagrams(group, state)}
                    className="flex items-center gap-3 p-4 bg-white border border-jdm-border
                               rounded-xl text-left hover:border-jdm-red/50 hover:shadow-card-hover
                               transition-all group"
                  >
                    <span className="text-2xl">{group.icon ?? '📦'}</span>
                    <span className="text-sm font-medium text-jdm-text group-hover:text-jdm-red transition-colors">
                      {group.text}
                    </span>
                    <span className="ml-auto text-jdm-muted text-sm">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Diagram List ── */}
      {state.stage === 'diagrams' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() =>
              setState({
                stage:       'groups',
                groups:      state.parentGroups,
                vehicleInfo: state.parentInfo,
                sourceUrl:   state.parentSourceUrl,
              })
            }
            className="flex items-center gap-1 text-sm text-jdm-muted hover:text-jdm-red transition-colors"
          >
            ← Zurück zu allen Kategorien
          </button>

          <p className="section-title">{state.groupName} — Diagramme</p>

          {state.diagrams.length === 0 ? (
            <div className="text-center py-8 text-jdm-muted text-sm">
              Keine Diagramme gefunden.{' '}
              <a href={state.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-jdm-red underline">
                Auf epc-data.com öffnen ↗
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {state.diagrams.map((d) => (
                <button
                  key={d.href}
                  type="button"
                  onClick={() => loadDiagram(d, state)}
                  className="flex items-center gap-3 p-3 bg-white border border-jdm-border
                             rounded-lg text-left hover:border-jdm-red/50
                             transition-all group text-sm"
                >
                  <span className="text-lg">📐</span>
                  <span className="text-jdm-text group-hover:text-jdm-red transition-colors flex-1">
                    {d.text}
                  </span>
                  <span className="text-jdm-muted">›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Single Diagram ── */}
      {state.stage === 'diagram' && (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setState(state.parentState)}
            className="flex items-center gap-1 text-sm text-jdm-muted hover:text-jdm-red transition-colors"
          >
            ← Zurück
          </button>

          <h3 className="font-semibold text-jdm-text">{state.diagramName}</h3>

          {/* Diagram image */}
          <div className="border border-jdm-border rounded-xl overflow-hidden bg-white">
            {state.imageUrl ? (
              <div className="relative w-full min-h-[300px] flex items-center justify-center bg-jdm-bg p-4">
                {/* Use regular img tag since epc-data.com GIFs may not be Next.js optimizable */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={state.imageUrl}
                  alt={state.diagramName}
                  className="max-w-full max-h-[500px] object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-jdm-bg text-jdm-muted text-sm gap-2">
                <span className="text-2xl opacity-40">📐</span>
                <span>Kein Diagrammbild verfügbar</span>
              </div>
            )}
          </div>

          {/* Parts table */}
          <div>
            <p className="section-title">Teileliste ({state.parts.length} Teile)</p>
            {state.parts.length === 0 ? (
              <div className="bg-jdm-bg rounded-lg p-4 text-center text-jdm-muted text-sm">
                Keine Teile geparst.{' '}
                <a href={state.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-jdm-red underline">
                  Auf epc-data.com ansehen ↗
                </a>
              </div>
            ) : (
              <div className="border border-jdm-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-jdm-bg">
                    <tr className="border-b border-jdm-border text-left">
                      <th className="px-3 py-2.5 text-jdm-muted font-medium w-8">#</th>
                      <th className="px-3 py-2.5 text-jdm-muted font-medium">OEM Teilenummer</th>
                      <th className="px-3 py-2.5 text-jdm-muted font-medium">Bezeichnung</th>
                      <th className="px-3 py-2.5 text-jdm-muted font-medium text-right w-12">Menge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-jdm-border bg-white">
                    {state.parts.map((p, i) => (
                      <tr key={i} className="hover:bg-jdm-bg transition-colors">
                        <td className="px-3 py-2 text-jdm-muted text-xs">{p.item}</td>
                        <td className="px-3 py-2 font-mono text-jdm-red text-xs tracking-wide">
                          {p.partNumber}
                        </td>
                        <td className="px-3 py-2 text-jdm-text">{p.description}</td>
                        <td className="px-3 py-2 text-jdm-text text-right">{p.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fallback link */}
          <div className="pt-1">
            <a
              href={state.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-jdm-muted hover:text-jdm-red transition-colors"
            >
              Original auf epc-data.com ansehen ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}


