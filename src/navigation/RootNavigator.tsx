import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import TodayScreen from '../screens/TodayScreen';
import NutritionScreen from '../screens/NutritionScreen';
import { isOnboardingComplete } from '../storage/preferences';
import { colors } from '../theme/theme';

type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

type MainTabsParamList = {
  Today: undefined;
  Nutrition: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function tabEmoji(emoji: string) {
  // Emoji tab icons keep us dependency-free (no vector-icon package needed).
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function MainTabs({ onEditPreferences }: { onEditPreferences: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Today"
        options={{ tabBarLabel: 'Today', tabBarIcon: tabEmoji('🍳') }}
      >
        {() => <TodayScreen onEditPreferences={onEditPreferences} />}
      </Tab.Screen>
      <Tab.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{ tabBarLabel: 'Nutrition', tabBarIcon: tabEmoji('🥗') }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const [checking, setChecking] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Onboarding');

  useEffect(() => {
    (async () => {
      const complete = await isOnboardingComplete();
      setInitialRoute(complete ? 'Main' : 'Onboarding');
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding">
          {({ navigation }) => (
            <OnboardingScreen onComplete={() => navigation.replace('Main')} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Main">
          {({ navigation }) => (
            <MainTabs onEditPreferences={() => navigation.replace('Onboarding')} />
          )}
        </Stack.Screen>
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
