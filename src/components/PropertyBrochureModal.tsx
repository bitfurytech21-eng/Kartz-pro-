import React from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Check,
  Building,
  Maximize2,
  Compass,
  Zap,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Property, Currency } from '../types';
import { CompanyLogo } from './CompanyLogo';

interface PropertyBrochureModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
}

export const PropertyBrochureModal: React.FC<PropertyBrochureModalProps> = ({
  property,
  isOpen,
  onClose,
  currency,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !property) return null;

  const formatPrice = (priceNum: number | null, isConfidential?: boolean) => {
    if (isConfidential || !priceNum) return 'Price Upon Confidential Request';
    let converted = priceNum;
    let symbol = '€';
    if (currency === 'USD') {
      converted = Math.round(priceNum * 1.09);
      symbol = '$';
    } else if (currency === 'GBP') {
      converted = Math.round(priceNum * 0.85);
      symbol = '£';
    }
    const formatted = converted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return currency === 'EUR' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#/annonce/${encodeURIComponent(property.ref)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white rounded-sm shadow-2xl border border-neutral-200 overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none">
        {/* Floating Screen Action Bar (Hidden when printing) */}
        <div className="sticky top-0 z-30 bg-neutral-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-semibold">
              Editorial Dossier
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs font-mono text-neutral-300">Ref: {property.ref}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-neutral-100 rounded-xs transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Dossier Container */}
        <div className="p-8 sm:p-12 print:p-8 space-y-8 bg-white text-[#1d1d1b]">
          {/* Dossier Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-300 pb-6 gap-4">
            <div>
              <div className="mb-2">
                <CompanyLogo variant="compact" theme="light" />
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-600 font-semibold">
                Private Prestige Real Estate Dossier
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-neutral-600 font-mono">Reference: {property.ref}</p>
              <p className="text-xs text-neutral-600 font-light">
                Issued on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs font-medium text-emerald-800 flex items-center sm:justify-end gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Certified Mandate
              </p>
            </div>
          </div>

          {/* Property Title & Core Price */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-neutral-600 font-medium">
                {property.typeDisplay} · {property.city} ({property.department})
              </span>
              <h1 className="text-2xl sm:text-3xl font-light font-serif-luxury tracking-wide text-[#1d1d1b]">
                {property.title}
              </h1>
              <p className="text-xs text-neutral-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                {property.location || property.city}, France
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-neutral-600 block">
                Acquisition Value
              </span>
              <span className="text-2xl sm:text-3xl font-serif-luxury font-light text-[#1d1d1b]">
                {formatPrice(property.priceNumber, property.isPriceConfidential)}
              </span>
            </div>
          </div>

          {/* Hero Cover Photography */}
          <div className="relative aspect-16/9 rounded-sm overflow-hidden border border-neutral-200">
            <img
              src={property.mainImage}
              alt={property.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Secondary Gallery Row */}
          {property.images && property.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {property.images.slice(1, 4).map((img, i) => (
                <div key={i} className="aspect-4/3 rounded-xs overflow-hidden border border-neutral-200">
                  <img
                    src={img}
                    alt={`${property.title} view ${i + 2}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-neutral-200 bg-[#fae9e5]/20 rounded-xs px-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-semibold block">
                Living Surface
              </span>
              <span className="text-lg font-serif-luxury font-light text-[#1d1d1b]">
                {property.surface} m²
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-semibold block">
                Total Rooms
              </span>
              <span className="text-lg font-serif-luxury font-light text-[#1d1d1b]">
                {property.rooms} Rooms ({property.bedrooms} Suites)
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-semibold block">
                Exterior Grounds
              </span>
              <span className="text-lg font-serif-luxury font-light text-[#1d1d1b]">
                {property.amenities?.terraceSurface
                  ? `${property.amenities.terraceSurface} m² Terrace`
                  : property.amenities?.gardenSurface
                  ? `${property.amenities.gardenSurface} m² Grounds`
                  : 'Private Grounds'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-semibold block">
                Energy Rating
              </span>
              <span className="text-lg font-serif-luxury font-light text-[#1d1d1b]">
                DPE {property.dpeScore || 'A'} / GES {property.gesScore || 'A'}
              </span>
            </div>
          </div>

          {/* Narrative Editorial Description */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-600">
              Architectural Presentation & Provenance
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 font-light leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Dedicated Advisor Card & Agency Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-neutral-50 rounded-sm border border-neutral-200 gap-6 mt-8">
            <div className="flex items-center space-x-4">
              <img
                src={property.agent.photo}
                alt={property.agent.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-neutral-300"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-semibold">
                  Listing Advisor
                </p>
                <h4 className="text-base font-serif-luxury font-light text-[#1d1d1b]">
                  {property.agent.name}
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-neutral-700 mt-1 font-light">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-neutral-400" />
                    {property.agent.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-neutral-400" />
                    {property.agent.email || 'info@kretz.site'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-neutral-200 pt-4 sm:pt-0 sm:pl-6 text-xs text-neutral-600 font-light">
              <p className="font-semibold text-[#1d1d1b]">KRETZ Family Real Estate</p>
              <p>Paris · French Riviera · Courchevel · International</p>
              <p className="text-[11px] text-neutral-600 mt-0.5">Direct: info@kretz.site · https://kretz.site</p>
            </div>
          </div>

          {/* Dossier Footer / Legal disclaimer */}
          <div className="text-center text-[10px] text-neutral-600 border-t border-neutral-200 pt-6 font-light">
            <p>
              Confidential presentation document issued exclusively for client advisory purposes. All surface measurements and details are verified according to French Loi Carrez and certified cadastral surveys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
