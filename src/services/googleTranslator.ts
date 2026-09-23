// Real-time Google Translate Service for Kretz Luxury Real Estate

export interface GoogleLanguage {
  code: string; // Google Translate code e.g. 'en', 'fr', 'es', 'zh-CN'
  codeUpper: string; // Display 2-letter uppercase e.g. 'EN', 'FR', 'ES'
  name: string; // English Name
  nativeName: string; // Native Language Name
  flag: string; // Flag Emoji
  rtl?: boolean;
}

export const GOOGLE_LANGUAGES: GoogleLanguage[] = [
  // Primary Luxury Markets
  { code: 'fr', codeUpper: 'FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', codeUpper: 'EN', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', codeUpper: 'ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', codeUpper: 'IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'de', codeUpper: 'DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', codeUpper: 'PT', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', codeUpper: 'RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', codeUpper: 'ZH', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', codeUpper: 'TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ar', codeUpper: 'AR', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', rtl: true },
  { code: 'ja', codeUpper: 'JA', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', codeUpper: 'KO', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'nl', codeUpper: 'NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', codeUpper: 'SV', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', codeUpper: 'NO', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', codeUpper: 'DA', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', codeUpper: 'FI', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'el', codeUpper: 'EL', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'tr', codeUpper: 'TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', codeUpper: 'PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'cs', codeUpper: 'CS', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', codeUpper: 'HU', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'he', codeUpper: 'HE', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'hi', codeUpper: 'HI', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', codeUpper: 'TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', codeUpper: 'VI', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', codeUpper: 'ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', codeUpper: 'MS', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'ro', codeUpper: 'RO', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'uk', codeUpper: 'UK', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'bg', codeUpper: 'BG', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'hr', codeUpper: 'HR', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sk', codeUpper: 'SK', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', codeUpper: 'SL', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', codeUpper: 'ET', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', codeUpper: 'LV', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', codeUpper: 'LT', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: 'fa', codeUpper: 'FA', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'ur', codeUpper: 'UR', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'bn', codeUpper: 'BN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', codeUpper: 'TA', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', codeUpper: 'TE', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'tl', codeUpper: 'TL', name: 'Filipino / Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' },
  { code: 'sw', codeUpper: 'SW', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'af', codeUpper: 'AF', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'is', codeUpper: 'IS', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' },
];

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
    __kretz_gt_initialized?: boolean;
  }
}

const STORAGE_KEY = 'kretz_google_translate_lang';

export function getStoredGoogleTranslateLanguage(): string {
  if (typeof window === 'undefined') return 'fr';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    // Check cookie googtrans
    const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch {}
  return 'fr';
}

export function initGoogleTranslateScript(): void {
  if (typeof window === 'undefined') return;

  if (window.__kretz_gt_initialized || document.getElementById('google-translate-script')) {
    return;
  }

  // Define global callback before loading script
  window.googleTranslateElementInit = function () {
    try {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            autoDisplay: false,
            includedLanguages: GOOGLE_LANGUAGES.map((l) => l.code).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
        window.__kretz_gt_initialized = true;

        // Auto apply saved language if not French
        const savedLang = getStoredGoogleTranslateLanguage();
        if (savedLang && savedLang !== 'fr') {
          setTimeout(() => {
            applyGoogleTranslateCode(savedLang);
          }, 300);
        }
      }
    } catch (e) {
      console.warn('Google Translate initialization notice:', e);
    }
  };

  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.onerror = () => {
    console.warn('Google Translate remote script blocked or offline, relying on built-in multilingual engine.');
  };
  document.head.appendChild(script);
}

function setGoogleTranslateCookie(langCode: string) {
  const domain = window.location.hostname;
  const cookieValueFr = langCode === 'fr' ? '/fr/fr' : `/fr/${langCode}`;
  const cookieValueAuto = langCode === 'fr' ? '/auto/fr' : `/auto/${langCode}`;
  const expires = 'Fri, 31 Dec 2030 23:59:59 GMT';

  document.cookie = `googtrans=${cookieValueFr}; path=/; expires=${expires};`;
  document.cookie = `googtrans=${cookieValueAuto}; path=/; expires=${expires};`;
  
  if (domain.includes('.')) {
    document.cookie = `googtrans=${cookieValueFr}; path=/; domain=.${domain}; expires=${expires};`;
    document.cookie = `googtrans=${cookieValueAuto}; path=/; domain=.${domain}; expires=${expires};`;
  }
}

export function applyGoogleTranslateCode(langCode: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(STORAGE_KEY, langCode);
  } catch {}

  setGoogleTranslateCookie(langCode);

  // Dispatch custom event for React components
  window.dispatchEvent(
    new CustomEvent('kretz-google-translate-change', {
      detail: { code: langCode },
    })
  );

  // Attempt DOM select manipulation
  const triggerSelect = (select: HTMLSelectElement) => {
    select.value = langCode;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    // Also trigger input event for full coverage
    select.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (select) {
    triggerSelect(select);
    return true;
  }

  // If select element isn't attached yet, retry with backoff
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const retrySelect = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (retrySelect) {
      triggerSelect(retrySelect);
      clearInterval(interval);
    }
    if (attempts > 15) {
      clearInterval(interval);
    }
  }, 150);

  return false;
}

export function resetToOriginalLanguage(): void {
  applyGoogleTranslateCode('fr');
}
