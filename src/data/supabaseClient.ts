// Shared Supabase client: auth (email/password) + per-user day plan storage.
// The publishable key is a public client key; data access is protected by
// Row Level Security (users can only read/write their own day_plans rows).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eddaipkxrghktcfqhoav.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c_kt8JqL_FvfZW0VBkSoQg_7O7dS1CJ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.email ?? null;
  } catch {
    return null;
  }
}
