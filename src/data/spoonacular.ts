// Spoonacular-powered meal suggestions.
//
// Calls go through our Netlify serverless proxy (/.netlify/functions/spoon),
// which injects the API key server-side and adds CORS headers. See
// netlify/functions/spoon.js.

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
};

// Our meal types -> Spoonacular "type" values (it has no lunch/dinner concept,
// so both map to main course).
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
      return 'pescetarian'; // Spoonacular spelling
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

function mapMeal(raw: any): SpoonMeal {
  const ingredients = Array.isArray(raw?.extendedIngredients)
    ? raw.extendedIngredients
        .map((i: any) => String(i?.original ?? i?.name ?? '').trim())
        .filter((s: string) => s.length > 0)
    : [];
  // De-duplicate ingredient lines (Spoonacular sometimes repeats).
  const uniqueIngredients = [...new Set(ingredients)];
  return {
    id: raw.id,
    title: String(raw?.title ?? 'Untitled dish').trim(),
    image: String(raw?.image ?? ''),
    readyInMinutes: raw?.readyInMinutes ?? null,
    servings: raw?.servings ?? null,
    dishTypes: Array.isArray(raw?.dishTypes) ? raw.dishTypes : [],
    ingredients: uniqueIngredients,
    steps: extractSteps(raw),
    nutrition: extractNutrition(raw),
  };
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
 * Fetch a batch of meal suggestions matching the user's meal type, diet and
 * ingredients. Recipes that use more of the user's ingredients rank first;
 * recipes containing avoided ingredients are excluded by Spoonacular.
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
  params.set('addRecipeInformation', 'true');
  params.set('addRecipeNutrition', 'true');
  params.set('fillIngredients', 'true');
  params.set('instructionsRequired', 'true');
  params.set('ignorePantry', 'true');
  params.set('number', String(BATCH_SIZE));
  params.set('offset', String(offset));

  const res = await fetch(`${PROXY}?${params.toString()}`, { signal });
  if (!res.ok) {
    if (res.status === 402) {
      throw new Error('Daily recipe limit reached. Try again tomorrow.');
    }
    if (res.status === 401) {
      throw new Error('Recipe service is misconfigured (API key).');
    }
    throw new Error(`Could not load suggestions (${res.status}).`);
  }
  const json = (await res.json()) as { results?: any[] };
  const results = Array.isArray(json.results) ? json.results : [];
  return results.map(mapMeal).filter((m) => m.image);
}
