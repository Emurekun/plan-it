import { DietType } from '../storage/preferences';

export const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: 'none', label: 'No restriction' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
];

export const FOOD_TAGS: { value: string; label: string }[] = [
  { value: 'eggs', label: 'Eggs' },
  { value: 'bread', label: 'Bread & Toast' },
  { value: 'avocado', label: 'Avocado' },
  { value: 'yogurt', label: 'Yogurt' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'oats', label: 'Oats' },
  { value: 'cheese', label: 'Cheese' },
  { value: 'bacon', label: 'Bacon & Sausage' },
  { value: 'smoothie', label: 'Smoothies' },
  { value: 'nuts', label: 'Nuts & Peanut Butter' },
  { value: 'pancake', label: 'Pancakes & Waffles' },
  { value: 'tofu', label: 'Tofu' },
  { value: 'cereal', label: 'Cereal' },
  { value: 'coffee', label: 'Coffee' },
];
