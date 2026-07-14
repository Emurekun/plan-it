export type Recipe = {
  ingredients: string[];
  steps: string[];
};

// Simple single-serving recipes, keyed by breakfast id.
export const RECIPES: Record<string, Recipe> = {
  'scrambled-eggs-toast': {
    ingredients: [
      '2–3 eggs',
      '1 tbsp butter',
      '2 slices of bread',
      'Salt & black pepper',
    ],
    steps: [
      'Whisk the eggs with a pinch of salt until smooth.',
      'Melt the butter in a nonstick pan over medium-low heat.',
      'Pour in the eggs and stir gently with a spatula until softly set, about 2–3 minutes.',
      'Toast the bread, butter it if you like, and serve the eggs on top with black pepper.',
    ],
  },
  'avocado-toast': {
    ingredients: [
      '1 ripe avocado',
      '2 slices of sourdough bread',
      '½ lemon (juiced)',
      'Chili flakes, salt & olive oil',
    ],
    steps: [
      'Toast the sourdough slices until golden and crisp.',
      'Mash the avocado with lemon juice and a pinch of salt.',
      'Spread the avocado over the toast.',
      'Finish with a drizzle of olive oil and a sprinkle of chili flakes.',
    ],
  },
  'greek-yogurt-berries': {
    ingredients: [
      '1 cup Greek yogurt',
      '½ cup mixed berries (fresh or thawed)',
      '1 tbsp honey',
      'Optional: granola or chopped nuts',
    ],
    steps: [
      'Spoon the yogurt into a bowl.',
      'Top with the berries.',
      'Drizzle with honey and add granola or nuts for crunch.',
    ],
  },
  'oatmeal-banana': {
    ingredients: [
      '½ cup rolled oats',
      '1 cup milk',
      '1 banana, sliced',
      'A dash of cinnamon',
      'Optional: 1 tsp honey',
    ],
    steps: [
      'Combine the oats and milk in a small pot.',
      'Simmer over medium heat, stirring, for 4–5 minutes until creamy.',
      'Stir in half the banana slices and the cinnamon.',
      'Top with the remaining banana and a drizzle of honey.',
    ],
  },
  'overnight-oats-vegan': {
    ingredients: [
      '½ cup rolled oats',
      '⅔ cup oat milk',
      '1 tbsp chia seeds',
      '1 tsp maple syrup',
      'Fresh fruit for topping',
    ],
    steps: [
      'Mix the oats, oat milk, chia seeds, and maple syrup in a jar.',
      'Cover and refrigerate overnight (or at least 4 hours).',
      'In the morning, stir well and top with fresh fruit.',
    ],
  },
  'smoked-salmon-bagel': {
    ingredients: [
      '1 bagel, halved',
      '2 tbsp cream cheese',
      '2–3 slices smoked salmon',
      '1 tsp capers',
      'Optional: red onion & dill',
    ],
    steps: [
      'Toast the bagel halves until golden.',
      'Spread each half generously with cream cheese.',
      'Layer on the smoked salmon.',
      'Top with capers, and red onion and dill if using.',
    ],
  },
  'bacon-eggs': {
    ingredients: [
      '3–4 strips of bacon',
      '2 eggs',
      'Salt & black pepper',
    ],
    steps: [
      'Cook the bacon in a cold pan over medium heat, turning until crisp, about 8 minutes. Set aside.',
      'Crack the eggs into the same pan with a little of the bacon fat.',
      'Fry sunny-side up until the whites are set, 2–3 minutes.',
      'Season with salt and pepper and serve with the bacon.',
    ],
  },
  'breakfast-burrito': {
    ingredients: [
      '1 large flour tortilla',
      '2 eggs, scrambled',
      '¼ cup grated cheese',
      '1 cooked sausage, sliced (or 2 strips of bacon)',
      'Optional: salsa & avocado',
    ],
    steps: [
      'Warm the tortilla in a dry pan for 20 seconds per side.',
      'Layer the scrambled eggs, cheese, and sausage down the middle.',
      'Add salsa or avocado if using.',
      'Fold in the sides and roll up tightly. Toast seam-side down for a minute to seal.',
    ],
  },
  'fruit-smoothie': {
    ingredients: [
      '1 banana',
      '½ cup mixed berries (frozen works best)',
      '1 cup almond milk',
      'Optional: 1 tsp honey or maple syrup',
    ],
    steps: [
      'Add the banana, berries, and almond milk to a blender.',
      'Blend until completely smooth, about 30–60 seconds.',
      'Taste, sweeten if needed, and pour into a tall glass.',
    ],
  },
  'peanut-butter-toast': {
    ingredients: [
      '2 slices whole-grain bread',
      '2 tbsp peanut butter',
      '1 banana, sliced',
      'Optional: a sprinkle of cinnamon or chia seeds',
    ],
    steps: [
      'Toast the bread until golden.',
      'Spread the peanut butter while the toast is still warm.',
      'Top with banana slices and a sprinkle of cinnamon or chia seeds.',
    ],
  },
  'buttermilk-pancakes': {
    ingredients: [
      '1 cup flour',
      '1 cup buttermilk',
      '1 egg',
      '1 tbsp sugar',
      '1 tsp baking powder, ½ tsp baking soda, pinch of salt',
      'Butter & maple syrup to serve',
    ],
    steps: [
      'Whisk the dry ingredients in one bowl and the buttermilk and egg in another.',
      'Combine the two until just mixed — a few lumps are fine.',
      'Cook ladles of batter in a buttered pan over medium heat until bubbles form, then flip. About 2 minutes per side.',
      'Stack high and serve with butter and maple syrup.',
    ],
  },
  'vegan-pancakes': {
    ingredients: [
      '1 ripe banana, mashed',
      '1 cup flour',
      '1 cup plant milk',
      '1 tbsp sugar & 1 tsp baking powder',
      'Berries to serve',
    ],
    steps: [
      'Mash the banana in a bowl, then whisk in the plant milk.',
      'Stir in the flour, sugar, and baking powder until just combined.',
      'Cook spoonfuls in a lightly oiled pan over medium heat, 2 minutes per side.',
      'Serve topped with fresh berries.',
    ],
  },
  'granola-yogurt-bowl': {
    ingredients: [
      '1 cup yogurt',
      '½ cup granola',
      '½ cup fresh fruit (berries, banana, or both)',
      'Optional: honey',
    ],
    steps: [
      'Spoon half the yogurt into a bowl or glass.',
      'Add a layer of granola and fruit, then repeat the layers.',
      'Finish with a drizzle of honey.',
    ],
  },
  'tofu-scramble': {
    ingredients: [
      '200 g firm tofu, drained',
      '½ tsp turmeric',
      '¼ bell pepper & ¼ onion, diced',
      '1 tbsp olive oil',
      'Salt & black pepper',
    ],
    steps: [
      'Heat the oil in a pan and sauté the onion and pepper until soft, about 3 minutes.',
      'Crumble in the tofu with your hands.',
      'Sprinkle over the turmeric, salt, and pepper and stir.',
      'Cook for 4–5 minutes, stirring occasionally, until heated through and lightly golden.',
    ],
  },
  'cheese-omelette': {
    ingredients: [
      '3 eggs',
      '⅓ cup grated cheese (cheddar or gruyère)',
      '1 tbsp butter',
      'Salt & black pepper',
    ],
    steps: [
      'Whisk the eggs with salt and pepper.',
      'Melt the butter in a nonstick pan over medium heat and pour in the eggs.',
      'When mostly set but still glossy on top, sprinkle the cheese over one half.',
      'Fold the omelette over the cheese, cook 30 more seconds, and slide onto a plate.',
    ],
  },
  'classic-cereal': {
    ingredients: [
      '1 bowl of your favorite cereal',
      'Cold milk',
      'Optional: sliced banana or berries',
    ],
    steps: [
      'Pour the cereal into a bowl.',
      'Add cold milk.',
      'Top with fruit if you like. Done — the easiest breakfast there is.',
    ],
  },
  'fruit-salad': {
    ingredients: [
      '2–3 cups mixed seasonal fruit (melon, berries, grapes, apple…)',
      '½ lime or lemon (juiced)',
      'Optional: fresh mint & 1 tsp honey',
    ],
    steps: [
      'Wash and chop all the fruit into bite-sized pieces.',
      'Toss gently in a bowl with the citrus juice.',
      'Finish with torn mint leaves and honey if using.',
    ],
  },
  'croissant-coffee': {
    ingredients: [
      '1 croissant (bakery-bought or frozen)',
      'Freshly brewed coffee',
      'Optional: butter & jam',
    ],
    steps: [
      'Warm the croissant in a 160 °C oven for 4–5 minutes until flaky.',
      'Brew your coffee however you like it.',
      'Serve the croissant with butter and jam on the side.',
    ],
  },
  'menemen': {
    ingredients: [
      '3 eggs',
      '2 ripe tomatoes, grated or finely chopped',
      '2 green peppers, sliced',
      '2 tbsp olive oil',
      'Salt, black pepper & optional chili flakes',
    ],
    steps: [
      'Heat the olive oil in a pan and soften the peppers for 2–3 minutes.',
      'Add the tomatoes and cook until the juices reduce, about 5 minutes.',
      'Crack in the eggs and stir gently, keeping them soft and creamy.',
      'Season and serve straight from the pan with crusty bread.',
    ],
  },
  'sucuklu-yumurta': {
    ingredients: [
      '8–10 slices of sucuk (Turkish garlic sausage)',
      '2–3 eggs',
      'Black pepper',
    ],
    steps: [
      'Lay the sucuk slices in a cold pan and set over medium heat.',
      'Cook until the edges curl and the oils release, about 2 minutes per side.',
      'Crack the eggs into the gaps between the slices.',
      'Cover and cook until the whites are set, 2–3 minutes. Serve with bread for dipping.',
    ],
  },
  'simit-cheese': {
    ingredients: [
      '1 simit (sesame bread ring)',
      'A few slices of white cheese (beyaz peynir or feta)',
      '1 tomato, sliced',
      'A handful of olives',
      'Hot black tea to serve',
    ],
    steps: [
      'Warm the simit briefly in the oven or a dry pan if it isn\'t fresh.',
      'Arrange the cheese, tomato slices, and olives on a plate.',
      'Tear off pieces of simit and build little bites. Best with a glass of hot tea.',
    ],
  },
  'turkish-breakfast-plate': {
    ingredients: [
      '2–3 kinds of cheese (white cheese, kaşar…)',
      'Olives (green and black)',
      '1 tomato & ½ cucumber, sliced',
      'Honey, jam & butter',
      '1 boiled egg',
      'Fresh bread or simit',
    ],
    steps: [
      'Boil the egg to your liking (8 minutes for just-set yolk).',
      'Arrange the cheeses, olives, and sliced vegetables on a large plate.',
      'Add small bowls of honey, jam, and butter.',
      'Serve everything with fresh bread and plenty of hot tea — take your time.',
    ],
  },
  'cheese-borek': {
    ingredients: [
      '4 sheets of yufka or phyllo dough',
      '200 g white cheese, crumbled',
      'A handful of chopped parsley',
      '1 egg + ½ cup milk + ¼ cup olive oil (for the wash)',
    ],
    steps: [
      'Whisk the egg, milk, and oil. Mix the cheese with the parsley.',
      'Layer the sheets in an oiled dish, brushing each with the egg wash and scattering cheese between layers.',
      'Cut into squares and pour any remaining wash on top.',
      'Bake at 180 °C for 30–35 minutes until deep golden.',
    ],
  },
  'shakshuka': {
    ingredients: [
      '3 eggs',
      '1 can (400 g) chopped tomatoes',
      '1 red pepper & ½ onion, diced',
      '2 cloves garlic, 1 tsp cumin, 1 tsp paprika',
      '2 tbsp olive oil & crusty bread to serve',
    ],
    steps: [
      'Sauté the onion and pepper in olive oil until soft, then add the garlic and spices.',
      'Pour in the tomatoes and simmer for 8–10 minutes until thickened.',
      'Make three wells in the sauce and crack an egg into each.',
      'Cover and cook until the whites are set, about 5 minutes. Serve with bread.',
    ],
  },
  'french-toast': {
    ingredients: [
      '2 thick slices of bread (brioche is best)',
      '1 egg',
      '¼ cup milk',
      '½ tsp cinnamon & 1 tsp sugar',
      'Butter, maple syrup & berries to serve',
    ],
    steps: [
      'Whisk the egg, milk, cinnamon, and sugar in a shallow dish.',
      'Soak each bread slice for 15–20 seconds per side.',
      'Cook in a buttered pan over medium heat until golden, 2–3 minutes per side.',
      'Serve with maple syrup and fresh berries.',
    ],
  },
  'belgian-waffles': {
    ingredients: [
      '1 cup flour',
      '1 cup milk',
      '1 egg, separated',
      '2 tbsp melted butter, 1 tbsp sugar, 1 tsp baking powder',
      'Fruit & powdered sugar to serve',
    ],
    steps: [
      'Whisk the flour, sugar, baking powder, milk, egg yolk, and melted butter into a smooth batter.',
      'Beat the egg white to soft peaks and fold it in for extra fluff.',
      'Cook in a hot waffle iron until crisp and golden, 3–4 minutes.',
      'Top with fruit and a dusting of powdered sugar.',
    ],
  },
  'full-english': {
    ingredients: [
      '2 eggs',
      '2 sausages & 2 strips of bacon',
      '½ can baked beans',
      '1 tomato, halved',
      '2 slices of toast & butter',
    ],
    steps: [
      'Cook the sausages in a pan over medium heat, turning, for 10–12 minutes; add the bacon halfway.',
      'Warm the beans in a small pot and grill or pan-fry the tomato halves cut-side down.',
      'Fry the eggs in the same pan at the end.',
      'Toast and butter the bread, then plate everything up together.',
    ],
  },
  'chia-pudding': {
    ingredients: [
      '3 tbsp chia seeds',
      '1 cup coconut milk (drinking kind)',
      '1 tsp maple syrup',
      'Mango cubes & berries for topping',
    ],
    steps: [
      'Stir the chia seeds, coconut milk, and maple syrup in a jar.',
      'Stir again after 10 minutes to break up clumps, then refrigerate overnight.',
      'Top with mango and berries before serving.',
    ],
  },
  'berry-smoothie-bowl': {
    ingredients: [
      '1 cup frozen mixed berries',
      '1 frozen banana',
      '½ cup plant milk',
      'Granola, banana slices & coconut flakes for topping',
    ],
    steps: [
      'Blend the frozen berries, banana, and milk until thick — it should hold a spoon upright.',
      'Scoop into a bowl.',
      'Arrange the granola, banana slices, and coconut flakes on top.',
    ],
  },
  'hummus-toast': {
    ingredients: [
      '2 slices of bread, toasted',
      '3 tbsp hummus',
      '¼ cucumber & ½ tomato, sliced',
      'Olive oil, salt & za\'atar or chili flakes',
    ],
    steps: [
      'Spread a thick layer of hummus on the warm toast.',
      'Top with the cucumber and tomato slices.',
      'Finish with olive oil, a pinch of salt, and za\'atar or chili flakes.',
    ],
  },
  'pb-banana-smoothie': {
    ingredients: [
      '1 banana',
      '2 tbsp peanut butter',
      '2 tbsp rolled oats',
      '1 cup plant milk',
      'Optional: 1 tsp maple syrup & ice',
    ],
    steps: [
      'Add everything to a blender.',
      'Blend until smooth and creamy, about 45 seconds.',
      'Pour into a glass — it drinks like a milkshake but keeps you full all morning.',
    ],
  },
  'muesli-milk': {
    ingredients: [
      '¾ cup muesli (oats, dried fruit & nuts)',
      '1 cup cold milk',
      'Optional: fresh fruit & yogurt',
    ],
    steps: [
      'Pour the muesli into a bowl and add the milk.',
      'Let it sit for 2–3 minutes so the oats soften slightly.',
      'Top with fresh fruit or a spoonful of yogurt if you like.',
    ],
  },
  'bagel-cream-cheese': {
    ingredients: [
      '1 bagel, halved',
      '3 tbsp cream cheese',
      'Optional: sliced tomato, cucumber, or chives',
    ],
    steps: [
      'Toast the bagel halves until golden.',
      'Spread generously with cream cheese while warm.',
      'Add tomato, cucumber, or a sprinkle of chives if using.',
    ],
  },
  'cottage-cheese-bowl': {
    ingredients: [
      '1 cup cottage cheese',
      '1 peach or a handful of berries, sliced',
      '2 tbsp walnuts, chopped',
      '1 tsp honey',
    ],
    steps: [
      'Spoon the cottage cheese into a bowl.',
      'Top with the fruit and walnuts.',
      'Drizzle with honey and serve.',
    ],
  },
  'apple-cinnamon-porridge': {
    ingredients: [
      '½ cup rolled oats',
      '1 cup plant milk (or water)',
      '1 apple, grated',
      '½ tsp cinnamon',
      '2 tbsp toasted walnuts',
    ],
    steps: [
      'Simmer the oats and milk in a small pot for 3 minutes, stirring.',
      'Stir in the grated apple and cinnamon and cook 2 more minutes.',
      'Spoon into a bowl and top with the toasted walnuts.',
    ],
  },
  'vegan-breakfast-wrap': {
    ingredients: [
      '1 large tortilla',
      '150 g firm tofu, crumbled',
      '¼ tsp turmeric, salt & pepper',
      '½ avocado, sliced',
      '2 tbsp salsa',
    ],
    steps: [
      'Sauté the crumbled tofu with turmeric, salt, and pepper for 4–5 minutes.',
      'Warm the tortilla in a dry pan.',
      'Fill with the tofu scramble, avocado slices, and salsa.',
      'Fold in the sides, roll up tightly, and toast seam-side down for a minute.',
    ],
  },
};

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPES[id];
}
