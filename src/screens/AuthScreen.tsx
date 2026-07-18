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
import { t, useLang, setLang } from '../data/i18n';

type Props = {
  // Gate mode: shown before the app is usable; no back link.
  gate?: boolean;
  onBack?: () => void;
};

export default function AuthScreen({ gate = false, onBack }: Props) {
  const lang = useLang();
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
      setMessage('confirmEmail');
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
    if (err) {
      setError(err.message);
      return;
    }
    // Return to the main screen so the new nickname is visible right away.
    if (onBack) onBack();
  };

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    // Auth listener returns the app to the sign-in gate.
  };

  const deleteAccount = async () => {
    // Two-step confirmation: first tap arms the button, second tap deletes.
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc('delete_user');
    if (err) {
      setBusy(false);
      setConfirmingDelete(false);
      setError(t('deleteFail'));
      return;
    }
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
          <Text style={typography.label}>{gate ? t('welcomeHdr') : t('accountHdr')}</Text>
          <Text style={[typography.title, styles.titleText]}>
            {sessionEmail && !gate ? t('yourAccount') : isSignup ? t('createAccountTitle') : t('signInTitle')}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.langRow}>
            <Pressable onPress={() => setLang('en')} hitSlop={8}>
              <Text style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}>EN</Text>
            </Pressable>
            <Text style={styles.langSep}>|</Text>
            <Pressable onPress={() => setLang('tr')} hitSlop={8}>
              <Text style={[styles.langBtn, lang === 'tr' && styles.langBtnActive]}>TR</Text>
            </Pressable>
          </View>
          {onBack && (
            <Pressable onPress={onBack} hitSlop={12}>
              <Text style={styles.link}>{t('back')}</Text>
            </Pressable>
          )}
        </View>
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
            <Text style={[typography.body, styles.hint]}>{t('cloudHint')}</Text>
            <Text style={styles.fieldLabel}>{t('nickname')}</Text>
            <TextInput
              style={styles.input}
              value={sessionNickname}
              onChangeText={setSessionNickname}
              placeholder={t('nickname')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />
            <PrimaryButton label={t('saveNickname')} onPress={saveNickname} disabled={busy} style={styles.button} />
            <PrimaryButton label={t('signOut')} variant="secondary" onPress={signOut} disabled={busy} style={styles.button} />
            <Pressable onPress={deleteAccount} disabled={busy} hitSlop={8} style={styles.deleteRow}>
              <Text style={styles.deleteText}>
                {confirmingDelete ? t('confirmDelete') : t('deleteAccount')}
              </Text>
            </Pressable>
            {confirmingDelete && <Text style={styles.deleteWarn}>{t('deleteWarn')}</Text>}
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={[typography.body, styles.hint]}>
              {isSignup ? t('signUpHint') : t('signInHint')}
            </Text>
            {isSignup && (
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder={t('nicknamePh')}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('email')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('passwordPh')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
            />
            <PrimaryButton
              label={busy ? t('pleaseWait') : isSignup ? t('createAccount') : t('signIn')}
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
                {isSignup ? t('switchToSignIn') : t('switchToSignUp')}
              </Text>
            </Pressable>
          </Card>
        )}

        {message && (
          <Text style={[styles.feedback, styles.ok]}>
            {message === 'confirmEmail' ? t('confirmEmail') : message}
          </Text>
        )}
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
  headerRight: {
    alignItems: 'flex-end',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  langBtnActive: {
    color: colors.primary,
  },
  langSep: {
    fontSize: 12,
    color: colors.border,
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
  deleteRow: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  deleteWarn: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
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
