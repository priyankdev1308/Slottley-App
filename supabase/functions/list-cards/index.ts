import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

interface StripeCard {
  id: string;
  card?: { brand?: string; last4?: string; exp_month?: number; exp_year?: number };
}

// Lists only the calling user's own saved cards — scoped to their own
// stripe_customer_id, never an id supplied by the request.
Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }

  const { data: profile, error: profileError } = await callerClient
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !profile?.stripe_customer_id) {
    // No Stripe customer yet means no cards yet — not an error state.
    return jsonResponse({ cards: [] }, 200);
  }

  const params = new URLSearchParams({ customer: profile.stripe_customer_id, type: 'card' });
  const listResponse = await fetch(`https://api.stripe.com/v1/payment_methods?${params.toString()}`, {
    headers: { Authorization: `Bearer ${stripeSecretKey}` },
  });

  const result = await listResponse.json();
  if (!listResponse.ok) {
    return jsonResponse({ error: result.error?.message ?? 'Stripe error' }, 502);
  }

  const cards = (result.data as StripeCard[]).map(pm => ({
    id: pm.id,
    brand: pm.card?.brand ?? 'unknown',
    last4: pm.card?.last4 ?? '',
    expMonth: pm.card?.exp_month ?? null,
    expYear: pm.card?.exp_year ?? null,
  }));

  return jsonResponse({ cards }, 200);
});
