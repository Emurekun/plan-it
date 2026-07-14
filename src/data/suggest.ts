import { Breakfast, BREAKFASTS } from './breakfasts';
import { Preferences } from '../storage/preferences';

function getEligiblePool(preferences: Preferences): Breakfast[] {
  const dietMatches = BREAKFASTS.filter((b) => b.diets.includes(preferences.diet));
  const noDislikes = dietMatches.filter((b) => !b.tags.some((tag) => preferences.dislikes.includes(tag)));
  // Fall back to diet-only matches if the dislikes filter wiped out everything.
  return noDislikes.length > 0 ? noDislikes : dietMatches;
}

export function suggestBreakfast(preferences: Preferences, excludeId?: string): Breakfast {
  const pool = getEligiblePool(preferences);
  const candidates = pool.length > 1 && excludeId ? pool.filter((b) => b.id !== excludeId) : pool;
  const usable = candidates.length > 0 ? candidates : pool;

  const liked = usable.filter((b) => b.tags.some((tag) => preferences.likes.includes(tag)));
  const weighted = liked.length > 0 ? liked : usable;

  const index = Math.floor(Math.random() * weighted.length);
  return weighted[index];
}

export function getBreakfastById(id: string): Breakfast | undefined {
  return BREAKFASTS.find((b) => b.id === id);
}
