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
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import MealRecipeModal from '../components/MealRecipeModal';
import { colors, radii, spacing, typography } from '../theme/theme';
import { MealType, SpoonMeal, suggestMeals, loadMealDetails } from '../data/spoonacular';
import { loadPreferences, resetOnboarding, Preferences } from '../storage/preferences';
import { loadDayPlan, setPlannedMeal } from '../storage/dayPlan';

type Props = {
  onEditPreferences: () => void;
  onOpenPlan?: () => void;
  onOpenAccount?: () => void;
};

const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
];

const PAGE = 8;

type Bucket = {
  meals: SpoonMeal[];
  index: number;
  offset: number;
  loading: boolean;
  error: string | null;
};

const emptyBucket: Bucket = { meals: [], index: 0, offset: 0, loading: false, error: null };

const todayLabel = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

function fmt(v: number | null): string {
  return v === null ? '—' : `${v}g`;
}

export default function TodayScreen({ onEditPreferences, onOpenPlan, onOpenAccount }: Props) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [recipeVisible, setRecipeVisible] = useState(false);
  const [plannedIds, setPlannedIds] = useState<Partial<Record<MealType, number>>>({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [buckets, setBuckets] = useState<Record<MealType, Bucket>>({
    breakfast: { ...emptyBucket },
    lunch: { ...emptyBucket },
    dinner: { ...emptyBucket },
  });
  const reqRef = useRef<Record<MealType, number>>({ breakfast: 0, lunch: 0, dinner: 0 });

  const loadBatch = useCallback(
    async (type: MealType, prefs: Preferences, offset: number, replace: boolean) => {
      const id = reqRef.current[type] + 1;
      reqRef.current[type] = id;
      setBuckets((prev) => ({ ...prev, [type]: { ...prev[type], loading: true, error: null } }));
      try {
        const meals = await suggestMeals({
          mealType: type,
          diet: prefs.diet,
          have: prefs.haveIngredients ?? [],
          avoid: prefs.avoidIngredients ?? [],
          offset,
        });
        if (reqRef.current[type] !== id) return;
        setBuckets((prev) => {
          const cur = prev[type];
          const merged = replace ? meals : [...cur.meals, ...meals];
          const nextIndex = replace ? 0 : cur.meals.length;
          return {
            ...prev,
            [type]: {
              meals: merged,
              index: merged.length ? Math.min(nextIndex, merged.length - 1) : 0,
              offset,
              loading: false,
              error: merged.length ? null : 'No recipes matched. Try adjusting your ingredients.',
            },
          };
        });
      } catch (e: any) {
        if (reqRef.current[type] !== id) return;
        setBuckets((prev) => ({
          ...prev,
          [type]: { ...prev[type], loading: false, error: e?.message ?? 'Could not load suggestions.' },
        }));
      }
    },
    [],
  );

  useEffect(() => {
    (async () => {
      const prefs = await loadPreferences();
      setPreferences(prefs);
      setPrefsLoaded(true);
      if (prefs) loadBatch('breakfast', prefs, 0, true);
    })();
  }, [loadBatch]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDayPlan().then((plan) => {
        if (!active) return;
        const ids: Partial<Record<MealType, number>> = {};
        (Object.keys(plan) as MealType[]).forEach((k) => {
          const m = plan[k];
          if (m) ids[k] = m.id;
        });
        setPlannedIds(ids);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const bucket = buckets[mealType];
  const meal = bucket.meals[bucket.index] ?? null;
  const currentId = meal?.id ?? null;
  const needsDetails = !!meal && !meal.detailsLoaded;

  // Lazily load full details (ingredients / steps / nutrition) for the shown meal.
  useEffect(() => {
    if (!meal || meal.detailsLoaded) return;
    let active = true;
    setDetailsLoading(true);
    setDetailsError(null);
    loadMealDetails(meal)
      .then((full) => {
        if (!active) return;
        setBuckets((prev) => {
          const bb = prev[mealType];
          return { ...prev, [mealType]: { ...bb, meals: bb.meals.map((x) => (x.id === full.id ? full : x)) } };
        });
      })
      .catch((e: any) => {
        if (active) setDetailsError(e?.message ?? 'Could not load details.');
      })
      .finally(() => {
        if (active) setDetailsLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealType, currentId, needsDetails]);

  const selectMeal = (type: MealType) => {
    setMealType(type);
    const b = buckets[type];
    if (preferences && !b.loading && b.meals.length === 0) {
      loadBatch(type, preferences, 0, true);
    }
  };

  const handleAnother = () => {
    if (!preferences) return;
    const b = buckets[mealType];
    if (b.index < b.meals.length - 1) {
      setBuckets((prev) => ({ ...prev, [mealType]: { ...prev[mealType], index: prev[mealType].index + 1 } }));
    } else {
      loadBatch(mealType, preferences, b.offset + PAGE, false);
    }
  };

  const handleAddToPlan = async (m: SpoonMeal) => {
    await setPlannedMeal(mealType, m);
    setPlannedIds((prev) => ({ ...prev, [mealType]: m.id }));
  };

  const handleEditPreferences = async () => {
    await resetOnboarding();
    onEditPreferences();
  };

  if (!prefsLoaded) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const n = meal?.nutrition ?? null;
  const planned = !!meal && plannedIds[mealType] === meal.id;
  const subtitleParts: string[] = [];
  if (meal?.detailsLoaded) {
    if (meal.dishTypes[0]) subtitleParts.push(meal.dishTypes[0]);
    if (meal.readyInMinutes) subtitleParts.push(`${meal.readyInMinutes} min`);
  }
  const subtitle = subtitleParts.join(' · ');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={typography.label}>TODAY</Text>
          <Text style={[typography.title, styles.dateText]}>{todayLabel}</Text>
        </View>
        <View style={styles.headerLinks}>
          <Pressable onPress={onOpenPlan} hitSlop={8}>
            <Text style={styles.link}>My plan →</Text>
          </Pressable>
          <Pressable onPress={handleEditPreferences} hitSlop={8}>
            <Text style={styles.editLink}>Edit preferences</Text>
          </Pressable>
          <Pressable onPress={onOpenAccount} hitSlop={8}>
            <Text style={styles.editLink}>Account</Text>
          </Pressable>
        </View>
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
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{mt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[typography.label, styles.suggestionLabel]}>{mealType.toUpperCase()} SUGGESTION</Text>

        <Card style={styles.card}>
          {bucket.loading ? (
            <View style={styles.state}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[typography.body, styles.stateText]}>Finding a recipe…</Text>
            </View>
          ) : bucket.error ? (
            <View style={styles.state}>
              <Text style={styles.emoji}>😕</Text>
              <Text style={[typography.body, styles.stateText]}>{bucket.error}</Text>
            </View>
          ) : meal ? (
            <View style={styles.mealWrap}>
              <Pressable
                onPress={() => meal.detailsLoaded && setRecipeVisible(true)}
                style={({ pressed }) => [styles.mealTap, pressed && meal.detailsLoaded && styles.cardPressed]}
              >
                <View style={styles.photoShadow}>
                  <Image source={{ uri: meal.image }} style={styles.photo} resizeMode="cover" />
                </View>
                <Text style={typography.heading}>{meal.title}</Text>
                {meal.detailsLoaded ? (
                  <>
                    {subtitle ? <Text style={[typography.body, styles.description]}>{subtitle}</Text> : null}
                    {n && n.calories !== null && (
                      <View style={styles.nutriRow}>
                        <Text style={styles.kcal}>{n.calories} kcal</Text>
                        <Text style={styles.macros}>
                          P {fmt(n.protein)} · C {fmt(n.carbs)} · F {fmt(n.fat)}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.detailsLoading}>
                    {detailsError ? (
                      <Text style={[typography.body, styles.stateText]}>{detailsError}</Text>
                    ) : (
                      <>
                        <ActivityIndicator color={colors.primary} />
                        <Text style={styles.detailsLoadingText}>Loading details…</Text>
                      </>
                    )}
                  </View>
                )}
              </Pressable>

              {meal.detailsLoaded && (
                <View style={styles.pillRow}>
                  <Pressable onPress={() => setRecipeVisible(true)} style={styles.recipeHint}>
                    <Text style={styles.recipeHintText}>Tap for recipe 📖</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAddToPlan(meal)}
                    style={[styles.recipeHint, planned && styles.recipeHintDone]}
                  >
                    <Text style={[styles.recipeHintText, planned && styles.recipeHintDoneText]}>
                      {planned ? 'Added to plan ✓' : 'Add to plan ➕'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.state}>
              <Text style={[typography.body, styles.stateText]}>No suggestion yet.</Text>
            </View>
          )}
        </Card>

        <PrimaryButton
          label="Give me another"
          onPress={handleAnother}
          disabled={bucket.loading || detailsLoading}
          style={styles.anotherButton}
        />
      </View>

      <MealRecipeModal visible={recipeVisible} meal={meal} onClose={() => setRecipeVisible(false)} />
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
  headerLinks: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 24,
    marginTop: 2,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  editLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.xs,
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
    minHeight: 260,
    justifyContent: 'center',
  },
  mealWrap: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  mealTap: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.85,
  },
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  stateText: {
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  emoji: {
    fontSize: 44,
    marginBottom: spacing.sm,
  },
  detailsLoading: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  detailsLoadingText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  description: {
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  nutriRow: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  kcal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  macros: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  recipeHint: {
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
  recipeHintDone: {
    backgroundColor: colors.primary,
  },
  recipeHintDoneText: {
    color: '#FFFFFF',
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
  anotherButton: {
    alignSelf: 'stretch',
  },
});
