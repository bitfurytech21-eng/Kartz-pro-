import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

export const translations: Record<Language, Translations> = {
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

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.EN;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRtl?: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'EN',
  setLanguage: () => {},
  t: en,
  isRtl: false,
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLanguage?: Language;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}> = ({ children, initialLanguage, language: propLanguage, onLanguageChange }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (propLanguage && ALL_SUPPORTED_LANGUAGES.includes(propLanguage)) return propLanguage;
    if (initialLanguage && ALL_SUPPORTED_LANGUAGES.includes(initialLanguage)) return initialLanguage;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kretz_language') as Language | null;
      if (saved && ALL_SUPPORTED_LANGUAGES.includes(saved)) {
        return saved;
      }
    }
    return 'EN';
  });

  // Keep state synced with propLanguage if passed
  useEffect(() => {
    if (propLanguage && propLanguage !== language && ALL_SUPPORTED_LANGUAGES.includes(propLanguage)) {
      setLanguageState(propLanguage);
    }
  }, [propLanguage]);

  const handleSetLanguage = (lang: Language) => {
    if (!ALL_SUPPORTED_LANGUAGES.includes(lang)) return;
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kretz_language', lang);
      document.documentElement.lang = lang.toLowerCase();
      // Handle RTL for Arabic and Hebrew
      if (lang === 'AR' || lang === 'HE') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  useEffect(() => {
    if (initialLanguage && initialLanguage !== language && ALL_SUPPORTED_LANGUAGES.includes(initialLanguage)) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language.toLowerCase();
      if (language === 'AR' || language === 'HE') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  }, [language]);

  const currentTranslations = useMemo(() => {
    return getTranslations(language);
  }, [language]);

  const isRtl = language === 'AR' || language === 'HE';

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      t: currentTranslations,
      isRtl,
    }),
    [language, currentTranslations, isRtl]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const TranslationProvider = LanguageProvider;

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}

export function useTranslation(): LanguageContextType {
  return useContext(LanguageContext);
}

// In-memory cache for dynamic text translations
const translationCache = new Map<string, string>();

/**
 * Translates arbitrary text (such as property descriptions or summaries)
 * using the server-side Gemini translation endpoint with caching.
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
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
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
      translationCache.set(cacheKey, data.translatedText);
      return data.translatedText;
    }
    return text;
  } catch (err) {
    console.warn('Translate text fallback to original:', err);
    return text;
  }
}
