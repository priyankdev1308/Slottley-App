import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY — set them in .env (see .env.example).',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // PKCE keeps the recovery/confirmation tokens out of the deep-link URL
    // itself (just a one-time `code` param) — the right choice for native
    // apps where the OS/other apps can otherwise see opened URLs.
    flowType: 'pkce',
  },
});

export const APP_URL_SCHEME = 'slottley';

// The reset-password link always opens this hosted web page (never the
// app) — see web/reset-password/. It has its own self-contained UI that
// completes the password change directly in the browser, so it works the
// same regardless of device or browser (no Safari/Chrome inconsistency).
export const PASSWORD_RESET_REDIRECT_URL =
  'https://codonnier.tech/reactapps/slottley_app/reset-password/index.html';

// resetPasswordForEmail is called from here (the app) but the resulting
// link is always completed on a *different* client — the web page above,
// possibly on a different device entirely. The main `supabase` client above
// uses PKCE, whose recovery code can only be exchanged by the same client
// that requested it, so it would fail there. This dedicated client uses the
// implicit flow instead, which puts the session tokens directly in the
// redirect URL's hash fragment — completable by any browser with no prior
// state. Only ever used for the resetPasswordForEmail call below; it holds
// no session of its own (persistSession: false).
export const supabaseAuthLinkClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
    flowType: 'implicit',
  },
});
