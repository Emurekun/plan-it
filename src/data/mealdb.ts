// TheMealDB client — powers Lunch & Dinner suggestions with real recipes and
// photos. Free/public API (test key "1"). Docs: https://www.themealdb.com/api.php
//
// Breakfast keeps using the app's own curated catalog (local photos + nutrition);
// Lunch and Dinner are pulled live from TheMealDB.

import { DietType } from '../storage/preferences';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type MealIngredient = {
  name: string;
  measure: string;
};

export type ApiMeal = {
  id: string;
  name: string;
  category: string;
  area: string;
  thumb: string;
  instructions: string;
  ingredients: MealIngredient[];
  tags: string[];
  youtube?: string;
};

type RawListMeal = { idMeal: string; strMeal: string; strMealThumb: string };
type RawMeal = Record<string, string | null>;

// Which TheMealDB categories feed each meal type, tuned to the user's diet so
// suggestions stay appropriate (e.g. a vegan never sees a beef dish).
function categoriesFor(mealType: MealType, diet: DietType): string[] {
  if (diet === 'vegan') return ['Vegan'];
  if (diet === 'vegetarian') return ['Vegetarian', 'Vegan'];
  if (diet === 'pescatarian') {
    return mealType === 'lunch'
      ? ['Seafood', 'Vegetarian', 'Vegan', 'Pasta']
      : ['Seafood', 'Vegetarian', 'Vegan'];
  }
  // No restriction.
  return mealType === 'lunch'
    ? ['Chicken', 'Pasta', 'Seafood', 'Vegetarian', 'Miscellaneous', 'Starter']
    : ['Beef', 'Chicken', 'Lamb', 'Pork', 'Pasta', 'Seafood', 'Miscellaneous'];
}

// Category listings rarely change, so cache them for the session.
const listCache = new Map<string, RawListMeal[]>();

async function getCategoryList(category: string): Promise<RawListMeal[]> {
  const cached = listCache.get(category);
  if (cached) return cached;
  const res = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error(`TheMealDB list failed (${res.status}).`);
  const json = (await res.json()) as { meals: RawListMeal[] | null };
  const meals = Array.isArray(json.meals) ? json.meals : [];
  listCache.set(category, meals);
  return meals;
}

function mapMeal(raw: RawMeal): ApiMeal {
  const ingredients: MealIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (raw[`strIngredient${i}`] || '').trim();
    const measure = (raw[`strMeasure${i}`] || '').trim();
    if (name) ingredients.push({ name, measure });
  }
  const tags = (raw.strTags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    id: String(raw.idMeal),
    name: (raw.strMeal || 'Unknown dish').trim(),
    category: (raw.strCategory || '').trim(),
    area: (raw.strArea || '').trim(),
    thumb: (raw.strMealThumb || '').trim(),
    instructions: (raw.strInstructions || '').trim(),
    ingredients,
    tags,
    youtube: (raw.strYoutube || '').trim() || undefined,
  };
}

async function lookupMeal(id: string): Promise<ApiMeal> {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`TheMealDB lookup failed (${res.status}).`);
  const json = (await res.json()) as { meals: RawMeal[] | null };
  if (!json.meals || !json.meals[0]) throw new Error('Recipe not found.');
  return mapMeal(json.meals[0]);
}

export type ApiSuggestion = {
  meal: ApiMeal;
  seen: string[];
};

/**
 * Suggest a Lunch or Dinner dish from TheMealDB, honoring the user's diet and
 * avoiding repeats until the eligible pool for this meal type is exhausted.
 */
export async function suggestApiMeal(
  mealType: MealType,
  diet: DietType,
  seenIds: string[] = [],
): Promise<ApiSuggestion> {
  const categories = categoriesFor(mealType, diet);

  // Build a de-duplicated pool of candidate ids across the categories.
  const poolMap = new Map<string, RawListMeal>();
  for (const category of categories) {
    try {
      const list = await getCategoryList(category);
      for (const m of list) poolMap.set(m.idMeal, m);
    } catch {
      // Skip a category that failed; others may still work.
    }
  }
  const pool = [...poolMap.keys()];
  if (pool.length === 0) {
    throw new Error('No dishes available right now. Check your connection.');
  }

  const validSeen = seenIds.filter((id) => poolMap.has(id));
  let remaining = pool.filter((id) => !validSeen.includes(id));
  let nextSeen = validSeen;
  if (remaining.length === 0) {
    // Whole pool shown — start a fresh cycle.
    remaining = pool;
    nextSeen = [];
  }

  const pickedId = remaining[Math.floor(Math.random() * remaining.length)];
  const meal = await lookupMeal(pickedId);
  return { meal, seen: [...nextSeen, pickedId] };
}
