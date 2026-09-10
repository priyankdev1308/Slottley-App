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

// Cancels one of the CALLING user's own bookings and fully refunds
// whatever was actually paid for it — the Stripe charge (if any) AND any
// referral wallet credit that was spent, so cancelling always makes the
// customer whole again.
Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  let body: { bookingId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const { bookingId } = body;
  if (!bookingId) {
    return jsonResponse({ error: 'Missing bookingId' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

  // Scoped to the caller's own JWT — RLS ("Renters can view their own
  // bookings") already restricts this select to rows the caller actually
  // owns, so a booking id that isn't theirs (or doesn't exist) just comes
  // back not found, no separate ownership check needed.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }
  const user = userData.user;

  const { data: booking, error: bookingError } = await callerClient
    .from('book_space')
    .select('id, status, referral_credit, payment_details')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return jsonResponse({ error: 'Booking not found' }, 404);
  }
  if (booking.status === 'Cancelled') {
    return jsonResponse({ error: 'This booking is already cancelled' }, 400);
  }

  let paymentDetails: Record<string, unknown> = {};
  try {
    paymentDetails = booking.payment_details ? JSON.parse(booking.payment_details) : {};
  } catch {
    paymentDetails = {};
  }
  const paymentIntentId =
    typeof paymentDetails.id === 'string' && paymentDetails.id.startsWith('pi_') ? paymentDetails.id : null;

  // Full refund of whatever was actually charged by card — no partial/
  // prorated amount, the whole PaymentIntent gets refunded.
  let refund: Record<string, unknown> | null = null;
  if (paymentIntentId) {
    const refundResponse = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ payment_intent: paymentIntentId }),
    });
    const refundResult = await refundResponse.json();
    if (!refundResponse.ok) {
      return jsonResponse({ error: refundResult.error?.message ?? 'Refund failed' }, 502);
    }
    refund = { id: refundResult.id, status: refundResult.status, amount: refundResult.amount };
  }

  // Elevated client — used for the wallet-credit refund RPC (EXECUTE is
  // revoked from anon/authenticated) and for the status update below, so
  // cancellation always goes through regardless of the book_space RLS
  // UPDATE policy's exact shape.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Give back any referral/wallet credit that was spent on this booking —
  // a full cancellation restores both the card charge AND the credit.
  const referralCredit = Number(booking.referral_credit) || 0;
  if (referralCredit > 0) {
    await adminClient.rpc('refund_wallet_credit', { p_user_id: user.id, p_amount: referralCredit });
  }

  const { error: updateError } = await adminClient
    .from('book_space')
    .update({
      status: 'Cancelled',
      payment_details: JSON.stringify({ ...paymentDetails, refund }),
    })
    .eq('id', bookingId);

  if (updateError) {
    // The refund has already gone through at this point — a rare failure
    // window, not a refund failure. Surfaced distinctly since the money is
    // already back with the customer; only the booking row's status
    // update itself failed.
    return jsonResponse(
      { error: 'Refund processed but the booking could not be updated. Please contact support.' },
      500,
    );
  }

  return jsonResponse({ success: true }, 200);
});
