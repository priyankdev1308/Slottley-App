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
  latitude: number | null;
  longitude: number | null;
  cqcRegistered?: boolean;
  category: string;
  categoryHint: string;
  rating: string;
  reviewCount: number;
  status: 'Active' | 'Inactive';
  description: string;
  amenities: string[];
  includedItems: string[];
  hostId: string;
  instantBooking: boolean;
}

interface PlaceImageRow {
  path: string;
  slot: string;
  sort_order: number;
}

export interface PlaceRow {
  id: string;
  title: string;
  address_street: string | null;
  area_town: string | null;
  latitude: number | null;
  longitude: number | null;
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
  host_id: string;
  instant_booking: boolean;
  place_images: PlaceImageRow[] | null;
}

export const PLACES_SELECT =
  'id, title, address_street, area_town, latitude, longitude, category, cqc_registered_only, status, about, amenities, included_items, ' +
  'hourly_price, hourly_enabled, daily_price, daily_enabled, weekly_price, weekly_enabled, ' +
  'monthly_price, monthly_enabled, host_id, instant_booking, place_images(path, slot, sort_order)';

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
    latitude: row.latitude,
    longitude: row.longitude,
    cqcRegistered: row.cqc_registered_only,
    category: categoryInfo?.title ?? row.category,
    categoryHint: categoryInfo?.description ?? '',
    rating: '0.0',
    reviewCount: 0,
    status: row.status,
    description: row.about ?? '',
    amenities: row.amenities ?? [],
    includedItems: row.included_items ?? [],
    hostId: row.host_id,
    instantBooking: row.instant_booking,
  };
};

export const fetchPlaceById = async (id: string): Promise<MySpace | null> => {
  const { data, error } = await supabase.from('places').select(PLACES_SELECT).eq('id', id).single();

  if (error || !data) return null;
  return mapPlaceRow(data as unknown as PlaceRow);
};

export interface HostSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export const fetchHostSummary = async (hostId: string): Promise<HostSummary | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, sur_name, profile_image')
    .eq('id', hostId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: [data.first_name, data.sur_name].filter(Boolean).join(' ') || 'Host',
    avatarUrl: data.profile_image
      ? supabase.storage.from('profile_images').getPublicUrl(data.profile_image).data.publicUrl
      : null,
  };
};

export interface EditablePlaceImage {
  slot: string;
  path: string;
  url: string;
  sortOrder: number;
}

export interface EditablePlace {
  id: string;
  title: string;
  about: string;
  businessName: string;
  addressStreet: string;
  areaTown: string;
  postCode: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  aestheticsRoom: boolean;
  cqcRegisteredOnly: boolean;
  cancellationPolicy: string;
  minBookingDays: number;
  amenities: string[];
  includedItems: string[];
  hourlyPrice: number | null;
  hourlyEnabled: boolean;
  dailyPrice: number | null;
  dailyEnabled: boolean;
  weeklyPrice: number | null;
  weeklyEnabled: boolean;
  monthlyPrice: number | null;
  monthlyEnabled: boolean;
  availableDays: string[];
  availableFrom: string | null;
  availableTo: string | null;
  instantBooking: boolean;
  images: EditablePlaceImage[];
}

interface PlaceEditRow {
  id: string;
  title: string;
  about: string | null;
  business_name: string | null;
  address_street: string | null;
  area_town: string | null;
  post_code: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string;
  aesthetics_room: boolean;
  cqc_registered_only: boolean;
  cancellation_policy: string;
  min_booking_days: number;
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
  available_days: string[] | null;
  available_from: string | null;
  available_to: string | null;
  instant_booking: boolean;
  place_images: PlaceImageRow[] | null;
}

const PLACE_EDIT_SELECT =
  'id, title, about, business_name, address_street, area_town, post_code, latitude, longitude, ' +
  'category, aesthetics_room, cqc_registered_only, cancellation_policy, min_booking_days, ' +
  'amenities, included_items, hourly_price, hourly_enabled, daily_price, daily_enabled, ' +
  'weekly_price, weekly_enabled, monthly_price, monthly_enabled, available_days, ' +
  'available_from, available_to, instant_booking, place_images(path, slot, sort_order)';

export const fetchPlaceForEdit = async (id: string): Promise<EditablePlace | null> => {
  const { data, error } = await supabase.from('places').select(PLACE_EDIT_SELECT).eq('id', id).single();

  if (error || !data) return null;
  const row = data as unknown as PlaceEditRow;

  const images: EditablePlaceImage[] = [...(row.place_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(img => ({
      slot: img.slot,
      path: img.path,
      url: supabase.storage.from(PLACE_IMAGE_BUCKET).getPublicUrl(img.path).data.publicUrl,
      sortOrder: img.sort_order,
    }));

  return {
    id: row.id,
    title: row.title,
    about: row.about ?? '',
    businessName: row.business_name ?? '',
    addressStreet: row.address_street ?? '',
    areaTown: row.area_town ?? '',
    postCode: row.post_code ?? '',
    latitude: row.latitude,
    longitude: row.longitude,
    category: row.category,
    aestheticsRoom: row.aesthetics_room,
    cqcRegisteredOnly: row.cqc_registered_only,
    cancellationPolicy: row.cancellation_policy,
    minBookingDays: row.min_booking_days,
    amenities: row.amenities ?? [],
    includedItems: row.included_items ?? [],
    hourlyPrice: row.hourly_price,
    hourlyEnabled: row.hourly_enabled,
    dailyPrice: row.daily_price,
    dailyEnabled: row.daily_enabled,
    weeklyPrice: row.weekly_price,
    weeklyEnabled: row.weekly_enabled,
    monthlyPrice: row.monthly_price,
    monthlyEnabled: row.monthly_enabled,
    availableDays: row.available_days ?? [],
    availableFrom: row.available_from,
    availableTo: row.available_to,
    instantBooking: row.instant_booking,
    images,
  };
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

// Renter-facing "Featured spaces" — no ratings system exists yet, so newest
// listings first stands in for it; swap the order() below once real ratings
// land, no other change needed.
export const fetchFeaturedPlaces = async (
  pageIndex: number,
  pageSize: number,
): Promise<{ rows: MySpace[]; more: boolean }> => {
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('places')
    .select(PLACES_SELECT)
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !data) return { rows: [], more: false };

  return {
    rows: (data as unknown as PlaceRow[]).map(mapPlaceRow),
    more: data.length === pageSize,
  };
};

// Renter-facing Home screen search box — matches on title only (no
// description/location full-text search set up), newest first.
export const searchPlaces = async (
  query: string,
  pageIndex: number,
  pageSize: number,
): Promise<{ rows: MySpace[]; more: boolean }> => {
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('places')
    .select(PLACES_SELECT)
    .eq('status', 'Active')
    .ilike('title', `%${query}%`)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !data) return { rows: [], more: false };

  return {
    rows: (data as unknown as PlaceRow[]).map(mapPlaceRow),
    more: data.length === pageSize,
  };
};

const NEARBY_RADIUS_MILES = 100;

// Renter-facing "Spaces Near You" — distance filtering, sorting, and
// pagination all happen in the `nearby_places` RPC (plain Haversine trig,
// no PostGIS extension set up), so this only needs to map the rows it gets back.
export const fetchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  pageIndex: number,
  pageSize: number,
): Promise<{ rows: MySpace[]; more: boolean }> => {
  const { data, error } = await supabase
    .rpc('nearby_places', {
      lat: latitude,
      lng: longitude,
      radius_miles: NEARBY_RADIUS_MILES,
      page_limit: pageSize,
      page_offset: pageIndex * pageSize,
    })
    .select(PLACES_SELECT);

  if (error || !data) return { rows: [], more: false };

  return {
    rows: (data as unknown as PlaceRow[]).map(mapPlaceRow),
    more: data.length === pageSize,
  };
};
