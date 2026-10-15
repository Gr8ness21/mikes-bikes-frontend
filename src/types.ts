export type Role = 'member' | 'driver' | 'admin';

export type GalleryItem = {
  _id: string;
  url: string;
  originalName: string;
  kind: 'image' | 'video';
  alt: string;
  showOnHome: boolean;
  showOnAbout: boolean;
  order: number;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
};

export type Vehicle = {
  _id: string;
  year: number;
  make: string;
  model: string;
  operable: boolean;
};

export type Quote = {
  currency: string;
  subtotal: number;
  enclosedPremium: number;
  seasonalMultiplier: number;
  discount404: number;
  i285Applied: boolean;
  total: number;
  depositDue: number;
  breakdown: {
    miles: number;
    perMile: number;
    base: number;
    notes: string[];
    seasonalName?: string | null;
  };
};

export type GeoPoint = {
  lat: number;
  lng: number;
  displayName?: string;
};

export type QuoteResponse = {
  pickupAddress: string;
  dropoffAddress: string;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  path?: [number, number][];
  miles: number;
  insideI285: boolean;
  operable: boolean;
  transportType: 'open' | 'enclosed';
  serviceType: string;
  quote: Quote;
};

export type Booking = {
  _id: string;
  serviceType: string;
  transportType: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledDate?: string;
  miles: number;
  status: string;
  quote: Quote;
  operable: boolean;
  vehicle?: Vehicle;
};
