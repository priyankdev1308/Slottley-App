-- Renter-side saved places (the heart icon on space cards / place detail).
-- One row per (user, place) like — unique constraint doubles as the
-- "already liked?" check so the client can just upsert/delete by pair.
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  created_at timestamptz not null default now(),

  unique (user_id, place_id)
);

alter table public.wishlists enable row level security;

create policy "Users can view their own wishlist"
  on public.wishlists for select
  using (auth.uid() = user_id);

create policy "Users can add to their own wishlist"
  on public.wishlists for insert
  with check (auth.uid() = user_id);

create policy "Users can remove from their own wishlist"
  on public.wishlists for delete
  using (auth.uid() = user_id);

create index wishlists_user_id_idx on public.wishlists (user_id);
create index wishlists_place_id_idx on public.wishlists (place_id);
