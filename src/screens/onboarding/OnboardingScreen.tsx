import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import Chip from '../../components/Chip';
import { colors, spacing, typography } from '../../theme/theme';
import { DIET_OPTIONS, FOOD_TAGS } from '../../data/options';
import { DietType, savePreferences } from '../../storage/preferences';

type Props = {
  onComplete: () => void;
};

const STEP_COUNT = 4;

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [diet, setDiet] = useState<DietType | null>(null);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const goNext = () => setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    if (!diet) return;
    setSaving(true);
    await savePreferences({ diet, likes, dislikes });
    setSaving(false);
    onComplete();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.dots}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <View>
            <Text style={styles.emoji}>🥐</Text>
            <Text style={typography.title}>Welcome to Plan It!</Text>
            <Text style={[typography.subtitle, styles.spacedTop]}>
              Answer a few quick questions so we can suggest breakfasts you'll actually enjoy. This only takes a minute, and everything stays on your device.
            </Text>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={typography.label}>STEP 1 OF 3</Text>
            <Text style={[typography.heading, styles.spacedTop]}>Do you follow a diet type?</Text>
            <View style={[styles.optionList, styles.spacedTop]}>
              {DIET_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={diet === opt.value}
                  onPress={() => setDiet(opt.value)}
                />
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={typography.label}>STEP 2 OF 3</Text>
            <Text style={[typography.heading, styles.spacedTop]}>What do you enjoy for breakfast?</Text>
            <Text style={[typography.subtitle, styles.spacedTopSm]}>Pick as many as you like.</Text>
            <View style={[styles.optionList, styles.spacedTop]}>
              {FOOD_TAGS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={likes.includes(opt.value)}
                  onPress={() => toggle(likes, setLikes, opt.value)}
                />
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={typography.label}>STEP 3 OF 3</Text>
            <Text style={[typography.heading, styles.spacedTop]}>Anything you'd rather avoid?</Text>
            <Text style={[typography.subtitle, styles.spacedTopSm]}>We'll steer clear of these.</Text>
            <View style={[styles.optionList, styles.spacedTop]}>
              {FOOD_TAGS.filter((opt) => !likes.includes(opt.value)).map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={dislikes.includes(opt.value)}
                  onPress={() => toggle(dislikes, setDislikes, opt.value)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <PrimaryButton label="Back" variant="secondary" onPress={goBack} style={styles.backButton} />
        )}
        {step < STEP_COUNT - 1 ? (
          <PrimaryButton
            label={step === 0 ? "Let's go" : 'Next'}
            onPress={goNext}
            disabled={step === 1 && !diet}
            style={styles.nextButton}
          />
        ) : (
          <PrimaryButton label="Start planning" onPress={finish} disabled={saving} style={styles.nextButton} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    flexGrow: 1,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  spacedTop: {
    marginTop: spacing.md,
  },
  spacedTopSm: {
    marginTop: spacing.xs,
  },
  optionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
