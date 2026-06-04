'use client';

import { useState, useEffect } from 'react';
import type { VehicleData } from '@/types';

interface Props { vehicle: VehicleData }

const CHASSIS_EPC_URL: Record<string, string> = {
  BNR32:  'https://nissan.epc-data.com/skyline/nissan_skyline-bnr32/',
  HCR32:  'https://nissan.epc-data.com/skyline/nissan_skyline-hcr32/',
  HNR32:  'https://nissan.epc-data.com/skyline/nissan_skyline-hnr32/',
  HR32:   'https://nissan.epc-data.com/skyline/nissan_skyline-hr32/',
  ECR33:  'https://nissan.epc-data.com/skyline/nissan_skyline-ecr33/',
  HCR33:  'https://nissan.epc-data.com/skyline/nissan_skyline-hcr33/',
  BCNR33: 'https://nissan.epc-data.com/skyline/nissan_skyline-bcnr33/',
  HR34:   'https://nissan.epc-data.com/skyline/nissan_skyline-hr34/',
  ENR34:  'https://nissan.epc-data.com/skyline/nissan_skyline-enr34/',
  ER34:   'https://nissan.epc-data.com/skyline/nissan_skyline-er34/',
  BNR34:  'https://nissan.epc-data.com/skyline/nissan_skyline-bnr34/',
};

function getEpcUrl(chassisNumber: string): string | null {
  const prefix = chassisNumber.replace(/[-\s].*/i, '').toUpperCase();
  const keys = Object.keys(CHASSIS_EPC_URL).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (prefix.startsWith(k)) return CHASSIS_EPC_URL[k];
  }
  return null;
}

export default function EpcTab({ vehicle }: Props) {
  const url = getEpcUrl(vehicle.chassisNumber);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [vehicle.chassisNumber]);

  if (!url) {
    return (
      <div className="text-center py-12 text-jdm-muted text-sm">
        Kein EPC-Eintrag für dieses Fahrzeug gefunden.
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-jdm-muted">
          Quelle:{' '}
          <a href="https://nissan.epc-data.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-jdm-red">
            nissan.epc-data.com
          </a>
          {' '}— offizieller Nissan Teilekatalog
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-jdm-muted hover:text-jdm-red transition-colors border border-jdm-border rounded-lg px-3 py-1.5 bg-white hover:border-jdm-red/50"
        >
          Im Browser öffnen ↗
        </a>
      </div>

      {/* Iframe container */}
      <div className="relative rounded-xl border border-jdm-border overflow-hidden bg-white" style={{ height: '640px' }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-jdm-bg gap-3 text-jdm-muted z-10">
            <span className="w-5 h-5 border-2 border-jdm-border border-t-jdm-red rounded-full animate-spin" />
            <span className="text-sm">Lade EPC-Katalog…</span>
          </div>
        )}
        <iframe
          key={url}
          src={url}
          className="w-full h-full border-0"
          title={`Nissan EPC — ${vehicle.chassisNumber}`}
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer"
        />
      </div>

      <p className="text-[10px] text-center text-jdm-muted">
        Falls die Seite nicht lädt:{' '}
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-jdm-red">
          {url}
        </a>
      </p>
    </div>
  );
}


