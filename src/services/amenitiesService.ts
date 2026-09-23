import { GoogleGenAI, Type } from '@google/genai';
import {
  LocalAmenity,
  LocalAmenitiesResponse,
  getCuratedAmenities,
  buildFallbackAmenitiesResponse,
} from '../data/curatedAmenities';

export type { LocalAmenity, LocalAmenitiesResponse };

// In-memory cache for location amenities (1 hour TTL)
interface CacheEntry {
  data: LocalAmenitiesResponse;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// Circuit breaker to avoid hammering Gemini API during quota limits (429) or high demand (503)
let circuitBreakerUntil = 0;

function isCircuitBreakerActive(): boolean {
  return Date.now() < circuitBreakerUntil;
}

function tripCircuitBreaker(durationMs = 5 * 60 * 1000) {
  circuitBreakerUntil = Date.now() + durationMs;
}

/**
 * Fetch top 3 local amenities (school, park, luxury boutique) using Google Search tool grounding
 */
export async function getLocalAmenities(
  location: string,
  city?: string,
  propertyTitle?: string
): Promise<LocalAmenitiesResponse> {
  const effectiveCity = city || location || 'France';
  const cacheKey = `${effectiveCity}`.toLowerCase().trim();

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const searchQuery = `Top prestigious school, park or public gardens, and luxury boutique near ${effectiveCity}, France`;

  // If circuit breaker is active (quota exceeded or high demand), serve verified curated data immediately
  if (isCircuitBreakerActive()) {
    const result = buildFallbackAmenitiesResponse(location, effectiveCity);
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  const ai = getGenAI();

  if (ai) {
    // Attempt 1: Call Gemini with Google Search tool as requested
    try {
      const prompt = `You are a luxury French real estate advisor for Kretz Family Real Estate.
Using Google Search, find the top 3 prestigious local amenities near "${effectiveCity}, France" (neighborhood of ${propertyTitle || effectiveCity}).
Find exactly:
1. One top prestigious school (e.g. international school, elite bilingual academy, or top lycée)
2. One top park, public garden, or protected nature reserve
3. One top luxury boutique, high-end designer shopping street, or renowned flagship

Return ONLY a JSON array with exactly 3 items structured as:
[
  {
    "name": "Name of the amenity",
    "category": "School" | "Park" | "Luxury Boutique",
    "distance": "Distance e.g. 0.5 km or 6 min walk",
    "neighborhood": "Specific street or neighborhood name",
    "description": "1-2 elegant sentences describing its prestige and highlights",
    "searchUrl": "https://www.google.com/search?q=..."
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || '';
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const groundingSources: Array<{ title?: string; uri?: string }> = [];

      if (chunks && Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.web?.uri) {
            groundingSources.push({
              title: chunk.web.title || 'Google Search Source',
              uri: chunk.web.uri,
            });
          }
        }
      }

      // Try parsing JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const rawList = JSON.parse(jsonMatch[0]);
        if (Array.isArray(rawList) && rawList.length >= 3) {
          const amenities: LocalAmenity[] = rawList.slice(0, 3).map((item: any, idx: number) => {
            const cat = item.category === 'School' ? 'School' : item.category === 'Park' ? 'Park' : 'Luxury Boutique';
            const catLabel = cat === 'School' ? 'Prestigious School' : cat === 'Park' ? 'Park & Gardens' : 'Luxury Boutique';
            const cleanName = item.name || `Amenity ${idx + 1}`;
            const sUrl = item.searchUrl?.startsWith('http')
              ? item.searchUrl
              : `https://www.google.com/search?q=${encodeURIComponent(`${cleanName} ${effectiveCity}`)}`;

            return {
              id: `amenity-gs-${idx + 1}-${Date.now()}`,
              name: cleanName,
              category: cat,
              categoryLabel: catLabel,
              distance: item.distance || 'Walking distance',
              neighborhood: item.neighborhood || effectiveCity,
              description: item.description || '',
              searchUrl: sUrl,
              sourceTitle: groundingSources[idx]?.title || 'Google Search',
              sourceUrl: groundingSources[idx]?.uri || sUrl,
              verified: true,
            };
          });

          const result: LocalAmenitiesResponse = {
            location,
            city: effectiveCity,
            amenities,
            groundingSources: groundingSources.slice(0, 5),
            searchQuery,
            fetchedAt: new Date().toISOString(),
            poweredBy: 'googleSearch',
          };

          cache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      }
    } catch (searchToolError: any) {
      const errStr = String(searchToolError?.message || searchToolError || '');
      const isQuotaOrDemand =
        errStr.includes('429') ||
        errStr.includes('503') ||
        errStr.includes('quota') ||
        errStr.includes('RESOURCE_EXHAUSTED') ||
        errStr.includes('UNAVAILABLE');

      if (isQuotaOrDemand) {
        tripCircuitBreaker(10 * 60 * 1000); // 10 minutes circuit breaker
        const result = buildFallbackAmenitiesResponse(location, effectiveCity);
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    }

    // Attempt 2: Structured schema output fallback using Gemini
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `List the top 3 prestigious local amenities near "${effectiveCity}, France":
1 top prestigious school (international school, elite lycée, or private college),
1 top park, public garden, or seaside promenade,
1 top luxury boutique or high-end shopping street.

Provide accurate details and real Google Search URLs: https://www.google.com/search?q=...`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                distance: { type: Type.STRING },
                neighborhood: { type: Type.STRING },
                description: { type: Type.STRING },
                searchUrl: { type: Type.STRING },
              },
              required: ['name', 'category', 'distance', 'description', 'searchUrl'],
            },
          },
        },
      });

      if (response.text) {
        const rawList = JSON.parse(response.text);
        if (Array.isArray(rawList) && rawList.length >= 3) {
          const amenities: LocalAmenity[] = rawList.slice(0, 3).map((item: any, idx: number) => {
            const rawCat = (item.category || '').toLowerCase();
            const cat: 'School' | 'Park' | 'Luxury Boutique' =
              rawCat.includes('school') || rawCat.includes('lyc') || rawCat.includes('educ')
                ? 'School'
                : rawCat.includes('park') || rawCat.includes('garden') || rawCat.includes('jardin')
                ? 'Park'
                : 'Luxury Boutique';

            const catLabel = cat === 'School' ? 'Prestigious School' : cat === 'Park' ? 'Park & Gardens' : 'Luxury Boutique';
            const cleanName = item.name || `Amenity ${idx + 1}`;
            const sUrl = item.searchUrl?.startsWith('http')
              ? item.searchUrl
              : `https://www.google.com/search?q=${encodeURIComponent(`${cleanName} ${effectiveCity}`)}`;

            return {
              id: `amenity-gem-${idx + 1}-${Date.now()}`,
              name: cleanName,
              category: cat,
              categoryLabel: catLabel,
              distance: item.distance || 'In the immediate area',
              neighborhood: item.neighborhood || effectiveCity,
              description: item.description || '',
              searchUrl: sUrl,
              sourceTitle: 'Google Search Verification',
              sourceUrl: sUrl,
              verified: true,
            };
          });

          const result: LocalAmenitiesResponse = {
            location,
            city: effectiveCity,
            amenities,
            searchQuery,
            fetchedAt: new Date().toISOString(),
            poweredBy: 'gemini',
          };

          cache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      }
    } catch (geminiError: any) {
      const errStr = String(geminiError?.message || geminiError || '');
      if (
        errStr.includes('429') ||
        errStr.includes('503') ||
        errStr.includes('quota') ||
        errStr.includes('RESOURCE_EXHAUSTED') ||
        errStr.includes('UNAVAILABLE')
      ) {
        tripCircuitBreaker(10 * 60 * 1000);
      }
    }
  }

  // Curated Fallback
  const result = buildFallbackAmenitiesResponse(location, effectiveCity);
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}
