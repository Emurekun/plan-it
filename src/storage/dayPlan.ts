// Stores the meals the user has planned for the current day.
//
// Local-first: plans always persist on-device (AsyncStorage) so the app works
// without an account. When the user is signed in, plans are also synced to
// Supabase (day_plans table, RLS-protected), so they survive reinstalls and
// follow the user across devices.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealType, SpoonMeal } from '../data/spoonacular';
import { supabase, getCurrentUserId } from '../data/supabaseClient';

export type DayPlan = Partial<Record<MealType, SpoonMeal>>;

type StoredPlan = {
  date: string;
  meals: DayPlan;
};

const KEY = 'planit.dayPlan';

function today(): string {
  return new Date().toDateString();
}

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

async function loadLocal(): Promise<DayPlan> {
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

async function persistLocal(meals: DayPlan): Promise<void> {
  const payload: StoredPlan = { date: today(), meals };
  await AsyncStorage.setItem(KEY, JSON.stringify(payload));
}

async function pushCloud(meals: DayPlan): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from('day_plans').upsert({
      user_id: userId,
      plan_date: todayISO(),
      meals,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Cloud sync is best-effort; local copy is the source of truth offline.
  }
}

async function pullCloud(): Promise<DayPlan | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;
    const { data, error } = await supabase
      .from('day_plans')
      .select('meals')
      .eq('user_id', userId)
      .eq('plan_date', todayISO())
      .maybeSingle();
    if (error || !data) return null;
    return (data.meals as DayPlan) ?? null;
  } catch {
    return null;
  }
}

// Returns today's plan. Signed-in users get their cloud copy (which also
// refreshes the local cache); guests get the on-device copy.
export async function loadDayPlan(): Promise<DayPlan> {
  const cloud = await pullCloud();
  if (cloud && Object.keys(cloud).length > 0) {
    await persistLocal(cloud);
    return cloud;
  }
  return loadLocal();
}

export async function setPlannedMeal(mealType: MealType, meal: SpoonMeal): Promise<DayPlan> {
  const current = await loadDayPlan();
  const next: DayPlan = { ...current, [mealType]: meal };
  await persistLocal(next);
  await pushCloud(next);
  return next;
}

export async function removePlannedMeal(mealType: MealType): Promise<DayPlan> {
  const current = await loadDayPlan();
  const next: DayPlan = { ...current };
  delete next[mealType];
  await persistLocal(next);
  await pushCloud(next);
  return next;
}
