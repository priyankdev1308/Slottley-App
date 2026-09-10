import { ImageSourcePropType } from 'react-native';
import { FunctionsHttpError } from '@supabase/supabase-js';

import { PLACES_SELECT, PlaceRow, mapPlaceRow } from './places';
import { supabase } from './supabaseClient';

export type BookingType = 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface BookingDetail {
  id: string;
  bookingId: string;
  placeId: string;
  placeTitle: string;
  placeLocation: string;
  placeImage: ImageSourcePropType;
  bookingType: BookingType;
  quantity: number;
  rate: number;
  totalPrice: number;
  status: BookingStatus;
  // Pre-formatted for display — a time range for Hourly ("10:00 AM - 12:00
  // PM"), or a quantity label for the rest ("3 Days", "1 Week", "2 Months").
  timeLabel: string;
  // A single date for Hourly, a "start - end" range for the rest.
  dateLabel: string;
}

interface BookSpaceRow {
  id: string;
  booking_id: string;
  place_id: string;
  booking_type: BookingType;
  start_date_time: string;
  end_date_time: string;
  quantity: number;
  rate: number;
  total_price: number;
  status: BookingStatus;
  places: PlaceRow | null;
}

const BOOK_SPACE_SELECT =
  `id, booking_id, place_id, booking_type, start_date_time, end_date_time, ` +
  `quantity, rate, total_price, status, places(${PLACES_SELECT})`;

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const formatDisplayDate = (date: Date) =>
  `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;

const formatDisplayTime = (date: Date) => {
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const hours12 = date.getHours() % 12 || 12;
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${hours12}:${minutes} ${ampm}`;
};

const UNIT_LABEL: Record<BookingType, string> = {
  Hourly: 'Hour',
  Daily: 'Day',
  Weekly: 'Week',
  Monthly: 'Month',
};

// Pre-formatted display strings shared by any screen showing a booking —
// a confirmed row (via mapBookingRow) or a not-yet-paid-for draft
// (PaymentScreen, before a book_space row exists).
export const buildBookingLabels = (
  bookingType: BookingType,
  startISO: string,
  endISO: string,
  quantity: number,
) => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const unit = UNIT_LABEL[bookingType];

  const timeLabel =
    bookingType === 'Hourly'
      ? `${formatDisplayTime(start)} - ${formatDisplayTime(end)}`
      : `${quantity} ${quantity === 1 ? unit : `${unit}s`}`;

  const dateLabel =
    bookingType === 'Hourly'
      ? formatDisplayDate(start)
      : `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;

  return { timeLabel, dateLabel };
};

const mapBookingRow = (row: BookSpaceRow): BookingDetail | null => {
  if (!row.places) return null;
  const place = mapPlaceRow(row.places);
  const { timeLabel, dateLabel } = buildBookingLabels(
    row.booking_type,
    row.start_date_time,
    row.end_date_time,
    row.quantity,
  );

  return {
    id: row.id,
    bookingId: row.booking_id,
    placeId: row.place_id,
    placeTitle: place.title,
    placeLocation: place.location,
    placeImage: place.image,
    bookingType: row.booking_type,
    quantity: row.quantity,
    rate: row.rate,
    totalPrice: row.total_price,
    status: row.status,
    timeLabel,
    dateLabel,
  };
};

export const fetchBookingById = async (id: string): Promise<BookingDetail | null> => {
  const { data, error } = await supabase
    .from('book_space')
    .select(BOOK_SPACE_SELECT)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapBookingRow(data as unknown as BookSpaceRow);
};

// One page of the CALLING user's own bookings (RLS already scopes
// book_space selects to auth.uid() = renter_id), most recently created
// first — same { rows, more } paging convention as fetchFeaturedPlaces.
export const fetchMyBookingsPage = async (
  pageIndex: number,
  pageSize: number,
): Promise<{ rows: BookingDetail[]; more: boolean }> => {
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('book_space')
    .select(BOOK_SPACE_SELECT)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error || !data) return { rows: [], more: false };

  const rows = (data as unknown as BookSpaceRow[])
    .map(mapBookingRow)
    .filter((booking): booking is BookingDetail => booking !== null);

  return { rows, more: data.length === pageSize };
};

// Cancels a booking via the cancel-booking Edge Function, which also
// issues a full Stripe refund (and gives back any referral credit spent)
// before flipping the row to Cancelled — a plain client-side status
// update would skip the refund entirely, so this always goes through the
// function rather than updating book_space directly.
export const cancelBooking = async (id: string): Promise<{ ok: boolean; error?: string }> => {
  const { error } = await supabase.functions.invoke('cancel-booking', { body: { bookingId: id } });
  if (!error) return { ok: true };

  let message = 'Please try again.';
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      message = body?.error ?? message;
    } catch {
      // response body wasn't JSON — fall back to the generic message
    }
  }
  return { ok: false, error: message };
};
