// Web stub for the ads module. The native AdMob SDK does not exist on web,
// so these are no-ops. Metro picks this file for the web bundle and
// ads.native.ts for iOS/Android.

export async function initAds(): Promise<void> {
  // no-op on web
}

export function maybeShowInterstitial(): void {
  // no-op on web
}
