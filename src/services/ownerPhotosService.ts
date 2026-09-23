/**
 * Service to manage real property owner profile photos.
 * Coordinates client-side caching (localStorage) and server-side persistence (/api/upload-owner-photo).
 */

const STORAGE_KEY = 'kretz_owner_photos';

// In-memory cache
let photoCache: Record<string, string> = {};

// Load initial state from localStorage
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    photoCache = JSON.parse(stored);
  }
} catch {
  photoCache = {};
}

// Listeners for reactive updates across components
type PhotoListener = (photos: Record<string, string>) => void;
const listeners = new Set<PhotoListener>();

function notifyListeners() {
  const current = { ...photoCache };
  listeners.forEach((listener) => {
    try {
      listener(current);
    } catch (e) {
      console.error('Error notifying photo listener', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kretz_owner_photos_updated', { detail: current }));
  }
}

/**
 * Syncs cached photos with server on app load
 */
export async function syncOwnerPhotosWithServer(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/owner-photos');
    if (res.ok) {
      const data = await res.json();
      if (data && data.photos && typeof data.photos === 'object') {
        photoCache = { ...data.photos, ...photoCache };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(photoCache));
        } catch {
          // localStorage quota or private mode
        }
        notifyListeners();
      }
    }
  } catch (err) {
    console.warn('Could not fetch owner photos from server, using local cache:', err);
  }
  return { ...photoCache };
}

// Automatically sync when module initializes in browser
if (typeof window !== 'undefined') {
  syncOwnerPhotosWithServer().catch(() => {});
}

/**
 * Returns the photo for a specific property reference or owner name
 */
export function getOwnerPhoto(propertyRef: string, ownerName?: string): string | null {
  if (!propertyRef) return null;
  if (photoCache[propertyRef]) return photoCache[propertyRef];
  if (ownerName && photoCache[ownerName]) return photoCache[ownerName];
  return null;
}

/**
 * Returns all current owner photos
 */
export function getAllOwnerPhotos(): Record<string, string> {
  return { ...photoCache };
}

/**
 * Subscribes to changes in owner photos
 */
export function subscribeOwnerPhotos(listener: PhotoListener): () => void {
  listeners.add(listener);
  listener({ ...photoCache });
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Uploads/saves a photo for a property owner
 */
export async function saveOwnerPhoto(
  propertyRef: string,
  ownerName: string,
  dataUrl: string,
  filename?: string
): Promise<string> {
  const safeFilename = filename || `owner_${propertyRef.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpeg`;

  // 1. Immediately update in-memory cache and localStorage for instant UI feedback
  photoCache[propertyRef] = dataUrl;
  if (ownerName) {
    photoCache[ownerName] = dataUrl;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photoCache));
  } catch {
    // quota limits
  }
  notifyListeners();

  // 2. Persist to server
  try {
    const res = await fetch('/api/upload-owner-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyRef,
        ownerName,
        filename: safeFilename,
        data: dataUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        // If server returned a permanent asset URL, update reference
        photoCache[propertyRef] = data.url;
        if (ownerName) photoCache[ownerName] = data.url;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(photoCache));
        } catch {}
        notifyListeners();
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Failed to upload owner photo to server, retained in client cache:', err);
  }

  return dataUrl;
}

/**
 * Removes an owner's photo
 */
export async function deleteOwnerPhoto(propertyRef: string, ownerName?: string): Promise<void> {
  delete photoCache[propertyRef];
  if (ownerName) {
    delete photoCache[ownerName];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photoCache));
  } catch {}
  notifyListeners();

  try {
    await fetch('/api/owner-photo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyRef, ownerName }),
    });
  } catch (err) {
    console.warn('Failed to delete owner photo on server:', err);
  }
}

/**
 * Intelligent bulk upload for owner photos.
 * Matches file names against property references (e.g. "KP1-173", "KP1-117") or owner names (e.g. "Balmain", "Hassan").
 */
export async function bulkUploadOwnerPhotos(
  files: FileList | File[],
  properties: Array<{ ref: string; title: string; owner?: { name: string } }>
): Promise<{ matchedCount: number; updatedRefs: string[] }> {
  let matchedCount = 0;
  const updatedRefs: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rawName = file.name.trim();
    const cleanName = rawName.toLowerCase();

    // Look for matching property
    let matchedRef: string | null = null;
    let matchedOwnerName = '';

    for (const p of properties) {
      const pRef = p.ref.toLowerCase();
      const pCleanRef = pRef.replace(/[^a-z0-9]/g, '');
      const fileClean = cleanName.replace(/[^a-z0-9]/g, '');

      // Check if filename contains ref (e.g. KP1-173, KP1173, kp1_173)
      if (cleanName.includes(pRef) || fileClean.includes(pCleanRef)) {
        matchedRef = p.ref;
        matchedOwnerName = p.owner?.name || '';
        break;
      }

      // Check if filename contains key parts of owner name
      if (p.owner?.name) {
        const ownerParts = p.owner.name
          .toLowerCase()
          .split(/[\s,()&-]+/)
          .filter((s) => s.length > 3);
        if (ownerParts.some((part) => cleanName.includes(part))) {
          matchedRef = p.ref;
          matchedOwnerName = p.owner.name;
          break;
        }
      }
    }

    if (matchedRef) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      await saveOwnerPhoto(matchedRef, matchedOwnerName, dataUrl, rawName);
      matchedCount++;
      if (!updatedRefs.includes(matchedRef)) {
        updatedRefs.push(matchedRef);
      }
    }
  }

  return { matchedCount, updatedRefs };
}
