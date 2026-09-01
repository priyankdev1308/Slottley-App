import { ImageSourcePropType } from 'react-native';

import { images } from '../../assets/images';
import { PLACE_CATEGORIES } from '../utils/placeCategories';
import { supabase } from './supabaseClient';

export const PLACE_IMAGE_BUCKET = 'place_images';

export interface MySpace {
  id: string;
  title: string;
  location: string;
  price: string;
  period: string;
  image: ImageSourcePropType;
  gallery: ImageSourcePropType[];
  imagePaths: string[];
  cqcRegistered?: boolean;
  category: string;
  categoryHint: string;
  rating: string;
  reviewCount: number;
  status: 'Active' | 'Inactive';
  description: string;
  amenities: string[];
  includedItems: string[];
}

interface PlaceImageRow {
  path: string;
  slot: string;
  sort_order: number;
}

interface PlaceRow {
  id: string;
  title: string;
  address_street: string | null;
  area_town: string | null;
  category: string;
  cqc_registered_only: boolean;
  status: 'Active' | 'Inactive';
  about: string | null;
  amenities: string[] | null;
  included_items: string[] | null;
  hourly_price: number | null;
  hourly_enabled: boolean;
  daily_price: number | null;
  daily_enabled: boolean;
  weekly_price: number | null;
  weekly_enabled: boolean;
  monthly_price: number | null;
  monthly_enabled: boolean;
  place_images: PlaceImageRow[] | null;
}

export const PLACES_SELECT =
  'id, title, address_street, area_town, category, cqc_registered_only, status, about, amenities, included_items, ' +
  'hourly_price, hourly_enabled, daily_price, daily_enabled, weekly_price, weekly_enabled, ' +
  'monthly_price, monthly_enabled, place_images(path, slot, sort_order)';

// First enabled tier wins, in this display-priority order.
const PRICE_TIERS: Array<{
  enabledKey: keyof PlaceRow;
  priceKey: keyof PlaceRow;
  period: string;
}> = [
  { enabledKey: 'daily_enabled', priceKey: 'daily_price', period: 'day' },
  { enabledKey: 'hourly_enabled', priceKey: 'hourly_price', period: 'hour' },
  { enabledKey: 'weekly_enabled', priceKey: 'weekly_price', period: 'week' },
  { enabledKey: 'monthly_enabled', priceKey: 'monthly_price', period: 'month' },
];

export const mapPlaceRow = (row: PlaceRow): MySpace => {
  const tier = PRICE_TIERS.find(t => row[t.enabledKey]);
  const priceValue = tier ? (row[tier.priceKey] as number | null) : null;

  const sortedImages = [...(row.place_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const imagePaths = sortedImages.map(img => img.path);
  const gallery: ImageSourcePropType[] = imagePaths.length
    ? imagePaths.map(path => ({
        uri: supabase.storage.from(PLACE_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
      }))
    : [images.dummy1];

  const categoryInfo = PLACE_CATEGORIES.find(c => c.key === row.category);

  return {
    id: row.id,
    title: row.title,
    location: row.area_town || row.address_street || '—',
    price: priceValue != null ? `£${priceValue}` : '£0',
    period: tier?.period ?? 'day',
    image: gallery[0],
    gallery,
    imagePaths,
    cqcRegistered: row.cqc_registered_only,
    category: categoryInfo?.title ?? row.category,
    categoryHint: categoryInfo?.description ?? '',
    rating: '0.0',
    reviewCount: 0,
    status: row.status,
    description: row.about ?? '',
    amenities: row.amenities ?? [],
    includedItems: row.included_items ?? [],
  };
};

export const fetchPlaceById = async (id: string): Promise<MySpace | null> => {
  const { data, error } = await supabase.from('places').select(PLACES_SELECT).eq('id', id).single();

  if (error || !data) return null;
  return mapPlaceRow(data as unknown as PlaceRow);
};

export const fetchHostPlacesCount = async (hostId: string): Promise<number> => {
  const { count } = await supabase
    .from('places')
    .select('id', { count: 'exact', head: true })
    .eq('host_id', hostId);
  return count ?? 0;
};

export const fetchHostPlacesPage = async (
  hostId: string,
  pageIndex: number,
  pageSize: number,
  search?: string,
): Promise<{ rows: MySpace[]; more: boolean }> => {
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('places')
    .select(PLACES_SELECT)
    .eq('host_id', hostId);

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    query = query.ilike('title', `%${trimmedSearch}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).range(from, to);

  if (error || !data) return { rows: [], more: false };

  return {
    rows: (data as unknown as PlaceRow[]).map(mapPlaceRow),
    more: data.length === pageSize,
  };
};
