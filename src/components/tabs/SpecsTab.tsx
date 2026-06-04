import type { VehicleData } from '@/types';

interface Props {
  vehicle: VehicleData;
  epcInfo?: Record<string, string> | null;
}

// Labels that map EPC field names → German display label
const EPC_LABEL_MAP: Record<string, string> = {
  'model':            'Modell',
  'year':             'Baujahr',
  'engine':           'Motor',
  'transmission':     'Getriebe',
  'drive':            'Antrieb',
  'body':             'Karosserie',
  'doors':            'Türen',
  'fuel':             'Kraftstoff',
  'market':           'Markt',
  'grade':            'Grade',
  'trim':             'Ausstattung',
  'color':            'Farbe',
  'interior':         'Innenraum',
  'chassis':          'Fahrgestell',
  'displacement':     'Hubraum',
  'power':            'Leistung',
  'torque':           'Drehmoment',
};

function epcLabel(key: string): string {
  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(EPC_LABEL_MAP)) {
    if (lower.includes(k)) return v;
  }
  return key;
}

export default function SpecsTab({ vehicle, epcInfo }: Props) {
  const { engine } = vehicle;
  const hasEpc = epcInfo && Object.keys(epcInfo).length > 0;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* EPC Originaldaten — shown first, acts as primary source */}
      {hasEpc && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="section-title mb-0">Originaldaten — nissan.epc-data.com</p>
            <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">
              Primärquelle
            </span>
          </div>
          <div className="border border-green-200 rounded-lg divide-y divide-green-100 bg-white overflow-hidden">
            {Object.entries(epcInfo).map(([k, v]) => (
              <div key={k} className="data-row px-4 bg-green-50/40">
                <span className="data-label">{epcLabel(k)} <span className="text-[10px] text-green-500 font-mono">({k})</span></span>
                <span className="data-value font-medium text-green-800">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-jdm-muted mt-1">
            Quelle:{' '}
            <a
              href={`https://nissan.epc-data.com/skyline/nissan_skyline-${vehicle.chassisNumber.replace(/[-\s].*/i, '').toLowerCase()}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-jdm-red"
            >
              nissan.epc-data.com ↗
            </a>
          </p>
        </div>
      )}

      {/* Allgemein */}
      <Section title="Allgemein">
        <Row label="Modell"               value={vehicle.fullName} />
        <Row label="Generation"           value={vehicle.generation} />
        <Row label="Baujahr"              value={vehicle.year} />
        <Row label="Produktionszeitraum"  value={vehicle.productionPeriod} />
        <Row label="Karosserieform"       value={vehicle.bodyStyle} />
        <Row label="Türen"                value={String(vehicle.doors)} />
        <Row label="Grade / Trim"         value={`${vehicle.grade}${vehicle.trim && vehicle.trim !== '—' ? ' — ' + vehicle.trim : ''}`} />
        <Row label="Markt"                value={vehicle.marketCode ?? '—'} />
        {vehicle.plantCode && <Row label="Werk" value={vehicle.plantCode} />}
      </Section>

      {/* Motor */}
      <Section title="Motor">
        <Row label="Motorcode"      value={engine.code} highlight />
        <Row label="Hubraum"        value={engine.displacement} />
        <Row label="Konfiguration"  value={engine.type} />
        <Row label="Nockenwelle"    value={engine.camshaft} />
        <Row label="Ventile"        value={engine.valves} />
        <Row label="Aufladung"      value={engine.aspiration} />
        <Row label="Leistung"       value={`${engine.powerHP} PS (${engine.powerKW} kW)`} />
        <Row label="Drehmoment"     value={`${engine.torqueNm} Nm`} />
      </Section>

      {/* Antriebsstrang */}
      <Section title="Antriebsstrang">
        <Row label="Getriebe"   value={vehicle.transmission} />
        <Row label="Antrieb"    value={vehicle.drivetrain} />
      </Section>

      {/* Farbe & Innenraum */}
      <Section title="Farbe & Innenraum">
        <Row label="Lackcode"     value={vehicle.colorCode} />
        <Row label="Farbe"        value={vehicle.colorName} />
        <Row label="Lacktyp"      value={vehicle.colorType} />
        <Row label="Innenraumcode" value={vehicle.interiorCode} />
        <Row label="Innenraum"    value={vehicle.interiorName} />
      </Section>

      {/* Features */}
      {vehicle.features.length > 0 && (
        <Section title="Sonderausstattung / Features">
          <ul className="space-y-1.5">
            {vehicle.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-jdm-text">
                <span className="text-jdm-red mt-0.5">▸</span>
                {f}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="section-title">{title}</p>
      <div className="border border-jdm-border rounded-lg divide-y divide-jdm-border bg-white">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="data-row px-4">
      <span className="data-label">{label}</span>
      <span className={`data-value ${highlight ? 'text-jdm-red font-bold font-mono' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

