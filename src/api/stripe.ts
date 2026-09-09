import { supabase } from './supabaseClient';

// Fire-and-forget: best-effort background provisioning, never blocks the UI
// and never surfaces an error to the user — the Edge Function itself is
// idempotent, so calling it repeatedly (signup, login, app open, ...) is
// safe and cheap once a Stripe customer already exists for this user.
export const ensureStripeCustomer = () => {
  supabase.functions.invoke('create-stripe-customer').catch(() => {});
};
