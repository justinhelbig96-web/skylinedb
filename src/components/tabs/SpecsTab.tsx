import type { VehicleData } from '@/types';

interface Props { vehicle: VehicleData }

export default function SpecsTab({ vehicle }: Props) {
  const { engine } = vehicle;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Allgemein */}
      <Section title="Allgemein">
        <Row label="Modell"               value={vehicle.fullName} />
        <Row label="Generation"           value={vehicle.generation} />
        <Row label="Baujahr"              value={vehicle.year} />
        <Row label="Produktionszeitraum"  value={vehicle.productionPeriod} />
        <Row label="Karosserieform"       value={vehicle.bodyStyle} />
        <Row label="Türen"                value={String(vehicle.doors)} />
        <Row label="Grade / Trim"         value={`${vehicle.grade}${vehicle.trim !== '—' ? ' — ' + vehicle.trim : ''}`} />
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
      <div className="card divide-y divide-jdm-border/50">{children}</div>
    </div>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="data-row px-4">
      <span className="data-label">{label}</span>
      <span className={`data-value ${highlight ? 'text-jdm-red-bright font-bold font-mono' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}
