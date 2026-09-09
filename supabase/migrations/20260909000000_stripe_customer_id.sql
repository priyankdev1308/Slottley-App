-- Stripe Customer id, created lazily/idempotently by the create-stripe-customer
-- Edge Function (never written directly by the client).
alter table public.users
  add column stripe_customer_id text;
