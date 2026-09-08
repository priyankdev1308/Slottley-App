-- Renter bookings created from BookPlaceScreen. Same two datetime columns
-- serve all four booking types (Hourly/Daily/Weekly/Monthly) — booking_type
-- just tags which one, rather than having per-type date columns.
create table public.book_space (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  renter_id uuid not null references public.users (id) on delete cascade,
  booking_type text not null check (booking_type in ('Hourly', 'Daily', 'Weekly', 'Monthly')),
  start_date_time timestamptz not null,
  end_date_time timestamptz not null,
  quantity numeric(10, 2) not null,   -- hours / days / weeks(=1) / months(rounded up)
  rate numeric(10, 2) not null,       -- the single tier rate used, snapshotted at booking time
  total_price numeric(10, 2) not null,
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Cancelled')),
  created_at timestamptz not null default now()
);

alter table public.book_space enable row level security;

create policy "Renters can view their own bookings"
  on public.book_space for select
  using (auth.uid() = renter_id);

create policy "Hosts can view bookings on their own places"
  on public.book_space for select
  using (auth.uid() = (select host_id from public.places where id = place_id));

create policy "Renters can create their own bookings"
  on public.book_space for insert
  with check (auth.uid() = renter_id);

create index book_space_place_id_idx on public.book_space (place_id);
create index book_space_renter_id_idx on public.book_space (renter_id);
