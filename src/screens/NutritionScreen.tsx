import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Card from '../components/Card';
import { colors, radii, spacing, typography } from '../theme/theme';
import { searchFoods, FoodNutrition } from '../data/nutrition';

type Status = 'idle' | 'loading' | 'done' | 'error';

const MACROS: { key: keyof FoodNutrition; label: string; color: string }[] = [
  { key: 'protein', label: 'Protein', color: '#2F7A54' },
  { key: 'carbs', label: 'Carbs', color: '#C08A2D' },
  { key: 'sugar', label: 'Sugar', color: '#C24E7A' },
  { key: 'fat', label: 'Fat', color: '#C24E4E' },
  { key: 'fiber', label: 'Fiber', color: '#6B8E23' },
];

function formatGrams(value: number | null): string {
  return value === null ? '—' : `${value} g`;
}

function MacroPill({ label, value, color }: { label: string; value: number | null; color: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{formatGrams(value)}</Text>
    </View>
  );
}

function FoodRow({ item }: { item: FoodNutrition }) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.foodName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.brand ? (
            <Text style={styles.brand} numberOfLines={1}>
              {item.brand}
            </Text>
          ) : null}
        </View>
        <View style={styles.calorieBadge}>
          <Text style={styles.calorieValue}>{item.calories ?? '—'}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>
      </View>

      <View style={styles.pillRow}>
        {MACROS.map((m) => (
          <MacroPill key={m.key} label={m.label} value={item[m.key] as number | null} color={m.color} />
        ))}
      </View>

      <Text style={styles.per}>per 100 g</Text>
    </Card>
  );
}

export default function NutritionScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodNutrition[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    Keyboard.dismiss();

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(null);
    try {
      const foods = await searchFoods(trimmed, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setResults(foods);
      setStatus('done');
    } catch (e: any) {
      if (controller.signal.aborted) return;
      setError(e?.message ?? 'Something went wrong.');
      setResults([]);
      setStatus('error');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={typography.label}>NUTRITION</Text>
        <Text style={[typography.title, styles.titleText]}>Calories & macros</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Search any food to see calories, protein, carbs, sugar, fat, and fiber.
        </Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. banana, greek yogurt, oats"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          onSubmitEditing={runSearch}
        />
        <Pressable
          onPress={runSearch}
          style={({ pressed }) => [styles.searchButton, pressed && styles.searchButtonPressed]}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {status === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}

      {status === 'error' && (
        <View style={styles.centered}>
          <Text style={styles.emoji}>😕</Text>
          <Text style={[typography.body, styles.stateText]}>{error}</Text>
        </View>
      )}

      {status === 'idle' && (
        <View style={styles.centered}>
          <Text style={styles.emoji}>🥗</Text>
          <Text style={[typography.body, styles.stateText]}>
            Type a food above and tap Search.
          </Text>
        </View>
      )}

      {status === 'done' && results.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emoji}>🔍</Text>
          <Text style={[typography.body, styles.stateText]}>
            No matches for “{query.trim()}”. Try another name.
          </Text>
        </View>
      )}

      {status === 'done' && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.fdcId)}
          renderItem={({ item }) => <FoodRow item={item} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titleText: {
    fontSize: 26,
    marginTop: 2,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 15,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emoji: {
    fontSize: 44,
    marginBottom: spacing.sm,
  },
  stateText: {
    textAlign: 'center',
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitleWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 21,
  },
  brand: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  calorieBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    minWidth: 64,
  },
  calorieValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  calorieUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    marginHorizontal: -spacing.xs / 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chipBackground,
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    margin: spacing.xs / 2,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs + 1,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  pillValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  per: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.sm,
    letterSpacing: 0.3,
  },
});
