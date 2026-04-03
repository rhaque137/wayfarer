-- Wayfarer core schema (Supabase Postgres)

create extension if not exists "pgcrypto";

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  owner_id uuid null,
  status text not null default 'draft',
  is_public boolean not null default true,
  spec jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day int not null,
  slot text not null check (slot in ('morning','afternoon','evening')),
  title text not null,
  category text not null default 'culture',
  starts_at timestamptz null,
  ends_at timestamptz null,
  lat double precision null,
  lon double precision null,
  place_source text null,
  place_id text null,
  estimated_cost numeric null,
  currency text null,
  rating numeric null,
  photo_url text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collaborators (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'collaborator',
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null,
  entity_type text not null,
  entity_id text not null,
  value int not null check (value in (-1, 0, 1)),
  created_at timestamptz not null default now(),
  unique (trip_id, user_id, entity_type, entity_id)
);

alter table public.trips enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.collaborators enable row level security;
alter table public.votes enable row level security;

-- Public read-only share links
create policy if not exists "trips_public_read"
on public.trips
for select
using (is_public = true);

create policy if not exists "itinerary_public_read"
on public.itinerary_items
for select
using (exists (select 1 from public.trips t where t.id = itinerary_items.trip_id and t.is_public = true));

-- Collaborator read/write (requires auth)
create policy if not exists "trips_collab_read"
on public.trips
for select
using (
  auth.uid() = owner_id
  or exists (select 1 from public.collaborators c where c.trip_id = trips.id and c.user_id = auth.uid())
);

create policy if not exists "itinerary_collab_rw"
on public.itinerary_items
for all
using (
  exists (select 1 from public.trips t where t.id = itinerary_items.trip_id and (t.owner_id = auth.uid()
    or exists (select 1 from public.collaborators c where c.trip_id = t.id and c.user_id = auth.uid())))
)
with check (
  exists (select 1 from public.trips t where t.id = itinerary_items.trip_id and (t.owner_id = auth.uid()
    or exists (select 1 from public.collaborators c where c.trip_id = t.id and c.user_id = auth.uid())))
);

