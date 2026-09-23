import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Heart,
  Menu,
  X,
  ChevronDown,
  Globe,
  Phone,
  ArrowRight,
  Mail,
  Calendar as CalendarIcon,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { Currency, Language } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { getTranslations } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';
import { RealtimeGoogleTranslate } from './RealtimeGoogleTranslate';

interface HeaderProps {
  currentCurrency: Currency;
  onCurrencyChange: (c: Currency) => void;
  currentLanguage: Language;
  onLanguageChange: (l: Language) => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAlert: () => void;
  onNavigateToSelection: () => void;
  onOpenGmail?: () => void;
  isGmailConnected?: boolean;
  onOpenCalendar?: () => void;
  isCalendarConnected?: boolean;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenOwnersManager?: () => void;
  onOpenOffMarket?: () => void;
  onOpenClientPortal?: () => void;
  comparisonCount?: number;
  onOpenComparison?: () => void;
  onOpenFinancialSuite?: () => void;
  userEmail?: string | null;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  onCurrencyChange,
  currentLanguage,
  onLanguageChange,
  savedCount,
  onOpenSaved,
  onOpenAlert,
  onNavigateToSelection,
  onOpenGmail,
  isGmailConnected,
  onOpenCalendar,
  isCalendarConnected,
  isAdmin,
  onOpenAdmin,
  onOpenOwnersManager,
  onOpenOffMarket,
  onOpenClientPortal,
  comparisonCount = 0,
  onOpenComparison,
  onOpenFinancialSuite,
  userEmail,
  onSignIn,
  onSignUp,
  onSignOut,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [buyDropdownOpen, setBuyDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currencies: { code: Currency; label: string; symbol: string }[] = [
    { code: 'EUR', label: 'EUR', symbol: '€' },
    { code: 'USD', label: 'USD', symbol: '$' },
    { code: 'GBP', label: 'GBP', symbol: '£' },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'EN', label: 'English', flag: '🇬🇧' },
    { code: 'FR', label: 'Français', flag: '🇫🇷' },
    { code: 'ES', label: 'Español', flag: '🇪🇸' },
    { code: 'PT', label: 'Português', flag: '🇵🇹' },
    { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
    { code: 'RU', label: 'Русский', flag: '🇷🇺' },
    { code: 'ZH', label: '中文 (简体)', flag: '🇨🇳' },
    { code: 'AR', label: 'العربية', flag: '🇦🇪' },
    { code: 'JA', label: '日本語', flag: '🇯🇵' },
    { code: 'NL', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'SV', label: 'Svenska', flag: '🇸🇪' },
    { code: 'KO', label: '한국어', flag: '🇰🇷' },
    { code: 'TR', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'PL', label: 'Polski', flag: '🇵🇱' },
    { code: 'EL', label: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'HI', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'HE', label: 'עברית', flag: '🇮🇱' },
    { code: 'DA', label: 'Dansk', flag: '🇩🇰' },
    { code: 'NO', label: 'Norsk', flag: '🇳🇴' },
    { code: 'FI', label: 'Suomi', flag: '🇫🇮' },
    { code: 'CS', label: 'Čeština', flag: '🇨🇿' },
    { code: 'TH', label: 'ไทย', flag: '🇹🇭' },
    { code: 'VI', label: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  const t = getTranslations(currentLanguage);

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 text-[#1d1d1b] border-b border-neutral-100'
          : 'bg-white py-4 text-[#1d1d1b] border-b border-neutral-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="/en/france/#selection-section"
            className="flex items-center select-none group"
            id="header-logo-link"
          >
            <CompanyLogo variant="compact" theme="light" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-[13px] tracking-wider uppercase font-medium">
            {/* Buy with mega dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setBuyDropdownOpen(true)}
              onMouseLeave={() => setBuyDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={onNavigateToSelection}
                className="flex items-center space-x-1.5 hover:text-black transition-colors py-2 text-[#1d1d1b]"
              >
                <span>{t.nav.buy}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {buyDropdownOpen && (
                <div className="absolute top-full left-0 w-72 bg-white shadow-xl border border-neutral-100 py-3 rounded-sm z-50">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-[10px] text-neutral-400 tracking-widest uppercase">
                      {t.nav.destinations}
                    </p>
                  </div>
                  <div className="py-1">
                    <a
                      href="#selection-section"
                      onClick={() => {
                        setBuyDropdownOpen(false);
                        onNavigateToSelection();
                      }}
                      className="block px-4 py-2 text-xs hover:bg-[#fae9e5]/40 text-[#1d1d1b] font-medium"
                    >
                      {t.nav.franceCurrent}
                    </a>
                    <a
                      href="#dream-destinations"
                      onClick={() => setBuyDropdownOpen(false)}
                      className="block px-4 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                    >
                      {t.nav.spain}
                    </a>
                    <a
                      href="#dream-destinations"
                      onClick={() => setBuyDropdownOpen(false)}
                      className="block px-4 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                    >
                      {t.nav.morocco}
                    </a>
                    <a
                      href="#dream-destinations"
                      onClick={() => setBuyDropdownOpen(false)}
                      className="block px-4 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                    >
                      {t.nav.mauritius}
                    </a>
                    <a
                      href="#dream-destinations"
                      onClick={() => setBuyDropdownOpen(false)}
                      className="block px-4 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                    >
                      {t.nav.unitedStates}
                    </a>
                  </div>
                  <div className="px-4 py-2 border-t border-b border-neutral-100 mt-1">
                    <p className="text-[10px] text-neutral-400 tracking-widest uppercase">
                      {t.nav.propertyTypes}
                    </p>
                  </div>
                  <div className="py-1">
                    <a
                      href="#selection-section"
                      onClick={() => {
                        setBuyDropdownOpen(false);
                        onNavigateToSelection();
                      }}
                      className="block px-4 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                    >
                      {t.nav.apartment}
                    </a>
                    <a
                      href="#selection-section"
                      onClick={() => {
                        setBuyDropdownOpen(false);
                        onNavigateToSelection();
                      }}
                      className="block px-4 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                    >
                      {t.nav.villa}
                    </a>
                    <a
                      href="#selection-section"
                      onClick={() => {
                        setBuyDropdownOpen(false);
                        onNavigateToSelection();
                      }}
                      className="block px-4 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                    >
                      {t.nav.hotelParticulier}
                    </a>
                    <a
                      href="#selection-section"
                      onClick={() => {
                        setBuyDropdownOpen(false);
                        onNavigateToSelection();
                      }}
                      className="block px-4 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                    >
                      {t.nav.castle}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#sell-section"
              className="hover:text-black transition-colors py-2 text-[#1d1d1b]"
            >
              {t.nav.sell}
            </a>

            <button
              type="button"
              onClick={() => {
                if (onOpenOffMarket) {
                  onOpenOffMarket();
                } else {
                  onNavigateToSelection();
                }
              }}
              className="hover:text-black transition-colors py-2 flex items-center space-x-1.5 text-[#1d1d1b] uppercase text-[13px] tracking-wider font-medium"
            >
              <span>{t.propertyCard.offMarket}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
            </button>

            <a
              href="#family-directory"
              className="hover:text-black transition-colors py-2 text-[#1d1d1b]"
            >
              The Family
            </a>

            {onOpenOwnersManager && (
              <button
                type="button"
                onClick={onOpenOwnersManager}
                className="hover:text-black transition-colors py-2 text-[#1d1d1b] uppercase text-[13px] tracking-wider font-medium cursor-pointer"
                title="Gérer les photos des propriétaires réels"
              >
                Propriétaires
              </button>
            )}

            <a
              href="#market-barometer"
              className="hover:text-black transition-colors py-2 text-[#1d1d1b]"
            >
              Barometer
            </a>

            {onOpenFinancialSuite && (
              <button
                type="button"
                onClick={onOpenFinancialSuite}
                className="hover:text-black transition-colors py-2 text-[#1d1d1b] uppercase text-[13px] tracking-wider font-medium"
              >
                Financial Suite
              </button>
            )}

            <a
              href="#market-editorial"
              className="hover:text-black transition-colors py-2 text-[#1d1d1b]"
            >
              {t.nav.agency}
            </a>

            <a
              href="#contact-footer"
              className="hover:text-black transition-colors py-2 text-[#1d1d1b]"
            >
              {t.nav.contact}
            </a>
          </nav>

          {/* Action Utilities Right */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Gmail Concierge Button */}
            {onOpenGmail && (
              <button
                id="header-gmail-btn"
                type="button"
                onClick={onOpenGmail}
                className={`inline-flex items-center space-x-1.5 text-[11px] uppercase tracking-wider font-semibold px-2.5 sm:px-3 py-1.5 rounded-sm border transition-all ${
                  isGmailConnected
                    ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100'
                    : 'border-neutral-200 hover:border-black hover:bg-neutral-50 text-[#1d1d1b]'
                }`}
                title="Gmail Concierge & Inquiries"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Gmail</span>
                {isGmailConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            )}

            {/* Google Calendar Concierge Button */}
            {onOpenCalendar && (
              <button
                id="header-calendar-btn"
                type="button"
                onClick={onOpenCalendar}
                className={`inline-flex items-center space-x-1.5 text-[11px] uppercase tracking-wider font-semibold px-2.5 sm:px-3 py-1.5 rounded-sm border transition-all ${
                  isCalendarConnected
                    ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100'
                    : 'border-neutral-200 hover:border-black hover:bg-neutral-50 text-[#1d1d1b]'
                }`}
                title="Google Calendar Viewing Schedule"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.nav.calendarSchedule || 'Calendar'}</span>
                {isCalendarConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            )}

            {/* Create Alert button */}
            <button
              id="header-create-alert-btn"
              type="button"
              onClick={onOpenAlert}
              className="hidden sm:inline-flex items-center space-x-1.5 text-[11px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-sm border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all text-[#1d1d1b]"
              title={t.selection.createAlert}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{t.selection.createAlert}</span>
            </button>

            {/* User Auth Action (Sign In & Sign Up Toggle) */}
            {userEmail ? (
              <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-neutral-600 pl-1 border-l border-neutral-200">
                <button
                  type="button"
                  onClick={onOpenClientPortal}
                  className="flex items-center space-x-1.5 px-2 py-1 bg-[#fae9e5]/40 hover:bg-[#fae9e5] border border-neutral-200 rounded-xs transition text-[#1d1d1b]"
                  title="Open Kretz VIP Client Portal"
                >
                  <User className="w-3.5 h-3.5 text-neutral-700" />
                  <span className="max-w-[100px] truncate font-mono text-[10px]">
                    {userEmail}
                  </span>
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="p-1 text-neutral-400 hover:text-black transition"
                    title={t.nav.signOut}
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden xl:flex items-center space-x-1 border-l border-neutral-200 pl-2">
                {onSignIn && (
                  <button
                    type="button"
                    id="header-signin-btn"
                    onClick={onSignIn}
                    className="inline-flex items-center space-x-1 text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 text-neutral-700 hover:text-black hover:bg-neutral-100/70 rounded-xs transition"
                    title={t.nav.signIn}
                  >
                    <LogIn className="w-3 h-3" />
                    <span>{t.nav.signIn}</span>
                  </button>
                )}
                {onSignUp && (
                  <button
                    type="button"
                    id="header-signup-btn"
                    onClick={onSignUp}
                    className="inline-flex items-center space-x-1 text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-[#1d1d1b] text-white hover:bg-black rounded-xs transition shadow-xs"
                    title={t.nav.signUp || 'Sign Up'}
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>{t.nav.signUp || 'Sign Up'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Currency Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCurrencyDropdownOpen(!currencyDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="text-[12px] font-medium tracking-wider uppercase px-2 py-1 hover:text-black flex items-center space-x-1 text-[#1d1d1b]"
              >
                <span>{currentCurrency}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-28 bg-white shadow-lg border border-neutral-100 py-1 rounded-sm z-50 text-xs">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onCurrencyChange(c.code);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-50 ${
                        currentCurrency === c.code ? 'font-bold bg-neutral-50 text-black' : 'text-neutral-600'
                      }`}
                    >
                      <span>{c.code}</span>
                      <span className="text-neutral-400">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Real-time Google Translator Engine */}
            <RealtimeGoogleTranslate
              variant="header"
              currentLanguage={currentLanguage}
              onLanguageChange={(codeUpper) => {
                const matchedLang = languages.find(
                  (l) => l.code.toUpperCase() === codeUpper.toUpperCase()
                );
                if (matchedLang) {
                  onLanguageChange(matchedLang.code as Language);
                }
              }}
            />

            {/* Favorites Heart */}
            <button
              type="button"
              onClick={onOpenSaved}
              className="relative p-1.5 hover:text-black transition-colors"
              title="Saved Properties"
              id="header-favorites-btn"
            >
              <Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-[#1d1d1b]' : ''}`} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1d1d1b] text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 hover:text-black text-[#1d1d1b]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-6 py-6 space-y-4 text-sm uppercase tracking-wider font-medium animate-fadeIn">
          <a
            href="#selection-section"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigateToSelection();
            }}
            className="block py-2 border-b border-neutral-100 text-[#1d1d1b]"
          >
            {t.nav.buy}
          </a>
          <a
            href="#sell-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-neutral-100 text-[#1d1d1b]"
          >
            {t.nav.sell}
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenOffMarket) {
                onOpenOffMarket();
              } else {
                onNavigateToSelection();
              }
            }}
            className="w-full text-left py-2 border-b border-neutral-100 text-[#1d1d1b] flex items-center justify-between uppercase text-sm tracking-wider font-medium"
          >
            <span>{t.propertyCard.offMarket} Vault</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
          </button>
          <a
            href="#family-directory"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-neutral-100 text-[#1d1d1b]"
          >
            The Family
          </a>
          <a
            href="#market-barometer"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-neutral-100 text-[#1d1d1b]"
          >
            Market Barometer
          </a>
          {onOpenFinancialSuite && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenFinancialSuite();
              }}
              className="w-full text-left py-2 border-b border-neutral-100 text-[#1d1d1b] flex items-center justify-between uppercase text-sm tracking-wider font-medium"
            >
              <span>Financial & Notary Suite</span>
              <Calculator className="w-4 h-4 text-neutral-400" />
            </button>
          )}
          <a
            href="#market-editorial"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-neutral-100 text-[#1d1d1b]"
          >
            {t.nav.agency}
          </a>
          <a
            href="#contact-footer"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-neutral-100 text-[#1d1d1b]"
          >
            {t.nav.contact}
          </a>

          {/* Mobile Real-time Google Translator */}
          <div className="py-3 border-b border-neutral-100">
            <RealtimeGoogleTranslate
              variant="mobile"
              currentLanguage={currentLanguage}
              onLanguageChange={(codeUpper) => {
                const matchedLang = languages.find(
                  (l) => l.code.toUpperCase() === codeUpper.toUpperCase()
                );
                if (matchedLang) {
                  onLanguageChange(matchedLang.code as Language);
                }
              }}
            />
          </div>

          <div className="pt-2 flex flex-col space-y-3">
            {onOpenGmail && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGmail();
                }}
                className={`w-full py-2.5 rounded-sm text-xs uppercase tracking-widest font-medium flex items-center justify-center space-x-2 border transition-colors ${
                  isGmailConnected
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-neutral-300 bg-neutral-50 text-[#1d1d1b]'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>{t.nav.gmailConcierge || 'Gmail Concierge'} {isGmailConnected ? '(Connected)' : ''}</span>
              </button>
            )}

            {onOpenCalendar && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCalendar();
                }}
                className={`w-full py-2.5 rounded-sm text-xs uppercase tracking-widest font-medium flex items-center justify-center space-x-2 border transition-colors ${
                  isCalendarConnected
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-neutral-300 bg-neutral-50 text-[#1d1d1b]'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>{t.nav.calendarSchedule || 'Google Calendar'} {isCalendarConnected ? '(Connected)' : ''}</span>
              </button>
            )}

            {/* Mobile Auth Toggle: Sign In / Sign Up */}
            {userEmail ? (
              <div className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-sm border border-neutral-200">
                <span className="text-xs font-mono truncate text-neutral-600">
                  {userEmail}
                </span>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="text-xs uppercase font-semibold text-neutral-800 hover:text-black flex items-center space-x-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.nav.signOut}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {onSignIn && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignIn();
                    }}
                    className="py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center justify-center space-x-1.5 border border-neutral-300 bg-white text-[#1d1d1b] hover:bg-neutral-50"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t.nav.signIn}</span>
                  </button>
                )}
                {onSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignUp();
                    }}
                    className="py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center justify-center space-x-1.5 bg-[#1d1d1b] text-white hover:bg-black"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t.nav.signUp || 'Sign Up'}</span>
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAlert();
              }}
              className="w-full text-center py-2.5 bg-[#1d1d1b] text-white rounded-sm text-xs uppercase tracking-widest font-medium"
            >
              {t.selection.createAlert}
            </button>
            <div className="text-center text-xs text-neutral-500 py-1 flex items-center justify-center space-x-1.5">
              <Phone className="w-3.5 h-3.5" />
              <a href="tel:+33753077572" className="hover:underline font-mono">
                +33 (0)7 53 07 75 72
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
