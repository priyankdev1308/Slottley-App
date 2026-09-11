import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Called directly by Stripe, not by the app — this function MUST be
// deployed with `--no-verify-jwt` (Stripe never sends a Supabase auth
// token) and MUST verify the request signature below (this endpoint is
// public; without verification anyone could POST a fake event and flip on
// payout status for an arbitrary user).
//
// Uses the real Stripe SDK's async webhook constructor (with the Deno
// subtle-crypto provider) rather than hand-rolled HMAC verification —
// this is Stripe's own documented pattern for Deno/edge-function
// webhooks, and correctness here (replay protection, timing-safe
// comparison) is exactly the kind of thing not worth reimplementing.
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Same version used for the v2 calls in connect-bank-account — keep these
// two in sync. Confirmed working (not a guess) against a live v2 Accounts
// integration on this Stripe account.
const STRIPE_API_VERSION_V2 = '2026-06-24.dahlia';

Deno.serve(async req => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing Stripe-Signature header' }), { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: `Signature verification failed: ${err.message}` }), {
      status: 400,
    });
  }

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // v2 events are "thin" — the payload only references the account (via
  // related_object.id), it doesn't embed it, so the current state has to
  // be fetched separately. Both the related_object.id field and the
  // configuration.recipient.capabilities.stripe_balance.stripe_transfers.status
  // path below are confirmed against a working reference implementation
  // (not a guess) — only the details_submitted heuristic further down is
  // still our own best-effort mapping, with no equivalent to check against.
  if (event.type === 'v2.core.account.updated') {
    const raw = event as unknown as Record<string, any>;
    const accountId: string | undefined = raw.related_object?.id;

    if (accountId) {
      const accountResponse = await fetch(
        `https://api.stripe.com/v2/core/accounts/${accountId}?include=configuration.recipient&include=configuration.merchant&include=requirements`,
        {
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            'Stripe-Version': STRIPE_API_VERSION_V2,
          },
        },
      );
      const account = await accountResponse.json();

      if (accountResponse.ok) {
        const payoutsStatus = account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status;
        const chargesStatus = account.configuration?.merchant?.capabilities?.card_payments?.status;
        // No direct v2 equivalent of v1's `details_submitted` boolean —
        // treating "no outstanding requirements" as the closest match.
        // (Best-effort only — not validated against a real payload.)
        const hasOutstandingRequirements = !!account.requirements?.summary?.minimum_deadline;

        await adminClient
          .from('users')
          .update({
            connect_charges_enabled: chargesStatus === 'active',
            connect_payouts_enabled: payoutsStatus === 'active',
            connect_details_submitted: !hasOutstandingRequirements,
          })
          .eq('stripe_connect_id', accountId);
      }
    }
  }

  // Any other event type: nothing to do yet, still ack quickly so Stripe
  // doesn't retry.
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
