import { useState } from 'react';
import { EPC_CATEGORIES } from '@/data/epcData';
import type { VehicleData, EpcCategory, EpcSubcategory } from '@/types';

interface Props { vehicle: VehicleData }

export default function EpcTab({ vehicle: _vehicle }: Props) {
  const [activeCat, setActiveCat]   = useState<EpcCategory>(EPC_CATEGORIES[0]);
  const [activeSub, setActiveSub]   = useState<EpcSubcategory>(EPC_CATEGORIES[0].subcategories[0]);

  function selectCat(cat: EpcCategory) {
    setActiveCat(cat);
    setActiveSub(cat.subcategories[0]);
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-700 text-sm font-medium">📐 OEM Parts Diagrams</p>
        <p className="text-amber-600/80 text-xs mt-1">
          Explosionszeichnungen werden von Nissan FAST/EPC bereitgestellt.
          Echtzeit-Diagramme werden freigeschaltet, sobald ein EPC-Datenfeed angebunden ist.
        </p>
      </div>

      <div className="flex gap-4 flex-col md:flex-row">
        {/* Category sidebar */}
        <div className="md:w-44 shrink-0 space-y-0.5">
          {EPC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCat(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                activeCat.id === cat.id
                  ? 'bg-jdm-red text-white font-medium'
                  : 'text-jdm-muted hover:text-jdm-text hover:bg-jdm-bg'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.nameDE}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Subcategory tabs */}
          <div className="flex gap-2 flex-wrap">
            {activeCat.subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSub(sub)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  activeSub.id === sub.id
                    ? 'border-jdm-red text-jdm-red-bright bg-jdm-red/10'
                    : 'border-jdm-border text-jdm-muted hover:border-jdm-red/50'
                }`}
              >
                {sub.nameDE}
              </button>
            ))}
          </div>

          {/* Diagram placeholder */}
          <div className="aspect-video flex items-center justify-center bg-jdm-bg border-2 border-dashed border-jdm-border rounded-xl">
            <div className="text-center space-y-2">
              <p className="text-4xl opacity-30">📐</p>
              <p className="text-jdm-muted text-sm">Explosionszeichnung</p>
              <p className="text-jdm-muted/50 text-xs">{activeSub.nameDE}</p>
            </div>
          </div>

          {/* Parts table */}
          <div>
            <p className="section-title">Teileliste — {activeSub.nameDE}</p>
            <div className="border border-jdm-border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-jdm-bg">
                  <tr className="border-b border-jdm-border text-left">
                    <th className="px-4 py-2.5 text-jdm-muted font-medium w-10">#</th>
                    <th className="px-4 py-2.5 text-jdm-muted font-medium">OEM Teilenummer</th>
                    <th className="px-4 py-2.5 text-jdm-muted font-medium">Bezeichnung</th>
                    <th className="px-4 py-2.5 text-jdm-muted font-medium text-right">Menge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-jdm-border bg-white">
                  {activeSub.parts.map((part) => (
                    <tr key={part.partNumber} className="hover:bg-jdm-bg transition-colors">
                      <td className="px-4 py-2.5 text-jdm-muted text-xs">{part.itemNumber}</td>
                      <td className="px-4 py-2.5 font-mono text-jdm-red text-xs tracking-wide">
                        {part.partNumber}
                      </td>
                      <td className="px-4 py-2.5 text-jdm-text">
                        {part.descriptionDE}
                        {part.notes && (
                          <span className="ml-2 text-jdm-muted text-xs">({part.notes})</span>
                        )}
                        {part.supersededBy && (
                          <span className="ml-2 text-amber-600 text-xs">→ {part.supersededBy}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-jdm-text text-right">{part.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
