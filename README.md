# Eburon Estate - Home Management Platform

A comprehensive dual-portal property management system built for modern real estate operations in Belgium. Features an Admin Portal for property managers and a Client Portal for property seekers with AI-powered voice search.

## 🌟 Features

### Client Portal (Public-Facing)

- **AI Voice Assistant** - "Homie" - Natural language property search using voice commands
- **Smart Search** - Filter by location, price, size, bedrooms, pet-friendly, and more
- **Interactive Map View** - Visualize properties on a map with real-time filtering
- **Property Details** - High-quality images, detailed descriptions, and amenities
- **Tenant Authentication** - Secure login for accessing personalized features
- **Maintenance Requests** - Tenants can submit and track maintenance issues
- **Favorites** - Save and manage favorite properties
- **No Login Required** - Browse properties freely; login only needed for booking

### Admin Portal (Management)

- **Dashboard** - Overview of properties, users, and maintenance requests
- **User Management** - Invite and manage users with role-based access (Admin, Contractor, Owner, Broker, Tenant)
- **Property Management** - Create, edit, and manage property listings
- **Maintenance Oversight** - Track and update maintenance requests from tenants
- **Secure Authentication** - Pre-configured admin access with Supabase Auth

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **UI Icons**: Lucide React
- **Backend**: Supabase (Auth + Database + Storage)
- **AI Voice**: Native Audio API with real-time voice processing
- **Maps**: Custom map integration with Belgian property coordinates

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Modern browser with microphone access (for voice features)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/panyeroa1/Eburon Estate.git
cd Eburon Estate
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
API_KEY=your_ai_api_key
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL schema from `supabase_schema.sql`:

```bash
# The schema creates:
# - listings table (properties)
# - users table (user data with roles)
# - maintenance_requests table (tenant requests)
# All with Row Level Security (RLS) policies
```

### 4. Seed Database (Optional)

Populate your database with 50 sample Belgian properties:

```bash
npm run seed
```

This script attempts to scrape properties from real estate sites and falls back to generated Belgian properties if needed.

### 5. Create Admin User

In Supabase Dashboard → Authentication → Users:

1. Click "Add user"
2. Email: `admin@eburon.ai`
3. Password: `123456`
4. Confirm creation

Then in SQL Editor, add the user profile:

```sql
INSERT INTO public.users (id, email, full_name, name, role)
VALUES (
  'user_id_from_auth_table',
  'admin@eburon.ai',
  'Admin User',
  'Admin User',
  'admin'
);
```

### 6. Run Development Server

```bash
npm run dev
```

Visit:

- **Client Portal**: <http://localhost:5173> (public homepage)
- **Admin Portal**: <http://localhost:5173/admin> (login required)
- **Dev Launcher**: <http://localhost:5173> (shows both portal links in dev mode)

## 🔐 Default Admin Credentials

**Pre-filled in login form:**

- Email: `admin@eburon.ai`
- Password: `123456`

## 📁 Project Structure

```text
Eburon Estate/
├── components/
│   ├── admin/              # Admin Portal components
│   │   ├── Dashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── CreateListing.tsx
│   │   └── MaintenanceDashboard.tsx
│   ├── tenant/             # Tenant-specific components
│   │   ├── Login.tsx
│   │   └── Profile.tsx
│   ├── ListingCard.tsx     # Property card display
│   ├── ListingDetails.tsx  # Property detail modal
│   ├── MapView.tsx         # Interactive map
│   └── DevLanding.tsx      # Development portal selector
├── portals/
│   ├── AdminPortal.tsx     # Admin portal root
│   └── ClientPortal.tsx    # Client portal root
├── services/
│   ├── supabase.ts         # Supabase client config
│   ├── listings.ts         # Real listings API service
│   └── mockDb.ts           # Fallback mock data
├── scripts/
│   └── seedListings.ts     # Database seeding script
├── types.ts                # TypeScript interfaces
├── App.tsx                 # Main app with domain routing
└── supabase_schema.sql     # Database schema
```

## 📜 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run seed       # Seed database with properties
```

## 🎯 Key Features Explained

### Voice Assistant ("Homie")

The AI voice assistant allows users to search for properties using natural language:

```text
User: "Find me a 2-bedroom apartment in Ghent under €1000"
Homie: "I found 12 properties matching your criteria..."
```

**How it works:**

1. User clicks microphone button
2. Real-time audio streaming to AI
3. Natural language understanding
4. Automatic filter updates
5. Results displayed instantly

### Role-Based Access Control

Five user roles with different permissions:

| Role | Access Level |
|------|-------------|
| **Admin** | Full access to all features |
| **Contractor** | Maintenance requests + property viewing |
| **Owner** | Property management + tenant oversight |
| **Broker** | Property listings + client management |
| **Tenant** | Property search + maintenance requests |

### Domain-Based Routing

The app automatically routes based on hostname:

- `homeadmin.eburon.ai` → Admin Portal
- `Eburon Estate.eburon.ai` → Client Portal
- `localhost` → Shows portal selector (dev mode)

### Security Features

- **Supabase Authentication** - Industry-standard auth with JWT
- **Row Level Security (RLS)** - Database-level access control
- **Protected Routes** - React Router guards for admin pages
- **Role Validation** - Server-side role checking
- **Secure API Keys** - Environment variable management

## 🌍 Belgian Property Data

All sample data uses real Belgian locations:

- Brussels (Capital region)
- Antwerp (Flanders)
- Ghent (East Flanders)
- Bruges (West Flanders)
- Leuven (Flemish Brabant)

Coordinates are accurate for map visualization.

## 🐛 Troubleshooting

### Voice Assistant Not Working

1. **Check microphone permissions**: Browser must have mic access
2. **HTTPS required**: Voice features need secure context (localhost or HTTPS)
3. **API Key**: Ensure `API_KEY` is set in `.env.local`

### Database Errors

1. **Check Supabase connection**: Verify URL and anon key
2. **Run schema**: Ensure `supabase_schema.sql` has been executed
3. **Check RLS policies**: Policies might be blocking inserts/selects

### Listing Images Not Loading

1. **Supabase Storage**: Create a `listing-images` bucket in Supabase Storage
2. **Make bucket public**: Enable public access in bucket settings
3. **Upload images**: Use the Admin Portal to upload images

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Environment Variables in Vercel:**

- Add all `.env.local` variables in Vercel Dashboard
- Set Build Command: `npm run build`
- Set Output Directory: `dist`

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

Add environment variables in Netlify Dashboard → Site Settings → Environment Variables.

## 📚 Additional Resources

- **Supabase Docs**: <https://supabase.com/docs>
- **React Router**: <https://reactrouter.com>
- **Vite**: <https://vitejs.dev>
- **Tailwind CSS**: <https://tailwindcss.com>

## 🤝 Contributing

This is a proprietary project for Eburon Development. For internal team members:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## 📄 License

Copyright © 2025 Eburon Development. All rights reserved.

## 👥 Team

Built by the Eburon Development team for modern property management.

---

**Need help?** Contact: <admin@eburon.ai>
