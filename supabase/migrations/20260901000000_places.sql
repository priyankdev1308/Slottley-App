-- Host-side space listings created from AddNewPlaceScreen. A host can list
-- multiple places; renters browse only the ones marked 'Active'.
create table public.places (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.users (id) on delete cascade,

  title text not null,
  about text,
  business_name text,
  address_street text,
  area_town text,
  post_code text,

  category text not null check (category in ('all', 'hair', 'beauty', 'barber', 'nail', 'therapy')),
  aesthetics_room boolean not null default false,
  cqc_registered_only boolean not null default false,
  cancellation_policy text not null check (cancellation_policy in ('nonrefundable', 'moderate', 'flexible')),
  min_booking_days integer not null default 1,

  amenities text[] not null default '{}',
  included_items text[] not null default '{}',

  hourly_price numeric(10, 2),
  hourly_enabled boolean not null default false,
  daily_price numeric(10, 2),
  daily_enabled boolean not null default false,
  weekly_price numeric(10, 2),
  weekly_enabled boolean not null default false,
  monthly_price numeric(10, 2),
  monthly_enabled boolean not null default false,

  available_days text[] not null default '{}',
  available_from date,
  available_to date,
  instant_booking boolean not null default false,

  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.places enable row level security;

create policy "Anyone can view active places"
  on public.places for select
  using (status = 'Active');

create policy "Hosts can view their own places"
  on public.places for select
  using (auth.uid() = host_id);

create policy "Hosts can create their own places"
  on public.places for insert
  with check (auth.uid() = host_id);

create policy "Hosts can update their own places"
  on public.places for update
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "Hosts can delete their own places"
  on public.places for delete
  using (auth.uid() = host_id);

-- Keeps updated_at current on every edit — places are mutable (price,
-- availability, status) unlike users/verified_users which don't track this.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger places_set_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

-- Photos: 3 fixed slots (reception/work/backwash) plus any number of
-- 'extra' images from the "Add More Image" tile.
create table public.place_images (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  slot text not null check (slot in ('reception', 'work', 'backwash', 'extra')),
  path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.place_images enable row level security;

create policy "Anyone can view place images"
  on public.place_images for select
  using (true);

create policy "Hosts can add images to their own places"
  on public.place_images for insert
  with check (
    auth.uid() = (select host_id from public.places where id = place_id)
  );

create policy "Hosts can update images on their own places"
  on public.place_images for update
  using (
    auth.uid() = (select host_id from public.places where id = place_id)
  );

create policy "Hosts can remove images from their own places"
  on public.place_images for delete
  using (
    auth.uid() = (select host_id from public.places where id = place_id)
  );

-- `place_images` bucket is created manually in the Supabase dashboard (same
-- as profile_images / verified_users) — public, since listing photos need
-- to be browsable by renters. Path convention: {host_id}/{place_id}/{slot}-{timestamp}.{ext}
update storage.buckets set public = true where id = 'place_images';

create policy "Anyone can view place image files"
  on storage.objects for select
  using (bucket_id = 'place_images');

create policy "Hosts can upload their own place image files"
  on storage.objects for insert
  with check (
    bucket_id = 'place_images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Hosts can replace their own place image files"
  on storage.objects for update
  using (
    bucket_id = 'place_images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Hosts can delete their own place image files"
  on storage.objects for delete
  using (
    bucket_id = 'place_images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
