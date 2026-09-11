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

// Confirmed working (not a guess) against a live v2 Accounts integration
// on this Stripe account — keep in sync with stripe-connect-webhook.
const STRIPE_API_VERSION_V2 = '2026-06-24.dahlia';

// Mirrors the working PHP `connectBankAccount` method: create a v2
// Connected Account + onboarding link on first use, or an Express
// dashboard login link on every use after that.
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
  // The bank-account-return function renders a page that posts a message
  // back to the app's in-app WebView when onboarding finishes — loaded
  // inside that WebView, not the system browser. Hardcoded rather than
  // built from SUPABASE_URL — that env var didn't resolve to your actual
  // public project URL (Stripe rejected it as an invalid return_url), so
  // this uses the confirmed project URL directly instead.
  const RETURN_URL = 'https://vsxdiyxkpbowkleikjmp.supabase.co/functions/v1/bank-account-return';

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
    .select('stripe_connect_id, email')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return jsonResponse({ error: profileError?.message ?? 'Profile not found' }, 500);
  }

  // Already connected — send them to their Express dashboard instead of
  // creating a second account or re-onboarding.
  if (profile.stripe_connect_id) {
    const loginResponse = await fetch(
      `https://api.stripe.com/v1/accounts/${profile.stripe_connect_id}/login_links`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeSecretKey}` },
      },
    );
    const loginLink = await loginResponse.json();

    if (!loginResponse.ok) {
      return jsonResponse({ error: loginLink.error?.message ?? 'Stripe error' }, 502);
    }
    return jsonResponse({ url: loginLink.url }, 200);
  }

  // First time — create the v2 Connected Account.
  const email = profile.email ?? user.email;
  const accountBody: Record<string, unknown> = {
    dashboard: 'express',
    identity: { country: 'GB' },
    configuration: {
      recipient: {
        capabilities: { stripe_balance: { stripe_transfers: { requested: true } } },
      },
      merchant: {
        capabilities: { card_payments: { requested: true } },
      },
    },
    defaults: {
      responsibilities: { fees_collector: 'application', losses_collector: 'application' },
    },
    include: ['configuration.recipient', 'identity', 'requirements'],
    metadata: { user_token: user.id },
  };
  if (email) {
    accountBody.contact_email = email;
  }

  const accountResponse = await fetch('https://api.stripe.com/v2/core/accounts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/json',
      'Stripe-Version': STRIPE_API_VERSION_V2,
    },
    body: JSON.stringify(accountBody),
  });
  const account = await accountResponse.json();

  if (!accountResponse.ok) {
    return jsonResponse({ error: account.error?.message ?? 'Stripe error' }, 502);
  }

  // Save the account id right away — if the onboarding-link call below
  // fails, the account still exists on Stripe's side, so the next attempt
  // must reuse it rather than creating a duplicate.
  const { error: saveError } = await callerClient
    .from('users')
    .update({ stripe_connect_id: account.id })
    .eq('id', user.id);

  if (saveError) {
    return jsonResponse({ error: saveError.message }, 500);
  }

  const linkResponse = await fetch('https://api.stripe.com/v2/core/account_links', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/json',
      'Stripe-Version': STRIPE_API_VERSION_V2,
    },
    body: JSON.stringify({
      account: account.id,
      use_case: {
        type: 'account_onboarding',
        account_onboarding: {
          configurations: ['recipient', 'merchant'],
          refresh_url: RETURN_URL,
          return_url: RETURN_URL,
        },
      },
    }),
  });
  const link = await linkResponse.json();

  if (!linkResponse.ok) {
    return jsonResponse({ error: link.error?.message ?? 'Stripe error' }, 502);
  }

  return jsonResponse({ url: link.url }, 200);
});
