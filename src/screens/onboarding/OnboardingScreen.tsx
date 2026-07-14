import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import Chip from '../../components/Chip';
import { colors, radii, spacing, typography } from '../../theme/theme';
import { DIET_OPTIONS } from '../../data/options';
import { POPULAR_INGREDIENTS, searchIngredients } from '../../data/ingredients';
import { DietType, savePreferences } from '../../storage/preferences';

type Props = {
  onComplete: () => void;
};

const STEP_COUNT = 4;

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [diet, setDiet] = useState<DietType | null>(null);
  const [have, setHave] = useState<string[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [haveQuery, setHaveQuery] = useState('');
  const [avoidQuery, setAvoidQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const goNext = () => setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    if (!diet) return;
    setSaving(true);
    await savePreferences({
      diet,
      haveIngredients: have,
      avoidIngredients: avoid,
      likes: [],
      dislikes: [],
    });
    setSaving(false);
    onComplete();
  };

  const renderPicker = (
    selected: string[],
    setSelected: (v: string[]) => void,
    query: string,
    setQuery: (v: string) => void,
    otherList: string[],
    placeholder: string,
  ) => {
    const matches = query.trim()
      ? searchIngredients(query)
      : POPULAR_INGREDIENTS;
    const suggestions = matches.filter(
      (name) => !selected.includes(name) && !otherList.includes(name),
    );

    return (
      <View style={styles.spacedTop}>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />

        {selected.length > 0 && (
          <View style={styles.selectedWrap}>
            {selected.map((name) => (
              <Chip
                key={name}
                label={`${name}  ✕`}
                selected
                onPress={() => toggle(selected, setSelected, name)}
              />
            ))}
          </View>
        )}

        <Text style={[typography.label, styles.pickerLabel]}>
          {query.trim() ? 'RESULTS' : 'POPULAR'}
        </Text>
        <View style={styles.optionList}>
          {suggestions.map((name) => (
            <Chip
              key={name}
              label={name}
              selected={false}
              onPress={() => toggle(selected, setSelected, name)}
            />
          ))}
          {query.trim() && suggestions.length === 0 && (
            <Text style={[typography.subtitle, styles.noMatch]}>
              No match. You can pick from Popular or try another spelling.
            </Text>
          )}
        </View>
      </View>
    );
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
            <Text style={styles.emoji}>🧑‍🍳</Text>
            <Text style={typography.title}>Welcome to Plan It!</Text>
            <Text style={[typography.subtitle, styles.spacedTop]}>
              Tell us what's in your kitchen and we'll suggest meals for breakfast, lunch, and
              dinner that you can actually make. It only takes a minute, and everything stays on
              your device.
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
            <Text style={[typography.heading, styles.spacedTop]}>Ingredients you have</Text>
            <Text style={[typography.subtitle, styles.spacedTopSm]}>
              Search and add what's in your kitchen. We'll suggest recipes that use them.
            </Text>
            {renderPicker(
              have,
              setHave,
              haveQuery,
              setHaveQuery,
              avoid,
              'Search ingredients (e.g. eggs, cheese)',
            )}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={typography.label}>STEP 3 OF 3</Text>
            <Text style={[typography.heading, styles.spacedTop]}>Ingredients to avoid</Text>
            <Text style={[typography.subtitle, styles.spacedTopSm]}>
              We'll skip recipes that contain these.
            </Text>
            {renderPicker(
              avoid,
              setAvoid,
              avoidQuery,
              setAvoidQuery,
              have,
              'Search ingredients to avoid',
            )}
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
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
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
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  selectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  pickerLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  noMatch: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
