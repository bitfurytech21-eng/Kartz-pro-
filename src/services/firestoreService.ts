import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { User } from 'firebase/auth';

export interface UserProfileData {
  email: string;
  displayName?: string;
  preferredCurrency?: string;
  preferredLanguage?: string;
}

export interface FavoriteItem {
  propertyId: string;
  propertyTitle: string;
  userId: string;
  addedAt: string;
}

export interface AlertPayload {
  email: string;
  propertyType: string;
  region: string;
  maxBudget?: string;
  frequency: 'instant' | 'daily' | 'weekly';
  userId?: string;
}

export interface InquiryPayload {
  propertyRef: string;
  propertyTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message?: string;
  userId?: string;
}

export interface ValuationPayload {
  city?: string;
  postalCode?: string;
  propertyType?: string;
  surface?: string;
  rooms?: string;
  fullName: string;
  email: string;
  phone: string;
  intent?: 'sell' | 'rent';
  userId?: string;
}

/**
 * Synchronize authenticated user profile to Firestore
 */
export async function syncUserProfile(user: User, preferences?: { currency?: string; language?: string }) {
  if (!user || !user.uid) return;
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    const payload: Record<string, any> = {
      email: user.email || '',
      displayName: user.displayName || '',
      updatedAt: new Date().toISOString(),
    };
    if (preferences?.currency) payload.preferredCurrency = preferences.currency;
    if (preferences?.language) payload.preferredLanguage = preferences.language;

    if (!existing.exists()) {
      payload.createdAt = new Date().toISOString();
      await setDoc(userRef, payload);
    } else {
      await setDoc(userRef, payload, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch saved favorite property IDs for a user
 */
export async function fetchUserFavorites(userId: string): Promise<string[]> {
  if (!userId) return [];
  const path = `users/${userId}/favorites`;
  try {
    const favsRef = collection(db, 'users', userId, 'favorites');
    const snapshot = await getDocs(favsRef);
    return snapshot.docs.map((docSnap) => docSnap.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Add a property to favorites
 */
export async function addFavoriteProperty(userId: string, propertyId: string, propertyTitle: string) {
  if (!userId || !propertyId) return;
  const path = `users/${userId}/favorites/${propertyId}`;
  try {
    const favRef = doc(db, 'users', userId, 'favorites', propertyId);
    await setDoc(favRef, {
      propertyId,
      propertyTitle: propertyTitle || 'Luxury Property',
      userId,
      addedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Remove a property from favorites
 */
export async function removeFavoriteProperty(userId: string, propertyId: string) {
  if (!userId || !propertyId) return;
  const path = `users/${userId}/favorites/${propertyId}`;
  try {
    const favRef = doc(db, 'users', userId, 'favorites', propertyId);
    await deleteDoc(favRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Submit a property inquiry to Firestore
 */
export async function submitInquiry(payload: InquiryPayload): Promise<string> {
  const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const path = `inquiries/${inquiryId}`;
  try {
    const inquiryRef = doc(db, 'inquiries', inquiryId);
    await setDoc(inquiryRef, {
      propertyRef: payload.propertyRef,
      propertyTitle: payload.propertyTitle || 'Luxury Property',
      senderName: payload.senderName,
      senderEmail: payload.senderEmail,
      senderPhone: payload.senderPhone || '',
      message: payload.message || '',
      userId: payload.userId || auth.currentUser?.uid || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return inquiryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save property alert criteria to Firestore
 */
export async function submitAlert(payload: AlertPayload): Promise<string> {
  const alertId = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const path = `alerts/${alertId}`;
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await setDoc(alertRef, {
      email: payload.email,
      propertyType: payload.propertyType || 'All',
      region: payload.region || 'All France',
      maxBudget: payload.maxBudget || 'Any',
      frequency: payload.frequency || 'instant',
      userId: payload.userId || auth.currentUser?.uid || null,
      createdAt: new Date().toISOString(),
    });
    return alertId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Submit property valuation / mandate request to Firestore
 */
export async function submitValuation(payload: ValuationPayload): Promise<string> {
  const valuationId = `val_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const path = `valuations/${valuationId}`;
  try {
    const valuationRef = doc(db, 'valuations', valuationId);
    await setDoc(valuationRef, {
      city: payload.city || '',
      postalCode: payload.postalCode || '',
      propertyType: payload.propertyType || 'Apartment',
      surface: payload.surface || '',
      rooms: payload.rooms || '',
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      intent: payload.intent || 'sell',
      userId: payload.userId || auth.currentUser?.uid || null,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    return valuationId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
