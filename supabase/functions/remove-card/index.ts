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

// Detaches a payment method from Stripe — but only after confirming it
// actually belongs to the CALLING user's own Stripe Customer. Without that
// ownership check, any authenticated user could pass an arbitrary pm_...
// id and detach someone else's card.
Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  let paymentMethodId: string | undefined;
  try {
    ({ paymentMethodId } = await req.json());
  } catch {
    // no body — paymentMethodId stays undefined, caught below
  }
  if (!paymentMethodId) {
    return jsonResponse({ error: 'Missing paymentMethodId' }, 400);
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
    return jsonResponse({ error: 'No Stripe customer for this user' }, 400);
  }

  const retrieveResponse = await fetch(
    `https://api.stripe.com/v1/payment_methods/${paymentMethodId}`,
    { headers: { Authorization: `Bearer ${stripeSecretKey}` } },
  );
  const paymentMethod = await retrieveResponse.json();

  if (!retrieveResponse.ok) {
    return jsonResponse({ error: paymentMethod.error?.message ?? 'Card not found' }, 404);
  }
  if (paymentMethod.customer !== profile.stripe_customer_id) {
    return jsonResponse({ error: 'This card does not belong to you' }, 403);
  }

  const detachResponse = await fetch(
    `https://api.stripe.com/v1/payment_methods/${paymentMethodId}/detach`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${stripeSecretKey}` },
    },
  );

  if (!detachResponse.ok) {
    const detachError = await detachResponse.json();
    return jsonResponse({ error: detachError.error?.message ?? 'Stripe error' }, 502);
  }

  return jsonResponse({ success: true }, 200);
});
