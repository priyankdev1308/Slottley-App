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

// Idempotent: returns the caller's existing stripe_customer_id if one is
// already saved, otherwise creates exactly one Stripe Customer and saves it.
// Safe to call from every login/signup/app-open — repeated calls after the
// first are just a cheap read, no duplicate customers are ever created.
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

  // Scoped to the caller's own JWT — used to identify who's calling and to
  // read/update only their own row (RLS already allows a user to update
  // their own public.users row, so no service_role key is needed here).
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }
  const user = userData.user;

  const { data: profile, error: profileError } = await callerClient
    .from('users')
    .select('stripe_customer_id, email, first_name, sur_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return jsonResponse({ error: profileError?.message ?? 'Profile not found' }, 500);
  }

  if (profile.stripe_customer_id) {
    return jsonResponse({ stripeCustomerId: profile.stripe_customer_id }, 200);
  }

  const name = [profile.first_name, profile.sur_name].filter(Boolean).join(' ');
  const params = new URLSearchParams({ 'metadata[supabase_user_id]': user.id });
  if (profile.email ?? user.email) params.set('email', profile.email ?? user.email!);
  if (name) params.set('name', name);

  const stripeResponse = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const stripeCustomer = await stripeResponse.json();
  if (!stripeResponse.ok) {
    return jsonResponse({ error: stripeCustomer.error?.message ?? 'Stripe error' }, 502);
  }

  const { error: updateError } = await callerClient
    .from('users')
    .update({ stripe_customer_id: stripeCustomer.id })
    .eq('id', user.id);

  if (updateError) {
    return jsonResponse({ error: updateError.message }, 500);
  }

  return jsonResponse({ stripeCustomerId: stripeCustomer.id }, 200);
});
