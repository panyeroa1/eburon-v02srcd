
export interface Listing {
  id: string;
  name: string;
  address: string;
  price: number;
  imageUrls: string[];
  energyClass: string;
  type: 'apartment' | 'house' | 'studio' | 'villa';
  size: number;
  description: string;
  bedrooms: number;
  petsAllowed: boolean;
  isFavorite?: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface Reservation {
  id: string;
  listingId: string;
  listingName: string;
  listingAddress: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  date: string;
  status: 'pending' | 'confirmed';
}

export type ApartmentSearchFilters = {
  city?: string | null;
  neighborhood?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minSize?: number | null;
  maxSize?: number | null;
  bedrooms?: number | null;
  petsAllowed?: boolean | null;
  type?: string | null;
  energyClassMin?: string | null;
  sortBy?: "price_asc" | "price_desc" | "size" | "default" | null;
};

// Simplified NLU response for the text fallback if needed
export interface NLUResponse {
  intent: "APARTMENT_SEARCH" | "REFINE_FILTERS" | "ASK_DETAILS" | "SMALL_TALK" | "END_SESSION";
  filters: ApartmentSearchFilters;
  assistantReply: string;
  targetListingId?: string | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type UserRole = 'admin' | 'contractor' | 'owner' | 'broker' | 'tenant';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  propertyId: string; // listingId
  propertyName: string;
  description: string;
  type: 'plumbing' | 'electric' | 'general' | 'other';
  status: 'open' | 'pending' | 'resolved';
  createdAt: string;
  assignedTo?: string; // contractorId
  imageUrl?: string;
}
