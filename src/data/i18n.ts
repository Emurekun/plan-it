// Lightweight i18n: language state (persisted), UI strings (EN/TR), and
// on-demand recipe translation (cached) for the TR mode.

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'en' | 'tr';

const LANG_KEY = 'planit.lang';
let current: Lang = 'en';
const listeners = new Set<() => void>();

export async function initLang(): Promise<void> {
  try {
    const v = await AsyncStorage.getItem(LANG_KEY);
    if (v === 'tr' || v === 'en') current = v;
  } catch {}
}

export function getLang(): Lang {
  return current;
}

export async function setLang(l: Lang): Promise<void> {
  current = l;
  listeners.forEach((f) => f());
  try {
    await AsyncStorage.setItem(LANG_KEY, l);
  } catch {}
}

// Re-renders the component whenever the language changes.
export function useLang(): Lang {
  const [, bump] = useState(0);
  useEffect(() => {
    const h = () => bump((x) => x + 1);
    listeners.add(h);
    return () => {
      listeners.delete(h);
    };
  }, []);
  return current;
}

export function locale(): string {
  return current === 'tr' ? 'tr-TR' : 'en-US';
}

const S: Record<string, { en: string; tr: string }> = {
  today: { en: 'TODAY', tr: 'BUGÜN' },
  planning: { en: 'PLANNING', tr: 'PLANLAMA' },
  myPlan: { en: 'My plan →', tr: 'Planım →' },
  changeIngredients: { en: 'Change ingredients', tr: 'Malzemeleri değiştir' },
  editPrefs: { en: 'Edit preferences', tr: 'Tercihleri düzenle' },
  account: { en: 'Account', tr: 'Hesap' },
  breakfast: { en: 'Breakfast', tr: 'Kahvaltı' },
  lunch: { en: 'Lunch', tr: 'Öğle' },
  dinner: { en: 'Dinner', tr: 'Akşam' },
  suggestionSuffix: { en: 'SUGGESTION', tr: 'ÖNERİSİ' },
  tapForRecipe: { en: 'Tap for recipe 📖', tr: 'Tarife bak 📖' },
  addToPlan: { en: 'Add to plan ➕', tr: 'Plana ekle ➕' },
  addedToPlan: { en: 'Added to plan ✓', tr: 'Plana eklendi ✓' },
  giveAnother: { en: 'Give me another', tr: 'Başka öner' },
  findingRecipe: { en: 'Finding a recipe…', tr: 'Tarif aranıyor…' },
  noSuggestion: { en: 'No suggestion yet.', tr: 'Henüz öneri yok.' },
  noMatch: {
    en: 'No recipes matched. Try adjusting your ingredients.',
    tr: 'Eşleşen tarif yok. Malzemelerini güncellemeyi dene.',
  },
  loadFail: { en: 'Could not load suggestions.', tr: 'Öneriler yüklenemedi.' },
  whichDay: { en: 'WHICH DAY?', tr: 'HANGİ GÜN?' },
  howManyGrams: { en: 'HOW MANY GRAMS WILL YOU EAT?', tr: 'KAÇ GRAM YİYECEKSİN?' },
  saveToPlan: { en: 'Save to plan', tr: 'Plana kaydet' },
  saving: { en: 'Saving…', tr: 'Kaydediliyor…' },
  cancel: { en: 'Cancel', tr: 'Vazgeç' },
  todayChip: { en: 'Today', tr: 'Bugün' },
  tomorrowChip: { en: 'Tomorrow', tr: 'Yarın' },
  tmrwChip: { en: 'Tmrw', tr: 'Yarın' },
  yourWeek: { en: 'YOUR WEEK', tr: 'HAFTAN' },
  done: { en: 'Done', tr: 'Bitti' },
  caloriesThisDay: { en: 'CALORIES THIS DAY', tr: 'GÜNÜN KALORİSİ' },
  protein: { en: 'Protein', tr: 'Protein' },
  carbs: { en: 'Carbs', tr: 'Karb.' },
  fat: { en: 'Fat', tr: 'Yağ' },
  fiber: { en: 'Fiber', tr: 'Lif' },
  nothingPlanned: {
    en: 'Nothing planned for this day yet.',
    tr: 'Bu gün için henüz plan yok.',
  },
  notPlannedYet: { en: 'Not planned yet', tr: 'Henüz planlanmadı' },
  pickHint: {
    en: 'Tap the button above to pick meals for this day.',
    tr: 'Bu gün için yemek seçmek üzere üstteki düğmeye dokun.',
  },
  remove: { en: 'Remove', tr: 'Kaldır' },
  loading: { en: 'Loading…', tr: 'Yükleniyor…' },
  ingredientsHdr: { en: 'INGREDIENTS', tr: 'MALZEMELER' },
  stepsHdr: { en: 'STEPS', tr: 'ADIMLAR' },
  kcalPer100: { en: 'kcal per 100 g', tr: 'kcal / 100 g' },
  per100g: { en: '(per 100g)', tr: '(100g başına)' },
  close: { en: 'Close', tr: 'Kapat' },
  translating: { en: 'Translating…', tr: 'Çevriliyor…' },
  welcomeHdr: { en: 'WELCOME', tr: 'HOŞ GELDİN' },
  accountHdr: { en: 'ACCOUNT', tr: 'HESAP' },
  signInTitle: { en: 'Plan It! Sign in', tr: 'Plan It! Giriş yap' },
  createAccountTitle: { en: 'Create account', tr: 'Hesap oluştur' },
  yourAccount: { en: 'Your account', tr: 'Hesabın' },
  back: { en: 'Back', tr: 'Geri' },
  signInHint: {
    en: 'Sign in to plan your meals. Your plans sync across devices.',
    tr: 'Yemeklerini planlamak için giriş yap. Planların cihazlar arasında eşitlenir.',
  },
  signUpHint: {
    en: 'Create your free account to start planning your meals.',
    tr: 'Yemek planlamaya başlamak için ücretsiz hesabını oluştur.',
  },
  nickname: { en: 'Nickname', tr: 'Takma ad' },
  nicknamePh: { en: 'Nickname (shown in the app)', tr: 'Takma ad (uygulamada görünür)' },
  email: { en: 'Email', tr: 'E-posta' },
  passwordPh: { en: 'Password (min 6 characters)', tr: 'Şifre (en az 6 karakter)' },
  signIn: { en: 'Sign in', tr: 'Giriş yap' },
  createAccount: { en: 'Create account', tr: 'Hesap oluştur' },
  pleaseWait: { en: 'Please wait…', tr: 'Lütfen bekle…' },
  switchToSignIn: { en: 'Already have an account? Sign in', tr: 'Zaten hesabın var mı? Giriş yap' },
  switchToSignUp: { en: 'New here? Create an account', tr: 'Yeni misin? Hesap oluştur' },
  cloudHint: { en: 'Your meal plans are synced to the cloud.', tr: 'Yemek planların bulutta eşitleniyor.' },
  saveNickname: { en: 'Save nickname', tr: 'Takma adı kaydet' },
  signOut: { en: 'Sign out', tr: 'Çıkış yap' },
  confirmEmail: {
    en: 'Account created. Please check your email to confirm, then sign in.',
    tr: 'Hesap oluşturuldu. E-postana gelen onay bağlantısına tıkla, sonra giriş yap.',
  },
  welcomeTitle: { en: 'Welcome to Plan It!', tr: "Plan It!'e hoş geldin!" },
  welcomeText: {
    en: "Tell us what's in your kitchen and we'll suggest meals for breakfast, lunch, and dinner that you can actually make. It only takes a minute, and everything stays on your device.",
    tr: 'Mutfağında ne olduğunu söyle; kahvaltı, öğle ve akşam için gerçekten yapabileceğin yemekler önerelim. Sadece bir dakika sürer.',
  },
  step1: { en: 'STEP 1 OF 3', tr: 'ADIM 1 / 3' },
  step2: { en: 'STEP 2 OF 3', tr: 'ADIM 2 / 3' },
  step3: { en: 'STEP 3 OF 3', tr: 'ADIM 3 / 3' },
  dietQ: { en: 'Do you follow a diet type?', tr: 'Bir diyet uyguluyor musun?' },
  ingHaveTitle: { en: 'Ingredients you have', tr: 'Elindeki malzemeler' },
  ingHaveHint: {
    en: "Search and add what's in your kitchen. We'll suggest recipes that use them.",
    tr: 'Mutfağındakileri ara ve ekle. Onları kullanan tarifler önerelim.',
  },
  ingAvoidTitle: { en: 'Ingredients to avoid', tr: 'Kaçınılacak malzemeler' },
  ingAvoidHint: { en: "We'll skip recipes that contain these.", tr: 'Bunları içeren tarifleri atlayacağız.' },
  searchIngPh: { en: 'Search ingredients (e.g. eggs, cheese)', tr: 'Malzeme ara (örn. yumurta, peynir)' },
  searchAvoidPh: { en: 'Search ingredients to avoid', tr: 'Kaçınılacak malzeme ara' },
  popular: { en: 'POPULAR', tr: 'POPÜLER' },
  results: { en: 'RESULTS', tr: 'SONUÇLAR' },
  noIngMatch: {
    en: 'No match. Try another spelling or pick from Popular.',
    tr: 'Sonuç yok. Farklı yazımı dene ya da Popüler listeden seç.',
  },
  next: { en: 'Next', tr: 'İleri' },
  letsGo: { en: "Let's go", tr: 'Başlayalım' },
  startPlanning: { en: 'Start planning', tr: 'Planlamaya başla' },
  yourKitchen: { en: 'YOUR KITCHEN', tr: 'MUTFAĞIN' },
  kitchenHint: {
    en: "Update what's in your kitchen — suggestions will match the new list.",
    tr: 'Mutfağındakileri güncelle — öneriler yeni listeye göre gelir.',
  },
  saveIngredients: { en: 'Save ingredients', tr: 'Malzemeleri kaydet' },
  mealsPlannedOf3: { en: 'of 3 meals planned', tr: '/ 3 öğün planlandı' },
  min: { en: 'min', tr: 'dk' },
  servings: { en: 'servings', tr: 'porsiyon' },
  deleteAccount: { en: 'Delete account', tr: 'Hesabı sil' },
  confirmDelete: { en: 'Tap again to permanently delete', tr: 'Kalıcı silmek için tekrar dokun' },
  deleteWarn: {
    en: 'Deletes your account and all plans. This cannot be undone.',
    tr: 'Hesabını ve tüm planlarını siler. Geri alınamaz.',
  },
  deleteFail: { en: 'Could not delete account.', tr: 'Hesap silinemedi.' },
};

export function t(key: string): string {
  const e = S[key];
  return e ? e[current] : key;
}

// ---- Recipe translation (TR mode) --------------------------------------

type TrRecipe = { ingredients: string[]; steps: string[] };
const recipeCache = new Map<number, TrRecipe>();

async function translateLines(lines: string[]): Promise<string[] | null> {
  // Chunk to keep URLs comfortably small.
  const chunks: string[][] = [];
  let cur: string[] = [];
  let len = 0;
  for (const l of lines) {
    if (len + l.length > 1300 && cur.length) {
      chunks.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(l);
    len += l.length + 1;
  }
  if (cur.length) chunks.push(cur);

  const out: string[] = [];
  for (const ch of chunks) {
    const q = encodeURIComponent(ch.join('\n'));
    const res = await fetch(
      'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=' + q,
    );
    if (!res.ok) return null;
    const j = await res.json();
    const translated = ((j?.[0] as any[]) || []).map((s) => s[0]).join('');
    const parts = translated.split('\n');
    if (parts.length !== ch.length) return null;
    out.push(...parts.map((p: string) => p.trim()));
  }
  return out;
}

/**
 * Translate a recipe's ingredients and steps to Turkish. Cached in memory and
 * on-device, so each recipe is translated at most once. Returns null on
 * failure (caller falls back to the original language).
 */
export async function translateRecipeTr(
  id: number,
  ingredients: string[],
  steps: string[],
): Promise<TrRecipe | null> {
  const cached = recipeCache.get(id);
  if (cached) return cached;
  try {
    const stored = await AsyncStorage.getItem('planit.trrec.' + id);
    if (stored) {
      const v = JSON.parse(stored) as TrRecipe;
      recipeCache.set(id, v);
      return v;
    }
  } catch {}

  try {
    const all = await translateLines([...ingredients, ...steps]);
    if (!all) return null;
    const v: TrRecipe = {
      ingredients: all.slice(0, ingredients.length),
      steps: all.slice(ingredients.length),
    };
    recipeCache.set(id, v);
    try {
      await AsyncStorage.setItem('planit.trrec.' + id, JSON.stringify(v));
    } catch {}
    return v;
  } catch {
    return null;
  }
}
