export type Language = 'en' | 'zh';

export interface ClientDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface LineItem {
  id: string;
  categoryId: string;
  description: string;
  descriptionZh?: string;
  details?: string; // e.g., "Length: 3m"
  detailsZh?: string;
  quantity: number;
  unitPriceEx: number;
  totalPriceInc: number;
  images?: string[];
}

export interface PricingItem {
  id: string;
  label: string;
  priceEx: number;
  unit?: string;
}

export type CategoryId = 
  | 'minor-bath' 
  | 'handrail' 
  | 'ramp' 
  | 'ramp-rails' 
  | 'major-bath' 
  | 'maintenance';

export interface CategoryDef {
  id: CategoryId;
  labelEn: string;
  labelZh: string;
}

export interface Dictionary {
  [key: string]: {
    en: string;
    zh: string;
  };
}