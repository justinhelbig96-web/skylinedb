import type { PartsSynonym } from '@/types';

/**
 * Parts synonym/translation dictionary.
 * german:         Primary German search term
 * english:        Generic English synonyms
 * engineSpecific: Additional terms per engine code
 * category:       UI grouping
 */
export const PARTS_SYNONYMS: PartsSynonym[] = [
  {
    id:       'timing-belt',
    german:   'Zahnriemen',
    english:  ['Timing Belt', 'Cam Belt', 'Timing Chain Belt'],
    engineSpecific: {
      RB25DE:    ['RB25 Timing Belt', 'RB25DE Timing Belt', 'Nissan 13028-AA001'],
      RB25DET:   ['RB25DET Timing Belt', 'RB25 Turbo Timing Belt'],
      RB26DETT:  ['RB26 Timing Belt', 'RB26DETT Timing Belt', 'GTR Timing Belt'],
    },
    category:     'Motor',
    partCategory: 'Timing',
    oem:          ['13028-AA001', '13028-AA000'],
  },
  {
    id:       'water-pump',
    german:   'Wasserpumpe',
    english:  ['Water Pump', 'Coolant Pump'],
    engineSpecific: {
      RB25DE:   ['RB25 Water Pump', 'Nissan 21010-AA020'],
      RB25DET:  ['RB25DET Water Pump'],
      RB26DETT: ['RB26 Water Pump', 'GTR Water Pump'],
    },
    category:     'Kühlung',
    partCategory: 'Cooling',
    oem:          ['21010-AA020'],
  },
  {
    id:       'oil-filter',
    german:   'Ölfilter',
    english:  ['Oil Filter', 'Engine Oil Filter'],
    engineSpecific: {
      RB25DE:   ['RB25 Oil Filter'],
      RB25DET:  ['RB25DET Oil Filter'],
      RB26DETT: ['RB26DETT Oil Filter', 'GTR Oil Filter'],
    },
    category:     'Motor',
    partCategory: 'Maintenance',
    oem:          ['15208-H8904', '15208-65F00'],
  },
  {
    id:       'spark-plug',
    german:   'Zündkerze',
    english:  ['Spark Plug', 'Ignition Plug'],
    engineSpecific: {
      RB25DE:   ['RB25 Spark Plug', 'NGK PFR6B-11'],
      RB25DET:  ['RB25DET Spark Plug', 'NGK PFR6B-11'],
      RB26DETT: ['RB26DETT Spark Plug', 'NGK R35-10 Spark Plug'],
    },
    category:     'Zündanlage',
    partCategory: 'Ignition',
    oem:          ['22401-AA780'],
  },
  {
    id:       'turbo-hose',
    german:   'Turboschlauch',
    english:  ['Turbo Hose', 'Boost Hose', 'Intercooler Pipe', 'Charge Pipe'],
    engineSpecific: {
      RB25DET:  ['RB25DET Turbo Hose', 'RB25 Boost Hose'],
      RB26DETT: ['RB26DETT Turbo Hose', 'GTR Boost Hose', 'Twin Turbo Hose'],
    },
    category:     'Turbo',
    partCategory: 'Turbo',
  },
  {
    id:       'clutch',
    german:   'Kupplung',
    english:  ['Clutch Kit', 'Clutch Disc', 'Clutch Plate', 'Pressure Plate'],
    engineSpecific: {
      RB25DE:   ['RB25 Clutch Kit'],
      RB25DET:  ['RB25DET Clutch Kit', 'RB25 Performance Clutch'],
      RB26DETT: ['RB26DETT Clutch', 'GTR Clutch Kit'],
    },
    category:     'Getriebe',
    partCategory: 'Drivetrain',
    oem:          ['30100-AA013'],
  },
  {
    id:       'brake-pads',
    german:   'Bremsbeläge',
    english:  ['Brake Pads', 'Brake Shoes', 'Front Brake Pads', 'Rear Brake Pads'],
    engineSpecific: {},
    category:     'Bremsen',
    partCategory: 'Brakes',
    oem:          ['D4060-AA025'],
  },
  {
    id:       'coilover',
    german:   'Gewindefahrwerk',
    english:  ['Coilover', 'Coilover Kit', 'Suspension Kit', 'Lowering Kit'],
    engineSpecific: {},
    category:     'Fahrwerk',
    partCategory: 'Suspension',
  },
  {
    id:       'exhaust',
    german:   'Auspuff',
    english:  ['Exhaust', 'Exhaust System', 'Cat-Back Exhaust', 'Muffler'],
    engineSpecific: {
      RB25DET:  ['RB25DET Exhaust', 'R34 Exhaust System'],
      RB26DETT: ['RB26DETT Exhaust', 'GTR Exhaust', 'R34 GTR Exhaust'],
    },
    category:     'Abgasanlage',
    partCategory: 'Exhaust',
  },
  {
    id:       'air-filter',
    german:   'Luftfilter',
    english:  ['Air Filter', 'Induction Kit', 'Cold Air Intake', 'Panel Filter'],
    engineSpecific: {
      RB25DET:  ['RB25DET Air Filter', 'RB25 Intake'],
      RB26DETT: ['RB26 Air Filter', 'GTR Induction Kit'],
    },
    category:     'Motor',
    partCategory: 'Air Intake',
  },
];

/**
 * Resolve all search terms for a given German query and engine code.
 */
export function resolveSearchTerms(
  query: string,
  engineCode?: string,
): { translations: string[]; engineTerms: string[] } {
  const lower = query.toLowerCase();
  const synonym = PARTS_SYNONYMS.find(
    (s) =>
      s.german.toLowerCase() === lower ||
      s.english.some((e) => e.toLowerCase() === lower) ||
      s.id === lower,
  );

  if (!synonym) {
    return { translations: [query], engineTerms: [] };
  }

  const translations  = synonym.english;
  const engineTerms   = engineCode ? (synonym.engineSpecific[engineCode] ?? []) : [];

  return { translations, engineTerms };
}
