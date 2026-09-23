import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { app, auth, db } from '../lib/firebase';

export { app, auth, db };

// All requested Google Calendar scopes
export const CALENDAR_SCOPES: string[] = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

export const WORKSPACE_SCOPES: string[] = [
  ...CALENDAR_SCOPES,
];

// Clean Google Auth provider with standard profile & email scopes
const generalProvider = new GoogleAuthProvider();
generalProvider.setCustomParameters({
  prompt: 'select_account',
});

// Dedicated Google Auth provider with Google Calendar scopes
const calendarProvider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach((scope) => {
  calendarProvider.addScope(scope);
});
calendarProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token management as strictly required by Workspace Integration skill
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

export interface AuthErrorInfo {
  code: string;
  title: string;
  message: string;
  isPopupBlocked: boolean;
  isUnauthorizedDomain: boolean;
  isOperationNotAllowed: boolean;
  domain?: string;
}

export const parseAuthError = (error: any): AuthErrorInfo => {
  const code = error?.code || '';
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  if (code === 'auth/popup-blocked') {
    return {
      code,
      title: 'Popup Blocked by Browser',
      message: 'The sign-in popup was blocked. You can use redirect authentication or schedule your appointment directly below.',
      isPopupBlocked: true,
      isUnauthorizedDomain: false,
      isOperationNotAllowed: false,
    };
  }

  if (code === 'auth/unauthorized-domain') {
    return {
      code,
      title: 'Domain Authorization Notice',
      message: `The domain "${currentHost}" is not listed in the Firebase authorized domains. You can schedule directly with our concierge below, or add "${currentHost}" in Firebase Console → Authentication → Settings → Authorized Domains.`,
      isPopupBlocked: false,
      isUnauthorizedDomain: true,
      isOperationNotAllowed: false,
      domain: currentHost,
    };
  }

  if (code === 'auth/operation-not-allowed') {
    return {
      code,
      title: 'Google Sign-In Disabled',
      message: 'Google Sign-in is currently not enabled in Firebase Console. Please enable the Google provider in Firebase Authentication → Sign-in method, or schedule directly below.',
      isPopupBlocked: false,
      isUnauthorizedDomain: false,
      isOperationNotAllowed: true,
    };
  }

  return {
    code,
    title: 'Google Authentication Notice',
    message: error?.message || 'Google authentication could not be completed. Please try again or use direct scheduling.',
    isPopupBlocked: false,
    isUnauthorizedDomain: false,
    isOperationNotAllowed: false,
  };
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Check for redirect result from signInWithRedirect
  if (typeof window !== 'undefined') {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          cachedAccessToken = credential?.accessToken || null;
          currentUser = result.user;
          if (onAuthSuccess && cachedAccessToken) {
            onAuthSuccess(result.user, cachedAccessToken);
          }
        }
      })
      .catch((err) => {
        console.warn('Redirect sign-in check notification:', err);
      });
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token must be refreshed via sign-in popup if expired or memory lost
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (options?: {
  withCalendarScopes?: boolean;
  useRedirectOnBlocked?: boolean;
}): Promise<{ user: User; accessToken: string } | null> => {
  const selectedProvider = options?.withCalendarScopes ? calendarProvider : generalProvider;
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, selectedProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    currentUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (error: any) {
    const errorCode = error?.code || '';
    if (
      errorCode === 'auth/cancelled-popup-request' ||
      errorCode === 'auth/popup-closed-by-user'
    ) {
      console.warn('Google sign-in popup closed or cancelled by user.');
      return null;
    }

    if (errorCode === 'auth/popup-blocked' && options?.useRedirectOnBlocked !== false) {
      console.warn('Google sign-in popup blocked. Proceeding with redirect sign-in...');
      await signInWithRedirect(auth, selectedProvider);
      return null;
    }

    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignInRedirect = async (withCalendarScopes?: boolean): Promise<void> => {
  const selectedProvider = withCalendarScopes ? calendarProvider : generalProvider;
  isSigningIn = true;
  await signInWithRedirect(auth, selectedProvider);
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getIdToken = async (): Promise<string | null> => {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting Firebase ID token:', error);
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  return currentUser || auth.currentUser;
};

export const ADMIN_EMAILS: string[] = [
  'info@kretz.site',
  'bitfurytech21@gmail.com',
];

export const isUserAdmin = (user: User | null): boolean => {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
};

export const isCurrentUserAdmin = (): boolean => {
  return isUserAdmin(getCurrentUser());
};

export const emailSignIn = async (email: string, pass: string): Promise<User> => {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  currentUser = cred.user;
  return cred.user;
};

export const emailSignUp = async (email: string, pass: string, displayName?: string): Promise<User> => {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName && displayName.trim()) {
    try {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    } catch (e) {
      console.warn('Could not set displayName on new user:', e);
    }
  }
  currentUser = cred.user;
  return cred.user;
};

export const sendResetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email.trim());
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  currentUser = null;
};

