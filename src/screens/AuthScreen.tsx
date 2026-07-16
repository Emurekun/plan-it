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
  onBack: () => void;
};

export default function AuthScreen({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSessionEmail(data.session?.user?.email ?? null);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSessionEmail(data.session?.user?.email ?? null);
    setMessage('Signed in! Your day plans now sync to the cloud.');
  };

  const signUp = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      setSessionEmail(data.session.user?.email ?? null);
      setMessage('Account created — you are signed in!');
    } else {
      setMessage('Account created. Please check your email to confirm, then sign in.');
    }
  };

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    setSessionEmail(null);
    setMessage('Signed out. Plans stay saved on this device.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={typography.label}>ACCOUNT</Text>
          <Text style={[typography.title, styles.titleText]}>
            {sessionEmail ? 'Your account' : 'Sign in'}
          </Text>
        </View>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {checking ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : sessionEmail ? (
          <Card style={styles.card}>
            <Text style={styles.emoji}>✅</Text>
            <Text style={typography.heading}>{sessionEmail}</Text>
            <Text style={[typography.body, styles.hint]}>
              Your day plans are synced to the cloud and follow you across devices.
            </Text>
            <PrimaryButton label="Sign out" variant="secondary" onPress={signOut} disabled={busy} style={styles.button} />
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={[typography.body, styles.hint]}>
              Create a free account to save your daily meal plans in the cloud.
            </Text>
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
              label={busy ? 'Please wait…' : 'Sign in'}
              onPress={signIn}
              disabled={busy || !email.trim() || password.length < 6}
              style={styles.button}
            />
            <PrimaryButton
              label="Create account"
              variant="secondary"
              onPress={signUp}
              disabled={busy || !email.trim() || password.length < 6}
              style={styles.button}
            />
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
