import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import RecipeModal from '../components/RecipeModal';
import NutritionModal from '../components/NutritionModal';
import MealRecipeModal from '../components/MealRecipeModal';
import { colors, radii, spacing, typography } from '../theme/theme';
import { Breakfast } from '../data/breakfasts';
import { suggestBreakfast, getBreakfastById } from '../data/suggest';
import { getRecipeById } from '../data/recipes';
import { getMealNutrition } from '../data/mealNutrition';
import { getBreakfastImage } from '../data/images';
import { MealType, ApiMeal, suggestApiMeal } from '../data/mealdb';
import {
  loadPreferences,
  loadTodaySuggestion,
  saveTodaySuggestion,
  loadSeenBreakfasts,
  saveSeenBreakfasts,
  resetOnboarding,
  Preferences,
} from '../storage/preferences';

type Props = {
  onEditPreferences: () => void;
};

const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
];

const todayLabel = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function TodayScreen({ onEditPreferences }: Props) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [mealType, setMealType] = useState<MealType>('breakfast');

  // Breakfast (curated catalog) state.
  const [breakfast, setBreakfast] = useState<Breakfast | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipeVisible, setRecipeVisible] = useState(false);
  const [nutritionVisible, setNutritionVisible] = useState(false);
  const [seen, setSeen] = useState<string[]>([]);

  // Lunch / Dinner (TheMealDB) state.
  const [apiMeal, setApiMeal] = useState<ApiMeal | null>(null);
  const [apiMealType, setApiMealType] = useState<MealType | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSeen, setApiSeen] = useState<{ lunch: string[]; dinner: string[] }>({
    lunch: [],
    dinner: [],
  });
  const [apiRecipeVisible, setApiRecipeVisible] = useState(false);
  const reqRef = useRef(0);

  const recipe = breakfast ? getRecipeById(breakfast.id) ?? null : null;
  const nutrition = breakfast ? getMealNutrition(breakfast.id) : null;
  const photo = breakfast ? getBreakfastImage(breakfast.id) : undefined;

  useEffect(() => {
    (async () => {
      const prefs = await loadPreferences();
      if (!prefs) {
        setLoading(false);
        return;
      }
      setPreferences(prefs);

      const storedSeen = await loadSeenBreakfasts();
      const savedId = await loadTodaySuggestion();
      const existing = savedId ? getBreakfastById(savedId) : undefined;

      if (existing) {
        setBreakfast(existing);
        setSeen(storedSeen);
      } else {
        const { breakfast: chosen, seen: nextSeen } = suggestBreakfast(prefs, storedSeen);
        setBreakfast(chosen);
        setSeen(nextSeen);
        await saveSeenBreakfasts(nextSeen);
        await saveTodaySuggestion(chosen.id);
      }
      setLoading(false);
    })();
  }, []);

  const loadApi = useCallback(
    async (type: MealType, prefs: Preferences | null, seedSeen: string[]) => {
      const diet = prefs?.diet ?? 'none';
      const id = ++reqRef.current;
      setApiLoading(true);
      setApiError(null);
      try {
        const { meal, seen: nextSeen } = await suggestApiMeal(type, diet, seedSeen);
        if (reqRef.current !== id) return;
        setApiMeal(meal);
        setApiMealType(type);
        setApiSeen((prev) => ({ ...prev, [type]: nextSeen }));
      } catch (e: any) {
        if (reqRef.current !== id) return;
        setApiMeal(null);
        setApiError(e?.message ?? 'Could not load a suggestion.');
      } finally {
        if (reqRef.current === id) setApiLoading(false);
      }
    },
    [],
  );

  const selectMeal = (type: MealType) => {
    setMealType(type);
    if (type !== 'breakfast' && apiMealType !== type) {
      loadApi(type, preferences, apiSeen[type as 'lunch' | 'dinner']);
    }
  };

  const handleBreakfastAnother = async () => {
    if (!preferences) return;
    const { breakfast: next, seen: nextSeen } = suggestBreakfast(preferences, seen, breakfast?.id);
    setBreakfast(next);
    setSeen(nextSeen);
    await saveSeenBreakfasts(nextSeen);
    await saveTodaySuggestion(next.id);
  };

  const handleAnother = () => {
    if (mealType === 'breakfast') {
      handleBreakfastAnother();
    } else {
      loadApi(mealType, preferences, apiSeen[mealType as 'lunch' | 'dinner']);
    }
  };

  const handleEditPreferences = async () => {
    await resetOnboarding();
    onEditPreferences();
  };

  if (loading || !breakfast) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={typography.body}>Loading today's suggestion…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={typography.label}>TODAY</Text>
          <Text style={[typography.title, styles.dateText]}>{todayLabel}</Text>
        </View>
        <Pressable onPress={handleEditPreferences} hitSlop={12}>
          <Text style={styles.editLink}>Edit preferences</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.selectorRow}>
          {MEAL_TYPES.map((mt) => {
            const active = mealType === mt.key;
            return (
              <Pressable
                key={mt.key}
                onPress={() => selectMeal(mt.key)}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {mt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[typography.label, styles.suggestionLabel]}>
          {mealType.toUpperCase()} SUGGESTION
        </Text>

        {mealType === 'breakfast' ? (
          <Pressable
            onPress={() => recipe && setRecipeVisible(true)}
            style={({ pressed }) => pressed && styles.cardPressed}
          >
            <Card style={styles.card}>
              {photo ? (
                <View style={styles.photoShadow}>
                  <Image source={photo} style={styles.photo} resizeMode="cover" />
                </View>
              ) : (
                <Text style={styles.emoji}>{breakfast.emoji}</Text>
              )}
              <Text style={typography.heading}>{breakfast.name}</Text>
              <Text style={[typography.body, styles.description]}>{breakfast.description}</Text>
              <View style={styles.pillRow}>
                {recipe && (
                  <View style={styles.recipeHint}>
                    <Text style={styles.recipeHintText}>Tap for recipe 📖</Text>
                  </View>
                )}
                {nutrition && (
                  <Pressable
                    onPress={() => setNutritionVisible(true)}
                    style={({ pressed }) => [styles.recipeHint, pressed && styles.cardPressed]}
                  >
                    <Text style={styles.recipeHintText}>Nutrition 🥗</Text>
                  </Pressable>
                )}
              </View>
            </Card>
          </Pressable>
        ) : (
          <Card style={styles.card}>
            {apiLoading ? (
              <View style={styles.apiState}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={[typography.body, styles.apiStateText]}>Finding a dish…</Text>
              </View>
            ) : apiError ? (
              <View style={styles.apiState}>
                <Text style={styles.emoji}>😕</Text>
                <Text style={[typography.body, styles.apiStateText]}>{apiError}</Text>
              </View>
            ) : apiMeal ? (
              <Pressable
                onPress={() => setApiRecipeVisible(true)}
                style={({ pressed }) => pressed && styles.cardPressed}
              >
                <View style={styles.photoShadow}>
                  <Image source={{ uri: apiMeal.thumb }} style={styles.photo} resizeMode="cover" />
                </View>
                <Text style={typography.heading}>{apiMeal.name}</Text>
                <Text style={[typography.body, styles.description]}>
                  {[apiMeal.category, apiMeal.area].filter(Boolean).join(' · ')}
                </Text>
                <View style={styles.pillRow}>
                  <View style={styles.recipeHint}>
                    <Text style={styles.recipeHintText}>Tap for recipe 📖</Text>
                  </View>
                </View>
              </Pressable>
            ) : (
              <View style={styles.apiState}>
                <Text style={[typography.body, styles.apiStateText]}>No suggestion yet.</Text>
              </View>
            )}
          </Card>
        )}

        <PrimaryButton label="Give me another" onPress={handleAnother} style={styles.anotherButton} />
      </View>

      <RecipeModal
        visible={recipeVisible}
        breakfast={breakfast}
        recipe={recipe}
        onClose={() => setRecipeVisible(false)}
      />
      <NutritionModal
        visible={nutritionVisible}
        breakfast={breakfast}
        nutrition={nutrition}
        onClose={() => setNutritionVisible(false)}
      />
      <MealRecipeModal
        visible={apiRecipeVisible}
        meal={apiMeal}
        onClose={() => setApiRecipeVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingTop: spacing.lg,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  dateText: {
    fontSize: 24,
    marginTop: 2,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  body: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  selectorRow: {
    flexDirection: 'row',
    backgroundColor: colors.chipBackground,
    borderRadius: radii.pill,
    padding: spacing.xs / 2,
    marginBottom: spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  suggestionLabel: {
    marginBottom: spacing.xs,
  },
  card: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  cardPressed: {
    opacity: 0.85,
  },
  apiState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  apiStateText: {
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recipeHint: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  recipeHintText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  photoShadow: {
    alignSelf: 'stretch',
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: spacing.md,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  description: {
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  anotherButton: {
    alignSelf: 'stretch',
  },
});
