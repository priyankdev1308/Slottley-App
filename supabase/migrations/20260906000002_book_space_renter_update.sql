-- Lets the renter mark their own pending booking as confirmed from
-- PaymentScreen — stands in for a real payment-success webhook until Stripe
-- is wired up.
create policy "Renters can update their own bookings"
  on public.book_space for update
  using (auth.uid() = renter_id)
  with check (auth.uid() = renter_id);
