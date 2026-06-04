import type { EpcCategory } from '@/types';

/**
 * Placeholder EPC structure for Nissan Skyline R34.
 * Replace diagramUrl with real Nissan EPC / FAST diagram URLs when available.
 */
export const EPC_CATEGORIES: EpcCategory[] = [
  {
    id:     'engine',
    name:   'Engine',
    nameDE: 'Motor',
    icon:   '⚙️',
    subcategories: [
      {
        id:      'engine-timing',
        name:    'Timing Belt / Chain',
        nameDE:  'Steuerriemen / Steuerkette',
        diagramUrl: null as unknown as string, // TODO: real EPC diagram URL
        parts: [
          { itemNumber: 1,  partNumber: '13028-AA001', description: 'Timing Belt',           descriptionDE: 'Zahnriemen',           quantity: 1 },
          { itemNumber: 2,  partNumber: '13070-AA001', description: 'Timing Belt Tensioner',  descriptionDE: 'Zahnriemenspanner',    quantity: 1 },
          { itemNumber: 3,  partNumber: '13085-AA001', description: 'Idler Pulley',           descriptionDE: 'Umlenkrolle',          quantity: 1 },
        ],
      },
      {
        id:      'engine-oiling',
        name:    'Engine Lubrication',
        nameDE:  'Motorschmierung',
        parts: [
          { itemNumber: 1,  partNumber: '15208-H8904', description: 'Oil Filter',             descriptionDE: 'Ölfilter',             quantity: 1 },
          { itemNumber: 2,  partNumber: '15010-AA010', description: 'Oil Pump',               descriptionDE: 'Ölpumpe',              quantity: 1 },
        ],
      },
      {
        id:      'engine-cooling',
        name:    'Cooling System',
        nameDE:  'Kühlsystem',
        parts: [
          { itemNumber: 1,  partNumber: '21010-AA020', description: 'Water Pump',             descriptionDE: 'Wasserpumpe',          quantity: 1 },
          { itemNumber: 2,  partNumber: '21400-AA050', description: 'Radiator',               descriptionDE: 'Kühler',               quantity: 1 },
          { itemNumber: 3,  partNumber: '21501-AA010', description: 'Thermostat',             descriptionDE: 'Thermostat',           quantity: 1 },
        ],
      },
    ],
  },
  {
    id:     'transmission',
    name:   'Transmission',
    nameDE: 'Getriebe',
    icon:   '🔧',
    subcategories: [
      {
        id:      'gearbox',
        name:    'Manual Gearbox (FS5W71C)',
        nameDE:  'Schaltgetriebe (FS5W71C)',
        parts: [
          { itemNumber: 1,  partNumber: '30100-AA013', description: 'Clutch Kit',             descriptionDE: 'Kupplung',             quantity: 1 },
          { itemNumber: 2,  partNumber: '32010-AA010', description: 'Gearbox Assembly',       descriptionDE: 'Getriebegehäuse',      quantity: 1 },
        ],
      },
    ],
  },
  {
    id:     'suspension',
    name:   'Suspension & Steering',
    nameDE: 'Fahrwerk & Lenkung',
    icon:   '🛞',
    subcategories: [
      {
        id:      'front-suspension',
        name:    'Front Suspension',
        nameDE:  'Vorderachse',
        parts: [
          { itemNumber: 1,  partNumber: '54302-AA010', description: 'Front Strut Assembly',   descriptionDE: 'Vorderes Federbein',   quantity: 2 },
          { itemNumber: 2,  partNumber: '54618-AA010', description: 'Front Sway Bar',         descriptionDE: 'Vorderer Stabilisator',quantity: 1 },
        ],
      },
      {
        id:      'rear-suspension',
        name:    'Rear Suspension (Multi-Link)',
        nameDE:  'Hinterachse (Mehrlenker)',
        parts: [
          { itemNumber: 1,  partNumber: '55400-AA010', description: 'Rear Shock Absorber',    descriptionDE: 'Hinterer Stoßdämpfer', quantity: 2 },
        ],
      },
    ],
  },
  {
    id:     'brakes',
    name:   'Brakes',
    nameDE: 'Bremsen',
    icon:   '🔴',
    subcategories: [
      {
        id:      'front-brakes',
        name:    'Front Brakes',
        nameDE:  'Vordere Bremsen',
        parts: [
          { itemNumber: 1,  partNumber: 'D4060-AA025', description: 'Front Brake Pads',       descriptionDE: 'Vordere Bremsbeläge',  quantity: 4 },
          { itemNumber: 2,  partNumber: '40206-AA010', description: 'Front Brake Disc',       descriptionDE: 'Vordere Bremsscheibe', quantity: 2 },
        ],
      },
    ],
  },
  {
    id:     'electrical',
    name:   'Electrical',
    nameDE: 'Elektrik',
    icon:   '⚡',
    subcategories: [
      {
        id:      'ignition',
        name:    'Ignition System',
        nameDE:  'Zündanlage',
        parts: [
          { itemNumber: 1,  partNumber: '22401-AA780', description: 'Spark Plug (x6)',        descriptionDE: 'Zündkerze (x6)',        quantity: 6 },
          { itemNumber: 2,  partNumber: '22020-AA010', description: 'Ignition Coil',          descriptionDE: 'Zündspule',             quantity: 6 },
        ],
      },
    ],
  },
];
