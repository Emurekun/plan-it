// Stores the meals the user has planned for the current day, on-device.
// Each meal type (breakfast/lunch/dinner) holds a full SpoonMeal so the Plan
// screen can show details and nutrition without re-fetching from the API.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealType, SpoonMeal } from '../data/spoonacular';

export type DayPlan = Partial<Record<MealType, SpoonMeal>>;

type StoredPlan = {
  date: string;
  meals: DayPlan;
};

const KEY = 'planit.dayPlan';

function today(): string {
  return new Date().toDateString();
}

// Returns the plan for today. If the stored plan is from a previous day, it is
// treated as empty (a fresh day).
export async function loadDayPlan(): Promise<DayPlan> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as StoredPlan;
    if (parsed.date !== today()) return {};
    return parsed.meals ?? {};
  } catch {
    return {};
  }
}

async function persist(meals: DayPlan): Promise<void> {
  const payload: StoredPlan = { date: today(), meals };
  await AsyncStorage.setItem(KEY, JSON.stringify(payload));
}

export async function setPlannedMeal(mealType: MealType, meal: SpoonMeal): Promise<DayPlan> {
  const current = await loadDayPlan();
  const next: DayPlan = { ...current, [mealType]: meal };
  await persist(next);
  return next;
}

export async function removePlannedMeal(mealType: MealType): Promise<DayPlan> {
  const current = await loadDayPlan();
  const next: DayPlan = { ...current };
  delete next[mealType];
  await persist(next);
  return next;
}
