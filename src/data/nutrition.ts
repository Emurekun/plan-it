// USDA FoodData Central client.
//
// Provides live calorie + macro (protein, carbs, sugar, fat, fiber) lookups for
// the Nutrition tab. Data comes from https://fdc.nal.usda.gov/
//
// ── API KEY ──────────────────────────────────────────────────────────────
// The public "DEMO_KEY" works out of the box but is heavily rate-limited
// (~30 requests/hour, shared across everyone). Grab your own free key in ~30s
// at https://fdc.nal.usda.gov/api-key-signup.html and paste it below.
const USDA_API_KEY = 'DEMO_KEY';

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// USDA nutrient "numbers" are stable identifiers we map macros against.
const NUTRIENT_NUMBERS = {
  calories: '208', // Energy (kcal)
  protein: '203',
  fat: '204', // Total lipid (fat)
  carbs: '205', // Carbohydrate, by difference
  sugar: '269', // Sugars, total including NLEA
  fiber: '291', // Fiber, total dietary
} as const;

export type FoodNutrition = {
  fdcId: number;
  name: string;
  brand?: string;
  dataType?: string;
  // All values are per 100 g of the food.
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  sugar: number | null;
  fiber: number | null;
};

type RawNutrient = {
  nutrientNumber?: string;
  nutrientName?: string;
  unitName?: string;
  value?: number;
};

type RawFood = {
  fdcId: number;
  description?: string;
  dataType?: string;
  brandOwner?: string;
  brandName?: string;
  foodNutrients?: RawNutrient[];
};

function round(value: number | undefined): number | null {
  if (value === undefined || value === null || Number.isNaN(value)) return null;
  return Math.round(value * 10) / 10;
}

function pickNutrient(nutrients: RawNutrient[], number: string): number | null {
  const match = nutrients.find((n) => n.nutrientNumber === number);
  return match ? round(match.value) : null;
}

function pickCalories(nutrients: RawNutrient[]): number | null {
  // Prefer the canonical kcal nutrient; fall back to any "Energy" entry in kcal.
  const byNumber = pickNutrient(nutrients, NUTRIENT_NUMBERS.calories);
  if (byNumber !== null) return byNumber;
  const kcal = nutrients.find(
    (n) => (n.nutrientName || '').toLowerCase().includes('energy') && (n.unitName || '').toUpperCase() === 'KCAL',
  );
  return kcal ? round(kcal.value) : null;
}

function mapFood(food: RawFood): FoodNutrition {
  const nutrients = food.foodNutrients ?? [];
  return {
    fdcId: food.fdcId,
    name: (food.description || 'Unknown food').trim(),
    brand: food.brandName || food.brandOwner || undefined,
    dataType: food.dataType,
    calories: pickCalories(nutrients),
    protein: pickNutrient(nutrients, NUTRIENT_NUMBERS.protein),
    fat: pickNutrient(nutrients, NUTRIENT_NUMBERS.fat),
    carbs: pickNutrient(nutrients, NUTRIENT_NUMBERS.carbs),
    sugar: pickNutrient(nutrients, NUTRIENT_NUMBERS.sugar),
    fiber: pickNutrient(nutrients, NUTRIENT_NUMBERS.fiber),
  };
}

/**
 * Search USDA FoodData Central for foods matching `query`.
 * Returns up to `pageSize` results with per-100g calories and macros.
 * Pass an AbortSignal to cancel in-flight requests (e.g. on fast re-typing).
 */
export async function searchFoods(
  query: string,
  options: { pageSize?: number; signal?: AbortSignal } = {},
): Promise<FoodNutrition[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    api_key: USDA_API_KEY,
    query: trimmed,
    pageSize: String(options.pageSize ?? 25),
    dataType: 'Foundation,SR Legacy,Branded',
  });

  const res = await fetch(`${BASE_URL}/foods/search?${params.toString()}`, {
    signal: options.signal,
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        'USDA rate limit reached. Add your own free API key in src/data/nutrition.ts.',
      );
    }
    if (res.status === 403) {
      throw new Error('USDA API key rejected. Check USDA_API_KEY in src/data/nutrition.ts.');
    }
    throw new Error(`USDA request failed (${res.status}).`);
  }

  const json = (await res.json()) as { foods?: RawFood[] };
  const foods = Array.isArray(json.foods) ? json.foods : [];
  return foods.map(mapFood);
}
