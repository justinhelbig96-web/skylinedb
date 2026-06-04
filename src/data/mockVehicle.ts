import type { VehicleData } from '@/types';

/**
 * Mock data for chassis number ER34-030828.
 * ER34 25GT = RB25DE (naturally aspirated), available with 4AT or 5MT.
 * This car has 4-speed automatic.
 */
export const ER34_030828: VehicleData = {
  chassisNumber:   'ER34-030828',
  model:           'Skyline',
  fullName:        'Nissan Skyline 25GT',
  generation:      'R34',
  year:            '1998',
  productionPeriod:'May 1998 – June 2001',
  engine: {
    code:          'RB25DE',
    displacement:  '2498 cc',
    type:          'Inline-6 DOHC',
    configuration: 'Inline-6',
    powerHP:       200,
    powerKW:       147,
    torqueNm:      245,
    aspiration:    'naturally-aspirated',
    valves:        '24-valve',
    camshaft:      'DOHC',
  },
  transmission:    '4-speed automatic (RE4R01B)',
  drivetrain:      'Hinterradantrieb (FR)',
  bodyStyle:       'Sedan (4-door)',
  doors:           4,
  grade:           '25GT',
  trim:            '—',
  colorCode:       'KH3',
  colorName:       'Super Black',
  colorType:       'Solid',
  interiorCode:    'G',
  interiorName:    'Dark Gray Cloth',
  equipmentCodes: [
    { code: 'ABS',   description: 'Anti-lock Braking System',          category: 'Safety' },
    { code: 'A/C',   description: 'Air Conditioning',                  category: 'Comfort' },
    { code: 'PS',    description: 'Power Steering (Rack & Pinion)',     category: 'Chassis' },
    { code: 'PW',    description: 'Power Windows',                     category: 'Comfort' },
    { code: 'PL',    description: 'Power Door Locks',                  category: 'Comfort' },
    { code: 'SRS',   description: 'Dual SRS Airbags (Driver + Pass.)', category: 'Safety' },
    { code: 'NVVL',  description: 'NISSAN Neo VVL Variable Valve Lift', category: 'Engine' },
  ],
  optionCodes:     [],
  features: [
    'NISSAN Neo VVL (Variable Valve Lift)',
    'Servolenkung',
    'Elektrische Fensterheber',
    'Dual SRS Airbags',
  ],
  sequenceNumber: '030828',
  plantCode:      'F (Tochigi)',
  marketCode:     'JDM',
  source:         'mock',
};
