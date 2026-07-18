// Monetization scaffolding: premium (ad-free) status + ad visibility.
//
// The launch release ships WITHOUT ads (ADS_ENABLED = false). When AdMob is
// integrated, flip the flag and replace the AdBanner placeholder with a real
// banner — every screen placement is already wired.
//
// Premium status lives in the `premium_subs` table (read-only for clients);
// it will be written by the subscription backend (e.g. RevenueCat webhook).

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

// Master switch for ads. Keep false until AdMob is integrated and the store
// listing declares ads.
export const ADS_ENABLED = false;

const CACHE_KEY = 'planit.premiumUntil';
let premiumUntil: number | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((f) => f());
}

export function isPremium(): boolean {
  return premiumUntil !== null && premiumUntil > Date.now();
}

/** True when ad slots should render. */
export function adsVisible(): boolean {
  return ADS_ENABLED && !isPremium();
}

/** Refresh premium status from cache, then from the backend. */
export async function refreshPremium(): Promise<void> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      premiumUntil = parseInt(cached, 10) || null;
      notify();
    }
  } catch {}

  try {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return;
    const { data } = await supabase
      .from('premium_subs')
      .select('active_until')
      .maybeSingle();
    premiumUntil = data?.active_until ? new Date(data.active_until).getTime() : null;
    notify();
    try {
      if (premiumUntil) {
        await AsyncStorage.setItem(CACHE_KEY, String(premiumUntil));
      } else {
        await AsyncStorage.removeItem(CACHE_KEY);
      }
    } catch {}
  } catch {}
}

/** Re-renders when premium status changes. */
export function usePremium(): boolean {
  const [, bump] = useState(0);
  useEffect(() => {
    const h = () => bump((x) => x + 1);
    listeners.add(h);
    return () => {
      listeners.delete(h);
    };
  }, []);
  return isPremium();
}
