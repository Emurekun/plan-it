import AsyncStorage from '@react-native-async-storage/async-storage';

export type DietType = 'none' | 'vegetarian' | 'vegan' | 'pescatarian';

export type Preferences = {
  diet: DietType;
  likes: string[];
  dislikes: string[];
};

const PREFERENCES_KEY = 'planit.preferences';
const ONBOARDING_COMPLETE_KEY = 'planit.onboardingComplete';
const TODAY_SUGGESTION_KEY = 'planit.todaySuggestion';

export async function savePreferences(preferences: Preferences): Promise<void> {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
}

export async function loadPreferences(): Promise<Preferences | null> {
  const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
  return raw ? (JSON.parse(raw) as Preferences) : null;
}

export async function isOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
  return value === 'true';
}

export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.multiRemove([PREFERENCES_KEY, ONBOARDING_COMPLETE_KEY, TODAY_SUGGESTION_KEY]);
}

type TodaySuggestion = {
  date: string;
  breakfastId: string;
};

export async function saveTodaySuggestion(breakfastId: string): Promise<void> {
  const today: TodaySuggestion = { date: new Date().toDateString(), breakfastId };
  await AsyncStorage.setItem(TODAY_SUGGESTION_KEY, JSON.stringify(today));
}

export async function loadTodaySuggestion(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(TODAY_SUGGESTION_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as TodaySuggestion;
  if (parsed.date !== new Date().toDateString()) return null;
  return parsed.breakfastId;
}
