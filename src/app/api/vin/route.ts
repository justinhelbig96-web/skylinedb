import { NextRequest, NextResponse } from 'next/server';
import { ER34_030828 } from '@/data/mockVehicle';
import type { VehicleData } from '@/types';

/**
 * GET /api/vin?chassis=ER34-030828
 *
 * Resolution order:
 *  1. Local mock data (ER34-030828)
 *  2. Built-in R32/R33/R34 decode from chassis prefix tables
 *  3. TODO: GTR-Registry proxy  → add fetch() when endpoint is confirmed
 *  4. TODO: Nissan FAST/EPC API → add auth + fetch() when credentials available
 */
export async function GET(request: NextRequest) {
  const chassis = request.nextUrl.searchParams
    .get('chassis')
    ?.toUpperCase()
    .trim();

  if (!chassis) {
    return NextResponse.json(
      { error: 'Missing chassis parameter.' },
      { status: 400 },
    );
  }

  // ── 1. Mock data hit ──────────────────────────────────────────────────────
  if (chassis === 'ER34-030828') {
    return NextResponse.json({ data: ER34_030828 });
  }

  // ── 2. Decode from chassis prefix ─────────────────────────────────────────
  const decoded = decodeSkylineChassis(chassis);
  if (decoded) {
    return NextResponse.json({ data: decoded });
  }

  // ── 3. External proxy (GTR-Registry / Nissan EPC) ─────────────────────────
  // TODO: implement when a reliable CORS-safe API is available.
  // Example:
  // const response = await fetch(`https://gtr-registry.example.com/api/${chassis}`);
  // if (response.ok) { ... }

  return NextResponse.json(
    { error: `No data found for chassis: ${chassis}` },
    { status: 404 },
  );
}

// ─── Decoder ─────────────────────────────────────────────────────────────────

type ChassisPrefix = {
  pattern: RegExp;
  model: string;
  fullName: string;
  generation: string;
  yearRange: string;
  productionPeriod: string;
  engineCode: string;
  engineName: string;
  displacement: string;
  powerHP: number;
  powerKW: number;
  torqueNm: number;
  aspiration: 'naturally-aspirated' | 'turbocharged' | 'twin-turbocharged';
  transmission: string;
  drivetrain: string;
  bodyStyle: string;
  doors: number;
  grade: string;
};

const CHASSIS_TABLE: ChassisPrefix[] = [
  // ── R32 ─────────────────────────────────────────────────────────────────
  {
    pattern:           /^BNR32/,
    model:             'Skyline GT-R',
    fullName:          'Nissan Skyline GT-R (BNR32)',
    generation:        'R32',
    yearRange:         '1989–1994',
    productionPeriod:  'August 1989 – December 1994',
    engineCode:        'RB26DETT',
    engineName:        'Inline-6 Twin Turbo',
    displacement:      '2568 cc',
    powerHP:           280,
    powerKW:           206,
    torqueNm:          353,
    aspiration:        'twin-turbocharged',
    transmission:      '5-speed manual (RB5W71A)',
    drivetrain:        'ATTESA E-TS 4WD',
    bodyStyle:         'Coupe (2-door)',
    doors:             2,
    grade:             'GT-R',
  },
  {
    pattern:           /^HNR32/,
    model:             'Skyline GTS-4',
    fullName:          'Nissan Skyline GTS-4 (HNR32)',
    generation:        'R32',
    yearRange:         '1989–1994',
    productionPeriod:  'August 1989 – December 1994',
    engineCode:        'RB20DE',
    engineName:        'Inline-6 NA',
    displacement:      '1998 cc',
    powerHP:           155,
    powerKW:           114,
    torqueNm:          186,
    aspiration:        'naturally-aspirated',
    transmission:      '4-speed automatic',
    drivetrain:        'ATTESA 4WD',
    bodyStyle:         'Sedan (4-door)',
    doors:             4,
    grade:             'GTS-4',
  },
  {
    pattern:           /^HCR32/,
    model:             'Skyline GTS-T',
    fullName:          'Nissan Skyline GTS-T (HCR32)',
    generation:        'R32',
    yearRange:         '1989–1994',
    productionPeriod:  'August 1989 – December 1994',
    engineCode:        'RB20DET',
    engineName:        'Inline-6 Turbo',
    displacement:      '1998 cc',
    powerHP:           215,
    powerKW:           158,
    torqueNm:          265,
    aspiration:        'turbocharged',
    transmission:      '5-speed manual',
    drivetrain:        'Hinterradantrieb (FR)',
    bodyStyle:         'Coupe (2-door)',
    doors:             2,
    grade:             'GTS-T',
  },
  // ── R33 ─────────────────────────────────────────────────────────────────
  {
    pattern:           /^ECR33/,
    model:             'Skyline 25GT-T',
    fullName:          'Nissan Skyline 25GT-T (ECR33)',
    generation:        'R33',
    yearRange:         '1993–1998',
    productionPeriod:  'August 1993 – January 1999',
    engineCode:        'RB25DET',
    engineName:        'Inline-6 Turbo',
    displacement:      '2498 cc',
    powerHP:           255,
    powerKW:           188,
    torqueNm:          284,
    aspiration:        'turbocharged',
    transmission:      '5-speed manual (FS5W71C)',
    drivetrain:        'Hinterradantrieb (FR)',
    bodyStyle:         'Sedan (4-door)',
    doors:             4,
    grade:             '25GT-T',
  },
  {
    pattern:           /^HCR33/,
    model:             'Skyline GTS25T',
    fullName:          'Nissan Skyline GTS25T (HCR33)',
    generation:        'R33',
    yearRange:         '1993–1998',
    productionPeriod:  'August 1993 – January 1999',
    engineCode:        'RB25DET',
    engineName:        'Inline-6 Turbo',
    displacement:      '2498 cc',
    powerHP:           255,
    powerKW:           188,
    torqueNm:          284,
    aspiration:        'turbocharged',
    transmission:      '5-speed manual (FS5W71C)',
    drivetrain:        'Hinterradantrieb (FR)',
    bodyStyle:         'Coupe (2-door)',
    doors:             2,
    grade:             'GTS25T',
  },
  {
    pattern:           /^BCNR33/,
    model:             'Skyline GT-R',
    fullName:          'Nissan Skyline GT-R (BCNR33)',
    generation:        'R33',
    yearRange:         '1995–1998',
    productionPeriod:  'January 1995 – December 1998',
    engineCode:        'RB26DETT',
    engineName:        'Inline-6 Twin Turbo',
    displacement:      '2568 cc',
    powerHP:           280,
    powerKW:           206,
    torqueNm:          368,
    aspiration:        'twin-turbocharged',
    transmission:      '5-speed manual (RB5W71A)',
    drivetrain:        'ATTESA E-TS 4WD',
    bodyStyle:         'Coupe (2-door)',
    doors:             2,
    grade:             'GT-R',
  },
  // ── R34 ─────────────────────────────────────────────────────────────────
  // ENR34 must come before ER34 (longer prefix first, else /^ER34/ matches both)
  {
    pattern:           /^ENR34/,
    model:             'Skyline 25GT',
    fullName:          'Nissan Skyline 25GT (ENR34)',
    generation:        'R34',
    yearRange:         '1998–2001',
    productionPeriod:  'May 1998 – June 2001',
    engineCode:        'RB25DE',
    engineName:        'Inline-6 NA (Neo VVL)',
    displacement:      '2498 cc',
    powerHP:           200,
    powerKW:           147,
    torqueNm:          245,
    aspiration:        'naturally-aspirated',
    transmission:      '5-speed manual / 4AT',
    drivetrain:        'ATTESA 4WD',
    bodyStyle:         'Sedan (4-door)',
    doors:             4,
    grade:             '25GT',
  },
  {
    pattern:           /^HR34/,
    model:             'Skyline 20GT',
    fullName:          'Nissan Skyline 20GT (HR34)',
    generation:        'R34',
    yearRange:         '1998–2001',
    productionPeriod:  'May 1998 – June 2001',
    engineCode:        'RB20DE',
    engineName:        'Inline-6 NA',
    displacement:      '1998 cc',
    powerHP:           155,
    powerKW:           114,
    torqueNm:          196,
    aspiration:        'naturally-aspirated',
    transmission:      '4-speed automatic (RE4R01A)',
    drivetrain:        'Hinterradantrieb (FR)',
    bodyStyle:         'Sedan (4-door)',
    doors:             4,
    grade:             '20GT',
  },
  {
    // ER34 covers BOTH 25GT (RB25DE, NA) and 25GT-T (RB25DET, Turbo).
    // Engine cannot be determined from chassis prefix alone — Grade/option code needed.
    pattern:           /^ER34/,
    model:             'Skyline 25GT / 25GT-T',
    fullName:          'Nissan Skyline 25GT / 25GT-T (ER34)',
    generation:        'R34',
    yearRange:         '1998–2001',
    productionPeriod:  'May 1998 – June 2001',
    engineCode:        'RB25DE / RB25DET',
    engineName:        'Inline-6 NA oder Turbo (Neo VVL) – abhängig vom Grade',
    displacement:      '2498 cc',
    powerHP:           200,   // 25GT (NA): 200 PS / 147 kW | 25GT-T (Turbo): 280 PS / 206 kW
    powerKW:           147,
    torqueNm:          245,   // NA: 245 Nm | Turbo: ~275 Nm
    aspiration:        'naturally-aspirated', // placeholder – see note above
    transmission:      '5-speed manual (FS5W71C) / 4AT',
    drivetrain:        'Hinterradantrieb (FR)',
    bodyStyle:         'Sedan (4-door)',
    doors:             4,
    grade:             '25GT (RB25DE) oder 25GT-T (RB25DET)',
  },
  {
    pattern:           /^BNR34/,
    model:             'Skyline GT-R',
    fullName:          'Nissan Skyline GT-R (BNR34)',
    generation:        'R34',
    yearRange:         '1999–2002',
    productionPeriod:  'January 1999 – July 2002',
    engineCode:        'RB26DETT',
    engineName:        'Inline-6 Twin Turbo',
    displacement:      '2568 cc',
    powerHP:           280,
    powerKW:           206,
    torqueNm:          392,
    aspiration:        'twin-turbocharged',
    transmission:      '6-speed manual (Getrag)',
    drivetrain:        'ATTESA E-TS Pro 4WD',
    bodyStyle:         'Coupe (2-door)',
    doors:             2,
    grade:             'GT-R',
  },
  {
    pattern:           /^HR32/,
    model:             'Skyline GTS',
    fullName:          'Nissan Skyline GTS (HR32)',
    generation:        'R32',
    yearRange:         '1989–1994',
    productionPeriod:  'August 1989 – December 1994',
    engineCode:        'RB20DE',
    engineName:        'Inline-6 NA',
    displacement:      '1998 cc',
    powerHP:           145,
    powerKW:           107,
    torqueNm:          180,
    aspiration:        'naturally-aspirated',
    transmission:      '5-speed manual',
    drivetrain:        'Hinterradantrieb (FR)',
    bodyStyle:         'Coupe (2-door)',
    doors:             2,
    grade:             'GTS',
  },
];

function decodeSkylineChassis(chassis: string): VehicleData | null {
  const normalized = chassis.replace(/[-\s]/g, '');
  const entry = CHASSIS_TABLE.find((e) => e.pattern.test(normalized));
  if (!entry) return null;

  const seqMatch = normalized.match(/\d+$/);
  const sequence = seqMatch ? seqMatch[0] : '000000';

  // ER34 is ambiguous: both RB25DE (25GT) and RB25DET (25GT-T) use the same chassis prefix.
  // The grade/trim code within the full VIN determines the actual engine.
  const isAmbiguous = /^ER34/i.test(normalized);

  return {
    chassisNumber:   chassis,
    model:           entry.model,
    fullName:        entry.fullName,
    generation:      entry.generation,
    year:            entry.yearRange.split('–')[0],
    productionPeriod: entry.productionPeriod,
    engine: {
      code:          entry.engineCode,
      displacement:  entry.displacement,
      type:          entry.engineName,
      configuration: 'Inline-6',
      powerHP:       entry.powerHP,
      powerKW:       entry.powerKW,
      torqueNm:      entry.torqueNm,
      aspiration:    entry.aspiration,
      valves:        '24-valve',
      camshaft:      'DOHC',
    },
    transmission:    entry.transmission,
    drivetrain:      entry.drivetrain,
    bodyStyle:       entry.bodyStyle,
    doors:           entry.doors,
    grade:           entry.grade,
    trim:            '—',
    colorCode:       '—',
    colorName:       'Unknown (VIN decode)',
    colorType:       '—',
    interiorCode:    '—',
    interiorName:    'Unknown',
    equipmentCodes:  [],
    optionCodes:     [],
    features:        isAmbiguous
      ? ['⚠ ER34 Hinweis: Chassis-Präfix allein reicht nicht aus. ER34 existiert mit RB25DE (25GT, Sauger) UND RB25DET (25GT-T, Turbo). Vollständige VIN oder Fahrzeugpapiere für genaue Motorbestimmung notwendig.']
      : [],
    sequenceNumber:  sequence,
    marketCode:      'JDM',
    source:          'decoded',
  };
}
