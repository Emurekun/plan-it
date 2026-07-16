import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Card from '../components/Card';
import MealRecipeModal from '../components/MealRecipeModal';
import { colors, radii, spacing, typography } from '../theme/theme';
import { MealType, SpoonMeal } from '../data/spoonacular';
import { DayPlan, loadDayPlan, removePlannedMeal, isoDate, addDays } from '../storage/dayPlan';

type Props = {
  onBack: () => void;
};

const SLOTS: { key: MealType; label: string; emoji: string }[] = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { key: 'lunch', label: 'Lunch', emoji: '🥗' },
  { key: 'dinner', label: 'Dinner', emoji: '🍽️' },
];

const MACROS: { key: 'protein' | 'carbs' | 'fat' | 'fiber'; label: string }[] = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
  { key: 'fiber', label: 'Fiber' },
];

function dayLabel(offset: number, d: Date): string {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tmrw';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function eatenField(
  plan: DayPlan,
  key: 'calories' | 'protein' | 'carbs' | 'sugar' | 'fat' | 'fiber',
): number {
  let total = 0;
  for (const entry of Object.values(plan)) {
    if (!entry) continue;
    const per100 = entry.meal?.nutrition?.[key];
    if (typeof per100 === 'number' && entry.grams > 0) {
      total += (per100 * entry.grams) / 100;
    }
  }
  return Math.round(total * 10) / 10;
}

export default function PlanScreen({ onBack }: Props) {
  const [dayOffset, setDayOffset] = useState(0);
  const [plan, setPlan] = useState<DayPlan>({});
  const [loading, setLoading] = useState(true);
  const [recipeMeal, setRecipeMeal] = useState<SpoonMeal | null>(null);
  const [recipeVisible, setRecipeVisible] = useState(false);

  const selectedDate = addDays(new Date(), dayOffset);
  const selectedISO = isoDate(selectedDate);

  const refresh = useCallback(async (iso: string) => {
    setLoading(true);
    setPlan(await loadDayPlan(iso));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh(selectedISO);
  }, [selectedISO, refresh]);

  const handleRemove = async (type: MealType) => {
    setPlan(await removePlannedMeal(selectedISO, type));
  };

  const openRecipe = (meal: SpoonMeal) => {
    setRecipeMeal(meal);
    setRecipeVisible(true);
  };

  const plannedCount = Object.keys(plan).length;
  const totalCalories = Math.round(eatenField(plan, 'calories'));
  const dateTitle = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={typography.label}>YOUR WEEK</Text>
          <Text style={[typography.title, styles.dateText]}>{dateTitle}</Text>
        </View>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.link}>Done</Text>
        </Pressable>
      </View>

      <View style={styles.weekWrap}>
        <View style={styles.weekRow}>
          {Array.from({ length: 7 }).map((_, i) => {
            const d = addDays(new Date(), i);
            const active = dayOffset === i;
            return (
              <Pressable
                key={i}
                onPress={() => setDayOffset(i)}
                style={[styles.dayChip, active && styles.dayChipActive]}
              >
                <Text style={[styles.dayChipLabel, active && styles.dayChipTextActive]}>
                  {dayLabel(i, d)}
                </Text>
                <Text style={[styles.dayChipNum, active && styles.dayChipTextActive]}>
                  {d.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.totalCard}>
          <Text style={styles.totalLabel}>CALORIES THIS DAY</Text>
          <Text style={styles.totalKcal}>{totalCalories} kcal</Text>
          <View style={styles.macroRow}>
            {MACROS.map((m) => (
              <View key={m.key} style={styles.macroItem}>
                <Text style={styles.macroValue}>{eatenField(plan, m.key)}g</Text>
                <Text style={styles.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.totalHint}>
            {loading
              ? 'Loading…'
              : plannedCount === 0
                ? 'Nothing planned for this day yet. Add meals from the Today screen.'
                : `${plannedCount} of 3 meals planned`}
          </Text>
        </Card>

        {SLOTS.map((slot) => {
          const entry = plan[slot.key];
          const kcal =
            entry && entry.meal?.nutrition?.calories != null
              ? Math.round((entry.meal.nutrition.calories * entry.grams) / 100)
              : null;
          return (
            <View key={slot.key} style={styles.slot}>
              <Text style={[typography.label, styles.slotLabel]}>
                {slot.emoji}  {slot.label.toUpperCase()}
              </Text>
              {entry ? (
                <Card style={styles.mealCard}>
                  <Pressable style={styles.mealRow} onPress={() => openRecipe(entry.meal)}>
                    {entry.meal.image ? (
                      <Image source={{ uri: entry.meal.image }} style={styles.thumb} resizeMode="cover" />
                    ) : (
                      <View style={styles.thumb} />
                    )}
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealTitle} numberOfLines={2}>
                        {entry.meal.title}
                      </Text>
                      <Text style={styles.mealMeta}>
                        {entry.grams} g{kcal !== null ? ` · ${kcal} kcal` : ''}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => handleRemove(slot.key)} hitSlop={10} style={styles.removeBtn}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </Card>
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Not planned yet</Text>
                  <Text style={styles.emptyHint}>
                    Pick a {slot.label.toLowerCase()} on the Today screen, tap “Add to plan” and choose this day.
                  </Text>
                </Card>
              )}
            </View>
          );
        })}
      </ScrollView>

      <MealRecipeModal visible={recipeVisible} meal={recipeMeal} onClose={() => setRecipeVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  dateText: {
    fontSize: 22,
    marginTop: 2,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  weekWrap: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  weekRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
    borderRadius: radii.md,
    backgroundColor: colors.chipBackground,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
  },
  dayChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  dayChipNum: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  totalCard: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  totalKcal: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
  macroRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  macroItem: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  macroLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.85,
    marginTop: 1,
  },
  totalHint: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  slot: {
    marginBottom: spacing.lg,
  },
  slotLabel: {
    marginBottom: spacing.sm,
  },
  mealCard: {
    paddingVertical: spacing.md,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.chipBackground,
    marginRight: spacing.md,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  mealMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  removeBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  emptyCard: {
    backgroundColor: colors.surface,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
