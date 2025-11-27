import { supabase } from './supabase';
import { ApartmentSearchFilters, Listing } from '../types';

export const searchListings = async (filters: ApartmentSearchFilters): Promise<Listing[]> => {
  let query = supabase
    .from('listings')
    .select('*');

  if (filters.city) {
    query = query.ilike('address', `%${filters.city}%`);
  }
  
  if (filters.minPrice) {
    query = query.gte('price', filters.minPrice);
  }
  
  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }
  
  if (filters.minSize) {
    query = query.gte('size', filters.minSize);
  }
  
  if (filters.bedrooms) {
    query = query.gte('bedrooms', filters.bedrooms);
  }
  
  if (filters.petsAllowed) {
    query = query.eq('pets_allowed', true);
  }
  
  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  // Sorting
  if (filters.sortBy === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (filters.sortBy === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else if (filters.sortBy === 'size') {
    query = query.order('size', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching listings:', error);
    return [];
  }

  // Map Supabase snake_case to camelCase if necessary, or ensure types match
  // Our SQL schema uses snake_case for some fields (pets_allowed, image_urls)
  // But our TS type uses camelCase (petsAllowed, imageUrls)
  // We need to map them.
  
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    address: item.address,
    price: item.price,
    imageUrls: item.image_urls || [],
    energyClass: item.energy_class,
    type: item.type,
    size: item.size,
    description: item.description,
    bedrooms: item.bedrooms,
    petsAllowed: item.pets_allowed,
    coordinates: item.coordinates,
    isFavorite: false // Default, handled locally for now
  }));
};
