import { ApartmentSearchFilters, Listing, Reservation } from '../types';

const MOCK_LISTINGS: Listing[] = [
  // --- GHENT ---
  {
    id: 'ghent-1',
    name: 'Modern Loft on the Korenmarkt',
    address: 'Korenmarkt 12, 9000 Ghent',
    price: 950,
    imageUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A',
    type: 'apartment',
    size: 85,
    description: 'Beautiful loft with high ceilings and view of the historic towers.',
    bedrooms: 1,
    petsAllowed: false,
    coordinates: { lat: 51.0543, lng: 3.7174 },
    isFavorite: false
  },
  {
    id: 'ghent-2',
    name: 'Historic Townhouse Patershol',
    address: 'Oudburg 24, 9000 Ghent',
    price: 1450,
    imageUrls: ['https://images.unsplash.com/photo-1513584685908-95c9e2d01361?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'house',
    size: 160,
    description: 'Authentic facade in the culinary heart of Ghent. Cobblestone street.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 51.0589, lng: 3.7223 },
    isFavorite: false
  },
  {
    id: 'ghent-3',
    name: 'Student Room near Sint-Pieters',
    address: 'Kortrijksesteenweg 150, 9000 Ghent',
    price: 550,
    imageUrls: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'studio',
    size: 25,
    description: 'Luxury student room (kot) with private bathroom. Shared kitchen.',
    bedrooms: 0,
    petsAllowed: false,
    coordinates: { lat: 51.0360, lng: 3.7120 },
    isFavorite: false
  },
  {
    id: 'ghent-4',
    name: 'Riverside Apartment Leie',
    address: 'Lindenlei 18, 9000 Ghent',
    price: 1100,
    imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A',
    type: 'apartment',
    size: 95,
    description: 'Sunny apartment overlooking the river Leie. Close to court of justice.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 51.0480, lng: 3.7150 },
    isFavorite: false
  },
  {
    id: 'ghent-5',
    name: 'Renovated Bel-etage',
    address: 'Visserij 88, 9000 Ghent',
    price: 1300,
    imageUrls: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'house',
    size: 140,
    description: 'Trendy neighborhood near dampoort. Large garden included.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 51.0520, lng: 3.7380 },
    isFavorite: false
  },

  // --- ANTWERP ---
  {
    id: 'antwerp-1',
    name: 'Family House with Garden',
    address: 'Veldstraat 45, 2060 Antwerp',
    price: 1350,
    imageUrls: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'house',
    size: 160,
    description: 'Renovated family home near the station. Includes a south-facing garden.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 51.2194, lng: 4.4025 },
    isFavorite: false
  },
  {
    id: 'antwerp-2',
    name: 'Penthouse Eilandje',
    address: 'Kattendijkdok-Oostkaai 10, 2000 Antwerp',
    price: 2200,
    imageUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A+',
    type: 'apartment',
    size: 130,
    description: 'Luxury penthouse with view of the MAS museum and the marina.',
    bedrooms: 2,
    petsAllowed: false,
    coordinates: { lat: 51.2300, lng: 4.4100 },
    isFavorite: false
  },
  {
    id: 'antwerp-3',
    name: 'Chic Apartment South District',
    address: 'Leopold de Waelplaats 15, 2000 Antwerp',
    price: 1600,
    imageUrls: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 110,
    description: 'Right opposite the Museum of Fine Arts. High ceilings, parquet floors.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 51.2090, lng: 4.3950 },
    isFavorite: false
  },
  {
    id: 'antwerp-4',
    name: 'Starter Apartment Borgerhout',
    address: 'Turnhoutsebaan 120, 2140 Antwerp',
    price: 850,
    imageUrls: ['https://images.unsplash.com/photo-1502005229766-93976a171f2d?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'apartment',
    size: 70,
    description: 'Vibrant neighborhood. Good connection to central station. Ideal for young couple.',
    bedrooms: 1,
    petsAllowed: false,
    coordinates: { lat: 51.2150, lng: 4.4350 },
    isFavorite: false
  },
  {
    id: 'antwerp-5',
    name: 'Mansion in Zurenborg',
    address: 'Cogels-Osylei 44, 2600 Antwerp',
    price: 2800,
    imageUrls: ['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'D',
    type: 'villa',
    size: 350,
    description: 'Iconic Art Nouveau style mansion in the most beautiful street of Antwerp.',
    bedrooms: 5,
    petsAllowed: true,
    coordinates: { lat: 51.2050, lng: 4.4300 },
    isFavorite: false
  },
  {
    id: 'antwerp-6',
    name: 'Studio near Meir',
    address: 'Meir 55, 2000 Antwerp',
    price: 750,
    imageUrls: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'studio',
    size: 40,
    description: 'Shopping district. Fully furnished studio.',
    bedrooms: 0,
    petsAllowed: false,
    coordinates: { lat: 51.2180, lng: 4.4080 },
    isFavorite: false
  },

  // --- BRUSSELS ---
  {
    id: 'bxl-1',
    name: 'Student Studio near VUB',
    address: 'Pleinlaan 8, 1050 Brussels',
    price: 600,
    imageUrls: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'studio',
    size: 35,
    description: 'Perfect for students. Close to university and public transport (Metro Delta).',
    bedrooms: 0,
    petsAllowed: false,
    coordinates: { lat: 50.8224, lng: 4.3982 },
    isFavorite: false
  },
  {
    id: 'bxl-2',
    name: 'Luxury Apartment Sablon',
    address: 'Rue de la Regence 36, 1000 Brussels',
    price: 1800,
    imageUrls: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A+',
    type: 'apartment',
    size: 110,
    description: 'High-end finishing, view of the Sablon church, underground parking available.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 50.8405, lng: 4.3556 },
    isFavorite: false
  },
  {
    id: 'bxl-3',
    name: 'EU District Flat',
    address: 'Rue de la Loi 200, 1000 Brussels',
    price: 1200,
    imageUrls: ['https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 80,
    description: 'Walking distance to European Commission. Secure building.',
    bedrooms: 1,
    petsAllowed: false,
    coordinates: { lat: 50.8430, lng: 4.3820 },
    isFavorite: false
  },
  {
    id: 'bxl-4',
    name: 'Townhouse in Ixelles',
    address: 'Rue du Page 80, 1050 Ixelles',
    price: 2400,
    imageUrls: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'D',
    type: 'house',
    size: 220,
    description: 'Charming Chatelain neighborhood. High ceilings, garden, 3 floors.',
    bedrooms: 4,
    petsAllowed: true,
    coordinates: { lat: 50.8250, lng: 4.3600 },
    isFavorite: false
  },
  {
    id: 'bxl-5',
    name: 'Modern Loft Dansaert',
    address: 'Rue Antoine Dansaert 90, 1000 Brussels',
    price: 1400,
    imageUrls: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 110,
    description: 'Design district. Open plan, industrial look.',
    bedrooms: 1,
    petsAllowed: true,
    coordinates: { lat: 50.8500, lng: 4.3450 },
    isFavorite: false
  },
  {
    id: 'bxl-6',
    name: 'Villa in Uccle',
    address: 'Avenue Winston Churchill 150, 1180 Uccle',
    price: 3500,
    imageUrls: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'villa',
    size: 300,
    description: 'Prestigious avenue. Large grounds, garage for 2 cars.',
    bedrooms: 5,
    petsAllowed: true,
    coordinates: { lat: 50.8100, lng: 4.3500 },
    isFavorite: false
  },
  {
    id: 'bxl-7',
    name: 'Cozy Flat Saint-Gilles',
    address: 'Parvis de Saint-Gilles 10, 1060 Saint-Gilles',
    price: 950,
    imageUrls: ['https://images.unsplash.com/photo-1534595038511-9f219fe0c979?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'apartment',
    size: 65,
    description: 'Near the daily market and trendy bars.',
    bedrooms: 1,
    petsAllowed: true,
    coordinates: { lat: 50.8300, lng: 4.3400 },
    isFavorite: false
  },
  {
    id: 'bxl-8',
    name: 'Apartment near Atomium',
    address: 'Avenue de l\'Atomium 1, 1020 Laeken',
    price: 1100,
    imageUrls: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 90,
    description: 'Green area, view of the Atomium park.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 50.8900, lng: 4.3500 },
    isFavorite: false
  },

  // --- LEUVEN ---
  {
    id: 'leuven-1',
    name: 'Student Room Oude Markt',
    address: 'Oude Markt 5, 3000 Leuven',
    price: 450,
    imageUrls: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'studio',
    size: 18,
    description: 'Basic kot in the center of nightlife. Shared facilities.',
    bedrooms: 0,
    petsAllowed: false,
    coordinates: { lat: 50.8790, lng: 4.7000 },
    isFavorite: false
  },
  {
    id: 'leuven-2',
    name: 'Modern Apartment Vaartkom',
    address: 'Vaartkom 30, 3000 Leuven',
    price: 1050,
    imageUrls: ['https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A',
    type: 'apartment',
    size: 85,
    description: 'Newly built district. View of the canal. Energy efficient.',
    bedrooms: 1,
    petsAllowed: true,
    coordinates: { lat: 50.8850, lng: 4.7050 },
    isFavorite: false
  },
  {
    id: 'leuven-3',
    name: 'House in Heverlee',
    address: 'Naamsesteenweg 200, 3001 Heverlee',
    price: 1400,
    imageUrls: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'house',
    size: 150,
    description: 'Quiet area near Arenberg park and IMEC.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 50.8600, lng: 4.6900 },
    isFavorite: false
  },
  {
    id: 'leuven-4',
    name: 'Begijnhof Studio',
    address: 'Schapenstraat 10, 3000 Leuven',
    price: 800,
    imageUrls: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'studio',
    size: 45,
    description: 'Charming studio near the Grand Beguinage.',
    bedrooms: 0,
    petsAllowed: false,
    coordinates: { lat: 50.8700, lng: 4.6950 },
    isFavorite: false
  },

  // --- COAST (Bruges, Ostend, Knokke) ---
  {
    id: 'bruges-1',
    name: 'Cozy Apartment Bruges',
    address: 'Langestraat 10, 8000 Bruges',
    price: 850,
    imageUrls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'apartment',
    size: 75,
    description: 'Affordable apartment inside the city walls. Quiet street.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 51.2093, lng: 3.2247 },
    isFavorite: false
  },
  {
    id: 'knokke-1',
    name: 'Modern Villa Knokke',
    address: 'Kustlaan 100, 8300 Knokke-Heist',
    price: 3500,
    imageUrls: ['https://images.unsplash.com/photo-1600596542815-2a4d9f912904?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A',
    type: 'villa',
    size: 220,
    description: 'Exclusive villa near the beach. High-end amenities and large garage.',
    bedrooms: 4,
    petsAllowed: true,
    coordinates: { lat: 51.3468, lng: 3.2872 },
    isFavorite: false
  },
  {
    id: 'ostend-1',
    name: 'Sea View Apartment',
    address: 'Albert I Promenade 50, 8400 Ostend',
    price: 1250,
    imageUrls: ['https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 90,
    description: 'Direct sea view from the living room. Large terrace.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 51.2300, lng: 2.9100 },
    isFavorite: false
  },
  {
    id: 'dehaan-1',
    name: 'Belle Epoque Villa',
    address: 'Rembrandtlaan 5, 8420 De Haan',
    price: 1900,
    imageUrls: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'D',
    type: 'house',
    size: 180,
    description: 'Classic coastal villa in historic De Haan concession.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 51.2700, lng: 3.0300 },
    isFavorite: false
  },

  // --- WALLONIA (Liège, Namur, Mons) ---
  {
    id: 'liege-1',
    name: 'Loft Outremeuse',
    address: 'Rue Puits-en-Sock 40, 4020 Liège',
    price: 900,
    imageUrls: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'apartment',
    size: 100,
    description: 'Spacious loft in the folkloric district.',
    bedrooms: 1,
    petsAllowed: true,
    coordinates: { lat: 50.6400, lng: 5.5800 },
    isFavorite: false
  },
  {
    id: 'namur-1',
    name: 'House near Citadel',
    address: 'Route Merveilleuse 10, 5000 Namur',
    price: 1300,
    imageUrls: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'house',
    size: 150,
    description: 'House with panoramic view over the Meuse valley.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 50.4600, lng: 4.8600 },
    isFavorite: false
  },
  {
    id: 'mons-1',
    name: 'Apartment Grand Place',
    address: 'Grand Place 15, 7000 Mons',
    price: 950,
    imageUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 85,
    description: 'Heart of the city, during the Doudou festival you have front row seats.',
    bedrooms: 2,
    petsAllowed: false,
    coordinates: { lat: 50.4500, lng: 3.9500 },
    isFavorite: false
  },

  // --- WEST FLANDERS (Ypres) ---
  {
    id: 'ieper-1',
    name: 'Historic Townhouse Ieper',
    address: 'Menenstraat 20, 8900 Ieper',
    price: 1100,
    imageUrls: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'D',
    type: 'house',
    size: 140,
    description: 'Charming authentic house near the Menin Gate. Needs some love but full of character.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 50.8503, lng: 2.8915 },
    isFavorite: false
  },

  // --- MECHELEN ---
  {
    id: 'mechelen-1',
    name: 'Apartment near Station',
    address: 'Leopoldstraat 10, 2800 Mechelen',
    price: 900,
    imageUrls: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 80,
    description: 'Ideal for commuters to Brussels or Antwerp. Modern building.',
    bedrooms: 2,
    petsAllowed: false,
    coordinates: { lat: 51.0200, lng: 4.4800 },
    isFavorite: false
  },
  {
    id: 'mechelen-2',
    name: 'Beguinage House',
    address: 'Nonnenstraat 5, 2800 Mechelen',
    price: 1500,
    imageUrls: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'D',
    type: 'house',
    size: 130,
    description: 'Historical charm in a UNESCO protected area. Peaceful.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 51.0300, lng: 4.4700 },
    isFavorite: false
  },

  // --- MORE VARIANTS ---
  {
    id: 'bxl-9',
    name: 'Penthouse Avenue Louise',
    address: 'Avenue Louise 500, 1000 Brussels',
    price: 2900,
    imageUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 180,
    description: 'Exclusive address. Concierge service. Valet parking.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 50.8200, lng: 4.3700 },
    isFavorite: false
  },
  {
    id: 'gent-6',
    name: 'Co-housing Project',
    address: 'Dampoortstraat 88, 9000 Ghent',
    price: 650,
    imageUrls: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A',
    type: 'studio',
    size: 30,
    description: 'Private studio with large shared garden and living room. Community vibes.',
    bedrooms: 1,
    petsAllowed: true,
    coordinates: { lat: 51.0550, lng: 3.7400 },
    isFavorite: false
  },
  {
    id: 'antwerp-7',
    name: 'Loft PAKT',
    address: 'Regine Beerplein 1, 2018 Antwerp',
    price: 1300,
    imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A',
    type: 'apartment',
    size: 90,
    description: 'Located at the PAKT site. Green roof, urban farming, coffee bars.',
    bedrooms: 1,
    petsAllowed: true,
    coordinates: { lat: 51.2000, lng: 4.4200 },
    isFavorite: false
  },
  {
    id: 'leuven-5',
    name: 'Kessel-Lo Family Home',
    address: 'Diestsesteenweg 150, 3010 Kessel-Lo',
    price: 1250,
    imageUrls: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'house',
    size: 140,
    description: 'Close to Hal 5 and provincial domain. Great for kids.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 50.8800, lng: 4.7200 },
    isFavorite: false
  },
  {
    id: 'hasselt-1',
    name: 'Apartment Quartier Bleu',
    address: 'Slachthuiskaai 5, 3500 Hasselt',
    price: 1100,
    imageUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'A',
    type: 'apartment',
    size: 95,
    description: 'Modern waterfront living. Close to fashion museum.',
    bedrooms: 2,
    petsAllowed: false,
    coordinates: { lat: 50.9300, lng: 5.3300 },
    isFavorite: false
  },
  {
    id: 'genk-1',
    name: 'C-Mine Loft',
    address: 'Evence Coppeeplaats 2, 3600 Genk',
    price: 950,
    imageUrls: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'apartment',
    size: 110,
    description: 'Industrial heritage site. Creative environment.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 50.9800, lng: 5.4900 },
    isFavorite: false
  },
  {
    id: 'waterloo-1',
    name: 'Villa Waterloo',
    address: 'Drève de Lorraine 10, 1410 Waterloo',
    price: 4000,
    imageUrls: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'villa',
    size: 400,
    description: 'Expansive estate near international schools.',
    bedrooms: 6,
    petsAllowed: true,
    coordinates: { lat: 50.7000, lng: 4.3800 },
    isFavorite: false
  },
  {
    id: 'aalst-1',
    name: 'City Apartment Aalst',
    address: 'Hopmarkt 5, 9300 Aalst',
    price: 800,
    imageUrls: ['https://images.unsplash.com/photo-1502005229766-93976a171f2d?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 80,
    description: 'Central location. Carnival hotspot.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 50.9300, lng: 4.0300 },
    isFavorite: false
  },
  {
    id: 'kortrijk-1',
    name: 'Kortrijk Design Flat',
    address: 'Budastraat 20, 8500 Kortrijk',
    price: 900,
    imageUrls: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 85,
    description: 'Near the Buda island. Creative hub.',
    bedrooms: 2,
    petsAllowed: false,
    coordinates: { lat: 50.8200, lng: 3.2600 },
    isFavorite: false
  },
  {
    id: 'tienen-1',
    name: 'Renovated Farmhouse',
    address: 'Grote Markt 10, 3300 Tienen',
    price: 1100,
    imageUrls: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'D',
    type: 'house',
    size: 180,
    description: 'Spacious house with large garden. Sugar city.',
    bedrooms: 4,
    petsAllowed: true,
    coordinates: { lat: 50.8000, lng: 4.9300 },
    isFavorite: false
  },
  {
    id: 'turnhout-1',
    name: 'Turnhout Studio',
    address: 'Grote Markt 50, 2300 Turnhout',
    price: 600,
    imageUrls: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'studio',
    size: 35,
    description: 'Compact living in the heart of the Kempen.',
    bedrooms: 0,
    petsAllowed: false,
    coordinates: { lat: 51.3200, lng: 4.9400 },
    isFavorite: false
  },
  {
    id: 'sint-niklaas-1',
    name: 'Art Deco House',
    address: 'Stationsstraat 80, 9100 Sint-Niklaas',
    price: 1200,
    imageUrls: ['https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'house',
    size: 160,
    description: 'Near the largest market square in Belgium.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 51.1600, lng: 4.1400 },
    isFavorite: false
  },
  {
    id: 'blankenberge-1',
    name: 'Pier View Flat',
    address: 'Zeedijk 100, 8370 Blankenberge',
    price: 950,
    imageUrls: ['https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'apartment',
    size: 70,
    description: 'Holiday apartment with view of the Pier.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 51.3100, lng: 3.1300 },
    isFavorite: false
  },
  {
    id: 'nieuwpoort-1',
    name: 'Harbor Apartment',
    address: 'Albert I Laan 200, 8620 Nieuwpoort',
    price: 1100,
    imageUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 85,
    description: 'Near the marina. Modern architecture.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 51.1300, lng: 2.7500 },
    isFavorite: false
  },
  {
    id: 'durbuy-1',
    name: 'Ardennes Chalet',
    address: 'Rue du Comte d\'Ursel 5, 6940 Durbuy',
    price: 1500,
    imageUrls: ['https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'E',
    type: 'house',
    size: 120,
    description: 'Wooden chalet in the smallest city in the world. Nature retreat.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 50.3500, lng: 5.4500 },
    isFavorite: false
  },
  {
    id: 'spa-1',
    name: 'Wellness Apartment',
    address: 'Avenue Reine Astrid 10, 4900 Spa',
    price: 1000,
    imageUrls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'apartment',
    size: 80,
    description: 'Near the thermal baths and casino.',
    bedrooms: 2,
    petsAllowed: false,
    coordinates: { lat: 50.4900, lng: 5.8600 },
    isFavorite: false
  },
  {
    id: 'arlon-1',
    name: 'Commuter Flat Arlon',
    address: 'Rue de Diekirch 20, 6700 Arlon',
    price: 1100,
    imageUrls: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'apartment',
    size: 90,
    description: 'Close to Luxembourg border. Ideal for cross-border workers.',
    bedrooms: 2,
    petsAllowed: true,
    coordinates: { lat: 49.6800, lng: 5.8100 },
    isFavorite: false
  },
  {
    id: 'roeselare-1',
    name: 'Family Home Roeselare',
    address: 'De Munt 10, 8800 Roeselare',
    price: 950,
    imageUrls: ['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'house',
    size: 140,
    description: 'Central location near shopping street.',
    bedrooms: 3,
    petsAllowed: true,
    coordinates: { lat: 50.9400, lng: 3.1200 },
    isFavorite: false
  },
  {
    id: 'waregem-1',
    name: 'Waregem Villa',
    address: 'Hippodroomstraat 5, 8790 Waregem',
    price: 1800,
    imageUrls: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'B',
    type: 'villa',
    size: 200,
    description: 'Near the racecourse. Large garden.',
    bedrooms: 4,
    petsAllowed: true,
    coordinates: { lat: 50.8800, lng: 3.4300 },
    isFavorite: false
  },
  {
    id: 'lier-1',
    name: 'Zimmer Tower Flat',
    address: 'Zimmerplein 5, 2500 Lier',
    price: 900,
    imageUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    energyClass: 'C',
    type: 'apartment',
    size: 80,
    description: 'View of the famous Zimmer Tower.',
    bedrooms: 2,
    petsAllowed: false,
    coordinates: { lat: 51.1300, lng: 4.5700 },
    isFavorite: false
  }
];

// --- Reservation Logic ---

const RESERVATION_STORAGE_KEY = 'eburon_reservations';
const LISTINGS_STORAGE_KEY = 'eburon_custom_listings';

export const saveReservation = (listing: Listing): void => {
  const existing = getReservations();
  const newReservation: Reservation = {
    id: Math.random().toString(36).substr(2, 9),
    listingId: listing.id,
    listingName: listing.name,
    listingAddress: listing.address,
    customerName: 'User-' + Math.floor(Math.random() * 1000), // Simulating logged-in user
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify([...existing, newReservation]));
};

export const getReservations = (): Reservation[] => {
  const data = localStorage.getItem(RESERVATION_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// --- Listing Management Logic ---

export const addListing = (newListing: Listing): void => {
  const existingCustom = getCustomListings();
  const updated = [newListing, ...existingCustom];
  localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(updated));
};

const getCustomListings = (): Listing[] => {
  const data = localStorage.getItem(LISTINGS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const getAllListings = (): Listing[] => {
  const custom = getCustomListings();
  // Merge custom listings with mock listings
  return [...custom, ...MOCK_LISTINGS];
};

// --- Search Logic ---

export async function searchListings(filters: ApartmentSearchFilters): Promise<Listing[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let results = getAllListings();

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
