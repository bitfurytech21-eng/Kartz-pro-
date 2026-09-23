import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Mail,
  Bell,
  Users,
  UserCheck,
  Camera,
  LogOut,
  AlertTriangle,
  Key,
} from 'lucide-react';
import { Property } from '../types';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  emailSignIn,
  logout,
  isUserAdmin,
  ADMIN_EMAILS,
} from '../services/firebaseAuth';
import { AdminPortalModal } from './AdminPortalModal';
import { CompanyLogo } from './CompanyLogo';

interface AdminRouteViewProps {
  currentUser: User | null;
  isAdmin: boolean;
  properties: Property[];
  onSelectProperty?: (property: Property) => void;
  onExitAdmin: () => void;
  initialTab?: 'inquiries' | 'alerts' | 'clients' | 'owners' | 'family';
}

export const AdminRouteView: React.FC<AdminRouteViewProps> = ({
  currentUser,
  isAdmin: initialIsAdmin,
  properties,
  onSelectProperty,
  onExitAdmin,
  initialTab = 'inquiries',
}) => {
  const [activeTab, setActiveTab] = useState<'inquiries' | 'alerts' | 'clients' | 'owners' | 'family'>(initialTab);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local admin bypass session flag
  const [hasMasterSession, setHasMasterSession] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('kretz_admin_session_auth') === 'true';
    } catch {
      return false;
    }
  });

  const effectiveIsAdmin = initialIsAdmin || hasMasterSession;

  // Master passcodes
  const MASTER_PASSCODES = ['KRETZ2026', 'kretz2026', 'KRETZ', 'kretz', 'ADMIN2026', 'admin'];

  const handleMasterPasscodeUnlock = (codeToVerify?: string) => {
    const targetCode = (codeToVerify !== undefined ? codeToVerify : passcodeInput).trim();
    if (MASTER_PASSCODES.includes(targetCode)) {
      setHasMasterSession(true);
      try {
        sessionStorage.setItem('kretz_admin_session_auth', 'true');
      } catch {}
      setAuthError(null);
    } else {
      setAuthError('Code d\'accès administrateur incorrect. Veuillez utiliser le code maître : KRETZ2026');
    }
  };

  // Sync sub-tab with hash routing e.g. #/admin/owners
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('owners') || hash.includes('proprietaires')) {
        setActiveTab('owners');
      } else if (hash.includes('alert')) {
        setActiveTab('alerts');
      } else if (hash.includes('client')) {
        setActiveTab('clients');
      } else if (hash.includes('family') || hash.includes('presse')) {
        setActiveTab('family');
      } else if (hash.includes('inquir') || hash.includes('lead')) {
        setActiveTab('inquiries');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab: 'inquiries' | 'alerts' | 'clients' | 'owners' | 'family') => {
    setActiveTab(tab);
    window.location.hash = `/admin/${tab}`;
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const result = await googleSignIn();
      if (result && result.user) {
        if (!isUserAdmin(result.user)) {
          setAuthError(`Le compte ${result.user.email} n'est pas autorisé à administrer la console.`);
        }
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(err?.message || 'Erreur d\'authentification Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError('Veuillez renseigner votre email et mot de passe administrateur.');
      return;
    }

    setAuthError(null);
    setIsSubmitting(true);
    try {
      const user = await emailSignIn(emailInput.trim(), passwordInput);
      if (!isUserAdmin(user)) {
        setAuthError(`Le compte ${user.email} n'est pas autorisé sur cette console.`);
      }
    } catch (err: any) {
      // Check if they entered the master passcode as password
      if (MASTER_PASSCODES.includes(passwordInput.trim())) {
        handleMasterPasscodeUnlock(passwordInput.trim());
        return;
      }
      setAuthError(err?.message || 'Identifiants administrateur invalides.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOutAdmin = async () => {
    try {
      sessionStorage.removeItem('kretz_admin_session_auth');
      setHasMasterSession(false);
      await logout();
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Guard Gate: Unauthenticated or Non-Admin User (unless unlocked with Master Passcode)
  if (!effectiveIsAdmin) {
    return (
      <div className="min-h-screen bg-[#0d0d0c] text-neutral-100 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
        {/* Top Minimal Navigation Bar */}
        <header className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CompanyLogo variant="compact" theme="dark" />
            <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase border-l border-neutral-700 pl-3">
              Private Console Gateway
            </span>
          </div>
          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white uppercase tracking-wider font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au Portefeuille Public</span>
          </button>
        </header>

        {/* Security Login Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-[#161615] border border-neutral-800 p-6 sm:p-8 rounded shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 mx-auto flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 bg-neutral-800 text-neutral-300 text-[10px] font-mono tracking-widest uppercase rounded">
                RESTRICTED ROUTE • #/ADMIN
              </span>
              <h1 className="font-serif text-2xl font-light tracking-wide text-white">
                Console d'Administration Kretz
              </h1>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Cette interface confidentielle permet la gestion du CRM, des mandats, des alertes acquéreurs et des photos des propriétaires.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-rose-900/20 border border-rose-700/50 text-rose-300 text-xs rounded">
                {authError}
              </div>
            )}

            {/* Direct Master Passcode / 1-Click Access Card */}
            <div className="p-4 bg-amber-400/5 border border-amber-400/30 rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5" />
                  <span>Code Maître Administrateur</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Passcode: <code className="text-amber-300 font-bold bg-neutral-900 px-1.5 py-0.5 rounded">KRETZ2026</code></span>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Entrez KRETZ2026"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleMasterPasscodeUnlock();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleMasterPasscodeUnlock()}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer"
                >
                  Entrer
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleMasterPasscodeUnlock('KRETZ2026')}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-amber-400/50 text-amber-300 hover:text-amber-200 text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition rounded cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>1-Clic : Déverrouiller en tant qu'Administrateur</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-neutral-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-neutral-500">ou via Google / Email</span>
              <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            {/* Google SSO Login */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-100 text-[#1d1d1b] text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition rounded shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Connexion avec Google</span>
              </button>

              {/* Email / Password fallback */}
              <form onSubmit={handleEmailPasswordLogin} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                    Email Manager
                  </label>
                  <input
                    type="email"
                    placeholder="bitfurytech21@gmail.com ou info@kretz.site"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Se connecter</span>
                </button>
              </form>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onExitAdmin}
                className="text-xs text-neutral-500 hover:text-neutral-300 underline transition cursor-pointer"
              >
                ← Quitter et revenir au site
              </button>
            </div>
          </div>
        </main>

        <footer className="px-6 py-3 border-t border-neutral-800 text-center text-[10px] text-neutral-600 font-mono">
          KRETZ REAL ESTATE PRIVATE SERVER • ROUTE PROTÉGÉE PAR PASSCODE MAÎTRE & FIRESTORE
        </footer>
      </div>
    );
  }

  // 2. Authenticated Admin View: Full Page Console
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col selection:bg-amber-400 selection:text-black text-[#1d1d1b]">
      {/* Top Console Navigation Bar */}
      <header className="bg-[#121212] text-white px-4 sm:px-8 py-3.5 border-b border-neutral-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-4">
          <CompanyLogo variant="compact" theme="dark" />
          <div className="hidden sm:flex items-center space-x-2 border-l border-neutral-700 pl-4">
            <span className="px-2 py-0.5 bg-amber-400 text-black text-[10px] font-bold tracking-widest uppercase rounded-xs">
              ADMIN ROUTE
            </span>
            <span className="text-xs text-neutral-300 font-light">
              Console & Base de Données
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-xs text-neutral-400 bg-neutral-800/80 px-3 py-1.5 rounded border border-neutral-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] text-neutral-200">{currentUser?.email}</span>
          </div>

          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold uppercase tracking-wider rounded transition cursor-pointer"
            title="Revenir à la vitrine publique"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Vitrine Publique</span>
          </button>

          <button
            type="button"
            onClick={handleSignOutAdmin}
            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Embedded Admin Portal Component with Tab Navigation */}
      <div className="flex-1 flex flex-col">
        <AdminPortalModal
          isOpen={true}
          onClose={onExitAdmin}
          adminEmail={currentUser?.email || 'bitfurytech21@gmail.com'}
          properties={properties}
          initialTab={activeTab}
          onSelectProperty={onSelectProperty}
        />
      </div>
    </div>
  );
};
