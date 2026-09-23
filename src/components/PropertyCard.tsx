import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share2, RotateCw, Play, Layers } from 'lucide-react';
import { Property, Currency } from '../types';
import { useTranslation } from '../i18n';

interface PropertyCardProps {
  property: Property;
  currency: Currency;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelect: (property: Property) => void;
  isCompared?: boolean;
  onToggleCompare?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  currency,
  isSaved,
  onToggleSave,
  onSelect,
  isCompared = false,
  onToggleCompare,
}) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ['https://files.kretzrealestate.com/67ec4082a8f72d825044d16021ae9bdf.jpg'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const translateChip = (chip: string) => {
    const lower = chip.toLowerCase();
    if (lower.includes('exclusive') || lower.includes('exclusiv')) return t.propertyCard.exclusive;
    if (lower.includes('off-market') || lower.includes('off market')) return t.propertyCard.offMarket;
    if (lower.includes('under offer') || lower.includes('offre')) return t.propertyCard.underOffer;
    if (lower.includes('sold') || lower.includes('vendu')) return t.propertyCard.sold;
    if (lower.includes('new') || lower.includes('nouveau') || lower.includes('nouv')) return t.propertyCard.new;
    return chip;
  };

  const formatCurrency = (priceNum: number | null, isConfidential: boolean) => {
    if (isConfidential || priceNum === null || priceNum === 0) {
      return t.propertyCard.priceOnRequest;
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

    const formatted = converted
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return currency === 'EUR' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
  };

  return (
    <div
      id={`property-card-${property.ref}`}
      onClick={() => onSelect(property)}
      className="group bg-white rounded-none border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer overflow-hidden relative"
    >
      {/* Image Gallery Showcase */}
      <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden select-none">
        <img
          src={images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            const src = target.src;
            if (src.includes('files.kretzrealestate.com')) {
              target.src = src.replace('https://files.kretzrealestate.com', '/files');
            }
          }}
        />

        {/* Subtle gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none"></div>

        {/* Carousel Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-black shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-black shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Photo Dots Counter Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-1 z-10">
            {images.slice(0, Math.min(images.length, 5)).map((_, idx) => (
              <span
                key={idx}
                className={`block w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Chips & Badges in top-left */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {property.chips.map((chip, idx) => {
            const isDarkBadge =
              chip === 'Exclusive' ||
              chip === 'OFF MARKET' ||
              chip === 'Co-exclusive';
            return (
              <span
                key={idx}
                className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-sm shadow-sm ${
                  isDarkBadge
                    ? 'bg-[#1d1d1b] text-white'
                    : 'bg-white text-[#1d1d1b]'
                }`}
              >
                {translateChip(chip)}
              </span>
            );
          })}
        </div>

        {/* Top-right Actions: Favorite & Compare */}
        <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 z-10">
          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(property);
              }}
              className={`w-7 h-7 rounded-full shadow-sm flex items-center justify-center transition-all ${
                isCompared
                  ? 'bg-[#1d1d1b] text-white hover:bg-neutral-800'
                  : 'bg-white/85 hover:bg-white text-[#1d1d1b]'
              }`}
              title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
              aria-label="Compare property"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className="w-7 h-7 rounded-full bg-white/85 hover:bg-white text-[#1d1d1b] shadow-sm flex items-center justify-center transition-all"
            title={isSaved ? t.propertyDetail.saved : t.propertyDetail.save}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isSaved ? 'fill-red-500 text-red-500' : 'text-neutral-700'
              }`}
            />
          </button>
        </div>

        {/* Cinema Film Badge in bottom-left - Only shown if property originally has a video */}
        {Boolean(property.videoUrl || property.filmUrl || property.vimeoId || (property.films && property.films.length > 0)) && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-medium rounded-full border border-white/20 shadow-xs z-10">
            <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
            <span>Film</span>
          </div>
        )}

        {/* 360 Virtual Tour Indicator in bottom-right */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-1 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium rounded-full border border-white/20 shadow-xs z-10">
          <RotateCw className="w-2.5 h-2.5 text-amber-400" />
          <span>{t.propertyDetail.virtualTour}</span>
        </div>
      </div>

      {/* Property Details Content Card */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Location */}
          <h3 className="text-[13px] uppercase font-medium tracking-wider text-[#1d1d1b] mb-2 truncate">
            {property.location}
          </h3>

          {/* Area & Rooms Specs with Divider */}
          <div className="flex items-center flex-wrap gap-y-1 text-xs text-[#757575] font-light space-x-2.5 mb-3">
            <span>{property.surface > 0 ? `${property.surface} ${t.propertyCard.sqm}` : t.propertyCard.exceptionalArea}</span>
            <span className="w-px h-3 bg-neutral-300"></span>
            <span>{property.rooms > 0 ? `${property.rooms} ${t.propertyCard.rooms}` : `${property.bedrooms || 3} ${t.propertyCard.bedrooms}`}</span>
            {property.bedrooms > 0 && property.rooms > 0 && (
              <>
                <span className="w-px h-3 bg-neutral-300"></span>
                <span>{property.bedrooms} {t.propertyCard.bedrooms}</span>
              </>
            )}
            {property.amenities.gardenSurface && property.amenities.gardenSurface > 0 && (
              <>
                <span className="w-px h-3 bg-neutral-300"></span>
                <span>{property.amenities.gardenSurface.toLocaleString()} {t.propertyCard.sqm} {t.propertyDetail.garden}</span>
              </>
            )}
          </div>

          {/* Owner Provenance Tag */}
          {property.owner && (
            <div className="mb-2.5 flex items-center space-x-1.5 text-[11px] text-neutral-600 truncate">
              {property.owner.photo ? (
                <img
                  src={property.owner.photo}
                  alt={property.owner.name}
                  className="w-4 h-4 rounded-full object-cover border border-amber-400/60 shrink-0 shadow-2xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>
              )}
              <span className="text-neutral-400 font-medium">{t.propertyCard.owner}:</span>
              <span className="text-neutral-800 truncate font-light" title={`${property.owner.name}`}>
                {property.owner.name}
              </span>
            </div>
          )}
        </div>

        {/* Price & Ref */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide text-[#1d1d1b]">
            {formatCurrency(property.price, property.isConfidential)}
          </span>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
            {property.ref}
          </span>
        </div>

        {/* Payment Plan & Installments Indicator */}
        <div className="mt-2 pt-1.5 border-t border-neutral-100/80 flex items-center justify-between text-[11px]">
          <span className="text-neutral-600 font-light flex items-center space-x-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1d1d1b] shrink-0"></span>
            <span className="font-medium text-[#1d1d1b]">Payment Plan:</span>
            <span className="font-mono text-neutral-800 truncate">
              {formatCurrency(property.price ? property.price * 0.55 : null, property.isConfidential)}
            </span>
          </span>
          <span className="text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 border border-neutral-200/80 shrink-0 ml-1">
            + Installments
          </span>
        </div>
      </div>
    </div>
  );
};
