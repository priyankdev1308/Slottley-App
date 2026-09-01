-- Address coordinates from the Google Place Picker search, used to plot
-- listings on a map and support distance-based search.
alter table public.places
  add column latitude double precision,
  add column longitude double precision;
