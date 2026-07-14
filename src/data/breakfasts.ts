import { DietType } from '../storage/preferences';

export type Breakfast = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  diets: DietType[];
  tags: string[];
};

export const BREAKFASTS: Breakfast[] = [
  {
    id: 'scrambled-eggs-toast',
    name: 'Scrambled Eggs & Toast',
    description: 'Soft scrambled eggs with buttered toast and a sprinkle of black pepper.',
    emoji: '🍳',
    diets: ['none', 'vegetarian'],
    tags: ['eggs', 'bread'],
  },
  {
    id: 'avocado-toast',
    name: 'Avocado Toast',
    description: 'Mashed avocado on sourdough with a squeeze of lemon and chili flakes.',
    emoji: '🥑',
    diets: ['none', 'vegetarian', 'vegan', 'pescatarian'],
    tags: ['avocado', 'bread'],
  },
  {
    id: 'greek-yogurt-berries',
    name: 'Greek Yogurt with Berries',
    description: 'Creamy yogurt topped with mixed berries and a drizzle of honey.',
    emoji: '🍓',
    diets: ['none', 'vegetarian', 'pescatarian'],
    tags: ['yogurt', 'fruit'],
  },
  {
    id: 'oatmeal-banana',
    name: 'Banana Oatmeal',
    description: 'Warm oats simmered with milk, sliced banana, and a dash of cinnamon.',
    emoji: '🥣',
    diets: ['none', 'vegetarian', 'pescatarian'],
    tags: ['oats', 'fruit'],
  },
  {
    id: 'overnight-oats-vegan',
    name: 'Vegan Overnight Oats',
    description: 'Oats soaked overnight in oat milk with chia seeds and fresh fruit.',
    emoji: '🌱',
    diets: ['none', 'vegetarian', 'vegan', 'pescatarian'],
    tags: ['oats', 'fruit'],
  },
  {
    id: 'smoked-salmon-bagel',
    name: 'Smoked Salmon Bagel',
    description: 'Toasted bagel with cream cheese, smoked salmon, and capers.',
    emoji: '🥯',
    diets: ['none', 'pescatarian'],
    tags: ['bread', 'cheese'],
  },
  {
    id: 'bacon-eggs',
    name: 'Bacon & Eggs',
    description: 'Crispy bacon strips with sunny-side-up eggs.',
    emoji: '🥓',
    diets: ['none'],
    tags: ['eggs', 'bacon'],
  },
  {
    id: 'breakfast-burrito',
    name: 'Breakfast Burrito',
    description: 'Scrambled eggs, cheese, and sausage wrapped in a warm tortilla.',
    emoji: '🌯',
    diets: ['none'],
    tags: ['eggs', 'cheese', 'bacon'],
  },
  {
    id: 'fruit-smoothie',
    name: 'Mixed Fruit Smoothie',
    description: 'A blend of banana, berries, and almond milk.',
    emoji: '🥤',
    diets: ['none', 'vegetarian', 'vegan', 'pescatarian'],
    tags: ['smoothie', 'fruit', 'nuts'],
  },
  {
    id: 'peanut-butter-toast',
    name: 'Peanut Butter Toast',
    description: 'Toasted whole-grain bread with a generous spread of peanut butter and banana slices.',
    emoji: '🥜',
    diets: ['none', 'vegetarian', 'vegan', 'pescatarian'],
    tags: ['nuts', 'bread', 'fruit'],
  },
  {
    id: 'buttermilk-pancakes',
    name: 'Buttermilk Pancakes',
    description: 'Fluffy pancakes stacked high with maple syrup.',
    emoji: '🥞',
    diets: ['none', 'vegetarian'],
    tags: ['pancake', 'eggs'],
  },
  {
    id: 'vegan-pancakes',
    name: 'Vegan Banana Pancakes',
    description: 'Egg-free pancakes made with mashed banana, served with berries.',
    emoji: '🍌',
    diets: ['none', 'vegetarian', 'vegan', 'pescatarian'],
    tags: ['pancake', 'fruit'],
  },
  {
    id: 'granola-yogurt-bowl',
    name: 'Granola Yogurt Bowl',
    description: 'Crunchy granola layered with yogurt and fresh fruit.',
    emoji: '🥣',
    diets: ['none', 'vegetarian', 'pescatarian'],
    tags: ['yogurt', 'fruit', 'nuts'],
  },
  {
    id: 'tofu-scramble',
    name: 'Tofu Scramble',
    description: 'Turmeric-spiced tofu scrambled with peppers and onions.',
    emoji: '🌟',
    diets: ['none', 'vegetarian', 'vegan', 'pescatarian'],
    tags: ['tofu'],
  },
  {
    id: 'cheese-omelette',
    name: 'Cheese Omelette',
    description: 'A fluffy folded omelette filled with melted cheese.',
    emoji: '🧀',
    diets: ['none', 'vegetarian'],
    tags: ['eggs', 'cheese'],
  },
  {
    id: 'classic-cereal',
    name: 'Classic Cereal & Milk',
    description: 'A simple bowl of your favorite cereal with cold milk.',
    emoji: '🥛',
    diets: ['none', 'vegetarian', 'pescatarian'],
    tags: ['cereal'],
  },
  {
    id: 'fruit-salad',
    name: 'Fresh Fruit Salad',
    description: 'A colorful bowl of seasonal fruit, no cooking required.',
    emoji: '🍇',
    diets: ['none', 'vegetarian', 'vegan', 'pescatarian'],
    tags: ['fruit'],
  },
  {
    id: 'croissant-coffee',
    name: 'Croissant & Coffee',
    description: 'A buttery, flaky croissant paired with a hot cup of coffee.',
    emoji: '☕',
    diets: ['none', 'vegetarian'],
    tags: ['bread', 'coffee'],
  },
];
