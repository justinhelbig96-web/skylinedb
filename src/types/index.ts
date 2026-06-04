// ─── Engine ─────────────────────────────────────────────────────────────────

export interface EngineData {
  code: string;
  displacement: string;
  type: string;
  configuration: string;
  powerHP: number;
  powerKW: number;
  torqueNm: number;
  aspiration: 'naturally-aspirated' | 'turbocharged' | 'twin-turbocharged';
  valves: string;
  camshaft: string;
}

// ─── Equipment ──────────────────────────────────────────────────────────────

export interface EquipmentCode {
  code: string;
  description: string;
  category: string;
}

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export interface VehicleData {
  chassisNumber: string;
  model: string;
  fullName: string;
  generation: string;
  year: string;
  productionPeriod: string;
  engine: EngineData;
  transmission: string;
  drivetrain: string;
  bodyStyle: string;
  doors: number;
  grade: string;
  trim: string;
  colorCode: string;
  colorName: string;
  colorType: string;
  interiorCode: string;
  interiorName: string;
  equipmentCodes: EquipmentCode[];
  optionCodes: string[];
  features: string[];
  sequenceNumber: string;
  plantCode?: string;
  marketCode?: string;
  raw?: Record<string, string>;
  source?: 'mock' | 'api' | 'decoded';
}

// ─── Shops ───────────────────────────────────────────────────────────────────

export interface Shop {
  id: string;
  name: string;
  website: string;
  logoPath: string;
  /** URL template – use {query} as placeholder */
  searchUrlTemplate: string;
  country: string;
  countryCode: string;
  priority: number;
  tags: string[];
  specialties: string[];
}

// ─── Parts / Synonyms ────────────────────────────────────────────────────────

export interface PartsSynonym {
  id: string;
  german: string;
  english: string[];
  /** engine code → additional search terms */
  engineSpecific: Record<string, string[]>;
  category: string;
  partCategory: string;
  oem?: string[];
}

export interface ShopSearchLink {
  shop: Shop;
  searchUrl: string;
  query: string;
}

export interface PartsSearchResult {
  searchTerm: string;
  translations: string[];
  engineSpecificTerms: string[];
  shopLinks: ShopSearchLink[];
}

// ─── EPC ─────────────────────────────────────────────────────────────────────

export interface EpcPart {
  itemNumber: number;
  partNumber: string;
  description: string;
  descriptionDE: string;
  quantity: number;
  notes?: string;
  supersededBy?: string;
}

export interface EpcSubcategory {
  id: string;
  name: string;
  nameDE: string;
  diagramUrl?: string;
  parts: EpcPart[];
}

export interface EpcCategory {
  id: string;
  name: string;
  nameDE: string;
  icon: string;
  subcategories: EpcSubcategory[];
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export type TabId = 'specs' | 'equipment' | 'epc' | 'parts' | 'shops';

export interface TabConfig {
  id: TabId;
  label: string;
  labelDE: string;
  icon: string;
}
