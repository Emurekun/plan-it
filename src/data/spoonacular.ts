// Meal suggestions from OUR OWN recipe database (Supabase).
//
// The database holds 744 recipes seeded from TheMealDB (free API) with
// per-serving nutrition estimated from ingredient reference values. Because
// the data is ours, there are NO API rate limits.
//
// NOTE: this file keeps its historical name (spoonacular.ts) so that existing
// imports (SpoonMeal, suggestMeals, loadMealDetails) stay stable across the
// app. Spoonacular itself is no longer used for suggestions.

import { DietType } from '../storage/preferences';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

const SUPA_URL = 'https://eddaipkxrghktcfqhoav.supabase.co/rest/v1/recipes';
const SUPA_KEY = 'sb_publishable_c_kt8JqL_FvfZW0VBkSoQg_7O7dS1CJ'; // public client key (RLS: read-only)
const HEADERS = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` };
const PAGE = 8;

export type MealNutrition = {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  sugar: number | null;
  fat: number | null;
  fiber: number | null;
};

export type TrContent = { ingredients: string[]; steps: string[] };

export type SpoonMeal = {
  id: number;
  title: string;
  titleTr?: string | null;
  tr?: TrContent | null;
  image: string;
  readyInMinutes: number | null;
  servings: number | null;
  dishTypes: string[];
  ingredients: string[];
  steps: string[];
  nutrition: MealNutrition | null;
  detailsLoaded: boolean;
};

type Row = {
  id: number;
  name: string;
  name_tr: string | null;
  tr: TrContent | null;
  category: string | null;
  area: string | null;
  thumb: string;
  instructions: string | null;
  ingredients: { name: string; measure: string }[];
  ing_text: string | null;
  nutrition: MealNutrition | null;
};

function toSteps(instructions: string): string[] {
  if (!instructions) return [];
  const byLine = instructions
    .split(/\r?\n+/)
    .map((s) => s.replace(/^\s*(STEP\s*\d+[:.)-]?)/i, '').trim())
    .filter((s) => s.length > 1);
  if (byLine.length > 1) return byLine;
  return instructions
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

function mapRow(row: Row): SpoonMeal {
  const ingredients = (row.ingredients ?? [])
    .map((i) => `${(i.measure || '').trim()} ${(i.name || '').trim()}`.trim())
    .filter((s) => s.length > 0);
  const dishTypes: string[] = [];
  if (row.category) dishTypes.push(row.category);
  if (row.area) dishTypes.push(row.area);
  return {
    id: row.id,
    title: row.name,
    titleTr: row.name_tr ?? null,
    tr: row.tr ?? null,
    image: row.thumb,
    readyInMinutes: null,
    servings: 4,
    dishTypes,
    ingredients,
    steps: toSteps(row.instructions ?? ''),
    nutrition: row.nutrition ?? null,
    detailsLoaded: true,
  };
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export type SuggestOptions = {
  mealType: MealType;
  diet: DietType;
  have: string[];
  avoid: string[];
  offset?: number;
  signal?: AbortSignal;
};

// Candidate pools are cached per filter set for the session, so paging through
// "give me another" costs no extra requests.
const poolCache = new Map<string, SpoonMeal[]>();

async function queryRecipes(
  mealType: MealType,
  diet: DietType,
  have: string[],
  avoid: string[],
  signal?: AbortSignal,
): Promise<Row[]> {
  const params = new URLSearchParams();
  params.set('select', 'id,name,name_tr,tr,category,area,thumb,instructions,ingredients,ing_text,nutrition');
  params.set('meal_types', `cs.{${mealType}}`);
  if (diet !== 'none') params.set('diets', `cs.{${diet}}`);
  for (const a of avoid) {
    const v = a.toLowerCase().replace(/[(),*%]/g, ' ').trim();
    if (v) params.append('ing_text', `not.ilike.*${v}*`);
  }
  if (have.length) {
    params.set('or', `(${have.map((h) => `ing_text.ilike.*${h}*`).join(',')})`);
  }
  params.set('limit', '150');
  const res = await fetch(`${SUPA_URL}?${params.toString()}`, { headers: HEADERS, signal });
  if (!res.ok) throw new Error(`Could not load recipes (${res.status}).`);
  return (await res.json()) as Row[];
}

async function fetchPool(opts: SuggestOptions): Promise<SpoonMeal[]> {
  const { mealType, diet, have, avoid, signal } = opts;
  const haveClean = have
    .map((h) => h.toLowerCase().replace(/[(),*%]/g, ' ').trim())
    .filter((h) => h.length > 1);

  // Staged relaxation: if the combined filters are too narrow (e.g. a vegan
  // breakfast whose avoid-list excludes "coconut milk" via "milk"), widen the
  // net instead of showing an empty state.
  let rows = await queryRecipes(mealType, diet, haveClean, avoid, signal);
  if (!rows.length && haveClean.length) {
    rows = await queryRecipes(mealType, diet, [], avoid, signal);
  }
  if (!rows.length && diet !== 'none' && avoid.length) {
    // The diet classification already excludes the big categories (meat, fish,
    // dairy, eggs, honey), so dropping the avoid filter is a safe last resort.
    rows = await queryRecipes(mealType, diet, [], [], signal);
  }

  if (haveClean.length) {
    // Rank by how many of the user's ingredients each recipe uses.
    const score = (r: Row) =>
      haveClean.reduce((s, h) => s + ((r.ing_text ?? '').includes(h) ? 1 : 0), 0);
    rows.sort((a, b) => score(b) - score(a));
  } else {
    shuffle(rows);
  }
  return rows.map(mapRow);
}

/**
 * Suggest meals from our own database — unlimited, no rate limits.
 * Recipes using more of the user's ingredients rank first; recipes containing
 * avoided ingredients are excluded. Paging wraps around the pool.
 */
export async function suggestMeals(opts: SuggestOptions): Promise<SpoonMeal[]> {
  const { mealType, diet, have, avoid, offset = 0 } = opts;
  const key = [mealType, diet, have.join('|'), avoid.join('|')].join('#');
  let pool = poolCache.get(key);
  if (!pool) {
    pool = await fetchPool(opts);
    poolCache.set(key, pool);
  }
  if (!pool.length) return [];
  const start = offset % pool.length;
  const out = pool.slice(start, start + PAGE);
  if (out.length < PAGE && pool.length > out.length) {
    out.push(...pool.slice(0, Math.min(PAGE - out.length, start)));
  }
  return out;
}

/**
 * Details are already loaded from the database; kept for API compatibility.
 */
export async function loadMealDetails(meal: SpoonMeal, _signal?: AbortSignal): Promise<SpoonMeal> {
  return meal;
}
