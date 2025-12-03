-- Create Listings Table
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  price numeric not null,
  image_urls text[] default '{}',
  energy_class text,
  type text check (type in ('apartment', 'house', 'studio', 'villa', 'loft')),
  size numeric,
  description text,
  bedrooms numeric,
  pets_allowed boolean default false,
  coordinates jsonb, -- { "lat": number, "lng": number }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Listings
alter table public.listings enable row level security;

-- Policy: Everyone can read listings
create policy "Public listings are viewable by everyone"
  on public.listings for select
  using ( true );

-- Policy: Only admins can insert/update/delete listings
-- (Assuming we have a way to identify admins, for now we might allow authenticated users or specific emails)
create policy "Admins can manage listings"
  on public.listings for all
  using ( auth.role() = 'authenticated' ); -- Simplified for now


-- Create Maintenance Requests Table
create table public.maintenance_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  type text not null,
  description text not null,
  property_name text,
  status text check (status in ('open', 'pending', 'resolved')) default 'open',
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Maintenance Requests
alter table public.maintenance_requests enable row level security;

-- Policy: Users can see their own requests
create policy "Users can view own maintenance requests"
  on public.maintenance_requests for select
  using ( auth.uid() = user_id );

-- Policy: Users can insert their own requests
create policy "Users can create maintenance requests"
  on public.maintenance_requests for insert
  with check ( auth.uid() = user_id );

-- Policy: Admins can view all requests
-- (This requires a custom claim or a separate admins table check. For simplicity, allowing all authenticated for now or we rely on the app logic)
create policy "Admins can view all requests"
  on public.maintenance_requests for select
  using ( auth.role() = 'authenticated' ); 


-- Create Users Table (stores additional user data beyond Supabase Auth)
create table public.users (
  id uuid references auth.users(id) primary key,
  email text,
  full_name text,
  name text,
  role text check (role in ('admin', 'contractor', 'owner', 'broker', 'tenant')) default 'tenant',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policy: Users can read their own profile
create policy "Users can read own profile"
  on public.users for select
  using ( auth.uid() = id );

-- Policy: Admins can read all profiles
create policy "Admins can read all profiles"
  on public.users for select
  using ( true ); -- Simplified

-- Policy: Admins can insert users
create policy "Admins can insert users"
  on public.users for insert
  with check ( true ); -- Simplified, should check if inserter is admin


-- Create Agents Table (for Bland AI voice agent configurations)
create table public.agents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  voice_id text,
  intro text,
  roles text,
  prompt text not null,
  bland_config jsonb not null, -- Full Bland AI configuration
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.agents enable row level security;

-- Policy: Authenticated users can read all agents
create policy "Authenticated users can read agents"
  on public.agents for select
  using ( auth.role() = 'authenticated' );

-- Policy: Authenticated users can insert agents
create policy "Authenticated users can insert agents"
  on public.agents for insert
  with check ( auth.role() = 'authenticated' );

-- Policy: Users can update their own agents
create policy "Users can update own agents"
  on public.agents for update
  using ( auth.uid() = created_by );

-- Policy: Users can delete their own agents
create policy "Users can delete own agents"
  on public.agents for delete
  using ( auth.uid() = created_by );
