// Interstitial (full-screen, skippable) ads via Google AdMob — native only.
//
// Shown at natural transition moments (every few "give me another" taps),
// never for ad-free (premium) users. Frequency-capped so it doesn't annoy.
//
// A platform sibling (ads.web.ts) provides no-op stubs so the web bundle
// never imports the native module.

import { Platform } from 'react-native';
import mobileAds, {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { adsVisible } from './monetization';

// Real interstitial unit for Android; test id elsewhere / in dev.
const AD_UNIT_ID =
  __DEV__ || Platform.OS !== 'android'
    ? TestIds.INTERSTITIAL
    : 'ca-app-pub-2574865816195164/9655964903';

// Show an interstitial roughly once every SHOW_EVERY suggestion refreshes.
const SHOW_EVERY = 4;

let initialized = false;
let interstitial: InterstitialAd | null = null;
let loaded = false;
let counter = 0;

function createAndLoad() {
  interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false,
  });
  loaded = false;
  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
  });
  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    // Preload the next one after the user dismisses.
    createAndLoad();
  });
  interstitial.addAdEventListener(AdEventType.ERROR, () => {
    loaded = false;
  });
  try {
    interstitial.load();
  } catch {}
}

/** Initialize the ads SDK once, then preload the first interstitial. */
export async function initAds(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await mobileAds().initialize();
    createAndLoad();
  } catch {}
}

/**
 * Called at a natural break. Shows an interstitial every few calls, but only
 * when ads are enabled and the user is not premium. Safe to call anytime.
 */
export function maybeShowInterstitial(): void {
  if (!adsVisible()) return;
  counter += 1;
  if (counter % SHOW_EVERY !== 0) return;
  if (interstitial && loaded) {
    try {
      interstitial.show();
    } catch {
      createAndLoad();
    }
  } else if (!interstitial) {
    createAndLoad();
  }
}
