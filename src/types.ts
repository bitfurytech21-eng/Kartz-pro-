export interface PropertyAgent {
  name: string;
  phone: string;
  email: string;
  photo: string;
}

export interface PropertyOwner {
  name: string;
  category:
    | 'Aristocracy & Royalty'
    | 'Haute Couture & Luxury'
    | 'Arts, Cinema & Architecture'
    | 'Industrialists & Tech Pioneers'
    | 'Private Family Office'
    | 'Grand Cru Wine Estate'
    | 'Diplomatic & Heritage'
    | 'Sports & Adventure Heritage';
  ownershipType:
    | 'Historical Proprietor'
    | 'Current Propriétaire'
    | 'Private Family Estate'
    | 'Heritage Trust'
    | 'Private Collector';
  periodOrAcquired?: string;
  avatarInitials?: string;
  photo?: string;
  photoFilename?: string;
  bio: string;
  highlights?: string[];
  nationality?: string;
  verified?: boolean;
}

export interface PropertyAmenities {
  pool: boolean;
  ac: boolean;
  elevator: boolean;
  alarm: boolean;
  terrace: boolean;
  terraceSurface?: number | null;
  nbTerraces?: number | null;
  balcony: boolean;
  garden: boolean;
  gardenSurface?: number | null;
  jacuzzi: boolean;
  chimney: boolean;
  tennis: boolean;
}

export interface Property {
  id: string;
  ref: string;
  title: string;
  type?: string;
  propertyType?: string;
  typeDisplay: string;
  location: string;
  city: string;
  department: string;
  region: string;
  postalCode?: string;
  surface: number;
  rooms: number;
  bedrooms: number;
  price: number | null;
  priceFormatted: string;
  priceExclBuyerFees?: number | null;
  priceInclBuyerFees?: number | null;
  statutVente?: string;
  lifeStyle?: string;
  dateDebutMandat?: string;
  description?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  isConfidential?: boolean;
  isOffMarket: boolean;
  isExclusive: boolean;
  isCoExclusive?: boolean;
  chips?: string[];
  images: string[];
  propertyTypeSlug?: string;
  tourUrl?: string;
  externalTourUrl?: string;
  videoUrl?: string;
  filmUrl?: string;
  films?: string[];
  vimeoId?: string;
  lat?: number | null;
  lng?: number | null;
  coordinates?: {
    lat: number;
    lng: number;
  };
  agent: PropertyAgent;
  owner?: PropertyOwner;
  amenities: PropertyAmenities;
}

export type Currency = 'EUR' | 'USD' | 'GBP';

export type Language =
  | 'EN'
  | 'FR'
  | 'ES'
  | 'PT'
  | 'DE'
  | 'IT'
  | 'RU'
  | 'ZH'
  | 'AR'
  | 'JA'
  | 'NL'
  | 'SV'
  | 'KO'
  | 'TR'
  | 'PL'
  | 'EL'
  | 'HI'
  | 'HE'
  | 'DA'
  | 'NO'
  | 'FI'
  | 'CS'
  | 'TH'
  | 'VI';

export type ViewMode = 'list' | 'map';

export type SortOption =
  | 'descPrice'
  | 'ascPrice'
  | 'newest'
  | 'surfaceDesc'
  | 'roomsDesc';

export interface FilterState {
  search: string;
  propertyType: string;
  region: string;
  minPrice: number | null;
  maxPrice: number | null;
  minRooms: number | null;
  minBedrooms: number | null;
  minSurface: number | null;
  isOffMarketOnly: boolean;
  isExclusiveOnly: boolean;
  mandateType: string;
  transactionType: string;
  poolOnly: boolean;
  acOnly: boolean;
  elevatorOnly: boolean;
  terraceOnly: boolean;
  balconyOnly: boolean;
  gardenOnly: boolean;
  chimneyOnly: boolean;
  tennisOnly: boolean;
  jacuzziOnly: boolean;
}

export interface AlertData {
  email: string;
  propertyType: string;
  region: string;
  maxBudget: string;
  frequency: 'instant' | 'daily' | 'weekly';
}
