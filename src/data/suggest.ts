import { Breakfast, BREAKFASTS } from './breakfasts';
import { Preferences } from '../storage/preferences';

function getEligiblePool(preferences: Preferences): Breakfast[] {
  const dietMatches = BREAKFASTS.filter((b) => b.diets.includes(preferences.diet));
  const noDislikes = dietMatches.filter((b) => !b.tags.some((tag) => preferences.dislikes.includes(tag)));
  // Fall back to diet-only matches if the dislikes filter wiped out everything.
  return noDislikes.length > 0 ? noDislikes : dietMatches;
}

function pickWeighted(candidates: Breakfast[], preferences: Preferences): Breakfast {
  // Prefer breakfasts matching the user's likes; once those are used up in this
  // cycle, the remaining ones become the candidates on their own.
  const liked = candidates.filter((b) => b.tags.some((tag) => preferences.likes.includes(tag)));
  const weighted = liked.length > 0 ? liked : candidates;
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export type Suggestion = {
  breakfast: Breakfast;
  seen: string[];
};

/**
 * Picks the next breakfast, never repeating one already in `seenIds` until the
 * whole eligible pool has been shown. Once exhausted, the cycle starts over
 * (avoiding an immediate repeat of `currentId`).
 */
export function suggestBreakfast(
  preferences: Preferences,
  seenIds: string[] = [],
  currentId?: string,
): Suggestion {
  const pool = getEligiblePool(preferences);

  let seen = seenIds.filter((id) => pool.some((b) => b.id === id));
  let remaining = pool.filter((b) => !seen.includes(b.id));

  if (remaining.length === 0) {
    // Every eligible breakfast has been shown — start a fresh cycle.
    seen = [];
    remaining = pool.length > 1 && currentId ? pool.filter((b) => b.id !== currentId) : pool;
  }

  const breakfast = pickWeighted(remaining, preferences);
  return { breakfast, seen: [...seen, breakfast.id] };
}

export function getBreakfastById(id: string): Breakfast | undefined {
  return BREAKFASTS.find((b) => b.id === id);
}
