import type { VehicleData } from '@/types';

interface Props { vehicle: VehicleData }

const CATEGORY_COLOR: Record<string, string> = {
  Safety:  'text-jdm-green  border-jdm-green/30  bg-jdm-green/5',
  Comfort: 'text-jdm-blue   border-jdm-blue/30   bg-jdm-blue/5',
  Chassis: 'text-jdm-gold   border-jdm-gold/30   bg-jdm-gold/5',
  Engine:  'text-jdm-red-bright border-jdm-red/30 bg-jdm-red/5',
};

export default function EquipmentTab({ vehicle }: Props) {
  const categories = Array.from(
    new Set(vehicle.equipmentCodes.map((e) => e.category)),
  );

  if (vehicle.equipmentCodes.length === 0) {
    return (
      <div className="animate-fade-in text-center py-12 text-jdm-muted">
        <p className="text-4xl mb-3">📋</p>
        <p>Keine Ausstattungscodes verfügbar für dieses Chassis.</p>
        <p className="text-sm mt-2 text-jdm-muted/60">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.code}
                  className={`card flex items-start gap-3 px-4 py-3 border ${colors}`}
                >
                  <span className="font-mono font-bold text-sm shrink-0 w-14">
                    {item.code}
                  </span>
                  <span className="text-jdm-text text-sm">{item.description}</span>
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
