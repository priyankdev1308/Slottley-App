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

// Attaches an ALREADY-TOKENIZED payment method (created client-side via the
// Stripe SDK's CardField + createPaymentMethod — the raw card number/CVC
// never reaches this function or any of our servers) to the calling user's
// own Stripe Customer.
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
    return jsonResponse({ error: 'No Stripe customer for this user yet' }, 400);
  }

  const attachResponse = await fetch(
    `https://api.stripe.com/v1/payment_methods/${paymentMethodId}/attach`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ customer: profile.stripe_customer_id }),
    },
  );

  const paymentMethod = await attachResponse.json();
  if (!attachResponse.ok) {
    return jsonResponse({ error: paymentMethod.error?.message ?? 'Stripe error' }, 502);
  }

  return jsonResponse(
    {
      id: paymentMethod.id,
      brand: paymentMethod.card?.brand ?? 'unknown',
      last4: paymentMethod.card?.last4 ?? '',
      expMonth: paymentMethod.card?.exp_month ?? null,
      expYear: paymentMethod.card?.exp_year ?? null,
    },
    200,
  );
});
