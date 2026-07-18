import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Session } from '@supabase/supabase-js';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import TodayScreen from '../screens/TodayScreen';
import PlanScreen from '../screens/PlanScreen';
import AuthScreen from '../screens/AuthScreen';
import IngredientsScreen from '../screens/IngredientsScreen';
import { isOnboardingComplete } from '../storage/preferences';
import { supabase } from '../data/supabaseClient';
import { initLang } from '../data/i18n';
import { refreshPremium } from '../data/monetization';
import { colors } from '../theme/theme';

type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: { dateOffset?: number } | undefined;
  Plan: undefined;
  Account: undefined;
  Ingredients: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [{ data }, complete] = await Promise.all([
        supabase.auth.getSession(),
        isOnboardingComplete(),
        initLang(),
      ]);
      if (!mounted) return;
      setSession(data.session ?? null);
      setOnboarded(complete);
      setReady(true);
      refreshPremium();
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      refreshPremium();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          // Signed out: the app is gated behind sign-in / sign-up.
          <Stack.Screen name="Auth">
            {() => <AuthScreen gate />}
          </Stack.Screen>
        ) : !onboarded ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={() => setOnboarded(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main">
              {({ navigation, route }) => (
                <TodayScreen
                  dateOffset={route.params?.dateOffset ?? 0}
                  onEditPreferences={() => setOnboarded(false)}
                  onOpenPlan={() => navigation.navigate('Plan')}
                  onOpenAccount={() => navigation.navigate('Account')}
                  onChangeIngredients={() => navigation.navigate('Ingredients')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Plan">
              {({ navigation }) => (
                <PlanScreen
                  onBack={() => navigation.goBack()}
                  onPlanDay={(offset) => navigation.navigate('Main', { dateOffset: offset })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Account">
              {({ navigation }) => <AuthScreen onBack={() => navigation.goBack()} />}
            </Stack.Screen>
            <Stack.Screen name="Ingredients">
              {({ navigation }) => <IngredientsScreen onBack={() => navigation.goBack()} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
