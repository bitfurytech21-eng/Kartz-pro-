import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Language, Translations } from './types';
import { en } from './translations/en';
import { fr } from './translations/fr';
import { es } from './translations/es';
import { pt } from './translations/pt';
import { de } from './translations/de';
import { it } from './translations/it';
import { ru } from './translations/ru';
import { zh } from './translations/zh';
import { ar } from './translations/ar';
import { ja } from './translations/ja';
import { nl } from './translations/nl';
import { sv } from './translations/sv';
import { ko } from './translations/ko';
import { tr } from './translations/tr';
import { pl } from './translations/pl';
import { el } from './translations/el';
import { hi } from './translations/hi';
import { he } from './translations/he';
import { da } from './translations/da';
import { no } from './translations/no';
import { fi } from './translations/fi';
import { cs } from './translations/cs';
import { th } from './translations/th';
import { vi } from './translations/vi';

export * from './types';
export {
  en,
  fr,
  es,
  pt,
  de,
  it,
  ru,
  zh,
  ar,
  ja,
  nl,
  sv,
  ko,
  tr,
  pl,
  el,
  hi,
  he,
  da,
  no,
  fi,
  cs,
  th,
  vi,
};

export const ALL_SUPPORTED_LANGUAGES: Language[] = [
  'EN',
  'FR',
  'ES',
  'PT',
  'DE',
  'IT',
  'RU',
  'ZH',
  'AR',
  'JA',
  'NL',
  'SV',
  'KO',
  'TR',
  'PL',
  'EL',
  'HI',
  'HE',
  'DA',
  'NO',
  'FI',
  'CS',
  'TH',
  'VI',
];

export const RTL_LANGUAGES: ReadonlySet<Language> = new Set<Language>(['AR', 'HE']);

export const rawTranslations: Record<Language, Translations> = {
  EN: en,
  FR: fr,
  ES: es,
  PT: pt,
  DE: de,
  IT: it,
  RU: ru,
  ZH: zh,
  AR: ar,
  JA: ja,
  NL: nl,
  SV: sv,
  KO: ko,
  TR: tr,
  PL: pl,
  EL: el,
  HI: hi,
  HE: he,
  DA: da,
  NO: no,
  FI: fi,
  CS: cs,
  TH: th,
  VI: vi,
};

/**
 * Normalizes a BCP 47 language code or locale string to a supported Language.
 */
export function normalizeLanguageCode(localeStr?: string | null): Language | null {
  if (!localeStr || typeof localeStr !== 'string') return null;
  const clean = localeStr.trim().toLowerCase();
  if (!clean) return null;

  // Direct uppercase match (e.g. "EN", "FR")
  const upper = clean.toUpperCase();
  if (ALL_SUPPORTED_LANGUAGES.includes(upper as Language)) {
    return upper as Language;
  }

  // Extract base tag (e.g. "fr-FR" -> "fr", "zh-Hans-CN" -> "zh")
  const primaryTag = clean.split(/[-_]/)[0];

  const tagMap: Record<string, Language> = {
    en: 'EN',
    fr: 'FR',
    es: 'ES',
    pt: 'PT',
    de: 'DE',
    it: 'IT',
    ru: 'RU',
    zh: 'ZH',
    ar: 'AR',
    ja: 'JA',
    nl: 'NL',
    sv: 'SV',
    se: 'SV',
    ko: 'KO',
    tr: 'TR',
    pl: 'PL',
    el: 'EL',
    hi: 'HI',
    he: 'HE',
    iw: 'HE', // legacy code for Hebrew
    da: 'DA',
    no: 'NO',
    nb: 'NO', // Norwegian Bokmål
    nn: 'NO', // Norwegian Nynorsk
    fi: 'FI',
    cs: 'CS',
    th: 'TH',
    vi: 'VI',
  };

  if (tagMap[primaryTag]) {
    return tagMap[primaryTag];
  }

  // Check prefix matches in clean string
  for (const [tag, lang] of Object.entries(tagMap)) {
    if (clean.startsWith(tag)) {
      return lang;
    }
  }

  return null;
}

/**
 * Detects user language preference from browser navigator settings
 * if no manual override is active.
 */
export function detectBrowserLanguage(
  supportedLanguages: readonly Language[] = ALL_SUPPORTED_LANGUAGES,
  fallback: Language = 'EN'
): Language {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return fallback;
  }

  try {
    const candidates: string[] = [];

    // Check navigator.languages (ordered list of preferred languages)
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      for (const l of navigator.languages) {
        if (l) candidates.push(l);
      }
    }

    // Check navigator.language & legacy userLanguage
    if (navigator.language) {
      candidates.push(navigator.language);
    }
    const navAny = navigator as any;
    if (navAny.userLanguage) {
      candidates.push(navAny.userLanguage);
    }
    if (navAny.browserLanguage) {
      candidates.push(navAny.browserLanguage);
    }

    for (const candidate of candidates) {
      const normalized = normalizeLanguageCode(candidate);
      if (normalized && supportedLanguages.includes(normalized)) {
        return normalized;
      }
    }
  } catch (err) {
    console.warn('[i18n] Error reading browser languages:', err);
  }

  return fallback;
}

/**
 * Retrieves the stored language preference from localStorage if available.
 */
export function getStoredLanguagePreference(): Language | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('kretz_language');
    if (stored) {
      const upper = stored.toUpperCase() as Language;
      if (ALL_SUPPORTED_LANGUAGES.includes(upper)) {
        return upper;
      }
    }
  } catch {
    // localStorage may be disabled in private mode
  }
  return null;
}

/**
 * Sets the stored language preference in localStorage.
 */
export function setStoredLanguagePreference(lang: Language): void {
  if (typeof window === 'undefined') return;
  try {
    if (ALL_SUPPORTED_LANGUAGES.includes(lang)) {
      localStorage.setItem('kretz_language', lang);
    }
  } catch {
    // ignore
  }
}

// Track logged missing keys to avoid spamming the console in development
const missingKeysWarningSet = new Set<string>();

/**
 * Creates a defensive, recursive Proxy wrapper around a translation dictionary.
 * If any requested key is missing or undefined in the target dictionary, it automatically
 * falls back to the English dictionary without crashing the UI, and logs a debug notice.
 */
export function createSafeTranslations<T extends object>(
  targetObj: T,
  fallbackObj: object = en,
  currentLanguage: Language = 'EN',
  pathPrefix = ''
): T {
  if (!targetObj || typeof targetObj !== 'object') {
    return (fallbackObj as T) || (targetObj as T);
  }

  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      // Handle symbols and standard JavaScript object methods
      if (typeof prop === 'symbol') {
        return Reflect.get(target, prop, receiver);
      }
      if (prop === 'toJSON' || prop === '$$typeof' || prop === 'valueOf' || prop === 'toString') {
        return Reflect.get(target, prop, receiver);
      }

      const currentPath = pathPrefix ? `${pathPrefix}.${String(prop)}` : String(prop);
      const targetVal = Reflect.get(target, prop, receiver);
      const fallbackVal = fallbackObj && typeof fallbackObj === 'object' ? (fallbackObj as any)[prop] : undefined;

      // 1. Value exists in current language dictionary
      if (targetVal !== undefined && targetVal !== null) {
        if (typeof targetVal === 'object' && !Array.isArray(targetVal) && targetVal !== null) {
          return createSafeTranslations(targetVal, fallbackVal || {}, currentLanguage, currentPath);
        }
        return targetVal;
      }

      // 2. Value missing in target dictionary; attempt fallback
      if (fallbackVal !== undefined && fallbackVal !== null) {
        if (
          process.env.NODE_ENV !== 'production' &&
          !missingKeysWarningSet.has(`${currentLanguage}:${currentPath}`)
        ) {
          missingKeysWarningSet.add(`${currentLanguage}:${currentPath}`);
          console.warn(
            `[i18n] Missing key "${currentPath}" in language "${currentLanguage}". Using fallback value:`,
            typeof fallbackVal === 'string' ? `"${fallbackVal}"` : fallbackVal
          );
        }

        if (typeof fallbackVal === 'object' && !Array.isArray(fallbackVal) && fallbackVal !== null) {
          return createSafeTranslations({}, fallbackVal, currentLanguage, currentPath);
        }
        return fallbackVal;
      }

      // 3. Key missing in both current dictionary and fallback dictionary
      if (
        process.env.NODE_ENV !== 'production' &&
        !missingKeysWarningSet.has(`MISSING_ALL:${currentPath}`)
      ) {
        missingKeysWarningSet.add(`MISSING_ALL:${currentPath}`);
        console.error(
          `[i18n] Translation key "${currentPath}" was not found in language "${currentLanguage}" or fallback dictionary.`
        );
      }

      return '';
    },
  };

  return new Proxy(targetObj, handler) as T;
}

// Cache of safe translation objects for each language
const safeTranslationsMap = new Map<Language, Translations>();

/**
 * Returns a robust Translations dictionary for the given language,
 * with automatic fallback to English for any missing keys.
 */
export function getTranslations(lang: Language): Translations {
  const validLang = ALL_SUPPORTED_LANGUAGES.includes(lang) ? lang : 'EN';
  if (safeTranslationsMap.has(validLang)) {
    return safeTranslationsMap.get(validLang)!;
  }

  const rawDict = rawTranslations[validLang] || rawTranslations.EN;
  const safeDict = createSafeTranslations(rawDict, rawTranslations.EN, validLang);
  safeTranslationsMap.set(validLang, safeDict);
  return safeDict;
}

/**
 * Simple string formatter replacing `{param}` or `{{param}}` templates with values.
 */
export function formatTranslation(
  template: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  if (!template || !params) return template || '';
  return template.replace(/\{\{\s*(\w+)\s*\}\}|\{\s*(\w+)\s*\}/g, (match, key1, key2) => {
    const key = key1 || key2;
    if (params[key] !== undefined && params[key] !== null) {
      return String(params[key]);
    }
    return match;
  });
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRtl: boolean;
  dir: 'rtl' | 'ltr';
  format: (template: string, params?: Record<string, string | number | boolean | null | undefined>) => string;
  tKey: (
    keyPath: string,
    params?: Record<string, string | number | boolean | null | undefined>,
    defaultValue?: string
  ) => string;
  hasKey: (keyPath: string) => boolean;
  browserLanguage: Language;
  supportedLanguages: Language[];
  resetToBrowserLanguage: () => void;
}

// Fallback context when used outside of LanguageProvider
const defaultContextValue: LanguageContextType = {
  language: 'EN',
  setLanguage: () => {},
  t: getTranslations('EN'),
  isRtl: false,
  dir: 'ltr',
  format: formatTranslation,
  tKey: (keyPath, params, defaultValue) => {
    return formatTranslation(defaultValue || keyPath, params);
  },
  hasKey: () => false,
  browserLanguage: 'EN',
  supportedLanguages: ALL_SUPPORTED_LANGUAGES,
  resetToBrowserLanguage: () => {},
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: Language;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  fallbackLanguage?: Language;
  detectBrowser?: boolean;
}

export function isSupportedLanguage(lang: any): lang is Language {
  return typeof lang === 'string' && (ALL_SUPPORTED_LANGUAGES as readonly string[]).includes(lang.toUpperCase());
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguage,
  language: propLanguage,
  onLanguageChange,
  fallbackLanguage = 'EN',
  detectBrowser = true,
}) => {
  const safeFallback: Language = isSupportedLanguage(fallbackLanguage)
    ? (fallbackLanguage as Language)
    : 'EN';

  // Compute initial language with clean hierarchy:
  // 1. Controlled prop `language`
  // 2. `initialLanguage`
  // 3. Stored preference in localStorage
  // 4. Browser preference via detectBrowserLanguage()
  // 5. safeFallback
  const [language, setLanguageState] = useState<Language>(() => {
    if (propLanguage && ALL_SUPPORTED_LANGUAGES.includes(propLanguage)) {
      return propLanguage;
    }
    if (initialLanguage && ALL_SUPPORTED_LANGUAGES.includes(initialLanguage)) {
      return initialLanguage;
    }
    const stored = getStoredLanguagePreference();
    if (stored) {
      return stored;
    }
    if (detectBrowser) {
      return detectBrowserLanguage(ALL_SUPPORTED_LANGUAGES, safeFallback);
    }
    return safeFallback;
  });

  const [browserLang, setBrowserLang] = useState<Language>(() =>
    detectBrowserLanguage(ALL_SUPPORTED_LANGUAGES, safeFallback)
  );

  // Sync state if controlled prop `language` updates
  useEffect(() => {
    if (propLanguage && propLanguage !== language && ALL_SUPPORTED_LANGUAGES.includes(propLanguage)) {
      setLanguageState(propLanguage);
    }
  }, [propLanguage]);

  // Sync state if `initialLanguage` changes dynamically
  useEffect(() => {
    if (initialLanguage && initialLanguage !== language && ALL_SUPPORTED_LANGUAGES.includes(initialLanguage)) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  // Listen to browser language settings changes (e.g. when user changes system language)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBrowserLanguageChange = () => {
      const updatedBrowserLang = detectBrowserLanguage(ALL_SUPPORTED_LANGUAGES, safeFallback);
      setBrowserLang(updatedBrowserLang);

      // If user has not set an explicit override in localStorage, automatically switch to new browser language
      const hasStoredOverride = Boolean(localStorage.getItem('kretz_language'));
      if (!hasStoredOverride && detectBrowser && !propLanguage) {
        setLanguageState(updatedBrowserLang);
      }
    };

    window.addEventListener('languagechange', handleBrowserLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleBrowserLanguageChange);
    };
  }, [detectBrowser, safeFallback, propLanguage]);

  // Apply HTML document language and direction attributes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      document.documentElement.lang = language.toLowerCase();
      if (RTL_LANGUAGES.has(language)) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    } catch {
      // ignore
    }
  }, [language]);

  const handleSetLanguage = useCallback(
    (newLang: Language) => {
      if (!ALL_SUPPORTED_LANGUAGES.includes(newLang)) {
        console.warn(`[i18n] Attempted to set unsupported language: "${newLang}"`);
        return;
      }
      setLanguageState(newLang);
      setStoredLanguagePreference(newLang);

      if (typeof window !== 'undefined') {
        try {
          document.documentElement.lang = newLang.toLowerCase();
          document.documentElement.dir = RTL_LANGUAGES.has(newLang) ? 'rtl' : 'ltr';
        } catch {
          // ignore
        }
      }

      if (onLanguageChange) {
        onLanguageChange(newLang);
      }
    },
    [onLanguageChange]
  );

  const resetToBrowserLanguage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('kretz_language');
      } catch {
        // ignore
      }
    }
    const detected = detectBrowserLanguage(ALL_SUPPORTED_LANGUAGES, safeFallback);
    handleSetLanguage(detected);
  }, [safeFallback, handleSetLanguage]);

  const currentTranslations = useMemo(() => {
    return getTranslations(language);
  }, [language]);

  const isRtl = RTL_LANGUAGES.has(language);
  const dir = isRtl ? 'rtl' : 'ltr';

  // Safe dot-notation lookup function (e.g. tKey('selection.propertiesAvailable', { count: 5 }))
  const tKey = useCallback(
    (
      keyPath: string,
      params?: Record<string, string | number | boolean | null | undefined>,
      defaultValue?: string
    ): string => {
      if (!keyPath) return defaultValue || '';
      const parts = keyPath.split('.');
      let current: any = currentTranslations;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          current = undefined;
          break;
        }
      }

      if (current !== undefined && typeof current === 'string') {
        return formatTranslation(current, params);
      }

      // Try fallback to en
      let fallbackCurrent: any = rawTranslations.EN;
      for (const part of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && part in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[part];
        } else {
          fallbackCurrent = undefined;
          break;
        }
      }

      if (fallbackCurrent !== undefined && typeof fallbackCurrent === 'string') {
        return formatTranslation(fallbackCurrent, params);
      }

      return formatTranslation(defaultValue || keyPath, params);
    },
    [currentTranslations]
  );

  const hasKey = useCallback(
    (keyPath: string): boolean => {
      if (!keyPath) return false;
      const parts = keyPath.split('.');
      let current: any = currentTranslations;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return false;
        }
      }
      return current !== undefined;
    },
    [currentTranslations]
  );

  const contextValue = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      t: currentTranslations,
      isRtl,
      dir,
      format: formatTranslation,
      tKey,
      hasKey,
      browserLanguage: browserLang,
      supportedLanguages: ALL_SUPPORTED_LANGUAGES,
      resetToBrowserLanguage,
    }),
    [
      language,
      handleSetLanguage,
      currentTranslations,
      isRtl,
      dir,
      tKey,
      hasKey,
      browserLang,
      resetToBrowserLanguage,
    ]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export const TranslationProvider = LanguageProvider;

/**
 * Hook to access current language state, translations, and helper functions.
 * Safe to use even outside a TranslationProvider (returns default fallback values).
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[i18n] useLanguage was used outside a TranslationProvider. Using fallback context.');
    }
    return defaultContextValue;
  }
  return context;
}

/**
 * Hook to access translations dictionary and localization helpers.
 * Safe to use even outside a TranslationProvider.
 */
export function useTranslation(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[i18n] useTranslation was used outside a TranslationProvider. Using fallback context.');
    }
    return defaultContextValue;
  }
  return context;
}

// In-memory cache for dynamic server-side text translations
const dynamicTranslationCache = new Map<string, string>();

/**
 * Translates arbitrary text (such as dynamic property descriptions or summaries)
 * using the server-side translation endpoint with caching.
 */
export async function translateText(
  text: string,
  targetLang: Language,
  sourceLang: string = 'auto'
): Promise<string> {
  if (!text || !text.trim()) return '';
  if (targetLang === 'EN' && sourceLang === 'en') return text;
  if (targetLang === 'FR' && sourceLang === 'fr') return text;

  const cacheKey = `${targetLang}:${text.slice(0, 100)}:${text.length}`;
  if (dynamicTranslationCache.has(cacheKey)) {
    return dynamicTranslationCache.get(cacheKey)!;
  }

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLang,
        sourceLang,
      }),
    });

    if (!res.ok) {
      throw new Error(`Translation failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.translatedText) {
      dynamicTranslationCache.set(cacheKey, data.translatedText);
      return data.translatedText;
    }
    return text;
  } catch (err) {
    console.warn('[i18n] Translate text fallback to original:', err);
    return text;
  }
}
