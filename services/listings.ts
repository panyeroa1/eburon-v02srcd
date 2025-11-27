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

  // Helper for Haversine distance (km)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
      return R * c;
  };

  let results: Listing[] = data.map((item: any) => {
    let distance = undefined;
    if (filters.userLocation && item.coordinates) {
        distance = getDistance(
            filters.userLocation.lat, 
            filters.userLocation.lng, 
            item.coordinates.lat, 
            item.coordinates.lng
        );
    }

    return {
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
      isFavorite: false, // Default, handled locally for now
      distance: distance
    };
  });

  // Client-side sorting for distance (since it's calculated dynamically)
  if (filters.sortBy === 'distance') {
      results.sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
      });
  }

  return results;
};
