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
export const PASSWORD_RESET_REDIRECT_URL = `${APP_URL_SCHEME}://reset-password`;
