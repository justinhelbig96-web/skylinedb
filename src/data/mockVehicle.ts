import type { VehicleData } from '@/types';

/**
 * Mock data for chassis number ER34-030828.
 * Replace or extend with real API data when a backend decoder is connected.
 */
export const ER34_030828: VehicleData = {
  chassisNumber:   'ER34-030828',
  model:           'Skyline',
  fullName:        'Nissan Skyline 25GT-T',
  generation:      'R34',
  year:            '1998',
  productionPeriod:'May 1998 – June 2001',
  engine: {
    code:          'RB25DET',
    displacement:  '2498 cc',
    type:          'Inline-6 DOHC',
    configuration: 'Inline-6',
    powerHP:       206,
    powerKW:       151,
    torqueNm:      275,
    aspiration:    'turbocharged',
    valves:        '24-valve',
    camshaft:      'DOHC',
  },
  transmission:    '5-speed manual (FS5W71C)',
  drivetrain:      'FR (Front Engine / Rear Wheel Drive)',
  bodyStyle:       'Sedan (4-door)',
  doors:           4,
  grade:           '25GT-T',
  trim:            'Type X',
  colorCode:       'KH3',
  colorName:       'Super Black',
  colorType:       'Solid',
  interiorCode:    'G',
  interiorName:    'Dark Gray Cloth',
  equipmentCodes: [
    { code: 'ABS',  description: 'Anti-lock Braking System',          category: 'Safety' },
    { code: 'A/C',  description: 'Air Conditioning',                  category: 'Comfort' },
    { code: 'PS',   description: 'Power Steering (Rack & Pinion)',     category: 'Chassis' },
    { code: 'PW',   description: 'Power Windows',                     category: 'Comfort' },
    { code: 'PL',   description: 'Power Door Locks',                  category: 'Comfort' },
    { code: 'SRS',  description: 'Dual SRS Airbags (Driver + Pass.)', category: 'Safety' },
    { code: 'VVEL', description: 'Variable Valve Timing (Neo VVL)',   category: 'Engine' },
    { code: 'LSD',  description: 'Limited Slip Differential (option)',category: 'Chassis' },
  ],
  optionCodes:     ['OP1', 'OP2'],
  features: [
    'Brembo Front Brakes',
    'Viscous LSD (Option)',
    'Momo Leather Steering Wheel',
    'Trip Computer',
    'Factory Recaro Seats (Type X)',
  ],
  sequenceNumber: '030828',
  plantCode:      'F (Tochigi)',
  marketCode:     'JDM',
  source:         'mock',
};
