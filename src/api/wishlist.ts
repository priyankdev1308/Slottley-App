import { MySpace, PLACES_SELECT, PlaceRow, mapPlaceRow } from './places';
import { supabase } from './supabaseClient';

export const fetchWishlistPlaceIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase.from('wishlists').select('place_id').eq('user_id', userId);

  if (error || !data) return [];
  return data.map(row => row.place_id as string);
};

export const addToWishlist = async (userId: string, placeId: string): Promise<boolean> => {
  const { error } = await supabase.from('wishlists').insert({ user_id: userId, place_id: placeId });
  return !error;
};

export const removeFromWishlist = async (userId: string, placeId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);
  return !error;
};

interface WishlistRow {
  place_id: string;
  places: PlaceRow | null;
}

// Joins through to the full place record so the Wishlist screen can render
// real cards, newest-liked first.
export const fetchWishlistPlaces = async (userId: string): Promise<MySpace[]> => {
  const { data, error } = await supabase
    .from('wishlists')
    .select(`place_id, places(${PLACES_SELECT})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as unknown as WishlistRow[])
    .map(row => row.places)
    .filter((place): place is PlaceRow => place != null)
    .map(mapPlaceRow);
};
