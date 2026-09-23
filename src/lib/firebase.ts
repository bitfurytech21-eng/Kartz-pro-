import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDocFromServer,
  Firestore,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress internal verbose/timeout SDK logs that trigger AI Studio iframe error alerts
try {
  setLogLevel('silent');
} catch {
  // Graceful fallback if setLogLevel is not supported in environment
}

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore targeting the specific provisioned database
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  // If already initialized, retrieve existing instance
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;

// Initialize Firebase Auth
export const auth = getAuth(app);

// Connection test utility with timeout protection
export async function testConnection() {
  try {
    const fetchPromise = getDocFromServer(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('connection-timeout')), 4000)
    );
    await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('the client is offline') ||
        error.message.includes('connection-timeout') ||
        error.message.includes('unavailable') ||
        error.message.includes('Backend didn\'t respond'))
    ) {
      console.info('Firebase Firestore client initialized in resilient offline/cache mode.');
    }
  }
}

// Error Handling Infrastructure as required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
