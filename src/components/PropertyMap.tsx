import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  ControlPosition,
} from '@vis.gl/react-google-maps';
import { Property, Currency } from '../types';
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
  GMP_INTERNAL_ATTRIBUTION_IDS,
  FRANCE_REGIONS,
  getGoogleMapsUrl,
  getGoogleMapsDirectionsUrl,
} from '../services/googleMaps';
import {
  MapPin,
  X,
  ChevronRight,
  ExternalLink,
  Navigation,
  Layers,
  Sparkles,
  Maximize2,
  Send,
  Phone,
  Mail,
} from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  currency: Currency;
  selectedPropertyId?: string;
  onSelectProperty: (property: Property) => void;
  className?: string;
}

// Controller component to smoothly center/zoom when region or active property changes
const MapBoundsController: React.FC<{
  targetCenter?: { lat: number; lng: number };
  targetZoom?: number;
  properties: Property[];
  singlePropertyMode: boolean;
}> = ({ targetCenter, targetZoom, properties, singlePropertyMode }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (singlePropertyMode && targetCenter) {
      map.panTo(targetCenter);
      map.setZoom(targetZoom || 15);
      return;
    }

    if (targetCenter && targetZoom) {
      map.panTo(targetCenter);
      map.setZoom(targetZoom);
      return;
    }

    // If multiple properties and no explicit target, fit to bounds if <= 50 properties
    if (properties.length > 0 && properties.length <= 60) {
      const bounds = new google.maps.LatLngBounds();
      let count = 0;
      properties.forEach((p) => {
        if (p.lat && p.lng) {
          bounds.extend({ lat: p.lat, lng: p.lng });
          count++;
        }
      });
      if (count > 0) {
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      }
    }
  }, [map, targetCenter, targetZoom, singlePropertyMode, properties]);

  return null;
};

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  currency,
  selectedPropertyId,
  onSelectProperty,
  className = '',
}) => {
  const isSingleMode = properties.length === 1;
  const singleProperty = isSingleMode ? properties[0] : null;

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    singleProperty || null
  );
  const [activeRegion, setActiveRegion] = useState<string>(
    isSingleMode ? 'all' : 'all'
  );
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  // Filter properties with valid lat & lng coordinates
  const validProperties = useMemo(() => {
    return properties.filter((p) => {
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return false;
      // Approximate geographical bounding box for France & Monaco
      return p.lat >= 41 && p.lat <= 52 && p.lng >= -6 && p.lng <= 10.5;
    });
  }, [properties]);

  // If a selectedPropertyId is provided via props, sync it
  useEffect(() => {
    if (selectedPropertyId) {
      const found = properties.find((p) => p.id === selectedPropertyId);
      if (found) setSelectedProperty(found);
    }
  }, [selectedPropertyId, properties]);

  // Initial center and zoom based on single mode vs catalog mode
  const initialCenter = useMemo(() => {
    if (singleProperty && singleProperty.lat && singleProperty.lng) {
      return { lat: singleProperty.lat, lng: singleProperty.lng };
    }
    return FRANCE_REGIONS.all.center;
  }, [singleProperty]);

  const initialZoom = useMemo(() => {
    if (singleProperty) return 15;
    return FRANCE_REGIONS.all.zoom;
  }, [singleProperty]);

  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number } | undefined>(
    initialCenter
  );
  const [currentZoom, setCurrentZoom] = useState<number | undefined>(initialZoom);

  // Handle region switch
  const handleRegionChange = (regionKey: string) => {
    setActiveRegion(regionKey);
    const reg = FRANCE_REGIONS[regionKey];
    if (reg) {
      setCurrentCenter(reg.center);
      setCurrentZoom(reg.zoom);
    }
  };

  const formatCurrency = useCallback(
    (priceNum: number | null, isConfidential?: boolean) => {
      if (isConfidential || priceNum === null || priceNum === 0) {
        return 'Confidential';
      }
      let converted = priceNum;
      let symbol = '€';
      if (currency === 'USD') {
        converted = Math.round(priceNum * 1.09);
        symbol = '$';
      } else if (currency === 'GBP') {
        converted = Math.round(priceNum * 0.85);
        symbol = '£';
      }

      if (converted >= 1000000) {
        return `${(converted / 1000000).toFixed(1)}M ${symbol}`;
      }
      return `${Math.round(converted / 1000)}k ${symbol}`;
    },
    [currency]
  );

  return (
    <div
      className={`relative w-full h-full min-h-[420px] bg-[#f7f7f6] overflow-hidden border border-neutral-200 ${className}`}
    >
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          mapId={GOOGLE_MAPS_MAP_ID}
          internalUsageAttributionIds={GMP_INTERNAL_ATTRIBUTION_IDS}
          defaultCenter={initialCenter}
          defaultZoom={initialZoom}
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          streetViewControl={true}
          mapTypeControl={false} // Handled with custom luxury controls below
          fullscreenControl={true}
          style={{ width: '100%', height: '100%' }}
        >
          <MapBoundsController
            targetCenter={currentCenter}
            targetZoom={currentZoom}
            properties={validProperties}
            singlePropertyMode={isSingleMode}
          />

          {/* Markers for valid properties */}
          {validProperties.map((prop) => {
            if (!prop.lat || !prop.lng) return null;
            const isSelected = selectedProperty?.id === prop.id;

            return (
              <AdvancedMarker
                key={prop.id}
                position={{ lat: prop.lat, lng: prop.lng }}
                onClick={() => setSelectedProperty(prop)}
                title={`${prop.title} - ${prop.location}`}
              >
                <div
                  className={`group relative cursor-pointer transition-transform duration-200 ${
                    isSelected ? 'scale-110 z-40' : 'hover:scale-110 z-20'
                  }`}
                >
                  {isSingleMode ? (
                    // Prominent custom pin for single property view in detail modal
                    <div className="flex flex-col items-center">
                      <div className="px-3 py-1.5 bg-[#1d1d1b] text-white text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xl border-2 border-white flex items-center space-x-1.5 animate-bounce">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>{formatCurrency(prop.price, prop.isConfidential)}</span>
                      </div>
                      <div className="w-0.5 h-3 bg-[#1d1d1b]" />
                      <div className="w-2 h-2 rounded-full bg-[#1d1d1b] ring-4 ring-black/20" />
                    </div>
                  ) : (
                    // Sleek price pill for catalog browsing
                    <div
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium tracking-tight shadow-lg flex items-center space-x-1.5 transition-all ${
                        isSelected
                          ? 'bg-[#1d1d1b] text-white ring-2 ring-white scale-110'
                          : 'bg-white/95 backdrop-blur-sm text-[#1d1d1b] border border-neutral-200 hover:bg-[#1d1d1b] hover:text-white'
                      }`}
                    >
                      <MapPin
                        className={`w-3 h-3 ${
                          isSelected ? 'text-amber-300' : 'text-neutral-500'
                        }`}
                      />
                      <span className="font-semibold">
                        {formatCurrency(prop.price, prop.isConfidential)}
                      </span>
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* InfoWindow for selected property if in single property mode */}
          {isSingleMode && selectedProperty && selectedProperty.lat && selectedProperty.lng && (
            <InfoWindow
              position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
              headerDisabled={true}
            >
              <div className="p-1 max-w-xs text-[#1d1d1b]">
                <div className="font-semibold text-xs uppercase tracking-wider text-neutral-800">
                  {selectedProperty.location}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  GPS: {selectedProperty.lat.toFixed(5)}, {selectedProperty.lng.toFixed(5)}
                </div>
                <div className="mt-2 flex items-center space-x-2 pt-2 border-t border-neutral-100">
                  <a
                    href={getGoogleMapsUrl(
                      selectedProperty.lat,
                      selectedProperty.lng,
                      selectedProperty.location
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Top Left: Regional Quick Jump Bar (hidden in single property view) */}
      {!isSingleMode && (
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-sm shadow-lg border border-neutral-200/80 max-w-[calc(100%-100px)]">
          {Object.values(FRANCE_REGIONS).map((reg) => (
            <button
              key={reg.id}
              type="button"
              onClick={() => handleRegionChange(reg.id)}
              className={`px-2.5 py-1 text-[11px] uppercase font-medium tracking-wider rounded-sm transition-all ${
                activeRegion === reg.id
                  ? 'bg-[#1d1d1b] text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {reg.name}
            </button>
          ))}
        </div>
      )}

      {/* Top Right: Custom Luxury Map Type Selector (Roadmap / Satellite) */}
      <div className="absolute top-3 right-3 z-10 flex items-center bg-white/95 backdrop-blur-md p-1 rounded-sm shadow-lg border border-neutral-200/80">
        <button
          type="button"
          onClick={() => setMapType('roadmap')}
          className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold rounded-sm transition-colors ${
            mapType === 'roadmap'
              ? 'bg-[#1d1d1b] text-white'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
          title="Standard Cartography"
        >
          Map
        </button>
        <button
          type="button"
          onClick={() => setMapType('hybrid')}
          className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold rounded-sm transition-colors flex items-center space-x-1 ${
            mapType === 'hybrid'
              ? 'bg-[#1d1d1b] text-white'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
          title="Aerial Satellite & Labels"
        >
          <Layers className="w-3 h-3" />
          <span>Satellite</span>
        </button>
      </div>

      {/* Floating Property Preview Card when clicking a marker in catalog browsing */}
      {!isSingleMode && selectedProperty && (
        <div className="absolute bottom-4 right-4 z-20 w-80 max-w-[calc(100%-2rem)] bg-white shadow-2xl rounded-sm border border-neutral-200 overflow-hidden transition-all duration-300">
          <div className="relative aspect-[16/10] bg-neutral-100">
            <img
              src={selectedProperty.images[0]}
              alt={selectedProperty.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                const src = target.src;
                if (src.includes('files.kretzrealestate.com')) {
                  target.src = src.replace('https://files.kretzrealestate.com', '/files');
                }
              }}
            />
            <button
              type="button"
              onClick={() => setSelectedProperty(null)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors shadow-sm"
              title="Close Preview"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute top-2 left-2">
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#1d1d1b] text-white rounded-sm shadow-sm">
                {selectedProperty.typeDisplay || 'Prestige'}
              </span>
            </div>
          </div>

          <div className="p-3.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
              <span className="flex items-center space-x-1 truncate max-w-[180px]">
                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                <span className="truncate">{selectedProperty.location}</span>
              </span>
              <span className="font-semibold text-neutral-900">
                {selectedProperty.priceFormatted}
              </span>
            </div>

            <h4 className="text-xs font-semibold text-[#1d1d1b] truncate mb-2">
              {selectedProperty.title}
            </h4>

            <div className="flex items-center text-[11px] text-neutral-500 space-x-2 mb-2.5">
              <span>{selectedProperty.surface} m²</span>
              <span>•</span>
              <span>{selectedProperty.rooms} Rooms</span>
              {selectedProperty.bedrooms > 0 && (
                <>
                  <span>•</span>
                  <span>{selectedProperty.bedrooms} Beds</span>
                </>
              )}
            </div>

            {/* Owner Provenance Tag */}
            {selectedProperty.owner && (
              <div className="mb-1.5 text-[10px] text-neutral-600 flex items-center space-x-1.5 truncate">
                {selectedProperty.owner.photo ? (
                  <img
                    src={selectedProperty.owner.photo}
                    alt={selectedProperty.owner.name}
                    className="w-3.5 h-3.5 rounded-full object-cover border border-amber-400/60 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>
                )}
                <span className="text-neutral-400">Owner:</span>
                <span className="text-neutral-900 font-medium truncate">{selectedProperty.owner.name}</span>
              </div>
            )}

            {/* Payment Plan Badge */}
            <div className="mb-2 px-2 py-1 bg-neutral-50 border border-neutral-200/80 text-[10px] flex items-center justify-between">
              <span className="text-neutral-700 truncate">
                <strong className="font-semibold text-[#1d1d1b]">Payment Plan:</strong>{' '}
                {formatCurrency(selectedProperty.price ? selectedProperty.price * 0.55 : null, selectedProperty.isConfidential)}
              </span>
              <span className="text-amber-800 font-semibold bg-amber-100/70 px-1 py-0.2 shrink-0 ml-1">
                + Installments
              </span>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100">
              <div className="flex items-center space-x-2">
                <a
                  href={`mailto:info@kretz.site?subject=${encodeURIComponent(`Inquiry on ${selectedProperty.title} (Ref: ${selectedProperty.ref})`)}`}
                  className="inline-flex items-center space-x-1 text-[11px] text-neutral-800 hover:text-black font-medium transition-colors"
                  title="Inquire via info@kretz.site"
                >
                  <Mail className="w-3 h-3 text-amber-500" />
                  <span>info@kretz.site</span>
                </a>
                {selectedProperty.lat && selectedProperty.lng && (
                  <a
                    href={getGoogleMapsUrl(
                      selectedProperty.lat,
                      selectedProperty.lng,
                      selectedProperty.location
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] text-neutral-600 hover:text-[#1d1d1b] font-medium transition-colors"
                    title="Open in Google Maps application"
                  >
                    <Navigation className="w-3 h-3 text-neutral-500" />
                    <span>Maps</span>
                  </a>
                )}
                {selectedProperty.externalTourUrl && (
                  <a
                    href={selectedProperty.externalTourUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] text-neutral-600 hover:text-[#1d1d1b] font-medium transition-colors"
                    title="Original listing on Kretz Real Estate"
                  >
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                    <span>Original</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => onSelectProperty(selectedProperty)}
                className="px-3 py-1 bg-[#1d1d1b] text-white text-[11px] uppercase tracking-wider font-semibold rounded-sm hover:bg-neutral-800 transition-colors flex items-center space-x-1"
              >
                <span>Details</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Left: Real Coordinates Badge */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-sm shadow-sm border border-neutral-200 text-[10px] text-neutral-600 flex items-center space-x-2">
        <span className="font-semibold text-neutral-900">Google Maps Platform</span>
        <span>•</span>
        <span>
          {isSingleMode && singleProperty?.lat && singleProperty?.lng
            ? `Lat: ${singleProperty.lat.toFixed(4)}, Lng: ${singleProperty.lng.toFixed(4)}`
            : `${validProperties.length} Real Geocoded Properties`}
        </span>
      </div>
    </div>
  );
};
