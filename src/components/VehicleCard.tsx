import type { VehicleData } from '@/types';

interface Props {
  vehicle: VehicleData;
}

const ASPIRATION_LABEL: Record<string, string> = {
  'naturally-aspirated': 'Saugmotor',
  turbocharged:          'Turbocharged',
  'twin-turbocharged':   'Twin-Turbo',
};

const ASPIRATION_COLOR: Record<string, string> = {
  'naturally-aspirated': 'text-jdm-blue border-jdm-blue/40',
  turbocharged:          'text-jdm-gold border-jdm-gold/40',
  'twin-turbocharged':   'text-jdm-red-bright border-jdm-red/40',
};

const SOURCE_COLOR: Record<string, string> = {
  mock:    'text-jdm-blue  border-jdm-blue/40',
  decoded: 'text-jdm-gold  border-jdm-gold/40',
  api:     'text-jdm-green border-jdm-green/40',
};

export default function VehicleCard({ vehicle }: Props) {
  const { engine } = vehicle;
  const aspLabel  = ASPIRATION_LABEL[engine.aspiration] ?? engine.aspiration;
  const aspColor  = ASPIRATION_COLOR[engine.aspiration] ?? 'text-jdm-muted border-jdm-border';
  const srcColor  = SOURCE_COLOR[vehicle.source ?? 'decoded'] ?? 'text-jdm-muted border-jdm-border';

  return (
    <div className="card p-6 md:p-8 space-y-5">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`badge border ${aspColor}`}>{aspLabel}</span>
            <span className={`badge border ${srcColor}`}>
              {vehicle.source === 'mock'
                ? 'Mock Data'
                : vehicle.source === 'decoded'
                ? 'VIN Decoded'
                : 'Live Data'}
            </span>
            {vehicle.marketCode && (
              <span className="badge border border-jdm-border text-jdm-muted">
                {vehicle.marketCode}
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-jdm-text leading-tight">
            {vehicle.fullName}
          </h2>
          <p className="font-mono text-jdm-red text-lg tracking-widest mt-1">
            {vehicle.chassisNumber}
          </p>
        </div>

        {/* Engine badge */}
        <div className="shrink-0 card bg-jdm-surface px-5 py-4 text-center min-w-[140px]">
          <p className="text-2xl font-display font-bold text-jdm-red-bright">
            {engine.code}
          </p>
          <p className="text-xs text-jdm-muted mt-0.5">{engine.displacement}</p>
          <p className="text-sm font-semibold text-jdm-text mt-1">
            {engine.powerHP} PS
          </p>
          <p className="text-xs text-jdm-muted">{engine.torqueNm} Nm</p>
        </div>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Baujahr"      value={vehicle.year} />
        <Stat label="Generation"   value={vehicle.generation} />
        <Stat label="Karosserie"   value={vehicle.bodyStyle.split('(')[0].trim()} />
        <Stat label="Antrieb"      value={vehicle.drivetrain.split(' ')[0]} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-jdm-surface rounded-lg px-4 py-3 border border-jdm-border">
      <p className="text-[11px] text-jdm-muted uppercase tracking-wider">{label}</p>
      <p className="text-jdm-text font-semibold text-sm mt-0.5 truncate">{value}</p>
    </div>
  );
}
