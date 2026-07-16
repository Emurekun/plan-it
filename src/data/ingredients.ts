// Curated list of common cooking ingredients for the onboarding pickers
// ("ingredients you have" and "ingredients to avoid"). Names are plain and
// title-cased so they read well as chips and work as free-text queries.
// Quick picks are diet-aware: vegans see vegan staples, vegetarians see
// vegetarian ones, etc. The search always covers the full list.

import { DietType } from '../storage/preferences';

const POPULAR_BASE: string[] = [
  'Bread',
  'Rice',
  'Pasta',
  'Tomato',
  'Onion',
  'Garlic',
  'Potato',
  'Avocado',
  'Olive Oil',
  'Banana',
  'Oats',
  'Spinach',
  'Mushroom',
  'Bell Pepper',
  'Carrot',
  'Lemon',
];

const POPULAR_VEGAN_EXTRAS: string[] = [
  'Tofu',
  'Chickpeas',
  'Lentils',
  'Coconut Milk',
  'Peanut Butter',
  'Almonds',
  'Broccoli',
  'Hummus',
];

const POPULAR_DAIRY_EGG: string[] = [
  'Egg',
  'Cheese',
  'Milk',
  'Butter',
  'Yogurt',
  'Honey',
];

const POPULAR_FISH: string[] = ['Salmon', 'Tuna', 'Shrimp'];

const POPULAR_MEAT: string[] = ['Chicken', 'Beef'];

export function popularIngredients(diet: DietType | null): string[] {
  switch (diet) {
    case 'vegan':
      return [...POPULAR_VEGAN_EXTRAS, ...POPULAR_BASE];
    case 'vegetarian':
      return [...POPULAR_DAIRY_EGG, 'Tofu', 'Chickpeas', ...POPULAR_BASE];
    case 'pescatarian':
      return [...POPULAR_FISH, ...POPULAR_DAIRY_EGG, ...POPULAR_BASE];
    default:
      return [...POPULAR_DAIRY_EGG.slice(0, 5), ...POPULAR_MEAT, ...POPULAR_BASE, 'Honey'];
  }
}

// Kept for backward compatibility.
export const POPULAR_INGREDIENTS: string[] = popularIngredients(null);

export const ALL_INGREDIENTS: string[] = [
  // Proteins & meat
  'Egg',
  'Chicken',
  'Chicken Breast',
  'Beef',
  'Ground Beef',
  'Pork',
  'Bacon',
  'Sausage',
  'Ham',
  'Turkey',
  'Lamb',
  'Salmon',
  'Tuna',
  'Shrimp',
  'Prawns',
  'Cod',
  'Tofu',
  'Tempeh',
  // Dairy
  'Milk',
  'Butter',
  'Cheese',
  'Cheddar',
  'Mozzarella',
  'Feta',
  'Parmesan',
  'Cream Cheese',
  'Yogurt',
  'Greek Yogurt',
  'Cream',
  'Sour Cream',
  'Cottage Cheese',
  // Grains & carbs
  'Bread',
  'Whole Wheat Bread',
  'Bagel',
  'Tortilla',
  'Rice',
  'Brown Rice',
  'Pasta',
  'Spaghetti',
  'Noodles',
  'Oats',
  'Quinoa',
  'Couscous',
  'Flour',
  'Cornmeal',
  'Cereal',
  'Crackers',
  // Vegetables
  'Tomato',
  'Cherry Tomatoes',
  'Onion',
  'Red Onion',
  'Garlic',
  'Potato',
  'Sweet Potato',
  'Carrot',
  'Bell Pepper',
  'Chilli',
  'Spinach',
  'Kale',
  'Lettuce',
  'Cucumber',
  'Mushroom',
  'Zucchini',
  'Aubergine',
  'Broccoli',
  'Cauliflower',
  'Cabbage',
  'Peas',
  'Green Beans',
  'Corn',
  'Celery',
  'Leek',
  'Asparagus',
  'Beetroot',
  'Pumpkin',
  'Ginger',
  'Spring Onion',
  // Fruits
  'Avocado',
  'Banana',
  'Apple',
  'Lemon',
  'Lime',
  'Orange',
  'Strawberry',
  'Blueberry',
  'Raspberry',
  'Mango',
  'Pineapple',
  'Grapes',
  'Peach',
  'Pear',
  'Coconut',
  'Dates',
  'Raisins',
  // Legumes & nuts
  'Chickpeas',
  'Black Beans',
  'Kidney Beans',
  'Lentils',
  'Hummus',
  'Peanut Butter',
  'Almonds',
  'Walnuts',
  'Cashews',
  'Peanuts',
  'Chia Seeds',
  'Sesame Seeds',
  'Sunflower Seeds',
  // Condiments, oils & sauces
  'Olive Oil',
  'Vegetable Oil',
  'Coconut Oil',
  'Salt',
  'Black Pepper',
  'Soy Sauce',
  'Vinegar',
  'Balsamic Vinegar',
  'Mustard',
  'Mayonnaise',
  'Ketchup',
  'Tomato Paste',
  'Tomato Sauce',
  'Coconut Milk',
  'Stock',
  'Sriracha',
  'Pesto',
  'Salsa',
  // Baking & sweet
  'Sugar',
  'Brown Sugar',
  'Honey',
  'Maple Syrup',
  'Baking Powder',
  'Baking Soda',
  'Yeast',
  'Vanilla',
  'Cocoa Powder',
  'Chocolate',
  'Dark Chocolate',
  'Jam',
  // Herbs & spices
  'Basil',
  'Parsley',
  'Coriander',
  'Mint',
  'Oregano',
  'Thyme',
  'Rosemary',
  'Cumin',
  'Paprika',
  'Cinnamon',
  'Turmeric',
  'Curry Powder',
  'Chilli Flakes',
  'Nutmeg',
  'Bay Leaf',
];

export function searchIngredients(query: string, limit = 30): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: string[] = [];
  const contains: string[] = [];
  for (const name of ALL_INGREDIENTS) {
    const lower = name.toLowerCase();
    if (lower.startsWith(q)) starts.push(name);
    else if (lower.includes(q)) contains.push(name);
  }
  return [...starts, ...contains].slice(0, limit);
}
