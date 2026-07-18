import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import MealRecipeModal from '../components/MealRecipeModal';
import { colors, radii, spacing, typography } from '../theme/theme';
import { MealType, SpoonMeal, suggestMeals } from '../data/spoonacular';
import { loadPreferences, resetOnboarding, Preferences } from '../storage/preferences';
import { setPlannedMeal, isoDate, addDays } from '../storage/dayPlan';
import { supabase } from '../data/supabaseClient';
import { t, useLang, setLang, locale } from '../data/i18n';

type Props = {
  onEditPreferences: () => void;
  onOpenPlan?: () => void;
  onOpenAccount?: () => void;
  onChangeIngredients?: () => void;
  // Which day is being planned (0 = today). Set when arriving from the Plan
  // screen so the whole week can be planned day by day.
  dateOffset?: number;
};

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

const PAGE = 8;

type Bucket = {
  meals: SpoonMeal[];
  index: number;
  offset: number;
  loading: boolean;
  error: string | null;
};

const emptyBucket: Bucket = { meals: [], index: 0, offset: 0, loading: false, error: null };

function dateTitle(d: Date): string {
  return d.toLocaleDateString(locale(), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function fmt(v: number | null): string {
  return v === null ? '—' : `${v}g`;
}

function dayChipLabel(offset: number, date: Date): string {
  if (offset === 0) return t('todayChip');
  if (offset === 1) return t('tomorrowChip');
  return date.toLocaleDateString(locale(), { weekday: 'short', day: 'numeric' });
}

export default function TodayScreen({ onEditPreferences, onOpenPlan, onOpenAccount, onChangeIngredients, dateOffset = 0 }: Props) {
  const lang = useLang();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [recipeVisible, setRecipeVisible] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});
  const [addVisible, setAddVisible] = useState(false);
  const [gramsText, setGramsText] = useState('250');
  const [targetOffset, setTargetOffset] = useState(0);
  const [saving, setSaving] = useState(false);
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
              error: merged.length ? null : 'noMatch',
            },
          };
        });
      } catch (e: any) {
        if (reqRef.current[type] !== id) return;
        setBuckets((prev) => ({
          ...prev,
          [type]: { ...prev[type], loading: false, error: e?.message ?? 'loadFail' },
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

  const prefsSigRef = useRef<string>('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      supabase.auth.getSession().then(({ data }) => {
        if (!active) return;
        const meta = data.session?.user?.user_metadata as any;
        setNickname(meta?.nickname || data.session?.user?.email || null);
      });
      // Re-read preferences on focus: if the user changed their ingredients
      // (or other prefs), refresh the suggestions to match.
      loadPreferences().then((prefs) => {
        if (!active || !prefs) return;
        const sig = JSON.stringify([prefs.diet, prefs.haveIngredients, prefs.avoidIngredients]);
        if (prefsSigRef.current && sig !== prefsSigRef.current) {
          prefsSigRef.current = sig;
          setPreferences(prefs);
          setBuckets({
            breakfast: { ...emptyBucket },
            lunch: { ...emptyBucket },
            dinner: { ...emptyBucket },
          });
          loadBatch(mealType, prefs, 0, true);
        } else if (!prefsSigRef.current) {
          prefsSigRef.current = sig;
        }
      });
      return () => {
        active = false;
      };
    }, [mealType, loadBatch]),
  );

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

  const handleEditPreferences = async () => {
    await resetOnboarding();
    onEditPreferences();
  };

  const openAddModal = () => {
    setGramsText('250');
    setTargetOffset(dateOffset);
    setAddVisible(true);
  };

  const bucket = buckets[mealType];
  const meal = bucket.meals[bucket.index] ?? null;

  const confirmAdd = async () => {
    if (!meal) return;
    const grams = Math.round(parseFloat(gramsText.replace(',', '.')));
    if (!isFinite(grams) || grams <= 0) return;
    setSaving(true);
    const dateISO = isoDate(addDays(new Date(), targetOffset));
    await setPlannedMeal(dateISO, mealType, meal, grams);
    setSaving(false);
    setAddedIds((prev) => ({ ...prev, [meal.id]: true }));
    setAddVisible(false);
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
  const added = !!meal && !!addedIds[meal.id];
  const subtitle = meal?.dishTypes[0] ?? '';
  const gramsNum = Math.round(parseFloat(gramsText.replace(',', '.')));
  const previewKcal =
    meal && n && n.calories !== null && isFinite(gramsNum) && gramsNum > 0
      ? Math.round((n.calories * gramsNum) / 100)
      : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={typography.label}>{dateOffset === 0 ? t('today') : t('planning')}</Text>
          <Text style={[typography.title, styles.dateText]}>
            {dateTitle(addDays(new Date(), dateOffset))}
          </Text>
        </View>
        <View style={styles.headerLinks}>
          <View style={styles.langRow}>
            <Pressable onPress={() => setLang('en')} hitSlop={6}>
              <Text style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}>EN</Text>
            </Pressable>
            <Text style={styles.langSep}>|</Text>
            <Pressable onPress={() => setLang('tr')} hitSlop={6}>
              <Text style={[styles.langBtn, lang === 'tr' && styles.langBtnActive]}>TR</Text>
            </Pressable>
          </View>
          {nickname && <Text style={styles.nickname}>👤 {nickname}</Text>}
          <Pressable onPress={onOpenPlan} hitSlop={8}>
            <Text style={styles.link}>{t('myPlan')}</Text>
          </Pressable>
          <Pressable onPress={onChangeIngredients} hitSlop={8}>
            <Text style={styles.editLink}>{t('changeIngredients')}</Text>
          </Pressable>
          <Pressable onPress={handleEditPreferences} hitSlop={8}>
            <Text style={styles.editLink}>{t('editPrefs')}</Text>
          </Pressable>
          <Pressable onPress={onOpenAccount} hitSlop={8}>
            <Text style={styles.editLink}>{t('account')}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.selectorRow}>
          {MEAL_TYPES.map((mt) => {
            const active = mealType === mt;
            return (
              <Pressable
                key={mt}
                onPress={() => selectMeal(mt)}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{t(mt)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[typography.label, styles.suggestionLabel]}>
          {t(mealType).toUpperCase()} {t('suggestionSuffix')}
        </Text>

        <Card style={styles.card}>
          {bucket.loading ? (
            <View style={styles.state}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[typography.body, styles.stateText]}>{t('findingRecipe')}</Text>
            </View>
          ) : bucket.error ? (
            <View style={styles.state}>
              <Text style={styles.emoji}>😕</Text>
              <Text style={[typography.body, styles.stateText]}>
                {bucket.error === 'noMatch' || bucket.error === 'loadFail' ? t(bucket.error) : bucket.error}
              </Text>
            </View>
          ) : meal ? (
            <View style={styles.mealWrap}>
              <Pressable
                onPress={() => setRecipeVisible(true)}
                style={({ pressed }) => [styles.mealTap, pressed && styles.cardPressed]}
              >
                <View style={styles.photoShadow}>
                  <Image source={{ uri: meal.image }} style={styles.photo} resizeMode="cover" />
                </View>
                <Text style={typography.heading}>
                  {lang === 'tr' && meal.titleTr ? meal.titleTr : meal.title}
                </Text>
                {subtitle ? <Text style={[typography.body, styles.description]}>{subtitle}</Text> : null}
                {n && n.calories !== null && (
                  <View style={styles.nutriRow}>
                    <Text style={styles.kcal}>{n.calories} kcal / 100g</Text>
                    <Text style={styles.macros}>
                      P {fmt(n.protein)} · C {fmt(n.carbs)} · F {fmt(n.fat)} {t('per100g')}
                    </Text>
                  </View>
                )}
              </Pressable>

              <View style={styles.pillRow}>
                <Pressable onPress={() => setRecipeVisible(true)} style={styles.recipeHint}>
                  <Text style={styles.recipeHintText}>{t('tapForRecipe')}</Text>
                </Pressable>
                <Pressable
                  onPress={openAddModal}
                  style={[styles.recipeHint, added && styles.recipeHintDone]}
                >
                  <Text style={[styles.recipeHintText, added && styles.recipeHintDoneText]}>
                    {added ? t('addedToPlan') : t('addToPlan')}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.state}>
              <Text style={[typography.body, styles.stateText]}>{t('noSuggestion')}</Text>
            </View>
          )}
        </Card>

        <PrimaryButton
          label={t('giveAnother')}
          onPress={handleAnother}
          disabled={bucket.loading}
          style={styles.anotherButton}
        />
      </View>

      <MealRecipeModal visible={recipeVisible} meal={meal} onClose={() => setRecipeVisible(false)} />

      <Modal visible={addVisible} animationType="fade" transparent onRequestClose={() => setAddVisible(false)}>
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropTouchable} onPress={() => setAddVisible(false)} />
          <View style={styles.sheet}>
            <Text style={[typography.heading, styles.sheetTitle]}>
              {t('addToPlan').replace(' ➕', '')}
            </Text>
            {meal && (
              <Text style={[typography.body, styles.sheetMeal]} numberOfLines={1}>
                {lang === 'tr' && meal.titleTr ? meal.titleTr : meal.title}
              </Text>
            )}

            <Text style={styles.fieldLabel}>{t('whichDay')}</Text>
            <View style={styles.dayRow}>
              {Array.from({ length: 7 }).map((_, i) => {
                const d = addDays(new Date(), i);
                const active = targetOffset === i;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setTargetOffset(i)}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                  >
                    <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                      {dayChipLabel(i, d)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>{t('howManyGrams')}</Text>
            <TextInput
              style={styles.gramsInput}
              value={gramsText}
              onChangeText={setGramsText}
              keyboardType="numeric"
              placeholder="e.g. 250"
              placeholderTextColor={colors.textMuted}
            />
            {previewKcal !== null && (
              <Text style={styles.previewKcal}>≈ {previewKcal} kcal</Text>
            )}

            <PrimaryButton
              label={saving ? t('saving') : t('saveToPlan')}
              onPress={confirmAdd}
              disabled={saving || !(isFinite(gramsNum) && gramsNum > 0)}
              style={styles.saveButton}
            />
            <PrimaryButton label={t('cancel')} variant="secondary" onPress={() => setAddVisible(false)} style={styles.saveButton} />
          </View>
        </View>
      </Modal>
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
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  langBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  langBtnActive: {
    color: colors.primary,
  },
  langSep: {
    color: colors.border,
    fontSize: 13,
  },
  nickname: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: 24,
    marginTop: 2,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 42, 40, 0.45)',
    justifyContent: 'center',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '92%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  sheetTitle: {
    textAlign: 'center',
  },
  sheetMeal: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.chipBackground,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  gramsInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  previewKcal: {
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
