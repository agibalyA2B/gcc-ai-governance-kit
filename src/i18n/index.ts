import en from './en.json';
import ar from './ar.json';

export type Lang = 'en' | 'ar';
const catalogs: Record<Lang, Record<string, string>> = { en, ar };
const STORAGE_KEY = 'gaigk.lang';

export function detectLang(navigatorLangs: readonly string[], stored: string | null): Lang {
  if (stored === 'en' || stored === 'ar') return stored;
  return navigatorLangs.some((l) => l.toLowerCase().startsWith('ar')) ? 'ar' : 'en';
}

export function t(lang: Lang, key: string): string {
  return catalogs[lang][key] ?? catalogs.en[key] ?? key;
}

function readStored(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export function storeLang(lang: Lang): void {
  try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage unavailable: keep in memory */ }
}

export function applyLang(lang: Lang, root: HTMLElement = document.documentElement): void {
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

export function initialLang(): Lang {
  return detectLang(navigator.languages ?? [navigator.language], readStored());
}
