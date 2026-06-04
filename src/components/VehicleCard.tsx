import type { VehicleData } from '@/types';
import Image from 'next/image';

interface Props {
  vehicle: VehicleData;
}

/**
 * Car image map — Nengun vehicle images by chassis prefix.
 * These are the public thumbnail URLs from nengun.com vehicle selector.
 * TODO: host own images if Nengun blocks hotlinking.
 */
const CAR_IMAGES: Record<string, string> = {
  BNR32: 'https://www.nengun.com/assets/images/vehicles/bnr32.jpg',
  HCR32: 'https://www.nengun.com/assets/images/vehicles/hcr32.jpg',
  HNR32: 'https://www.nengun.com/assets/images/vehicles/hr32.jpg',
  HR32:  'https://www.nengun.com/assets/images/vehicles/hr32.jpg',
  ECR33: 'https://www.nengun.com/assets/images/vehicles/ecr33.jpg',
  HCR33: 'https://www.nengun.com/assets/images/vehicles/ecr33.jpg',
  BCNR33:'https://www.nengun.com/assets/images/vehicles/bcnr33.jpg',
  ER34:  'https://www.nengun.com/assets/images/vehicles/er34.jpg',
  ENR34: 'https://www.nengun.com/assets/images/vehicles/enr34.jpg',
  HR34:  'https://www.nengun.com/assets/images/vehicles/hr34.jpg',
  BNR34: 'https://www.nengun.com/assets/images/vehicles/bnr34.jpg',
};

function getCarImage(chassis: string): string | null {
  const key = Object.keys(CAR_IMAGES).find((k) =>
    chassis.replace(/[-\s]/g, '').toUpperCase().startsWith(k),
  );
  return key ? CAR_IMAGES[key] : null;
}

const SOURCE_LABEL: Record<string, string> = {
  mock:    'Beispieldaten',
  decoded: 'VIN dekodiert',
  api:     'Live-Daten',
};

export default function VehicleCard({ vehicle }: Props) {
  const { engine } = vehicle;
  const imgUrl = getCarImage(vehicle.chassisNumber);

  return (
    <div className="bg-white border border-jdm-border rounded-xl shadow-card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Car image */}
        <div className="sm:w-64 shrink-0 bg-jdm-bg flex items-center justify-center overflow-hidden">
          {imgUrl ? (
            <div className="relative w-full h-48 sm:h-full min-h-[160px]">
              <Image
                src={imgUrl}
                alt={vehicle.fullName}
                fill
                className="object-cover"
                unoptimized
                onError={() => {/* silently falls back */}}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-48 sm:h-full min-h-[160px] text-5xl text-jdm-border">
              🚗
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-jdm-bg border border-jdm-border text-jdm-muted font-medium">
                {vehicle.generation}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-jdm-bg border border-jdm-border text-jdm-muted font-medium">
                {vehicle.marketCode ?? 'JDM'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-jdm-bg border border-jdm-border text-jdm-muted">
                {SOURCE_LABEL[vehicle.source ?? 'decoded']}
              </span>
            </div>

            <h2 className="text-xl font-bold text-jdm-text leading-tight">{vehicle.fullName}</h2>
            <p className="font-mono text-jdm-red text-base tracking-widest mt-0.5">
              {vehicle.chassisNumber}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Motor"       value={engine.code}                        highlight />
            <Stat label="Leistung"    value={`${engine.powerHP} PS`} />
            <Stat label="Antrieb"     value={vehicle.drivetrain.split(' ')[0]} />
            <Stat label="Getriebe"    value={vehicle.transmission.split(' ')[0]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-jdm-bg rounded-lg px-3 py-2.5 border border-jdm-border">
      <p className="text-[10px] text-jdm-muted uppercase tracking-wider">{label}</p>
      <p className={`font-semibold text-sm mt-0.5 truncate ${highlight ? 'text-jdm-red font-mono' : 'text-jdm-text'}`}>
        {value}
      </p>
    </div>
  );
}
