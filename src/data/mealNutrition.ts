// Estimated per-serving nutrition for each breakfast in the catalog,
// keyed by breakfast id. Values are for one serving as described in the
// recipe (kcal, grams). Estimates are based on USDA FoodData Central
// reference values for the main ingredients.

export type MealNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  sugar: number;
  fat: number;
  fiber: number;
};

export const MEAL_NUTRITION: Record<string, MealNutrition> = {
  'scrambled-eggs-toast': { calories: 470, protein: 24, carbs: 32, sugar: 4, fat: 27, fiber: 2.5 },
  'avocado-toast': { calories: 420, protein: 9, carbs: 44, sugar: 4, fat: 24, fiber: 9 },
  'greek-yogurt-berries': { calories: 260, protein: 20, carbs: 32, sugar: 28, fat: 5, fiber: 3 },
  'oatmeal-banana': { calories: 350, protein: 12, carbs: 62, sugar: 27, fat: 7, fiber: 7 },
  'overnight-oats-vegan': { calories: 340, protein: 9, carbs: 55, sugar: 16, fat: 10, fiber: 9 },
  'smoked-salmon-bagel': { calories: 450, protein: 25, carbs: 50, sugar: 6, fat: 17, fiber: 2 },
  'bacon-eggs': { calories: 400, protein: 22, carbs: 2, sugar: 1, fat: 34, fiber: 0 },
  'breakfast-burrito': { calories: 550, protein: 25, carbs: 40, sugar: 3, fat: 32, fiber: 3 },
  'fruit-smoothie': { calories: 220, protein: 4, carbs: 48, sugar: 32, fat: 3, fiber: 6 },
  'peanut-butter-toast': { calories: 430, protein: 14, carbs: 48, sugar: 14, fat: 21, fiber: 6 },
  'buttermilk-pancakes': { calories: 520, protein: 11, carbs: 90, sugar: 40, fat: 13, fiber: 2 },
  'vegan-pancakes': { calories: 390, protein: 8, carbs: 72, sugar: 28, fat: 8, fiber: 6 },
  'granola-yogurt-bowl': { calories: 380, protein: 15, carbs: 52, sugar: 26, fat: 12, fiber: 5 },
  'tofu-scramble': { calories: 240, protein: 18, carbs: 8, sugar: 3, fat: 15, fiber: 3 },
  'cheese-omelette': { calories: 380, protein: 24, carbs: 2, sugar: 1, fat: 30, fiber: 0 },
  'classic-cereal': { calories: 280, protein: 9, carbs: 50, sugar: 20, fat: 5, fiber: 3 },
  'fruit-salad': { calories: 150, protein: 2, carbs: 38, sugar: 30, fat: 0.5, fiber: 5 },
  'croissant-coffee': { calories: 300, protein: 6, carbs: 32, sugar: 7, fat: 16, fiber: 2 },
  'menemen': { calories: 280, protein: 14, carbs: 10, sugar: 6, fat: 20, fiber: 3 },
  'sucuklu-yumurta': { calories: 420, protein: 24, carbs: 2, sugar: 1, fat: 35, fiber: 0 },
  'simit-cheese': { calories: 480, protein: 17, carbs: 68, sugar: 6, fat: 15, fiber: 4 },
  'turkish-breakfast-plate': { calories: 600, protein: 22, carbs: 55, sugar: 18, fat: 32, fiber: 5 },
  'cheese-borek': { calories: 420, protein: 13, carbs: 38, sugar: 2, fat: 24, fiber: 2 },
  'shakshuka': { calories: 350, protein: 17, carbs: 28, sugar: 10, fat: 19, fiber: 5 },
  'french-toast': { calories: 480, protein: 14, carbs: 65, sugar: 30, fat: 18, fiber: 3 },
  'belgian-waffles': { calories: 500, protein: 10, carbs: 78, sugar: 34, fat: 16, fiber: 3 },
  'full-english': { calories: 750, protein: 35, carbs: 40, sugar: 8, fat: 50, fiber: 7 },
  'chia-pudding': { calories: 300, protein: 7, carbs: 30, sugar: 16, fat: 17, fiber: 12 },
  'berry-smoothie-bowl': { calories: 380, protein: 9, carbs: 68, sugar: 34, fat: 9, fiber: 9 },
  'hummus-toast': { calories: 340, protein: 11, carbs: 44, sugar: 5, fat: 14, fiber: 8 },
  'pb-banana-smoothie': { calories: 400, protein: 13, carbs: 54, sugar: 26, fat: 16, fiber: 7 },
  'muesli-milk': { calories: 340, protein: 12, carbs: 56, sugar: 22, fat: 8, fiber: 6 },
  'bagel-cream-cheese': { calories: 400, protein: 12, carbs: 56, sugar: 8, fat: 14, fiber: 2 },
  'cottage-cheese-bowl': { calories: 300, protein: 22, carbs: 22, sugar: 17, fat: 13, fiber: 3 },
  'apple-cinnamon-porridge': { calories: 360, protein: 10, carbs: 58, sugar: 20, fat: 11, fiber: 8 },
  'vegan-breakfast-wrap': { calories: 450, protein: 18, carbs: 42, sugar: 4, fat: 24, fiber: 9 },
};

export function getMealNutrition(id: string): MealNutrition | null {
  return MEAL_NUTRITION[id] ?? null;
}
