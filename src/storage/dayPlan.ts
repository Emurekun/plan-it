// Date-keyed meal plans. Each planned meal stores the recipe plus how many
// grams the user intends to eat, so daily calories are computed from the
// per-100g nutrition values.
//
// Local-first (AsyncStorage per date); synced to Supabase day_plans for
// signed-in users (RLS: each user only sees their own rows).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealType, SpoonMeal } from '../data/spoonacular';
import { supabase, getCurrentUserId } from '../data/supabaseClient';

export type PlannedMeal = {
  meal: SpoonMeal;
  grams: number;
};

export type DayPlan = Partial<Record<MealType, PlannedMeal>>;

const KEY_PREFIX = 'planit.dayPlan.v2.';

export function isoDate(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function loadLocal(dateISO: string): Promise<DayPlan> {
  const raw = await AsyncStorage.getItem(KEY_PREFIX + dateISO);
  if (!raw) return {};
  try {
    return (JSON.parse(raw) as DayPlan) ?? {};
  } catch {
    return {};
  }
}

async function persistLocal(dateISO: string, meals: DayPlan): Promise<void> {
  await AsyncStorage.setItem(KEY_PREFIX + dateISO, JSON.stringify(meals));
}

async function pushCloud(dateISO: string, meals: DayPlan): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase.from('day_plans').upsert({
      user_id: userId,
      plan_date: dateISO,
      meals,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Cloud sync is best-effort; the local copy still works offline.
  }
}

async function pullCloud(dateISO: string): Promise<DayPlan | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;
    const { data, error } = await supabase
      .from('day_plans')
      .select('meals')
      .eq('user_id', userId)
      .eq('plan_date', dateISO)
      .maybeSingle();
    if (error || !data) return null;
    return (data.meals as DayPlan) ?? null;
  } catch {
    return null;
  }
}

export async function loadDayPlan(dateISO: string): Promise<DayPlan> {
  const cloud = await pullCloud(dateISO);
  if (cloud && Object.keys(cloud).length > 0) {
    await persistLocal(dateISO, cloud);
    return cloud;
  }
  return loadLocal(dateISO);
}

export async function setPlannedMeal(
  dateISO: string,
  mealType: MealType,
  meal: SpoonMeal,
  grams: number,
): Promise<DayPlan> {
  const current = await loadDayPlan(dateISO);
  const next: DayPlan = { ...current, [mealType]: { meal, grams } };
  await persistLocal(dateISO, next);
  await pushCloud(dateISO, next);
  return next;
}

export async function removePlannedMeal(dateISO: string, mealType: MealType): Promise<DayPlan> {
  const current = await loadDayPlan(dateISO);
  const next: DayPlan = { ...current };
  delete next[mealType];
  await persistLocal(dateISO, next);
  await pushCloud(dateISO, next);
  return next;
}
