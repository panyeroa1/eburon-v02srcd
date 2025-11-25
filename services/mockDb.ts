import { ApartmentSearchFilters, Listing } from '../types';

const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    name: 'Modern Loft on the Korenmarkt',
    address: 'Korenmarkt 12, Ghent',
    price: 950,
    imageUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A',
    type: 'apartment',
    size: 85,
    description: 'Beautiful loft with high ceilings and view of the historic towers.',
    bedrooms: 1,
    petsAllowed: false,
    coordinates: { lat: 51.0543, lng: 3.7174 }
  },
  {
    id: '2',
    name: 'Family House with Garden',
    address: 'Veldstraat 45, Antwerp',
    price: 1350,
    imageUrls: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'house',
    size: 160,
    description: 'Renovated family home near the station. Includes a south-facing garden.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 51.2194, lng: 4.4025 }
  },
  {
    id: '3',
    name: 'Student Studio near VUB',
    address: 'Pleinlaan 8, Brussels',
    price: 600,
    imageUrls: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'studio',
    size: 35,
    description: 'Perfect for students. Close to university and public transport (Metro Delta).',
    bedrooms: 0,
    petsAllowed: false,
    coordinates: { lat: 50.8224, lng: 4.3982 }
  },
  {
    id: '4',
    name: 'Luxury Apartment Sablon',
    address: 'Rue de la Regence 36, Brussels',
    price: 1800,
    imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A+',
    type: 'apartment',
    size: 110,
    description: 'High-end finishing, view of the Sablon church, underground parking available.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 50.8405, lng: 4.3556 }
  },
  {
    id: '5',
    name: 'Historic Townhouse Ieper',
    address: 'Menenstraat 20, Ieper',
    price: 1100,
    imageUrls: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'D',
    type: 'house',
    size: 140,
    description: 'Charming authentic house near the Menin Gate. Needs some love but full of character.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 50.8503, lng: 2.8915 }
  },
  {
    id: '6',
    name: 'Cozy Apartment Bruges',
    address: 'Langestraat 10, Bruges',
    price: 850,
    imageUrls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'apartment',
    size: 75,
    description: 'Affordable apartment inside the city walls. Quiet street.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 51.2093, lng: 3.2247 }
  },
  {
    id: '7',
    name: 'Modern Villa Knokke',
    address: 'Kustlaan 100, Knokke-Heist',
    price: 2500,
    imageUrls: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A',
    type: 'villa',
    size: 220,
    description: 'Exclusive villa near the beach. High-end amenities and large garage.',
    bedrooms: 4,
    petsAllowed: true,
    coordinates: { lat: 51.3468, lng: 3.2872 }
  }
];

export async function searchListings(filters: ApartmentSearchFilters): Promise<Listing[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let results = [...MOCK_LISTINGS];

  if (filters.city) {
    const city = filters.city.toLowerCase();
    results = results.filter(l => l.address.toLowerCase().includes(city));
  }

  if (filters.minPrice != null) {
    results = results.filter(l => l.price >= filters.minPrice!);
  }

  if (filters.maxPrice != null) {
    results = results.filter(l => l.price <= filters.maxPrice!);
  }

  if (filters.minSize != null) {
    results = results.filter(l => l.size >= filters.minSize!);
  }

  if (filters.type) {
    const type = filters.type.toLowerCase();
    results = results.filter(l => l.type.toLowerCase().includes(type));
  }
  
  if (filters.bedrooms != null) {
     results = results.filter(l => l.bedrooms >= filters.bedrooms!);
  }

  if (filters.petsAllowed === true) {
    results = results.filter(l => l.petsAllowed === true);
  }

  // Sorting
  if (filters.sortBy === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'size') {
    results.sort((a, b) => b.size - a.size);
  }

  return results;
}
