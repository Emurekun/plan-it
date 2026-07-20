import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../theme/theme';
import { popularIngredients, searchIngredients, ingredientLabel } from '../data/ingredients';
import { loadPreferences, savePreferences, Preferences } from '../storage/preferences';
import { t, useLang } from '../data/i18n';

type Props = {
  onBack: () => void;
};

// Lets the user update "ingredients you have" any time (what's in the kitchen
// changes day to day) without redoing the whole onboarding. Diet and avoided
// ingredients stay as they are.
export default function IngredientsScreen({ onBack }: Props) {
  const lang = useLang();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [have, setHave] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await loadPreferences();
      setPrefs(p);
      setHave(p?.haveIngredients ?? []);
    })();
  }, []);

  const toggle = (value: string) => {
    setHave((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    await savePreferences({ ...prefs, haveIngredients: have });
    setSaving(false);
    onBack();
  };

  if (!prefs) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const avoid = prefs.avoidIngredients ?? [];
  const matches = query.trim() ? searchIngredients(query) : popularIngredients(prefs.diet);
  const suggestions = matches.filter((name) => !have.includes(name) && !avoid.includes(name));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={typography.label}>{t('yourKitchen')}</Text>
          <Text style={[typography.title, styles.titleText]}>{t('ingHaveTitle')}</Text>
        </View>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.link}>{t('cancel')}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.subtitle, styles.hint]}>{t('kitchenHint')}</Text>

        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder={t('searchIngPh')}
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />

        {have.length > 0 && (
          <View style={styles.selectedWrap}>
            {have.map((name) => (
              <Chip key={name} label={`${ingredientLabel(name, lang)}  ✕`} selected onPress={() => toggle(name)} />
            ))}
          </View>
        )}

        <Text style={[typography.label, styles.pickerLabel]}>
          {query.trim() ? t('results') : t('popular')}
        </Text>
        <View style={styles.optionList}>
          {suggestions.map((name) => (
            <Chip key={name} label={ingredientLabel(name, lang)} selected={false} onPress={() => toggle(name)} />
          ))}
          {query.trim() && suggestions.length === 0 && (
            <Text style={[typography.subtitle, styles.noMatch]}>{t('noIngMatch')}</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={saving ? t('saving') : t('saveIngredients')}
          onPress={save}
          disabled={saving}
          style={styles.saveButton}
        />
      </View>
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
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  titleText: {
    fontSize: 22,
    marginTop: 2,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  hint: {
    fontSize: 14,
    marginBottom: spacing.md,
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
  optionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noMatch: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  saveButton: {
    alignSelf: 'stretch',
  },
});
