import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radii, spacing, typography } from '../theme/theme';
import { SpoonMeal } from '../data/spoonacular';
import { t, useLang, translateRecipeTr } from '../data/i18n';
import PrimaryButton from './PrimaryButton';

type Props = {
  visible: boolean;
  meal: SpoonMeal | null;
  onClose: () => void;
};

const MACROS: { key: 'protein' | 'carbs' | 'sugar' | 'fat' | 'fiber'; labelKey: string; color: string }[] = [
  { key: 'protein', labelKey: 'protein', color: '#2F7A54' },
  { key: 'carbs', labelKey: 'carbs', color: '#C08A2D' },
  { key: 'sugar', labelKey: 'sugar', color: '#C24E7A' },
  { key: 'fat', labelKey: 'fat', color: '#C24E4E' },
  { key: 'fiber', labelKey: 'fiber', color: '#6B8E23' },
];

const MACRO_TR: Record<string, string> = { sugar: 'Şeker' };
const MACRO_EN: Record<string, string> = { sugar: 'Sugar' };

export default function MealRecipeModal({ visible, meal, onClose }: Props) {
  const lang = useLang();
  const [trContent, setTrContent] = useState<{ ingredients: string[]; steps: string[] } | null>(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    setTrContent(null);
    if (!visible || !meal || lang !== 'tr') return;
    // Preferred source: the pre-translated content stored in our database.
    if (meal.tr && meal.tr.ingredients?.length) {
      setTrContent(meal.tr);
      return;
    }
    // Fallback: translate on the fly (older cached plans without db content).
    let active = true;
    setTranslating(true);
    translateRecipeTr(meal.id, meal.ingredients, meal.steps)
      .then((v) => {
        if (active) setTrContent(v);
      })
      .finally(() => {
        if (active) setTranslating(false);
      });
    return () => {
      active = false;
    };
  }, [visible, meal?.id, lang]);

  if (!meal) return null;

  const title = lang === 'tr' && meal.titleTr ? meal.titleTr : meal.title;
  const ingredients = lang === 'tr' && trContent ? trContent.ingredients : meal.ingredients;
  const steps = lang === 'tr' && trContent ? trContent.steps : meal.steps;

  const macroLabel = (key: string, labelKey: string) => {
    if (key === 'sugar') return lang === 'tr' ? MACRO_TR.sugar : MACRO_EN.sugar;
    return t(labelKey);
  };

  const subtitleParts: string[] = [];
  if (meal.dishTypes[0]) subtitleParts.push(meal.dishTypes[0]);
  if (meal.readyInMinutes) subtitleParts.push(`${meal.readyInMinutes} ${t('min')}`);
  if (meal.servings) subtitleParts.push(`${meal.servings} ${t('servings')}`);
  const subtitle = subtitleParts.join(' · ');
  const n = meal.nutrition;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {meal.image ? (
              <View style={styles.photoShadow}>
                <Image source={{ uri: meal.image }} style={styles.photo} resizeMode="cover" />
              </View>
            ) : null}
            <Text style={[typography.heading, styles.centered]}>{title}</Text>
            {subtitle ? (
              <Text style={[typography.subtitle, styles.centered, styles.descriptionSpacing]}>
                {subtitle}
              </Text>
            ) : null}

            {n && (n.calories !== null || n.protein !== null) && (
              <View style={styles.nutritionCard}>
                <View style={styles.calorieBlock}>
                  <Text style={styles.calorieValue}>{n.calories ?? '—'}</Text>
                  <Text style={styles.calorieUnit}>{t('kcalPer100')}</Text>
                </View>
                <View style={styles.macroRow}>
                  {MACROS.map((m) => (
                    <View key={m.key} style={styles.macroItem}>
                      <View style={[styles.macroDot, { backgroundColor: m.color }]} />
                      <Text style={styles.macroLabel}>{macroLabel(m.key, m.labelKey)}</Text>
                      <Text style={styles.macroValue}>{n[m.key] === null ? '—' : `${n[m.key]} g`}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {lang === 'tr' && translating && (
              <View style={styles.translatingRow}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={styles.translatingText}>{t('translating')}</Text>
              </View>
            )}

            {ingredients.length > 0 && (
              <>
                <Text style={[typography.label, styles.sectionLabel]}>{t('ingredientsHdr')}</Text>
                {ingredients.map((item, i) => (
                  <View key={i} style={styles.ingredientRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={[typography.body, styles.listText]}>{item}</Text>
                  </View>
                ))}
              </>
            )}

            {steps.length > 0 && (
              <>
                <Text style={[typography.label, styles.sectionLabel]}>{t('stepsHdr')}</Text>
                {steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={[typography.body, styles.listText]}>{step}</Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
          <PrimaryButton label={t('close')} variant="secondary" onPress={onClose} style={styles.closeButton} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 42, 40, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg + 8,
    borderTopRightRadius: radii.lg + 8,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
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
  centered: {
    textAlign: 'center',
  },
  descriptionSpacing: {
    marginTop: spacing.xs,
  },
  nutritionCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
  },
  calorieBlock: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  calorieValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  calorieUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    letterSpacing: 0.3,
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs / 2,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginRight: 4,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  translatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  translatingText: {
    marginLeft: spacing.sm,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs + 2,
  },
  bullet: {
    color: colors.primary,
    fontSize: 16,
    marginRight: spacing.sm,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm + 2,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  listText: {
    flex: 1,
    lineHeight: 22,
  },
  closeButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
});
