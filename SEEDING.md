# Database Seeding Instructions

## Prerequisites

1. Make sure you have run the SQL schema in Supabase:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase_schema.sql`

## Seeding the Database

To populate your database with property listings, run:

```bash
npm run seed
```

This script will:
1. Attempt to scrape 50 properties from Sotheby's Realty Belgium
2. If scraping fails (due to website structure changes or CORS), it will use generated fallback data with Belgian properties
3. Insert all properties into your Supabase `listings` table

## What Gets Inserted

Each property includes:
- Name and address
- Price (monthly rent in €)
- Images
- Property type (apartment, house, studio, villa, loft)
- Size in m²
- Number of bedrooms
- Energy class
- Description
- Coordinates (Belgium locations)
- Pets allowed status

## Verifying the Data

After running the seed script, you can verify the data:

1. **In Supabase Dashboard:**
   - Go to Table Editor
   - Select the `listings` table
   - You should see 50 new properties

2. **In the Application:**
   - Run `npm run dev`
   - Navigate to the Client Portal
   - You should see the real properties instead of mock data

## Troubleshooting

If you get errors:
- Make sure the Supabase schema is created
- Check your Supabase URL and API key in `services/supabase.ts`
- Verify your internet connection for scraping
- Check the console output for specific error messages
