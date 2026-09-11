-- Stripe Connect fields for Hosts connecting a payout bank account.
-- stripe_connect_id is the Accounts v2 account id (acct_...); the three
-- booleans mirror Stripe's own Account object fields and are kept in sync
-- by the stripe-connect-webhook Edge Function's account.updated handler —
-- the onboarding redirect alone never confirms actual completion.
alter table public.users
  add column stripe_connect_id text,
  add column connect_charges_enabled boolean not null default false,
  add column connect_payouts_enabled boolean not null default false,
  add column connect_details_submitted boolean not null default false;
