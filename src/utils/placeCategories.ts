// Shared with the `places.category` check constraint (supabase/migrations/20260901000000_places.sql)
// — keep the `key` values in sync with that constraint.
export interface PlaceCategory {
  key: string;
  title: string;
  description?: string;
  fullWidth?: boolean;
}

export const PLACE_CATEGORIES: PlaceCategory[] = [
  { key: 'all', title: 'All categories' },
  { key: 'hair', title: 'Hair / Rent a Chair', description: 'e.g. cutting, colouring, styling' },
  {
    key: 'beauty',
    title: 'Beauty Room',
    description: 'e.g. facials, waxing, tinting, makeup, brow & lash',
  },
  { key: 'barber', title: 'Barber Chair', description: "e.g. men's cuts, shaves, grooming" },
  {
    key: 'nail',
    title: 'Nail Station',
    description: 'e.g. manicure, pedicure, nail extensions',
    fullWidth: true,
  },
  {
    key: 'therapy',
    title: 'Therapy Room',
    description: 'e.g. massage, reflexology, holistic & complementary therapies',
    fullWidth: true,
  },
];
