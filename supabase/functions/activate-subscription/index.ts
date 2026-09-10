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

// Mirrors src/config/subscriptionProducts.ts — kept as a small literal list
// here rather than shared, same as BOOKING_TYPES in create-booking-payment
// (Deno functions can't import from the app's src/ tree).
const KNOWN_PRODUCT_IDS = [
  'com.app.slottley.subscription.enhance.monthly',
  'com.app.slottley.subscription.pro.monthly',
];
const PLATFORMS = ['ios', 'android'];

interface RequestBody {
  productId?: string;
  platform?: string;
  // Not used yet — see the TEST-MODE note below. Accepted now so the real
  // Apple/Google purchase flow can pass a receipt/purchase token later
  // without changing this function's call shape.
  receipt?: string;
}

// Activates a Host's subscription for the CALLING user's own account.
//
// TEST-MODE: there is no real Apple/Google purchase yet, so there is
// nothing to verify a receipt against — a successful call is trusted to
// mean a successful test purchase. When real StoreKit/Google Play Billing
// purchases are wired up, `receipt` (above) should be verified against
// Apple's/Google's server-to-server APIs here BEFORE writing anything
// below; the client's call shape and the columns written won't need to
// change.
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

  const { productId, platform } = body;
  if (!productId || !KNOWN_PRODUCT_IDS.includes(productId)) {
    return jsonResponse({ error: 'Invalid product id' }, 400);
  }
  if (!platform || !PLATFORMS.includes(platform)) {
    return jsonResponse({ error: 'Invalid platform' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // Scoped to the caller's own JWT — this only ever updates the caller's
  // own row, and RLS's existing "Users can update their own row" policy
  // already permits it, so no service-role client is needed here.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }

  const { error: updateError } = await callerClient
    .from('users')
    .update({
      subscription_product: productId,
      is_subscription_activated: 1,
      is_android_purchased: platform === 'android' ? 1 : 0,
    })
    .eq('id', userData.user.id);

  if (updateError) {
    return jsonResponse({ error: updateError.message }, 500);
  }

  return jsonResponse({ success: true }, 200);
});
