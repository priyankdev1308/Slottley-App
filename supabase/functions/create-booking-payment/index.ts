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

const BOOKING_TYPES = ['Hourly', 'Daily', 'Weekly', 'Monthly'];

interface RequestBody {
  paymentMethodId?: string;
  placeId?: string;
  bookingType?: string;
  startDateTime?: string;
  endDateTime?: string;
  quantity?: number;
  rate?: number;
  totalPrice?: number;
}

// Charges the caller's own saved card for a booking and ONLY creates the
// book_space row if that charge actually succeeds — no charge, no booking,
// and no booking without a charge. The book_space INSERT RLS policy that
// used to let a renter create their own row directly has been dropped
// (see the accompanying migration), so this Edge Function's service-role
// insert below is now the ONLY way a book_space row can be created.
Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const { paymentMethodId, placeId, bookingType, startDateTime, endDateTime, quantity, rate, totalPrice } = body;

  if (!paymentMethodId || !placeId || !bookingType || !startDateTime || !endDateTime) {
    return jsonResponse({ error: 'Missing booking details' }, 400);
  }
  if (!BOOKING_TYPES.includes(bookingType)) {
    return jsonResponse({ error: 'Invalid booking type' }, 400);
  }
  if (!quantity || quantity <= 0 || !rate || rate <= 0 || !totalPrice || totalPrice <= 0) {
    return jsonResponse({ error: 'Invalid booking pricing' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

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
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.stripe_customer_id) {
    return jsonResponse({ error: 'No payment profile found. Please add a card first.' }, 400);
  }
  const stripeCustomerId = profile.stripe_customer_id;

  // Ownership check — same critical pattern as remove-card: never charge a
  // payment method that isn't the caller's own, even if one is supplied.
  const retrieveResponse = await fetch(
    `https://api.stripe.com/v1/payment_methods/${paymentMethodId}`,
    { headers: { Authorization: `Bearer ${stripeSecretKey}` } },
  );
  const paymentMethod = await retrieveResponse.json();

  if (!retrieveResponse.ok) {
    return jsonResponse({ error: paymentMethod.error?.message ?? 'Card not found' }, 404);
  }
  if (paymentMethod.customer !== stripeCustomerId) {
    return jsonResponse({ error: 'This card does not belong to you' }, 403);
  }

  // Create + confirm in one call — the customer is actively present (they
  // just tapped Pay), so this is on-session, card-only, no return_url. If
  // Stripe comes back with anything other than 'succeeded' (including
  // 'requires_action' for 3D Secure), that's treated as a failed payment —
  // 3DS/SCA handling is explicitly out of scope for now.
  const paymentIntentParams = new URLSearchParams({
    amount: String(Math.round(totalPrice * 100)),
    currency: 'gbp',
    customer: stripeCustomerId,
    payment_method: paymentMethodId,
    confirm: 'true',
    'payment_method_types[]': 'card',
  });

  const paymentIntentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: paymentIntentParams,
  });

  const paymentIntent = await paymentIntentResponse.json();

  if (!paymentIntentResponse.ok) {
    return jsonResponse({ error: paymentIntent.error?.message ?? 'Payment failed' }, 402);
  }
  if (paymentIntent.status !== 'succeeded') {
    const message =
      paymentIntent.status === 'requires_action'
        ? 'This card requires additional verification — please try a different card.'
        : paymentIntent.last_payment_error?.message ?? 'Payment could not be completed.';
    return jsonResponse({ error: message }, 402);
  }

  // Payment succeeded — now create the booking. Uses the service-role
  // client because the client-side INSERT policy on book_space has been
  // removed; this is the only path a book_space row can be created through.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: booking, error: insertError } = await adminClient
    .from('book_space')
    .insert({
      place_id: placeId,
      renter_id: user.id,
      booking_type: bookingType,
      start_date_time: startDateTime,
      end_date_time: endDateTime,
      quantity,
      rate,
      total_price: totalPrice,
      // Platform commission % and referral-credit lookup still have no
      // business rule defined (same pre-existing gap as the app's own
      // PaymentScreen summary, which shows both as £0) — place_price is
      // the pre-commission/credit price, currently equal to total_price.
      place_price: totalPrice,
      platform_commission: 0,
      referral_credit: 0,
      status: 'Confirmed',
      payment_details: JSON.stringify({
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_method: paymentIntent.payment_method,
        created: paymentIntent.created,
      }),
    })
    .select('id')
    .single();

  if (insertError || !booking) {
    // The card has already been charged at this point — a rare failure
    // window (e.g. a transient DB issue), not a payment failure. Surfaced
    // distinctly rather than as a generic error since there's no automatic
    // refund here; the charge stands and needs manual follow-up.
    return jsonResponse(
      { error: 'Payment succeeded but we could not save your booking. Please contact support.' },
      500,
    );
  }

  return jsonResponse({ bookingId: booking.id }, 200);
});
