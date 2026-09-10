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

// Charges the caller's own saved card (after applying any referral wallet
// credit) for a booking and ONLY creates the book_space row if payment
// actually succeeds — no charge, no booking, and no booking without a
// charge. The book_space INSERT RLS policy that used to let a renter
// create their own row directly has been dropped, so this Edge Function's
// service-role insert below is now the ONLY way a book_space row can be
// created.
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

  if (!placeId || !bookingType || !startDateTime || !endDateTime) {
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
  // Elevated client — used for the wallet-credit spend/refund RPCs (their
  // EXECUTE grant is revoked from anon/authenticated, so only this client
  // can call them) and for the final booking insert.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }
  const user = userData.user;

  const { data: profile, error: profileError } = await callerClient
    .from('users')
    .select('stripe_customer_id, wallet_balance')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return jsonResponse({ error: 'No payment profile found. Please add a card first.' }, 400);
  }
  const stripeCustomerId = profile.stripe_customer_id;

  // Spend referral wallet credit against this booking FIRST (before ever
  // touching Stripe) — spend_wallet_credit is a single locked SQL statement
  // so two overlapping bookings can never spend the same credit twice.
  // Worst case it spends less than intended (returns 0), and the customer
  // just pays full price by card — the credit is never lost or double-used.
  const intendedCredit = Math.min(Math.max(profile.wallet_balance ?? 0, 0), totalPrice);
  let creditApplied = 0;
  if (intendedCredit > 0) {
    const { data: spent, error: spendError } = await adminClient.rpc('spend_wallet_credit', {
      p_user_id: user.id,
      p_amount: intendedCredit,
    });
    if (spendError) {
      // Logged so a missing/misnamed RPC (e.g. the wallet-credit migration
      // hasn't been run yet) shows up in the function logs instead of
      // silently looking like the user just had no credit to spend.
      console.error('spend_wallet_credit failed:', spendError);
    } else if (typeof spent === 'number') {
      creditApplied = spent;
    }
  }

  const amountToCharge = Math.round((totalPrice - creditApplied) * 100) / 100;

  let paymentDetails: Record<string, unknown>;

  if (amountToCharge > 0) {
    if (!paymentMethodId) {
      if (creditApplied > 0) await adminClient.rpc('refund_wallet_credit', { p_user_id: user.id, p_amount: creditApplied });
      return jsonResponse({ error: 'Missing booking details' }, 400);
    }
    if (!stripeCustomerId) {
      if (creditApplied > 0) await adminClient.rpc('refund_wallet_credit', { p_user_id: user.id, p_amount: creditApplied });
      return jsonResponse({ error: 'No payment profile found. Please add a card first.' }, 400);
    }

    // Ownership check — same critical pattern as remove-card: never charge
    // a payment method that isn't the caller's own, even if one is supplied.
    const retrieveResponse = await fetch(
      `https://api.stripe.com/v1/payment_methods/${paymentMethodId}`,
      { headers: { Authorization: `Bearer ${stripeSecretKey}` } },
    );
    const paymentMethod = await retrieveResponse.json();

    if (!retrieveResponse.ok) {
      if (creditApplied > 0) await adminClient.rpc('refund_wallet_credit', { p_user_id: user.id, p_amount: creditApplied });
      return jsonResponse({ error: paymentMethod.error?.message ?? 'Card not found' }, 404);
    }
    if (paymentMethod.customer !== stripeCustomerId) {
      if (creditApplied > 0) await adminClient.rpc('refund_wallet_credit', { p_user_id: user.id, p_amount: creditApplied });
      return jsonResponse({ error: 'This card does not belong to you' }, 403);
    }

    // Create + confirm in one call — the customer is actively present (they
    // just tapped Pay), so this is on-session, card-only, no return_url. If
    // Stripe comes back with anything other than 'succeeded' (including
    // 'requires_action' for 3D Secure), that's treated as a failed payment —
    // 3DS/SCA handling is explicitly out of scope for now.
    const paymentIntentParams = new URLSearchParams({
      amount: String(Math.round(amountToCharge * 100)),
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

    if (!paymentIntentResponse.ok || paymentIntent.status !== 'succeeded') {
      // The card charge didn't go through — give back any wallet credit we
      // already spent, since no booking is being created.
      if (creditApplied > 0) await adminClient.rpc('refund_wallet_credit', { p_user_id: user.id, p_amount: creditApplied });

      const message = !paymentIntentResponse.ok
        ? paymentIntent.error?.message ?? 'Payment failed'
        : paymentIntent.status === 'requires_action'
        ? 'This card requires additional verification — please try a different card.'
        : paymentIntent.last_payment_error?.message ?? 'Payment could not be completed.';
      return jsonResponse({ error: message }, 402);
    }

    paymentDetails = {
      method: 'card',
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      payment_method: paymentIntent.payment_method,
      created: paymentIntent.created,
      walletCreditApplied: creditApplied,
    };
  } else {
    // Wallet credit covered the entire booking cost — no card charge needed.
    paymentDetails = { method: 'wallet', walletCreditApplied: creditApplied };
  }

  // Payment settled (by card, by wallet credit, or both) — now create the
  // booking. Uses the service-role client because the client-side INSERT
  // policy on book_space has been removed; this is the only path a
  // book_space row can be created through.
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
      // place_price is the pre-adjustment price (rate x quantity);
      // total_price is what the customer actually settled after credit.
      // Platform commission still has no business rule defined, so it
      // stays at 0 (same pre-existing gap as before).
      place_price: totalPrice,
      platform_commission: 0,
      referral_credit: creditApplied,
      total_price: amountToCharge,
      status: 'Confirmed',
      payment_details: JSON.stringify(paymentDetails),
    })
    .select('id')
    .single();

  if (insertError || !booking) {
    // Payment has already settled at this point — a rare failure window
    // (e.g. a transient DB issue), not a payment failure. Give back any
    // wallet credit spent, since no booking was actually created; the card
    // charge (if any) still stands and needs manual follow-up — no
    // automatic refund API call for that part.
    if (creditApplied > 0) await adminClient.rpc('refund_wallet_credit', { p_user_id: user.id, p_amount: creditApplied });
    return jsonResponse(
      { error: 'Payment succeeded but we could not save your booking. Please contact support.' },
      500,
    );
  }

  return jsonResponse({ bookingId: booking.id }, 200);
});
