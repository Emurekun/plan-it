import React, { useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import RecipeModal from '../components/RecipeModal';
import { colors, spacing, typography } from '../theme/theme';
import { Breakfast } from '../data/breakfasts';
import { suggestBreakfast, getBreakfastById } from '../data/suggest';
import { getRecipeById } from '../data/recipes';
import { getBreakfastImage } from '../data/images';
import {
  loadPreferences,
  loadTodaySuggestion,
  saveTodaySuggestion,
  resetOnboarding,
  Preferences,
} from '../storage/preferences';

type Props = {
  onEditPreferences: () => void;
};

const todayLabel = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function TodayScreen({ onEditPreferences }: Props) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [breakfast, setBreakfast] = useState<Breakfast | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipeVisible, setRecipeVisible] = useState(false);

  const recipe = breakfast ? getRecipeById(breakfast.id) ?? null : null;
  const photo = breakfast ? getBreakfastImage(breakfast.id) : undefined;

  useEffect(() => {
    (async () => {
      const prefs = await loadPreferences();
      if (!prefs) {
        setLoading(false);
        return;
      }
      setPreferences(prefs);

      const savedId = await loadTodaySuggestion();
      const existing = savedId ? getBreakfastById(savedId) : undefined;
      const chosen = existing ?? suggestBreakfast(prefs);
      setBreakfast(chosen);
      await saveTodaySuggestion(chosen.id);
      setLoading(false);
    })();
  }, []);

  const handleAnother = async () => {
    if (!preferences) return;
    const next = suggestBreakfast(preferences, breakfast?.id);
    setBreakfast(next);
    await saveTodaySuggestion(next.id);
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
        <Text style={typography.label}>BREAKFAST SUGGESTION</Text>
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
            {recipe && (
              <View style={styles.recipeHint}>
                <Text style={styles.recipeHintText}>Tap for recipe 📖</Text>
              </View>
            )}
          </Card>
        </Pressable>

        <PrimaryButton label="Give me another" onPress={handleAnother} style={styles.anotherButton} />
      </View>

      <RecipeModal
        visible={recipeVisible}
        breakfast={breakfast}
        recipe={recipe}
        onClose={() => setRecipeVisible(false)}
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
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  cardPressed: {
    opacity: 0.85,
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
    height: 170,
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
