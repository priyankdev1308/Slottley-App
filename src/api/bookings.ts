import { ImageSourcePropType } from 'react-native';

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

const mapBookingRow = (row: BookSpaceRow): BookingDetail | null => {
  if (!row.places) return null;
  const place = mapPlaceRow(row.places);

  const start = new Date(row.start_date_time);
  const end = new Date(row.end_date_time);
  const unit = UNIT_LABEL[row.booking_type];

  const timeLabel =
    row.booking_type === 'Hourly'
      ? `${formatDisplayTime(start)} - ${formatDisplayTime(end)}`
      : `${row.quantity} ${row.quantity === 1 ? unit : `${unit}s`}`;

  const dateLabel =
    row.booking_type === 'Hourly'
      ? formatDisplayDate(start)
      : `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;

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

// Stands in for a real payment-success webhook until Stripe is wired up —
// just flips the row to Confirmed, no charge actually happens yet.
export const markBookingConfirmed = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('book_space').update({ status: 'Confirmed' }).eq('id', id);
  return !error;
};
