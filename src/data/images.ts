import { ImageSourcePropType } from 'react-native';

// Photos sourced from Wikimedia Commons (free licenses).
// Attribution details live in assets/breakfasts/CREDITS.json.
export const BREAKFAST_IMAGES: Record<string, ImageSourcePropType> = {
  'apple-cinnamon-porridge': require('../../assets/breakfasts/apple-cinnamon-porridge.jpg'),
  'avocado-toast': require('../../assets/breakfasts/avocado-toast.jpg'),
  'bacon-eggs': require('../../assets/breakfasts/bacon-eggs.jpg'),
  'bagel-cream-cheese': require('../../assets/breakfasts/bagel-cream-cheese.jpg'),
  'belgian-waffles': require('../../assets/breakfasts/belgian-waffles.jpg'),
  'berry-smoothie-bowl': require('../../assets/breakfasts/berry-smoothie-bowl.jpg'),
  'breakfast-burrito': require('../../assets/breakfasts/breakfast-burrito.jpg'),
  'buttermilk-pancakes': require('../../assets/breakfasts/buttermilk-pancakes.jpg'),
  'cheese-borek': require('../../assets/breakfasts/cheese-borek.jpg'),
  'cheese-omelette': require('../../assets/breakfasts/cheese-omelette.jpg'),
  'chia-pudding': require('../../assets/breakfasts/chia-pudding.jpg'),
  'classic-cereal': require('../../assets/breakfasts/classic-cereal.jpg'),
  'cottage-cheese-bowl': require('../../assets/breakfasts/cottage-cheese-bowl.jpg'),
  'croissant-coffee': require('../../assets/breakfasts/croissant-coffee.jpg'),
  'french-toast': require('../../assets/breakfasts/french-toast.jpg'),
  'fruit-salad': require('../../assets/breakfasts/fruit-salad.jpg'),
  'fruit-smoothie': require('../../assets/breakfasts/fruit-smoothie.jpg'),
  'full-english': require('../../assets/breakfasts/full-english.jpg'),
  'granola-yogurt-bowl': require('../../assets/breakfasts/granola-yogurt-bowl.jpg'),
  'greek-yogurt-berries': require('../../assets/breakfasts/greek-yogurt-berries.jpg'),
  'hummus-toast': require('../../assets/breakfasts/hummus-toast.jpg'),
  'menemen': require('../../assets/breakfasts/menemen.jpg'),
  'muesli-milk': require('../../assets/breakfasts/muesli-milk.jpg'),
  'oatmeal-banana': require('../../assets/breakfasts/oatmeal-banana.jpg'),
  'overnight-oats-vegan': require('../../assets/breakfasts/overnight-oats-vegan.jpg'),
  'pb-banana-smoothie': require('../../assets/breakfasts/pb-banana-smoothie.jpg'),
  'peanut-butter-toast': require('../../assets/breakfasts/peanut-butter-toast.jpg'),
  'scrambled-eggs-toast': require('../../assets/breakfasts/scrambled-eggs-toast.jpg'),
  'shakshuka': require('../../assets/breakfasts/shakshuka.jpg'),
  'simit-cheese': require('../../assets/breakfasts/simit-cheese.jpg'),
  'smoked-salmon-bagel': require('../../assets/breakfasts/smoked-salmon-bagel.jpg'),
  'sucuklu-yumurta': require('../../assets/breakfasts/sucuklu-yumurta.jpg'),
  'tofu-scramble': require('../../assets/breakfasts/tofu-scramble.jpg'),
  'turkish-breakfast-plate': require('../../assets/breakfasts/turkish-breakfast-plate.jpg'),
  'vegan-breakfast-wrap': require('../../assets/breakfasts/vegan-breakfast-wrap.jpg'),
  'vegan-pancakes': require('../../assets/breakfasts/vegan-pancakes.jpg'),
};

export function getBreakfastImage(id: string): ImageSourcePropType | undefined {
  return BREAKFAST_IMAGES[id];
}
