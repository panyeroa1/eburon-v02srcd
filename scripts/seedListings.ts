import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

const supabaseUrl = 'https://gsjnucljnnqtsjllfufy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzam51Y2xqbm5xdHNqbGxmdWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzQzNTYsImV4cCI6MjA3OTgxMDM1Nn0.DbjToxlF-k5lTG-SS0fYsE3OyL9KD9byFbuBSVzDF6k';

const supabase = createClient(supabaseUrl, supabaseKey);

interface ScrapedProperty {
  name: string;
  address: string;
  price: number;
  image_urls: string[];
  energy_class: string;
  type: 'apartment' | 'house' | 'studio' | 'villa' | 'loft';
  size: number;
  description: string;
  bedrooms: number;
  pets_allowed: boolean;
  coordinates: { lat: number; lng: number } | null;
}

async function fetchSothebysListings(): Promise<ScrapedProperty[]> {
  const properties: ScrapedProperty[] = [];
  
  try {
    // Fetch Belgium listings
    const response = await fetch('https://www.sothebysrealty.com/eng/sales/belgium');
    const html = await response.text();
    const $ = cheerio.load(html);

    console.log('Fetching listings from Sotheby\'s Realty Belgium...');

    // Find property cards - adjust selectors based on actual HTML structure
    $('.srp-item, .property-card, .listing-item').each((index, element) => {
      if (index >= 50) return false; // Limit to 50 properties

      try {
        const $el = $(element);
        
        // Extract data (selectors may need adjustment based on actual HTML)
        const name = $el.find('.property-title, h3, h2').first().text().trim() || 'Luxury Property';
        const address = $el.find('.property-address, .address, .location').first().text().trim() || 'Belgium';
        const priceText = $el.find('.property-price, .price').first().text().trim();
        const price = parsePrice(priceText);
        
        const imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';
        const image_urls = imageUrl ? [imageUrl.startsWith('http') ? imageUrl : `https://www.sothebysrealty.com${imageUrl}`] : [];
        
        // Extract bedrooms
        const bedroomsText = $el.find('.bedrooms, .beds').first().text();
        const bedrooms = parseInt(bedroomsText) || 3;
        
        // Extract size if available
        const sizeText = $el.find('.property-size, .sqft, .area').first().text();
        const size = parseSize(sizeText) || 120;
        
        // Determine type from description or default
        const description = $el.find('.property-description, .description').first().text().trim() || 
                           `Luxury property in ${address}`;
        const type = determinePropertyType(name + ' ' + description);

        // Use Belgium center coordinates as placeholder
        const coordinates = { lat: 50.8503, lng: 4.3517 };

        properties.push({
          name,
          address,
          price,
          image_urls,
          energy_class: 'B', // Default
          type,
          size,
          description,
          bedrooms,
          pets_allowed: false, // Default
          coordinates
        });

        console.log(`✓ Scraped: ${name} - €${price}`);
      } catch (err) {
        console.error('Error parsing property:', err);
      }
    });

    console.log(`\nTotal properties scraped: ${properties.length}`);
    return properties;

  } catch (error) {
    console.error('Error fetching Sotheby\'s listings:', error);
    return [];
  }
}

function parsePrice(priceText: string): number {
  // Remove currency symbols and parse number
  const cleaned = priceText.replace(/[€$,\s]/g, '');
  const price = parseInt(cleaned);
  
  // If price is very large (e.g., $2,500,000), convert to monthly rent equivalent
  if (price > 100000) {
    return Math.floor(price / 200); // Rough conversion to monthly rent
  }
  
  return price || 1500; // Default price
}

function parseSize(sizeText: string): number {
  const cleaned = sizeText.replace(/[,\s]/g, '');
  const match = cleaned.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function determinePropertyType(text: string): 'apartment' | 'house' | 'studio' | 'villa' | 'loft' {
  const lower = text.toLowerCase();
  if (lower.includes('villa')) return 'villa';
  if (lower.includes('loft')) return 'loft';
  if (lower.includes('studio')) return 'studio';
  if (lower.includes('house') || lower.includes('townhouse')) return 'house';
  return 'apartment';
}

async function seedDatabase(properties: ScrapedProperty[]) {
  console.log('\n--- Seeding Database ---');
  
  for (const property of properties) {
    try {
      const { error } = await supabase
        .from('listings')
        .insert([property]);

      if (error) {
        console.error(`✗ Failed to insert ${property.name}:`, error.message);
      } else {
        console.log(`✓ Inserted ${property.name}`);
      }
    } catch (err) {
      console.error(`✗ Error inserting ${property.name}:`, err);
    }
  }

  console.log('\n✓ Database seeding complete!');
}

// Main execution
async function main() {
  console.log('=== Sotheby\'s Realty Property Scraper ===\n');
  
  const properties = await fetchSothebysListings();
  
  if (properties.length === 0) {
    console.log('No properties found. The website structure may have changed.');
    console.log('Using fallback data...');
    // Add some fallback Belgian properties
    const fallbackProperties = generateFallbackProperties();
    await seedDatabase(fallbackProperties);
  } else {
    await seedDatabase(properties);
  }
}

function generateFallbackProperties(): ScrapedProperty[] {
  const belgianCities = [
    { name: 'Brussels', lat: 50.8503, lng: 4.3517 },
    { name: 'Antwerp', lat: 51.2194, lng: 4.4025 },
    { name: 'Ghent', lat: 51.0543, lng: 3.7174 },
    { name: 'Bruges', lat: 51.2093, lng: 3.2247 },
    { name: 'Leuven', lat: 50.8798, lng: 4.7005 }
  ];

  const properties: ScrapedProperty[] = [];
  
  for (let i = 0; i < 50; i++) {
    const city = belgianCities[i % belgianCities.length];
    const types: Array<'apartment' | 'house' | 'studio' | 'villa' | 'loft'> = ['apartment', 'house', 'studio', 'villa', 'loft'];
    const type = types[i % types.length];
    
    properties.push({
      name: `${['Luxury', 'Modern', 'Historic', 'Elegant', 'Charming'][i % 5]} ${type.charAt(0).toUpperCase() + type.slice(1)} in ${city.name}`,
      address: `Avenue Louise ${100 + i}, ${city.name}, Belgium`,
      price: 900 + (i * 75),
      image_urls: [`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=800&q=80`],
      energy_class: ['A', 'B', 'C'][i % 3],
      type,
      size: 75 + (i * 10),
      description: `Beautiful ${type} located in the heart of ${city.name}. Modern amenities and excellent location.`,
      bedrooms: 1 + (i % 4),
      pets_allowed: i % 2 === 0,
      coordinates: city
    });
  }
  
  return properties;
}

main().catch(console.error);
