const EARTH_RADIUS_MILES = 3959;

const toRad = (deg: number) => (deg * Math.PI) / 180;

// Matches the Haversine formula used server-side in the `nearby_places` RPC
// (supabase/migrations/20260903000000_nearby_places.sql) — kept in sync so
// the distance shown on a card matches what the query actually filtered on.
export const haversineMiles = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
