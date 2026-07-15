// Spoonacular-powered meal suggestions.
//
// Calls go through our Netlify serverless proxy (/.netlify/functions/spoon),
// which injects the API key server-side and adds CORS headers.
//
// Point budget: Spoonacular's free tier is limited (~150 points/day), and
// recipe information + nutrition are the expensive parts. To stay cheap we:
//   1. Search with a plain complexSearch (no recipe info / nutrition) — this
//      returns id + title + image for a whole batch for ~1 point.
//   2. Load full details (ingredients, steps, nutrition) lazily, only for the
//      meal actually shown, via recipes/{id}/information, and cache by id.

import { DietType } from '../storage/preferences';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

const PROXY = 'https://lets-plan-it.com/.netlify/functions/spoon';
const BATCH_SIZE = 8;

export type MealNutrition = {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  sugar: number | null;
  fat: number | null;
  fiber: number | null;
};

export type SpoonMeal = {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number | null;
  servings: number | null;
  dishTypes: string[];
  ingredients: string[];
  steps: string[];
  nutrition: MealNutrition | null;
  // Whether the expensive details (ingredients/steps/nutrition) are loaded.
  detailsLoaded: boolean;
};

function spoonType(mealType: MealType): string {
  return mealType === 'breakfast' ? 'breakfast' : 'main course';
}

function spoonDiet(diet: DietType): string | null {
  switch (diet) {
    case 'vegetarian':
      return 'vegetarian';
    case 'vegan':
      return 'vegan';
    case 'pescatarian':
      return 'pescetarian';
    default:
      return null;
  }
}

function round(n: any): number | null {
  const v = Number(n);
  if (!isFinite(v)) return null;
  return Math.round(v * 10) / 10;
}

function extractNutrition(raw: any): MealNutrition | null {
  const nutrients = raw?.nutrition?.nutrients;
  if (!Array.isArray(nutrients)) return null;
  const find = (name: string) => {
    const hit = nutrients.find((n: any) => n && n.name === name);
    return hit ? round(hit.amount) : null;
  };
  return {
    calories: find('Calories'),
    protein: find('Protein'),
    carbs: find('Carbohydrates'),
    sugar: find('Sugar'),
    fat: find('Fat'),
    fiber: find('Fiber'),
  };
}

function extractSteps(raw: any): string[] {
  const groups = raw?.analyzedInstructions;
  if (!Array.isArray(groups)) return [];
  const steps: string[] = [];
  for (const g of groups) {
    for (const s of g?.steps ?? []) {
      if (s?.step) steps.push(String(s.step).trim());
    }
  }
  return steps;
}

function extractIngredients(raw: any): string[] {
  const list = Array.isArray(raw?.extendedIngredients)
    ? raw.extendedIngredients
        .map((i: any) => String(i?.original ?? i?.name ?? '').trim())
        .filter((s: string) => s.length > 0)
    : [];
  return [...new Set(list)];
}

function limitError(status: number): Error | null {
  if (status === 402) return new Error('Daily recipe limit reached. Try again tomorrow.');
  if (status === 401) return new Error('Recipe service is misconfigured (API key).');
  return null;
}

export type SuggestOptions = {
  mealType: MealType;
  diet: DietType;
  have: string[];
  avoid: string[];
  offset?: number;
  signal?: AbortSignal;
};

/**
 * Cheap search: returns a batch of lightweight meals (id + title + image).
 * Ranking favors recipes that use more of the user's ingredients.
 */
export async function suggestMeals(opts: SuggestOptions): Promise<SpoonMeal[]> {
  const { mealType, diet, have, avoid, offset = 0, signal } = opts;

  const params = new URLSearchParams();
  params.set('path', 'recipes/complexSearch');
  params.set('type', spoonType(mealType));
  const d = spoonDiet(diet);
  if (d) params.set('diet', d);
  if (have.length) {
    params.set('includeIngredients', have.join(','));
    params.set('sort', 'max-used-ingredients');
  } else {
    params.set('sort', 'random');
  }
  if (avoid.length) params.set('excludeIngredients', avoid.join(','));
  params.set('number', String(BATCH_SIZE));
  params.set('offset', String(offset));

  const res = await fetch(`${PROXY}?${params.toString()}`, { signal });
  if (!res.ok) {
    const le = limitError(res.status);
    if (le) throw le;
    throw new Error(`Could not load suggestions (${res.status}).`);
  }
  const json = (await res.json()) as { results?: any[] };
  const results = Array.isArray(json.results) ? json.results : [];
  return results
    .filter((r) => r && r.id && r.image)
    .map((r) => ({
      id: r.id,
      title: String(r.title ?? 'Untitled dish').trim(),
      image: String(r.image),
      readyInMinutes: null,
      servings: null,
      dishTypes: [],
      ingredients: [],
      steps: [],
      nutrition: null,
      detailsLoaded: false,
    }));
}

// Recipe details are immutable, so cache them for the session.
const detailCache = new Map<number, SpoonMeal>();

/**
 * Lazily load full details (ingredients, steps, nutrition) for one meal.
 * Cached by id so re-viewing a meal costs no extra API points.
 */
export async function loadMealDetails(meal: SpoonMeal, signal?: AbortSignal): Promise<SpoonMeal> {
  if (meal.detailsLoaded) return meal;
  const cached = detailCache.get(meal.id);
  if (cached) return cached;

  const params = new URLSearchParams();
  params.set('path', `recipes/${meal.id}/information`);
  params.set('includeNutrition', 'true');

  const res = await fetch(`${PROXY}?${params.toString()}`, { signal });
  if (!res.ok) {
    const le = limitError(res.status);
    if (le) throw le;
    throw new Error(`Could not load recipe details (${res.status}).`);
  }
  const raw = await res.json();
  const full: SpoonMeal = {
    ...meal,
    title: String(raw?.title ?? meal.title).trim(),
    image: String(raw?.image ?? meal.image),
    readyInMinutes: raw?.readyInMinutes ?? null,
    servings: raw?.servings ?? null,
    dishTypes: Array.isArray(raw?.dishTypes) ? raw.dishTypes : [],
    ingredients: extractIngredients(raw),
    steps: extractSteps(raw),
    nutrition: extractNutrition(raw),
    detailsLoaded: true,
  };
  detailCache.set(meal.id, full);
  return full;
}
