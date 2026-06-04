import type { Shop } from '@/types';

/**
 * Shop configuration.
 * Add logo images to /public/logos/<id>.svg (or .png).
 * searchUrlTemplate: replace {query} with URL-encoded search term.
 */
export const SHOPS: Shop[] = [
  {
    id:              'jdm-heart',
    name:            'JDM Heart',
    website:         'https://www.jdm-heart.com',
    logoPath:        '/logos/jdm-heart.png',
    searchUrlTemplate: 'https://www.jdm-heart.com/catalogsearch/result/?q={query}',
    country:         'Germany',
    countryCode:     'DE',
    priority:        1,
    tags:            ['JDM', 'Nissan', 'Skyline', 'OEM', 'Tuning'],
    specialties:     ['Nissan', 'Toyota', 'Honda', 'Subaru'],
  },
  {
    id:              'varakai',
    name:            'Varakai',
    website:         'https://www.varakai.de',
    logoPath:        '/logos/varakai.png',
    searchUrlTemplate: 'https://www.varakai.de/search?q={query}',
    country:         'Germany',
    countryCode:     'DE',
    priority:        2,
    tags:            ['JDM', 'Parts', 'Nissan', 'RB Engine'],
    specialties:     ['Nissan', 'Mazda', 'Mitsubishi'],
  },
  {
    id:              'jdm-shop',
    name:            'JDM-Shop.de',
    website:         'https://www.jdm-shop.de',
    logoPath:        '/logos/jdm-shop.png',
    searchUrlTemplate: 'https://www.jdm-shop.de/search?sSearch={query}',
    country:         'Germany',
    countryCode:     'DE',
    priority:        3,
    tags:            ['JDM', 'Accessories', 'Parts'],
    specialties:     ['Multi-Brand'],
  },
  {
    id:              'amayama',
    name:            'Amayama (OEM)',
    website:         'https://amayama.com',
    logoPath:        '/logos/amayama.png',
    searchUrlTemplate: 'https://amayama.com/en/search.html?search_str={query}',
    country:         'Japan',
    countryCode:     'JP',
    priority:        4,
    tags:            ['OEM', 'Genuine Parts', 'Nissan'],
    specialties:     ['Nissan OEM', 'Toyota OEM'],
  },
  {
    id:              'nengun',
    name:            'Nengun Performance',
    website:         'https://www.nengun.com',
    logoPath:        '/logos/nengun.png',
    searchUrlTemplate: 'https://www.nengun.com/search?q={query}',
    country:         'Japan',
    countryCode:     'JP',
    priority:        5,
    tags:            ['JDM', 'Performance', 'Nissan', 'RB'],
    specialties:     ['Nissan', 'Toyota', 'Performance Parts'],
  },
];
