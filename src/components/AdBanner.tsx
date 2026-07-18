// Ad slot placeholder. Renders nothing while ADS_ENABLED is false or the user
// has the ad-free subscription. When AdMob is integrated, swap the body of
// this component for a real BannerAd — the screen placements stay unchanged.

import React from 'react';
import { adsVisible, usePremium } from '../data/monetization';

export default function AdBanner() {
  usePremium(); // re-render when premium status changes
  if (!adsVisible()) return null;
  // AdMob banner goes here (react-native-google-mobile-ads BannerAd).
  return null;
}
