import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../theme/theme';
import { supabase } from '../data/supabaseClient';

type Props = {
  // Gate mode: shown before the app is usable; no back link.
  gate?: boolean;
  onBack?: () => void;
};

export default function AuthScreen({ gate = false, onBack }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionNickname, setSessionNickname] = useState<string>('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSessionEmail(data.session?.user?.email ?? null);
        setSessionNickname(String(data.session?.user?.user_metadata?.nickname ?? ''));
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) setError(err.message);
    // On success the auth listener in RootNavigator switches screens.
  };

  const signUp = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nickname: nickname.trim() } },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (!data.session) {
      setMessage('Account created. Please check your email to confirm, then sign in.');
      setMode('signin');
    }
  };

  const saveNickname = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({
      data: { nickname: sessionNickname.trim() },
    });
    setBusy(false);
    if (err) setError(err.message);
    else setMessage('Nickname updated.');
  };

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    // Auth listener returns the app to the sign-in gate.
  };

  const isSignup = mode === 'signup';
  const canSubmit = !busy && !!email.trim() && password.length >= 6 && (!isSignup || nickname.trim().length >= 2);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={typography.label}>{gate ? 'WELCOME' : 'ACCOUNT'}</Text>
          <Text style={[typography.title, styles.titleText]}>
            {sessionEmail && !gate ? 'Your account' : isSignup ? 'Create account' : 'Plan It! Sign in'}
          </Text>
        </View>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.link}>Back</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.body}>
        {checking ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : sessionEmail && !gate ? (
          <Card style={styles.card}>
            <Text style={styles.emoji}>👤</Text>
            <Text style={[typography.heading, styles.centeredText]}>{sessionEmail}</Text>
            <Text style={[typography.body, styles.hint]}>
              Your meal plans are synced to the cloud.
            </Text>
            <Text style={styles.fieldLabel}>Nickname</Text>
            <TextInput
              style={styles.input}
              value={sessionNickname}
              onChangeText={setSessionNickname}
              placeholder="Nickname"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />
            <PrimaryButton label="Save nickname" onPress={saveNickname} disabled={busy} style={styles.button} />
            <PrimaryButton label="Sign out" variant="secondary" onPress={signOut} disabled={busy} style={styles.button} />
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={[typography.body, styles.hint]}>
              {isSignup
                ? 'Create your free account to start planning your meals.'
                : 'Sign in to plan your meals. Your plans sync across devices.'}
            </Text>
            {isSignup && (
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="Nickname (shown in the app)"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6 characters)"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
            />
            <PrimaryButton
              label={busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
              onPress={isSignup ? signUp : signIn}
              disabled={!canSubmit}
              style={styles.button}
            />
            <Pressable
              onPress={() => {
                setMode(isSignup ? 'signin' : 'signup');
                setError(null);
                setMessage(null);
              }}
              hitSlop={8}
              style={styles.switchRow}
            >
              <Text style={styles.switchText}>
                {isSignup ? 'Already have an account? Sign in' : "New here? Create an account"}
              </Text>
            </Pressable>
          </Card>
        )}

        {message && <Text style={[styles.feedback, styles.ok]}>{message}</Text>}
        {error && <Text style={[styles.feedback, styles.err]}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontSize: 24,
    marginTop: 2,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  body: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
  card: {
    alignItems: 'stretch',
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.sm,
  },
  switchRow: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  feedback: {
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: '600',
  },
  ok: {
    color: colors.primaryDark,
  },
  err: {
    color: colors.danger,
  },
});
