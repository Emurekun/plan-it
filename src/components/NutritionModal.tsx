import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/theme';
import { Breakfast } from '../data/breakfasts';
import { MealNutrition } from '../data/mealNutrition';
import PrimaryButton from './PrimaryButton';

type Props = {
  visible: boolean;
  breakfast: Breakfast | null;
  nutrition: MealNutrition | null;
  onClose: () => void;
};

const MACROS: { key: keyof MealNutrition; label: string; color: string }[] = [
  { key: 'protein', label: 'Protein', color: '#2F7A54' },
  { key: 'carbs', label: 'Carbs', color: '#C08A2D' },
  { key: 'sugar', label: 'Sugar', color: '#C24E7A' },
  { key: 'fat', label: 'Fat', color: '#C24E4E' },
  { key: 'fiber', label: 'Fiber', color: '#6B8E23' },
];

export default function NutritionModal({ visible, breakfast, nutrition, onClose }: Props) {
  if (!breakfast || !nutrition) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.content}>
            <Text style={styles.emoji}>{breakfast.emoji}</Text>
            <Text style={[typography.heading, styles.centered]}>{breakfast.name}</Text>

            <View style={styles.calorieBadge}>
              <Text style={styles.calorieValue}>{nutrition.calories}</Text>
              <Text style={styles.calorieUnit}>kcal total</Text>
            </View>

            <Text style={[typography.label, styles.sectionLabel]}>MACROS</Text>
            {MACROS.map((m) => (
              <View key={m.key} style={styles.macroRow}>
                <View style={[styles.macroDot, { backgroundColor: m.color }]} />
                <Text style={styles.macroLabel}>{m.label}</Text>
                <Text style={styles.macroValue}>{nutrition[m.key]} g</Text>
              </View>
            ))}

            <Text style={styles.note}>Estimated values for one serving.</Text>
          </View>
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
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  centered: {
    textAlign: 'center',
  },
  calorieBadge: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  calorieUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm + 2,
  },
  macroLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  note: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  closeButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
});
