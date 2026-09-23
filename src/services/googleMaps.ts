/// <reference types="vite/client" />
// Google Maps Platform configuration and helper utilities

export const GOOGLE_MAPS_API_KEY =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyAYEL0cQzcJb6rFF85upxIWGnBWPPEMcWs';

// Map ID is mandatory for AdvancedMarkerElement
export const GOOGLE_MAPS_MAP_ID = 'DEMO_MAP_ID';

// Mandatory attribution ID for AI Studio Google Maps usage tracking
export const GMP_INTERNAL_ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];

export interface MapRegionConfig {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  zoom: number;
}

export const FRANCE_REGIONS: Record<string, MapRegionConfig> = {
  all: {
    id: 'all',
    name: 'All Properties',
    center: { lat: 46.5, lng: 2.5 },
    zoom: 6,
  },
  paris: {
    id: 'paris',
    name: 'Paris & Île-de-France',
    center: { lat: 48.8566, lng: 2.3522 },
    zoom: 12,
  },
  riviera: {
    id: 'riviera',
    name: 'French Riviera & Monaco',
    center: { lat: 43.68, lng: 7.25 },
    zoom: 10,
  },
  alps: {
    id: 'alps',
    name: 'French Alps & Geneva',
    center: { lat: 45.85, lng: 6.5 },
    zoom: 9,
  },
  provence: {
    id: 'provence',
    name: 'Provence & Luberon',
    center: { lat: 43.85, lng: 5.2 },
    zoom: 10,
  },
  southwest: {
    id: 'southwest',
    name: 'Bordeaux & Arcachon',
    center: { lat: 44.84, lng: -0.8 },
    zoom: 9,
  },
};

/**
 * Returns a direct Google Maps web URL to open the location in Google Maps app / web
 */
export const getGoogleMapsUrl = (lat: number, lng: number, label?: string): string => {
  const query = label ? encodeURIComponent(`${label}, France`) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

/**
 * Returns a Google Maps directions URL to navigate to the property
 */
export const getGoogleMapsDirectionsUrl = (lat: number, lng: number): string => {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};
