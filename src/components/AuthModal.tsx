import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  googleSignIn,
  googleSignInRedirect,
  emailSignIn,
  emailSignUp,
  sendResetPassword,
  parseAuthError,
} from '../services/firebaseAuth';
import { CompanyLogo } from './CompanyLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onAuthSuccess?: (email: string) => void;
  onOpenLegal?: (type: 'privacy' | 'terms') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onAuthSuccess,
  onOpenLegal,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  // Sync mode with initialMode when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsResetMode(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsResetMode(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn({ withCalendarScopes: false, useRedirectOnBlocked: false });
      if (res?.user) {
        if (onAuthSuccess) onAuthSuccess(res.user.email || '');
        handleClose();
      }
    } catch (err: any) {
      if (
        err?.code !== 'auth/cancelled-popup-request' &&
        err?.code !== 'auth/popup-closed-by-user'
      ) {
        const parsed = parseAuthError(err);
        setErrorMessage(parsed.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Reset password mode
    if (isResetMode) {
      if (!email.trim()) {
        setErrorMessage('Please enter your email address to receive reset instructions.');
        return;
      }
      setLoading(true);
      try {
        await sendResetPassword(email);
        setSuccessMessage(`Password reset link dispatched to ${email.trim()}. Check your inbox.`);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to dispatch reset email. Ensure the address is correct.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Validation
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await emailSignUp(email, password, name);
        setSuccessMessage(`Welcome to Kretz Private Office, ${name || user.email}!`);
        if (onAuthSuccess) onAuthSuccess(user.email || '');
        setTimeout(() => {
          handleClose();
        }, 900);
      } else {
        const user = await emailSignIn(email, password);
        setSuccessMessage(`Welcome back, ${user.displayName || user.email}!`);
        if (onAuthSuccess) onAuthSuccess(user.email || '');
        setTimeout(() => {
          handleClose();
        }, 600);
      }
    } catch (err: any) {
      const code = err?.code || '';
      let msg = err?.message || 'Authentication failed. Please verify credentials.';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. If you do not have an account, please switch to Sign Up.';
      } else if (code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please switch to Sign In.';
      } else if (code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address format.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
      id="auth-modal-overlay"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-sm shadow-2xl border border-neutral-200 overflow-hidden"
        id="auth-modal-container"
      >
        {/* Top subtle bar */}
        <div className="h-1 bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition"
          aria-label="Close"
          id="auth-modal-close-btn"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header & Brand */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center mb-1">
              <CompanyLogo variant="compact" theme="light" />
            </div>
            <p className="text-[11px] font-mono tracking-widest uppercase text-neutral-400">
              Private Client Office
            </p>
            <h2 className="text-xl font-serif-luxury text-[#1d1d1b]">
              {isResetMode
                ? 'Reset Password'
                : mode === 'signin'
                ? 'Sign In to Your Account'
                : 'Create Private Client Account'}
            </h2>
            <p className="text-xs text-neutral-500 font-light">
              {isResetMode
                ? 'Enter your registered email to receive recovery instructions.'
                : mode === 'signin'
                ? 'Access your saved luxury residences, mandate alerts, and private concierge.'
                : 'Register to unlock exclusive off-market properties and portfolio alerts.'}
            </p>
          </div>

          {/* SIGN IN / SIGN UP SEGMENTED TOGGLE (Only when not in reset password mode) */}
          {!isResetMode && (
            <div
              className="flex rounded-sm bg-neutral-100 p-1 mb-6 border border-neutral-200"
              id="auth-mode-toggle"
            >
              <button
                type="button"
                id="toggle-signin-tab"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs uppercase tracking-wider font-semibold rounded-xs transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-[#1d1d1b] shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                id="toggle-signup-tab"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs uppercase tracking-wider font-semibold rounded-xs transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-[#1d1d1b] shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Google Single Sign-On Button */}
          {!isResetMode && (
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                id="auth-google-btn"
                className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 border border-neutral-300 rounded-sm hover:border-black hover:bg-neutral-50 transition text-xs font-semibold text-[#1d1d1b] disabled:opacity-50"
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
                <span>
                  {mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                  <span className="bg-white px-2">or with company / personal email</span>
                </div>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div
              id="auth-error-banner"
              className="mb-4 p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div
              id="auth-success-banner"
              className="mb-4 p-3 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5" id="auth-form">
            {/* Full Name field (Sign up only) */}
            {mode === 'signup' && !isResetMode && (
              <div>
                <label
                  htmlFor="auth-fullname-input"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-700 mb-1"
                >
                  Full Name / Title
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="auth-fullname-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lord Alexander Sinclair"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900 transition"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label
                htmlFor="auth-email-input"
                className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. client@kretz.site or name@domain.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900 transition font-mono text-[12px]"
                />
              </div>
            </div>

            {/* Password (when not in reset mode) */}
            {!isResetMode && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="auth-password-input"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-700"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(true);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-neutral-500 hover:text-black hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Sign up only) */}
            {mode === 'signup' && !isResetMode && (
              <div>
                <label
                  htmlFor="auth-confirm-password-input"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="auth-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-neutral-900 transition"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="auth-submit-btn"
                disabled={loading}
                className="w-full py-2.5 bg-[#1d1d1b] text-white rounded-sm text-xs font-semibold uppercase tracking-widest hover:bg-black transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {isResetMode
                        ? 'Dispatch Reset Link'
                        : mode === 'signin'
                        ? 'Sign In to Account'
                        : 'Complete Registration'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Switcher / Reset cancel */}
          <div className="mt-5 text-center text-xs text-neutral-500 font-light pt-4 border-t border-neutral-100">
            {isResetMode ? (
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-medium text-[#1d1d1b] hover:underline"
              >
                ← Back to Sign In
              </button>
            ) : mode === 'signin' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-[#1d1d1b] hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-[#1d1d1b] hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}

            {/* Legal Links required for Google Verification */}
            <div className="mt-3 pt-2 text-[10px] text-neutral-400 text-center space-x-2">
              <button
                type="button"
                onClick={() => onOpenLegal ? onOpenLegal('privacy') : undefined}
                className="hover:underline hover:text-neutral-600"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onOpenLegal ? onOpenLegal('terms') : undefined}
                className="hover:underline hover:text-neutral-600"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
