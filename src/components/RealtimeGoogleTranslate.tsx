import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Globe, ChevronDown, Check, Search, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GOOGLE_LANGUAGES,
  GoogleLanguage,
  getStoredGoogleTranslateLanguage,
  applyGoogleTranslateCode,
  resetToOriginalLanguage,
  initGoogleTranslateScript,
} from '../services/googleTranslator';

interface RealtimeGoogleTranslateProps {
  variant?: 'header' | 'mobile' | 'floating';
  currentLanguage?: string;
  onLanguageChange?: (langCode: string) => void;
  className?: string;
}

export const RealtimeGoogleTranslate: React.FC<RealtimeGoogleTranslateProps> = ({
  variant = 'header',
  currentLanguage,
  onLanguageChange,
  className = '',
}) => {
  const [currentCode, setCurrentCode] = useState<string>(() => {
    if (currentLanguage) return currentLanguage.toLowerCase();
    return getStoredGoogleTranslateLanguage();
  });
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync when parent language changes
  useEffect(() => {
    if (currentLanguage) {
      const codeLower = currentLanguage.toLowerCase();
      // Handle special zh cases if needed
      const matched = GOOGLE_LANGUAGES.find(
        (l) => l.code.toLowerCase() === codeLower || l.codeUpper.toLowerCase() === codeLower
      );
      if (matched && matched.code !== currentCode) {
        setCurrentCode(matched.code);
      }
    }
  }, [currentLanguage]);

  // Initialize script on mount
  useEffect(() => {
    initGoogleTranslateScript();

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ code: string }>;
      if (customEvent.detail && customEvent.detail.code) {
        setCurrentCode(customEvent.detail.code);
      }
    };

    window.addEventListener('kretz-google-translate-change', handleCustomChange);
    return () => {
      window.removeEventListener('kretz-google-translate-change', handleCustomChange);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentLangObj = useMemo(() => {
    return (
      GOOGLE_LANGUAGES.find((l) => l.code.toLowerCase() === currentCode.toLowerCase()) ||
      GOOGLE_LANGUAGES[0]
    );
  }, [currentCode]);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return GOOGLE_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return GOOGLE_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.codeUpper.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectLanguage = (lang: GoogleLanguage) => {
    setCurrentCode(lang.code);
    applyGoogleTranslateCode(lang.code);
    if (onLanguageChange) {
      onLanguageChange(lang.codeUpper);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleReset = () => {
    setCurrentCode('fr');
    resetToOriginalLanguage();
    if (onLanguageChange) {
      onLanguageChange('FR');
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  if (variant === 'mobile') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between text-xs text-neutral-500 uppercase tracking-widest font-mono">
          <span className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>Traduction Google en direct</span>
          </span>
          {currentCode !== 'fr' && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] text-amber-600 hover:text-black flex items-center space-x-1 uppercase font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Original (FR)</span>
            </button>
          )}
        </div>

        {/* Quick buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {GOOGLE_LANGUAGES.slice(0, 8).map((l) => {
            const isSelected = currentCode.toLowerCase() === l.code.toLowerCase();
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => handleSelectLanguage(l)}
                className={`py-2 px-1 text-center rounded text-xs transition border flex flex-col items-center justify-center space-y-0.5 ${
                  isSelected
                    ? 'bg-[#1d1d1b] text-white border-[#1d1d1b] font-bold shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
              >
                <span className="text-sm leading-none">{l.flag}</span>
                <span className="text-[10px] font-mono uppercase">{l.codeUpper}</span>
              </button>
            );
          })}
        </div>

        {/* More languages select */}
        <div className="relative">
          <select
            value={currentCode}
            onChange={(e) => {
              const found = GOOGLE_LANGUAGES.find((l) => l.code === e.target.value);
              if (found) handleSelectLanguage(found);
            }}
            className="w-full bg-white border border-neutral-200 rounded px-3 py-2 text-xs text-[#1d1d1b] font-medium focus:outline-none focus:border-black appearance-none"
          >
            {GOOGLE_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
        </div>
      </div>
    );
  }

  // Header desktop view
  return (
    <div className={`relative flex items-center ${className}`} ref={dropdownRef} id="header-google-translate">
      {/* Luxury Segmented Pill Switcher */}
      <div className="flex items-center bg-[#f7f6f4] p-0.5 rounded-full border border-neutral-200/80 shadow-2xs">
        {/* FR Pill */}
        <button
          type="button"
          onClick={() => {
            const frLang = GOOGLE_LANGUAGES.find((l) => l.code === 'fr') || GOOGLE_LANGUAGES[0];
            handleSelectLanguage(frLang);
          }}
          className={`relative px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase transition-colors duration-200 rounded-full select-none ${
            currentCode === 'fr' ? 'text-[#1d1d1b]' : 'text-neutral-400 hover:text-neutral-800'
          }`}
          aria-label="Traduire en Français"
        >
          {currentCode === 'fr' && (
            <motion.div
              layoutId="gt-active-pill"
              className="absolute inset-0 bg-white rounded-full shadow-xs border border-neutral-200/90"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <span className="relative z-10 inline-flex items-center space-x-1">
            <span>FR</span>
          </span>
        </button>

        {/* EN Pill */}
        <button
          type="button"
          onClick={() => {
            const enLang = GOOGLE_LANGUAGES.find((l) => l.code === 'en') || GOOGLE_LANGUAGES[1];
            handleSelectLanguage(enLang);
          }}
          className={`relative px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase transition-colors duration-200 rounded-full select-none ${
            currentCode === 'en' ? 'text-[#1d1d1b]' : 'text-neutral-400 hover:text-neutral-800'
          }`}
          aria-label="Translate to English"
        >
          {currentCode === 'en' && (
            <motion.div
              layoutId="gt-active-pill"
              className="absolute inset-0 bg-white rounded-full shadow-xs border border-neutral-200/90"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <span className="relative z-10 inline-flex items-center space-x-1">
            <span>EN</span>
          </span>
        </button>

        {/* Active badge if another custom language is chosen */}
        {!['fr', 'en'].includes(currentCode.toLowerCase()) && (
          <div className="relative px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full select-none text-[#1d1d1b]">
            <motion.div
              layoutId="gt-active-pill"
              className="absolute inset-0 bg-white rounded-full shadow-xs border border-neutral-200/90"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
            <span className="relative z-10 inline-flex items-center space-x-1 font-bold">
              <span>{currentLangObj.flag}</span>
              <span>{currentLangObj.codeUpper}</span>
            </span>
          </div>
        )}

        {/* Open full 100+ languages modal / dropdown */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative z-10 pl-1.5 pr-2 py-1 text-neutral-400 hover:text-black transition-colors rounded-full flex items-center space-x-1 ${
            isOpen ? 'text-black' : ''
          }`}
          title="Google Translate (100+ langues en temps réel)"
          aria-label="Ouvrir le traducteur Google en temps réel"
          id="gt-dropdown-toggle-btn"
        >
          <Globe className="w-3.5 h-3.5" />
          <ChevronDown
            className={`w-2.5 h-2.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-black' : 'opacity-60'
            }`}
          />
        </button>
      </div>

      {/* Floating Searchable Luxury Google Translate Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-72 bg-white shadow-2xl border border-neutral-200 rounded-sm z-50 text-xs overflow-hidden"
          >
            {/* Header with Google live badge */}
            <div className="p-3 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Google Traduction Directe
                </span>
              </div>
              {currentCode !== 'fr' && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[10px] text-amber-300 hover:text-white inline-flex items-center space-x-1 uppercase tracking-wider font-mono transition"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            {/* Live Search Input */}
            <div className="p-2 border-b border-neutral-100 bg-neutral-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher une langue / Search language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-black font-light"
                />
              </div>
            </div>

            {/* Quick Global Markets list */}
            <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
              {filteredLanguages.length === 0 ? (
                <div className="py-6 text-center text-neutral-400 text-xs font-light">
                  Aucune langue trouvée pour "{searchQuery}"
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = currentCode.toLowerCase() === lang.code.toLowerCase();
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors hover:bg-[#fae9e5]/30 ${
                        isSelected ? 'bg-[#fae9e5]/20 font-semibold text-black' : 'text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <div>
                          <div className="text-xs font-medium text-[#1d1d1b] flex items-center space-x-1.5">
                            <span>{lang.name}</span>
                            {lang.rtl && (
                              <span className="text-[9px] px-1 bg-neutral-100 text-neutral-500 rounded uppercase font-mono">
                                RTL
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-light">{lang.nativeName}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono uppercase text-neutral-400">
                          {lang.codeUpper}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom footnote */}
            <div className="px-3 py-2 bg-neutral-50 border-t border-neutral-100 text-[10px] text-neutral-400 font-light flex items-center justify-between">
              <span>Traduction dynamique en temps réel</span>
              <span className="font-mono text-[9px] text-neutral-500">{filteredLanguages.length} langues</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
