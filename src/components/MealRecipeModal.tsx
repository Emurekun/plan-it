import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/theme';
import { ApiMeal } from '../data/mealdb';
import PrimaryButton from './PrimaryButton';

type Props = {
  visible: boolean;
  meal: ApiMeal | null;
  onClose: () => void;
};

function toSteps(instructions: string): string[] {
  if (!instructions) return [];
  // Prefer explicit line breaks; fall back to sentence splitting.
  const byLine = instructions
    .split(/\r?\n+/)
    .map((s) => s.replace(/^\s*(STEP\s*\d+[:.)-]?)/i, '').trim())
    .filter((s) => s.length > 0);
  if (byLine.length > 1) return byLine;
  return instructions
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function MealRecipeModal({ visible, meal, onClose }: Props) {
  if (!meal) return null;
  const steps = toSteps(meal.instructions);
  const subtitle = [meal.category, meal.area].filter(Boolean).join(' · ');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {meal.thumb ? (
              <View style={styles.photoShadow}>
                <Image source={{ uri: meal.thumb }} style={styles.photo} resizeMode="cover" />
              </View>
            ) : null}
            <Text style={[typography.heading, styles.centered]}>{meal.name}</Text>
            {subtitle ? (
              <Text style={[typography.subtitle, styles.centered, styles.descriptionSpacing]}>
                {subtitle}
              </Text>
            ) : null}

            {meal.ingredients.length > 0 && (
              <>
                <Text style={[typography.label, styles.sectionLabel]}>INGREDIENTS</Text>
                {meal.ingredients.map((item, i) => (
                  <View key={i} style={styles.ingredientRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={[typography.body, styles.listText]}>
                      {item.measure ? `${item.measure} ` : ''}
                      {item.name}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {steps.length > 0 && (
              <>
                <Text style={[typography.label, styles.sectionLabel]}>STEPS</Text>
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
          <PrimaryButton label="Close" variant="secondary" onPress={onClose} style={styles.closeButton} />
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
