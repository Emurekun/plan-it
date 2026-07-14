import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import TodayScreen from '../screens/TodayScreen';
import { isOnboardingComplete } from '../storage/preferences';
import { colors } from '../theme/theme';

type RootStackParamList = {
  Onboarding: undefined;
  Today: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [checking, setChecking] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Onboarding');

  useEffect(() => {
    (async () => {
      const complete = await isOnboardingComplete();
      setInitialRoute(complete ? 'Today' : 'Onboarding');
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
            <OnboardingScreen onComplete={() => navigation.replace('Today')} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Today">
          {({ navigation }) => (
            <TodayScreen onEditPreferences={() => navigation.replace('Onboarding')} />
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
