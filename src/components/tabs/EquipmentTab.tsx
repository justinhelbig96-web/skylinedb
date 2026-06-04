import type { VehicleData } from '@/types';

interface Props { vehicle: VehicleData }

const CATEGORY_COLOR: Record<string, string> = {
  Safety:  'text-green-700  border-green-200  bg-green-50',
  Comfort: 'text-blue-700   border-blue-200   bg-blue-50',
  Chassis: 'text-amber-700  border-amber-200  bg-amber-50',
  Engine:  'text-red-700    border-red-200    bg-red-50',
};

export default function EquipmentTab({ vehicle }: Props) {
  const categories = Array.from(
    new Set(vehicle.equipmentCodes.map((e) => e.category)),
  );

  if (vehicle.equipmentCodes.length === 0) {
    return (
      <div className="animate-fade-in text-center py-12 text-jdm-muted">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm">Keine Ausstattungscodes verfügbar für dieses Chassis.</p>
        <p className="text-xs mt-2 text-jdm-muted/60">
          Ausstattungsdaten sind nur für Mock-Einträge vollständig hinterlegt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {categories.map((cat) => {
        const items = vehicle.equipmentCodes.filter((e) => e.category === cat);
        const colors = CATEGORY_COLOR[cat] ?? 'text-jdm-muted border-jdm-border bg-transparent';
        return (
          <div key={cat}>
            <p className="section-title">{cat}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((item) => (
                <div
                  key={item.code}
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${colors}`}
                >
                  <span className="font-mono font-bold text-xs shrink-0 w-12 mt-0.5">
                    {item.code}
                  </span>
                  <span className="text-jdm-text">{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Option codes */}
      {vehicle.optionCodes.length > 0 && (
        <div>
          <p className="section-title">Option Codes</p>
          <div className="flex flex-wrap gap-2">
            {vehicle.optionCodes.map((oc) => (
              <span key={oc} className="badge border border-jdm-border text-jdm-muted font-mono">
                {oc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
