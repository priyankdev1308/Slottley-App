-- Bookings are now only created after a Stripe payment actually succeeds,
-- via the create-booking-payment Edge Function (using the service_role
-- key, which bypasses RLS). The old policy let any renter insert their own
-- book_space row directly with no payment check at all — dropping it so
-- the Edge Function's service-role insert is the only way a row can be
-- created, making "payment success -> booking exists" an enforced
-- invariant rather than a UI-only convention.
drop policy "Renters can create their own bookings" on public.book_space;
