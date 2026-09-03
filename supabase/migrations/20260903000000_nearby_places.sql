-- Distance-sorted, paginated nearby-places lookup for the renter Home screen's
-- "Spaces Near You" section. No PostGIS extension is set up (latitude/longitude
-- are plain double precision), so this uses the standard Haversine formula.
-- Returns `setof public.places` (not a custom row type) so PostgREST can still
-- embed `place_images` on the client the same way it does for a plain table
-- select — the actual distance value is cheap to recompute client-side for
-- display, so it isn't returned here.
create or replace function public.nearby_places(
  lat double precision,
  lng double precision,
  radius_miles double precision default 100,
  page_limit integer default 10,
  page_offset integer default 0
)
returns setof public.places
language sql
stable
as $$
  select *
  from public.places
  where status = 'Active'
    and latitude is not null
    and longitude is not null
    and 3959 * acos(
      least(1, greatest(-1,
        cos(radians(lat)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(lng)) +
        sin(radians(lat)) * sin(radians(latitude))
      ))
    ) <= radius_miles
  order by 3959 * acos(
    least(1, greatest(-1,
      cos(radians(lat)) * cos(radians(latitude)) *
      cos(radians(longitude) - radians(lng)) +
      sin(radians(lat)) * sin(radians(latitude))
    ))
  ) asc
  limit page_limit offset page_offset;
$$;

grant execute on function public.nearby_places(double precision, double precision, double precision, integer, integer)
  to anon, authenticated;
