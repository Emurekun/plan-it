import { DietType } from '../storage/preferences';

export const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: 'none', label: 'No restriction' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
];

const ALL_DIETS: DietType[] = ['none', 'vegetarian', 'vegan', 'pescatarian'];
const NON_VEGAN: DietType[] = ['none', 'vegetarian', 'pescatarian'];
const MEAT_ONLY: DietType[] = ['none'];

export type FoodTag = {
  value: string;
  label: string;
  diets: DietType[];
};

export const FOOD_TAGS: FoodTag[] = [
  { value: 'eggs', label: 'Eggs', diets: NON_VEGAN },
  { value: 'bread', label: 'Bread & Toast', diets: ALL_DIETS },
  { value: 'avocado', label: 'Avocado', diets: ALL_DIETS },
  { value: 'yogurt', label: 'Yogurt', diets: NON_VEGAN },
  { value: 'fruit', label: 'Fruit', diets: ALL_DIETS },
  { value: 'oats', label: 'Oats', diets: ALL_DIETS },
  { value: 'cheese', label: 'Cheese', diets: NON_VEGAN },
  { value: 'bacon', label: 'Bacon & Sausage', diets: MEAT_ONLY },
  { value: 'smoothie', label: 'Smoothies', diets: ALL_DIETS },
  { value: 'nuts', label: 'Nuts & Peanut Butter', diets: ALL_DIETS },
  { value: 'pancake', label: 'Pancakes & Waffles', diets: ALL_DIETS },
  { value: 'tofu', label: 'Tofu', diets: ALL_DIETS },
  { value: 'cereal', label: 'Cereal', diets: ALL_DIETS },
  { value: 'coffee', label: 'Coffee', diets: ALL_DIETS },
];

export function tagsForDiet(diet: DietType | null): FoodTag[] {
  if (!diet) return FOOD_TAGS;
  return FOOD_TAGS.filter((tag) => tag.diets.includes(diet));
}
