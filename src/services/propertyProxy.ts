export interface ProxiedPropertyData {
  descriptionEn?: string;
  descriptionFr?: string;
  videoUrl?: string;
  films?: string[];
  vimeoId?: string;
  agent?: {
    name: string;
    phone: string;
    email: string;
    photo: string;
    role?: string;
  };
  surface?: number;
  rooms?: number;
  bedrooms?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  gardenSurface?: number;
  terraceSurface?: number;
  charges?: string;
  dpe?: {
    energyRating?: string;
    gesRating?: string;
  };
}

// In-memory cache for fast repeated views
const propertyProxyCache = new Map<string, ProxiedPropertyData>();

/**
 * Extracts Vimeo Video ID from a Vimeo URL.
 * e.g. https://vimeo.com/1128830054 -> 1128830054
 */
export function extractVimeoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Fetches real property details, descriptions, and video films from kretzrealestate.com via Vite proxy.
 */
export async function fetchPropertyFromProxy(
  ref: string,
  slugHint?: string
): Promise<ProxiedPropertyData | null> {
  const cleanRef = ref.trim().toLowerCase();
  if (propertyProxyCache.has(cleanRef)) {
    return propertyProxyCache.get(cleanRef)!;
  }

  const slugsToTry: string[] = [];
  if (slugHint) slugsToTry.push(slugHint.toLowerCase());
  // Standard Kretz URL slugs
  ['villa', 'apartment', 'house', 'property', 'castle', 'chalet', 'hotel-particulier', 'duplex'].forEach((s) => {
    if (!slugsToTry.includes(s)) slugsToTry.push(s);
  });

  for (const slug of slugsToTry) {
    const url = `/page-data/en/annonce/${cleanRef}/${slug}/page-data.json`;
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) continue;

      const json = await res.json();
      const node = json?.result?.data?.allProperty?.nodes?.[0];
      if (!node) continue;

      // Extract film / video
      const vids = node.video || [];
      const filmUrls: string[] = [];
      for (const v of vids) {
        const fn = v?.filename || v?.url || '';
        if (fn && (fn.includes('vimeo') || fn.includes('youtube') || fn.includes('mp4') || fn.startsWith('http'))) {
          filmUrls.push(fn);
        }
      }

      const primaryVideo = filmUrls[0] || undefined;
      const vimeoId = extractVimeoId(primaryVideo);

      // Extract agent
      let agent: ProxiedPropertyData['agent'] = undefined;
      const agentNode = node.suiviPar;
      if (agentNode && (agentNode.nom || agentNode.prenom)) {
        const fullName = `${agentNode.prenom || ''} ${agentNode.nom || ''}`.trim();
        agent = {
          name: fullName || 'Kretz Luxury Associate',
          phone: agentNode.telephone || '+33 7 53 07 75 72',
          email: agentNode.email || 'info@kretz.site',
          photo:
            agentNode.photo?.portraitSquare ||
            agentNode.photo?.url ||
            'https://files.kretzrealestate.com/46985a975765792df9a9228807e382d5.jpg',
          role: 'Dedicated Property Director',
        };
      }

      const result: ProxiedPropertyData = {
        descriptionEn: (node.descriptionEn || '').trim() || undefined,
        descriptionFr: (node.descriptionFr || '').trim() || undefined,
        videoUrl: primaryVideo,
        films: filmUrls.length > 0 ? filmUrls : undefined,
        vimeoId: vimeoId || undefined,
        agent,
        surface: node.surfaceHabitable ? parseInt(node.surfaceHabitable, 10) : undefined,
        rooms: node.nombrePieces ? parseInt(node.nombrePieces, 10) : undefined,
        bedrooms: node.nombreChambres ? parseInt(node.nombreChambres, 10) : undefined,
        gardenSurface: node.surfaceJardin ? parseInt(node.surfaceJardin, 10) : undefined,
        terraceSurface: node.surfaceTerrasse ? parseInt(node.surfaceTerrasse, 10) : undefined,
        charges: node.charges || undefined,
        dpe: {
          energyRating: node.consommationEnergetiqueLabel || undefined,
          gesRating: node.emissionGesLabel || undefined,
        },
      };

      if (node.lat && node.lng) {
        const lat = parseFloat(node.lat);
        const lng = parseFloat(node.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          result.coordinates = { lat, lng };
        }
      }

      propertyProxyCache.set(cleanRef, result);
      return result;
    } catch {
      // Continue to next slug
    }
  }

  return null;
}
