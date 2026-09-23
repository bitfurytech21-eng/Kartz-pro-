import React, { useState, useEffect } from 'react';
import { submitInquiry } from '../services/firestoreService';
import {
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Phone,
  Mail,
  Check,
  MapPin,
  Maximize2,
  Send,
  Building,
  Sparkles,
  Waves,
  Wind,
  Shield,
  Sun,
  Flame,
  Trophy,
  Trees,
  ShieldCheck,
  MessageCircle,
  FileText,
  RotateCw,
  Video,
  Play,
  Film,
  Globe,
  Image as ImageIcon,
  ExternalLink,
  Calendar as CalendarIcon,
  Navigation,
  Percent,
  Calculator,
  Crown,
  Printer,
  Layers,
  UserCheck,
} from 'lucide-react';
import { Property, Currency } from '../types';
import { useTranslation, translateText, Language } from '../i18n';
import { VirtualTourViewer } from './VirtualTourViewer';
import { PropertyMap } from './PropertyMap';
import { PropertyPaymentPlan } from './PropertyPaymentPlan';
import { PropertyOwnerCard } from './PropertyOwnerCard';
import { LocalAmenitiesSection } from './LocalAmenitiesSection';
import { getPropertyOwner } from '../data/ownersRegistry';
import { PropertyBrochureModal } from './PropertyBrochureModal';
import { PropertyLifestyleSection } from './PropertyLifestyleSection';
import { EnergyPerformanceChart } from './EnergyPerformanceChart';
import {
  getGoogleMapsUrl,
  getGoogleMapsDirectionsUrl,
} from '../services/googleMaps';
import {
  fetchPropertyFromProxy,
  extractVimeoId,
  ProxiedPropertyData,
} from '../services/propertyProxy';

interface PropertyDetailModalProps {
  property: Property | null;
  currency: Currency;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
  onSelectProperty?: (property: Property) => void;
  allProperties?: Property[];
  onOpenGmailWithProperty?: (property: Property) => void;
  onOpenCalendarWithProperty?: (property: Property) => void;
  currentLanguage?: Language;
  isCompared?: boolean;
  onToggleCompare?: (property: Property) => void;
  onOpenFinancialSuite?: (property: Property) => void;
}

const PropertyDetailModalContent: React.FC<{
  property: Property;
  currency: Currency;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
  onSelectProperty?: (property: Property) => void;
  allProperties?: Property[];
  onOpenGmailWithProperty?: (property: Property) => void;
  onOpenCalendarWithProperty?: (property: Property) => void;
  currentLanguage?: Language;
  isCompared?: boolean;
  onToggleCompare?: (property: Property) => void;
  onOpenFinancialSuite?: (property: Property) => void;
  onOpenOwnersManager?: () => void;
}> = ({
  property,
  currency,
  isSaved,
  onToggleSave,
  onClose,
  onSelectProperty,
  allProperties = [],
  onOpenGmailWithProperty,
  onOpenCalendarWithProperty,
  currentLanguage,
  isCompared = false,
  onToggleCompare,
  onOpenFinancialSuite,
  onOpenOwnersManager,
}) => {
  const { t, language: globalLang } = useTranslation();
  const effectiveInitialLang: Language = currentLanguage || globalLang || 'EN';

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isTourDialogOpen, setIsTourDialogOpen] = useState(false);
  const [isFilmDialogOpen, setIsFilmDialogOpen] = useState(false);
  const [descriptionLang, setDescriptionLang] = useState<Language>(effectiveInitialLang);
  const [translatedDescriptions, setTranslatedDescriptions] = useState<Record<string, string>>({});
  const [isTranslatingDesc, setIsTranslatingDesc] = useState(false);
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [proxiedData, setProxiedData] = useState<ProxiedPropertyData | null>(null);
  const [isProxyLoading, setIsProxyLoading] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hello, I would like to receive confidential information and schedule a private visit for property reference ${property.ref} in ${property.location}.`,
  });

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ['https://files.kretzrealestate.com/67ec4082a8f72d825044d16021ae9bdf.jpg'];

  // Update description language when global language changes
  useEffect(() => {
    if (globalLang && globalLang !== descriptionLang) {
      setDescriptionLang(globalLang);
    }
  }, [globalLang]);

  // Fetch live proxy data if needed
  useEffect(() => {
    let isMounted = true;
    setActiveImageIndex(0);
    setIsPhotoDialogOpen(false);
    setIsTourDialogOpen(false);
    setIsFilmDialogOpen(false);
    setInquirySent(false);
    setProxiedData(null);
    setTranslatedDescriptions({});
    setInquiryData((prev) => ({
      ...prev,
      message: `Hello, I would like to receive confidential information and schedule a private visit for property reference ${property.ref} in ${property.location}.`,
    }));

    // Check if we need to supplement with live proxy data
    setIsProxyLoading(true);
    fetchPropertyFromProxy(property.ref, property.propertyTypeSlug)
      .then((data) => {
        if (isMounted && data) {
          setProxiedData(data);
        }
      })
      .finally(() => {
        if (isMounted) setIsProxyLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [property.id, property.ref, property.location, property.propertyTypeSlug]);

  // Derived effective film / video attributes
  const effectiveVideoUrl =
    proxiedData?.videoUrl ||
    property.videoUrl ||
    property.filmUrl ||
    (property.films && property.films[0]);

  const effectiveVimeoId =
    proxiedData?.vimeoId ||
    property.vimeoId ||
    extractVimeoId(effectiveVideoUrl);

  const hasFilm = Boolean(effectiveVideoUrl || effectiveVimeoId);

  // Derived effective descriptions
  const descEn = proxiedData?.descriptionEn || property.descriptionEn || property.description || '';
  const descFr = proxiedData?.descriptionFr || property.descriptionFr || property.description || '';

  // Trigger translation when switching to any language other than native EN or FR
  useEffect(() => {
    if (descriptionLang !== 'EN' && descriptionLang !== 'FR') {
      if (!translatedDescriptions[descriptionLang]) {
        const baseText = descEn || descFr;
        if (baseText) {
          setIsTranslatingDesc(true);
          translateText(baseText, descriptionLang)
            .then((res) => {
              setTranslatedDescriptions((prev) => ({ ...prev, [descriptionLang]: res }));
            })
            .catch((err) => {
              console.warn(`Translation error for ${descriptionLang}:`, err);
            })
            .finally(() => {
              setIsTranslatingDesc(false);
            });
        }
      }
    }
  }, [descriptionLang, descEn, descFr, translatedDescriptions]);

  let currentDescription = descEn || descFr;
  if (descriptionLang === 'FR') {
    currentDescription = descFr || descEn;
  } else if (descriptionLang === 'EN') {
    currentDescription = descEn || descFr;
  } else if (translatedDescriptions[descriptionLang]) {
    currentDescription = translatedDescriptions[descriptionLang];
  }

  // Handle keyboard navigation for modal/dialogs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFilmDialogOpen) {
          setIsFilmDialogOpen(false);
        } else if (isTourDialogOpen) {
          setIsTourDialogOpen(false);
        } else if (isPhotoDialogOpen) {
          setIsPhotoDialogOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPhotoDialogOpen, isTourDialogOpen, isFilmDialogOpen, images.length, onClose]);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatCurrency = (priceNum: number | null, isConfidential: boolean) => {
    if (isConfidential || priceNum === null || priceNum === 0) {
      return 'Confidential price';
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

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);

    submitInquiry({
      propertyRef: property.ref,
      propertyTitle: property.title,
      senderName: inquiryData.name,
      senderEmail: inquiryData.email,
      senderPhone: inquiryData.phone,
      message: inquiryData.message,
    }).catch((err) => {
      console.warn('Firestore inquiry save notice:', err);
    });

    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyRef: property.ref,
        propertyTitle: property.title,
        senderName: inquiryData.name,
        senderEmail: inquiryData.email,
        senderPhone: inquiryData.phone,
        message: inquiryData.message,
      }),
    }).catch((err) => {
      console.error('Failed to save inquiry to database:', err);
    });
  };

  // Find similar properties
  const similarProperties = allProperties
    .filter((p) => p.id !== property.id && (p.department === property.department || p.typeDisplay === property.typeDisplay))
    .slice(0, 3);

  // Real Owner & Provenance
  const propertyOwner = property.owner || getPropertyOwner(property);

  // Pre-filled email inquiry message for this specific property
  const prefilledEmailSubject = `Inquiry regarding Property Ref ${property.ref} - ${property.title}`;
  const prefilledEmailBody = `Hello Kretz Real Estate,

I am inquiring regarding Property Reference: ${property.ref}
Title: ${property.title}
Location: ${property.location}
Price: ${property.price ? `${property.price.toLocaleString('fr-FR')} €` : 'Confidential'}

Could you please provide full architectural documentation, floor plans, and arrange a private confidential viewing?

Kind regards,`;

  const emailPropertyUrl = `mailto:info@kretz.site?subject=${encodeURIComponent(prefilledEmailSubject)}&body=${encodeURIComponent(prefilledEmailBody)}`;

  return (
    <div
      id="property-detail-modal"
      className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fadeIn flex flex-col property-detail-modal-container"
    >
      {/* Sticky Top Header Bar matching original Kretz */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all no-print">
        {/* Left: Authentic Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#1d1d1b] hover:text-neutral-500 py-1.5 px-2.5 rounded-xs transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        {/* Center: Authentic KRETZ Brand Wordmark */}
        <div className="flex items-center space-x-1 cursor-pointer" onClick={onClose}>
          <span className="font-serif-luxury text-xl font-bold tracking-[0.25em] text-[#1d1d1b]">
            KRETZ
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={() => onToggleSave(property.id)}
            className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
            title="Bookmark property"
          >
            <Heart
              className={`w-4 h-4 ${
                isSaved ? 'fill-red-500 text-red-500' : ''
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: property.title,
                  text: `${property.title} - ${property.location} (Ref: ${property.ref})`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-full transition-colors hidden sm:block"
            title="Share property"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(property)}
              className={`p-2 border rounded-xs transition-colors hidden sm:inline-flex items-center justify-center no-print ${
                isCompared
                  ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                  : 'border-neutral-200 text-neutral-800 hover:text-black hover:border-black'
              }`}
              title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
              aria-label={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
            >
              <Layers className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsBrochureOpen(true)}
            className="p-2 border border-neutral-200 text-neutral-800 hover:text-black hover:border-black rounded-xs transition-colors hidden sm:inline-flex items-center justify-center no-print"
            title="Download / Print Editorial PDF Brochure"
            aria-label="Download / Print Editorial PDF Brochure"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Close view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Property Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        {/* Print-Only Luxury Dossier Letterhead */}
        <div className="hidden print:block border-b-2 border-[#1d1d1b] pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif-luxury text-3xl font-bold tracking-[0.25em] text-[#1d1d1b]">
                KRETZ
              </div>
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium mt-1">
                Family Real Estate — Private Client Dossier
              </div>
            </div>
            <div className="text-right text-xs text-neutral-600 space-y-0.5 font-light">
              <div className="font-mono font-bold text-neutral-900 text-sm">REF: {property.ref}</div>
              <div>Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div className="text-neutral-500 text-[11px]">+33 7 53 07 75 72 • info@kretz.site</div>
            </div>
          </div>
        </div>
        {/* Top Breadcrumbs and Reference */}
        <div className="flex items-center justify-between text-xs text-neutral-500 font-light border-b border-neutral-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-neutral-800">France</span>
            <span>/</span>
            <span>{property.location}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-mono text-[11px] tracking-wider text-neutral-400">
              REF : {property.ref}
            </span>
            {property.chips.map((chip, idx) => (
              <span
                key={idx}
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#1d1d1b] text-white rounded-xs"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* 2-Column Hero Showcase (8 cols / 4 cols on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Photo Showcase with Authentic Buttons Group */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <div className="relative aspect-[16/10] sm:aspect-[21/11] bg-neutral-900 rounded-none overflow-hidden select-none shadow-sm group">
              <img
                src={images[activeImageIndex]}
                alt={`${property.title} - photo ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-center cursor-pointer transition-transform duration-700 ease-out group-hover:scale-102"
                onClick={() => setIsPhotoDialogOpen(true)}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  const src = target.src;
                  if (src.includes('files.kretzrealestate.com')) {
                    target.src = src.replace('https://files.kretzrealestate.com', '/files');
                  }
                }}
              />

              {/* Prev / Next Bordered Circular Arrows (CustomArrowBordered) */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black shadow-md border border-neutral-200/80 flex items-center justify-center transition-all opacity-85 hover:opacity-100 z-10 no-print"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black shadow-md border border-neutral-200/80 flex items-center justify-center transition-all opacity-85 hover:opacity-100 z-10 no-print"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Top Right Photo Count Pill */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-xs font-mono no-print">
                {activeImageIndex + 1} / {images.length}
              </div>

              {/* Bottom Centered Authentic Button Group matching original Kretz website */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 no-print">
                <div
                  role="group"
                  className="inline-flex rounded-sm bg-white overflow-hidden"
                  style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.16)' }}
                >
                  {/* Pictures Button */}
                  <button
                    type="button"
                    onClick={() => setIsPhotoDialogOpen(true)}
                    className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-5 py-2.5 text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-[#1d1d1b] hover:bg-neutral-100 transition-colors border-r border-neutral-200"
                  >
                    <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700" />
                    <span>Pictures ({images.length})</span>
                  </button>

                  {/* Cinema Film Button - Only shown if property originally has a video */}
                  {hasFilm && (
                    <button
                      type="button"
                      onClick={() => setIsFilmDialogOpen(true)}
                      className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-5 py-2.5 text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-[#1d1d1b] hover:bg-neutral-100 transition-colors border-r border-neutral-200 relative group"
                    >
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 fill-emerald-600 group-hover:scale-110 transition-transform" />
                      <span>Film</span>
                      <span className="relative flex h-2 w-2 ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </button>
                  )}

                  {/* Video / Virtual Tour Button */}
                  <button
                    type="button"
                    onClick={() => setIsTourDialogOpen(true)}
                    className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-5 py-2.5 text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-[#1d1d1b] hover:bg-neutral-100 transition-colors relative"
                  >
                    <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 animate-spin-slow" />
                    <span>Virtual Tour</span>
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Thumbnails Row underneath */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar no-print">
                {images.slice(0, 10).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-none w-20 h-14 rounded-xs overflow-hidden border-2 transition-all ${
                      idx === activeImageIndex
                        ? 'border-black scale-102 opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${idx + 1}`}
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
                  </button>
                ))}
                {images.length > 10 && (
                  <button
                    type="button"
                    onClick={() => setIsPhotoDialogOpen(true)}
                    className="flex-none w-20 h-14 rounded-xs bg-neutral-100 hover:bg-neutral-200 text-[#1d1d1b] flex flex-col items-center justify-center text-[10px] font-semibold tracking-wider transition-colors border-2 border-transparent"
                  >
                    <span>+{images.length - 10}</span>
                    <span>More</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Property Header, Specs, Price, and Authentic Black Family Real Estate Card */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            {/* Property Titles & Info */}
            <div className="border-b border-neutral-200 pb-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500 uppercase tracking-widest font-medium">
                <span>{property.location}</span>
                <span className="font-mono text-neutral-400">REF: {property.ref}</span>
              </div>

              <span className="text-xs uppercase tracking-widest font-semibold text-neutral-400 block pt-1">
                {property.typeDisplay || 'Prestige Residence'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-light font-serif-luxury text-[#1d1d1b] leading-tight">
                {property.title}
              </h1>

              {/* Specs inline with vertical dividers matching Kretz */}
              <div className="flex items-center space-x-3 text-xs text-neutral-600 pt-2 font-light">
                <span className="font-medium text-neutral-900">
                  {property.surface > 0 ? `${property.surface} sqm` : 'Exceptional area'}
                </span>
                <span className="w-px h-3 bg-neutral-300"></span>
                <span>{property.bedrooms > 0 ? `${property.bedrooms} Bedrooms` : 'Multiple Suites'}</span>
                <span className="w-px h-3 bg-neutral-300"></span>
                <span>{property.rooms > 0 ? `${property.rooms} Rooms` : 'Multi-room'}</span>
              </div>

              {/* Owner Provenance Pill */}
              {propertyOwner && (
                <div className="pt-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById(`owner-section-${property.id}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 text-xs transition-colors text-left"
                    title="Click to view full owner biography and provenance"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-neutral-500 font-normal">Real Owner:</span>
                    <span className="font-semibold text-neutral-900 font-serif-luxury tracking-wide truncate max-w-[260px]">
                      {propertyOwner.name}
                    </span>
                    <span className="text-neutral-400 text-[10px]">↓</span>
                  </button>
                </div>
              )}

              {/* Display Price */}
              <div className="pt-3">
                <div className="text-2xl sm:text-3xl font-semibold text-[#1d1d1b] tracking-tight">
                  {formatCurrency(property.price, property.isConfidential)}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Agency fees included in displayed price
                </div>

                {/* Overview & Acquisition Options Quick Callout */}
                <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-[#1d1d1b] text-white text-[10px] font-semibold tracking-wider uppercase">
                        <FileText className="w-2.5 h-2.5 text-amber-400" />
                        <span>Description</span>
                      </span>
                      <span className="text-[11px] text-neutral-500 font-light">Architectural Overview</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById(`description-section-${property.id}`)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-medium text-[#1d1d1b] hover:text-neutral-600 underline whitespace-nowrap ml-2 cursor-pointer"
                    >
                      Read Description ↓
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-neutral-200/60">
                    <div className="flex items-center space-x-1.5">
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-neutral-200 text-neutral-800 text-[10px] font-semibold tracking-wider uppercase">
                        <Percent className="w-2.5 h-2.5 text-neutral-700" />
                        <span>Payment Plan</span>
                      </span>
                      <span className="text-[11px] text-neutral-600 font-light truncate">
                        {formatCurrency(property.price ? property.price * 0.55 : null, property.isConfidential)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById(`payment-plan-section-${property.id}`)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-medium text-neutral-700 hover:text-black underline whitespace-nowrap ml-2 cursor-pointer"
                    >
                      View Schedule ↓
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentic Black Card: Kretz Family Real Estate */}
            <div className="bg-[#1D1D1B] text-white p-6 rounded-none space-y-5 shadow-sm">
              {/* Kretz Wordmark SVG & Family Subtitle */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-serif-luxury text-2xl font-bold tracking-[0.2em] text-white">
                    KRETZ
                  </span>
                </div>
                <div className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                  Family Real Estate
                </div>
              </div>

              {/* Authentic Emblem SVG */}
              <div className="w-10 h-10 opacity-80 text-white">
                <svg viewBox="0 0 183.214 183.214" fill="currentColor" className="w-full h-full">
                  <path d="M488.274,166.269q-1.363-1.468-2.79-2.878a91.526,91.526,0,0,0-91.4-22.345q-2.021.625-4,1.346a91.581,91.581,0,0,0-51.343,126.1q.985,2.028,2.069,4a92.118,92.118,0,0,0,49.274,42.238q1.98.717,4,1.346A91.545,91.545,0,0,0,490.1,288.834q1.32-1.509,2.574-3.075a91.414,91.414,0,0,0-4.4-119.49Zm-67.1-25.313A87.315,87.315,0,0,1,482.436,166l-23.928,20.491a56.238,56.238,0,0,0-64.423-7.242v-34A87.266,87.266,0,0,1,421.176,140.957Zm-27.09,100.708V183.873a52.247,52.247,0,0,1,61.361,5.243Zm-60.517-13.1a87.749,87.749,0,0,1,56.517-81.9V268.5H343.212A87.073,87.073,0,0,1,333.569,228.563ZM345.406,272.5h44.68v37.969A88.115,88.115,0,0,1,345.406,272.5Zm75.771,43.674a87.266,87.266,0,0,1-27.09-4.293V246.933L421.8,223.2l65.416,62.866A87.431,87.431,0,0,1,421.176,316.171Zm68.608-33.192-64.928-62.4,60.379-51.709a87.429,87.429,0,0,1,4.549,114.107Z" transform="translate(-329.569 -136.957)" />
                </svg>
              </div>

              {/* Exact Description text from Kretz website */}
              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                Kretz is an independent family agency specialized in luxury real estate in France and internationally for over 10 years. Its responsiveness and constant technological innovation allow it to support both local and international clients with excellence.
              </p>

              {/* Official Company Mandate & Advisory */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#2a2a28] border border-amber-400/40 p-2 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
                    <svg viewBox="0 0 183.214 183.214" fill="currentColor" className="w-full h-full">
                      <path d="M488.274,166.269q-1.363-1.468-2.79-2.878a91.526,91.526,0,0,0-91.4-22.345q-2.021.625-4,1.346a91.581,91.581,0,0,0-51.343,126.1q.985,2.028,2.069,4a92.118,92.118,0,0,0,49.274,42.238q1.98.717,4,1.346A91.545,91.545,0,0,0,490.1,288.834q1.32-1.509,2.574-3.075a91.414,91.414,0,0,0-4.4-119.49Zm-67.1-25.313A87.315,87.315,0,0,1,482.436,166l-23.928,20.491a56.238,56.238,0,0,0-64.423-7.242v-34A87.266,87.266,0,0,1,421.176,140.957Zm-27.09,100.708V183.873a52.247,52.247,0,0,1,61.361,5.243Zm-60.517-13.1a87.749,87.749,0,0,1,56.517-81.9V268.5H343.212A87.073,87.073,0,0,1,333.569,228.563ZM345.406,272.5h44.68v37.969A88.115,88.115,0,0,1,345.406,272.5Zm75.771,43.674a87.266,87.266,0,0,1-27.09-4.293V246.933L421.8,223.2l65.416,62.866A87.431,87.431,0,0,1,421.176,316.171Zm68.608-33.192-64.928-62.4,60.379-51.709a87.429,87.429,0,0,1,4.549,114.107Z" transform="translate(-329.569 -136.957)" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-400 font-mono tracking-widest uppercase">Official Mandate</div>
                    <div className="text-sm font-semibold text-white tracking-wide">Kretz Real Estate</div>
                    <div className="text-[11px] text-neutral-300 font-light">Private Client Advisory</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-300 font-light">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <a href="tel:+33753077572" className="hover:underline font-mono">
                      +33 7 53 07 75 72
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-amber-300" />
                    <a
                      href={emailPropertyUrl}
                      className="hover:underline font-mono text-amber-300 hover:text-white truncate"
                      title={`Inquire about Ref ${property.ref} via info@kretz.site`}
                    >
                      info@kretz.site (Ref: {property.ref})
                    </a>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="pt-2 space-y-2 no-print">
                  <a
                    href={emailPropertyUrl}
                    className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-3 bg-[#1d1d1b] hover:bg-black text-white border border-neutral-700 rounded-none text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
                    title={`Inquire via info@kretz.site about ${property.title} (Ref: ${property.ref})`}
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-300" />
                    <span>Inquire Ref {property.ref} (info@kretz.site)</span>
                  </a>

                  {onOpenGmailWithProperty && (
                    <button
                      type="button"
                      onClick={() => onOpenGmailWithProperty(property)}
                      className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-none text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-neutral-200" />
                      <span>Email Kretz Private Office (Gmail)</span>
                    </button>
                  )}

                  {onOpenCalendarWithProperty && (
                    <button
                      type="button"
                      onClick={() => onOpenCalendarWithProperty(property)}
                      className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-none text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-neutral-200" />
                      <span>Schedule Viewing (Calendar)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Property Description (Replacing Mortgage Calculator) */}
        <div id={`description-section-${property.id}`} className="border-t border-neutral-200 pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1d1d1b]">
                {t.propertyDetail.overview}
              </h2>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Curated architectural narrative and interior highlights for this estate.
              </p>
            </div>

            {/* Language Toggle for Description */}
            <div className="flex items-center space-x-2 no-print">
              <div className="inline-flex items-center rounded-xs border border-neutral-200 bg-neutral-100 p-0.5 text-xs">
                {(['EN', 'FR', 'ES', 'DE', 'IT'] as const).map((langCode) => (
                  <button
                    key={langCode}
                    type="button"
                    onClick={() => setDescriptionLang(langCode)}
                    className={`px-2 py-1 rounded-xs font-medium transition-all ${
                      descriptionLang === langCode
                        ? 'bg-white text-[#1d1d1b] shadow-xs font-semibold'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    {langCode === 'EN' && '🇬🇧 EN'}
                    {langCode === 'FR' && '🇫🇷 FR'}
                    {langCode === 'ES' && '🇪🇸 ES'}
                    {langCode === 'DE' && '🇩🇪 DE'}
                    {langCode === 'IT' && '🇮🇹 IT'}
                  </button>
                ))}
              </div>

              {/* Extended language selector dropdown for remaining languages */}
              <select
                value={['EN', 'FR', 'ES', 'DE', 'IT'].includes(descriptionLang) ? '' : descriptionLang}
                onChange={(e) => {
                  if (e.target.value) {
                    setDescriptionLang(e.target.value as Language);
                  }
                }}
                className={`text-xs py-1 px-2 rounded-xs border border-neutral-200 bg-white font-medium text-neutral-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black ${
                  !['EN', 'FR', 'ES', 'DE', 'IT'].includes(descriptionLang)
                    ? 'border-neutral-800 font-bold bg-neutral-50'
                    : ''
                }`}
              >
                <option value="" disabled>
                  {['EN', 'FR', 'ES', 'DE', 'IT'].includes(descriptionLang)
                    ? '+ More Languages'
                    : `${descriptionLang}`}
                </option>
                <option value="PT">🇵🇹 Português (PT)</option>
                <option value="RU">🇷🇺 Русский (RU)</option>
                <option value="ZH">🇨🇳 中文 (ZH)</option>
                <option value="AR">🇦🇪 العربية (AR)</option>
                <option value="JA">🇯🇵 日本語 (JA)</option>
                <option value="NL">🇳🇱 Nederlands (NL)</option>
                <option value="SV">🇸🇪 Svenska (SV)</option>
                <option value="KO">🇰🇷 한국어 (KO)</option>
                <option value="TR">🇹🇷 Türkçe (TR)</option>
                <option value="PL">🇵🇱 Polski (PL)</option>
                <option value="EL">🇬🇷 Ελληνικά (EL)</option>
                <option value="HI">🇮🇳 हिन्दी (HI)</option>
                <option value="HE">🇮🇱 עברית (HE)</option>
                <option value="DA">🇩🇰 Dansk (DA)</option>
                <option value="NO">🇳🇴 Norsk (NO)</option>
                <option value="FI">🇫🇮 Suomi (FI)</option>
                <option value="CS">🇨🇿 Čeština (CS)</option>
                <option value="TH">🇹🇭 ไทย (TH)</option>
                <option value="VI">🇻🇳 Tiếng Việt (VI)</option>
              </select>
            </div>
          </div>

          <div className="relative text-sm text-neutral-800 font-light leading-relaxed max-w-4xl space-y-4 whitespace-pre-line bg-[#fcfbf9] p-5 sm:p-6 border border-neutral-200/80 rounded-xs min-h-[120px]">
            {isTranslatingDesc ? (
              <div className="flex items-center justify-center space-x-2 py-8 text-neutral-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs uppercase tracking-widest font-mono">
                  {t.propertyDetail.translatingDescription || 'Translating description...'} ({descriptionLang})
                </span>
              </div>
            ) : (
              currentDescription || property.description
            )}
          </div>
        </div>

        {/* Characteristics Grid */}
        <div className="border-t border-neutral-200 pt-8 space-y-4">
          <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1d1d1b]">
            {t.propertyDetail.keyCharacteristics}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-5 bg-[#fcfbf9] border border-neutral-200/80 rounded-none text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                {t.propertyDetail.livingArea}
              </span>
              <span className="font-semibold text-[#1d1d1b]">
                {property.surface > 0 ? `${property.surface} m²` : 'Exceptional'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                {t.propertyDetail.garden}
              </span>
              <span className="font-semibold text-[#1d1d1b]">
                {property.amenities.gardenSurface && property.amenities.gardenSurface > 0
                  ? `${property.amenities.gardenSurface.toLocaleString()} m²`
                  : property.amenities.garden
                  ? 'Landscaped'
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                {t.propertyDetail.rooms}
              </span>
              <span className="font-semibold text-[#1d1d1b]">
                {property.rooms > 0 ? `${property.rooms} ${t.propertyCard.rooms}` : 'Multi-room'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                {t.propertyDetail.bedrooms}
              </span>
              <span className="font-semibold text-[#1d1d1b]">
                {property.bedrooms > 0 ? `${property.bedrooms} ${t.propertyCard.bedrooms}` : 'Master Suites'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                {t.propertyDetail.propertyType}
              </span>
              <span className="font-semibold text-[#1d1d1b] truncate block" title={property.typeDisplay}>
                {property.typeDisplay}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                Mandate
              </span>
              <span className="font-semibold text-[#1d1d1b]">
                {property.isExclusive ? t.propertyCard.exclusive : property.isCoExclusive ? 'Co-exclusive' : property.isOffMarket ? t.propertyCard.offMarket : 'Direct'}
              </span>
            </div>
          </div>
        </div>

        {/* Real Property Owner & Provenance Section */}
        <div id={`owner-section-${property.id}`} className="border-t border-neutral-200 pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1d1d1b]">
                Real Property Owner & Provenance
              </h2>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Authentic historical lineage, current ownership mandate, and biographical profile for this estate.
              </p>
            </div>
            {onOpenOwnersManager && (
              <button
                type="button"
                onClick={onOpenOwnersManager}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium transition cursor-pointer self-start sm:self-center"
                title="Gérer les photos de tous les propriétaires"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Tous les Propriétaires</span>
              </button>
            )}
          </div>
          <PropertyOwnerCard property={property} owner={propertyOwner} />
        </div>

        {/* Structured Installment & Payment Plan */}
        <div id={`payment-plan-section-${property.id}`} className="border-t border-neutral-200 pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1d1d1b]">
                Structured Installment & Payment Plan
              </h2>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Explore Kretz structured milestone plans for private acquisition.
              </p>
            </div>
            {onOpenFinancialSuite && (
              <button
                type="button"
                onClick={() => onOpenFinancialSuite(property)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold bg-[#fae9e5] text-[#1d1d1b] border border-neutral-300 rounded-xs hover:bg-[#1d1d1b] hover:text-white transition self-start sm:self-auto no-print cursor-pointer"
                title="Open interactive French Notary Duties & Wealth Tax Simulator"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Notary & IFI Suite</span>
              </button>
            )}
          </div>
          <PropertyPaymentPlan property={property} currency={currency} />
        </div>

        {/* Amenities & Equipments */}
        <div className="border-t border-neutral-200 pt-8 space-y-4">
          <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1d1d1b]">
            {t.propertyDetail.amenities}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
              <Check className="w-3.5 h-3.5 text-black flex-shrink-0" />
              <span>Prestige Location</span>
            </div>
            {property.amenities.pool && (
              <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
                <Waves className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span>Swimming Pool</span>
              </div>
            )}
            {property.amenities.ac && (
              <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
                <Wind className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span>Air Conditioning</span>
              </div>
            )}
            {property.amenities.elevator && (
              <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
                <Building className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span>Private Elevator</span>
              </div>
            )}
            {property.amenities.terrace && (
              <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
                <Sun className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span>
                  Terrace {property.amenities.terraceSurface ? `(${property.amenities.terraceSurface} m²)` : ''}
                </span>
              </div>
            )}
            {property.amenities.balcony && (
              <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
                <Maximize2 className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span>Balcony / Loggia</span>
              </div>
            )}
            {property.amenities.garden && (
              <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
                <Trees className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span>Landscaped Grounds</span>
              </div>
            )}
            {property.amenities.chimney && (
              <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
                <Flame className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span>Fireplace / Cheminée</span>
              </div>
            )}
            {property.amenities.tennis && (
              <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
                <Trophy className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span>Private Tennis Court</span>
              </div>
            )}
            {property.amenities.jacuzzi && (
              <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
                <Sparkles className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span>Jacuzzi / Spa</span>
              </div>
            )}
            {property.amenities.alarm && (
              <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
                <ShieldCheck className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span>Security & Alarm System</span>
              </div>
            )}
            <div className="flex items-center space-x-2.5 p-2.5 bg-neutral-50 rounded-none border border-neutral-100">
              <Shield className="w-3.5 h-3.5 text-black flex-shrink-0" />
              <span>Confidential Mandate</span>
            </div>
          </div>
        </div>

        {/* Energy Performance (DPE / GES) Chart */}
        <div className="border-t border-neutral-200 pt-8">
          <EnergyPerformanceChart
            property={property}
            energyGrade={proxiedData?.dpe?.energyRating || (property as any).energyGrade}
            gesGrade={proxiedData?.dpe?.gesRating || (property as any).gesGrade}
            language={descriptionLang || currentLanguage || globalLang || 'EN'}
          />
        </div>

        {/* Location Map */}
        <div className="border-t border-neutral-200 pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1d1d1b]">
                  Property Location & Cartography
                </h2>
                <span className="px-2 py-0.5 bg-neutral-100 text-[10px] uppercase font-bold tracking-wider text-neutral-700 rounded-sm">
                  Google Maps
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-neutral-500 mt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                  <span>{property.location}</span>
                </span>
                {property.lat && property.lng && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-neutral-600">
                      {property.lat.toFixed(5)}° N, {property.lng.toFixed(5)}° E
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 no-print">
              {property.lat && property.lng && (
                <>
                  <a
                    href={getGoogleMapsUrl(property.lat, property.lng, property.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1d1d1b] text-white text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-neutral-800 transition-colors shadow-sm"
                    title="Open exact location in Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open in Google Maps</span>
                  </a>
                  <a
                    href={getGoogleMapsDirectionsUrl(property.lat, property.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-neutral-100 text-neutral-800 text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-neutral-200 transition-colors border border-neutral-200"
                    title="Get driving / transit directions"
                  >
                    <span>Directions</span>
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="h-80 w-full rounded-sm overflow-hidden border border-neutral-200 shadow-sm">
            <PropertyMap
              properties={[property]}
              currency={currency}
              selectedPropertyId={property.id}
              onSelectProperty={() => {}}
            />
          </div>
        </div>

        {/* Local Amenities & Neighborhood (Google Search Grounded) */}
        <LocalAmenitiesSection property={property} />

        {/* Hyper-Local Lifestyle & Sunlight Exposure Simulator */}
        <PropertyLifestyleSection property={property} />

        {/* Direct Inquiry & Visit Request Form */}
        <div className="border-t border-neutral-200 pt-8 space-y-4">
          <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1d1d1b]">
            Schedule a Private Viewing or Request Dossier
          </h2>

          {/* Clean print dossier advisory note replacing interactive web form */}
          <div className="hidden print:block p-5 border border-neutral-200 bg-neutral-50 text-xs text-neutral-700 space-y-2">
            <div className="font-semibold text-[#1d1d1b] uppercase tracking-wider text-[11px]">
              Private Client Inquiries & Acquisition Mandate
            </div>
            <p className="font-light leading-relaxed">
              To arrange a confidential private inspection, receive complete architectural plans, or discuss structured acquisition terms for reference {property.ref}, please contact the Kretz Family Real Estate Private Client Office directly:
            </p>
            <div className="font-mono text-[11px] text-neutral-900 pt-1">
              Telephone: +33 7 53 07 75 72 &nbsp;|&nbsp; Email: info@kretz.site (Ref: {property.ref})
            </div>
          </div>

          {inquirySent ? (
            <div className="p-8 bg-green-50 border border-green-200 text-center space-y-3 animate-fadeIn no-print">
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-[#1d1d1b]">
                Inquiry Transmitted Successfully
              </h4>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto font-light">
                Your request regarding ref {property.ref} has been forwarded to the Kretz Real Estate Private Client Office. Our advisory team will contact you promptly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendInquiry} className="space-y-4 max-w-2xl text-xs no-print">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={inquiryData.name}
                  onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                  className="px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-none focus:outline-none focus:border-black"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={inquiryData.email}
                  onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                  className="px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-none focus:outline-none focus:border-black"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number *"
                  value={inquiryData.phone}
                  onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                  className="px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-none focus:outline-none focus:border-black"
                />
              </div>

              <textarea
                rows={3}
                value={inquiryData.message}
                onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-none focus:outline-none focus:border-black resize-none"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-neutral-400">
                  * All requests handled with absolute confidentiality.
                </span>
                <div className="flex items-center space-x-2">
                  {onOpenGmailWithProperty && (
                    <button
                      type="button"
                      onClick={() => onOpenGmailWithProperty(property)}
                      className="px-4 py-3 border border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 text-[#1d1d1b] rounded-none uppercase tracking-widest font-semibold text-[11px] flex items-center space-x-1.5 transition-colors"
                      title="Send directly from your verified Gmail account"
                    >
                      <Mail className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Send via Gmail</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#1d1d1b] hover:bg-neutral-800 text-white rounded-none uppercase tracking-widest font-semibold text-[11px] flex items-center space-x-2 transition-colors"
                  >
                    <span>Transmit Request</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="border-t border-neutral-200 pt-8 pb-12 space-y-6 no-print">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-[#1d1d1b]">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {similarProperties.map((simProp) => (
                <div
                  key={simProp.id}
                  onClick={() => onSelectProperty && onSelectProperty(simProp)}
                  className="group cursor-pointer border border-neutral-200 overflow-hidden bg-white hover:shadow-md transition-all"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
                    <img
                      src={simProp.images[0]}
                      alt={simProp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#1d1d1b] text-white">
                      REF: {simProp.ref}
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="text-[11px] text-neutral-500 uppercase tracking-wider truncate">
                      {simProp.location}
                    </div>
                    <h4 className="text-sm font-semibold text-[#1d1d1b] truncate">
                      {simProp.title}
                    </h4>
                    <div className="text-xs font-medium text-neutral-800 pt-1">
                      {formatCurrency(simProp.price, simProp.isConfidential)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FULLSCREEN PHOTO DIALOG ('x' in original Kretz) */}
      {isPhotoDialogOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-fadeIn no-print">
          {/* Top Bar */}
          <div className="px-6 py-4 flex items-center justify-between text-white border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <span className="font-serif-luxury text-lg tracking-widest">KRETZ</span>
              <span className="text-neutral-400 text-xs">|</span>
              <span className="text-xs text-neutral-300 font-mono">
                {activeImageIndex + 1} / {images.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsPhotoDialogOpen(false)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close photos dialog"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Photo View */}
          <div className="flex-1 relative flex items-center justify-center p-4 select-none">
            <img
              src={images[activeImageIndex]}
              alt={`${property.title} large photo ${activeImageIndex + 1}`}
              className="max-h-[75vh] max-w-[90vw] object-contain shadow-2xl transition-all"
              referrerPolicy="no-referrer"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="h-20 bg-black/80 border-t border-white/10 px-4 py-2 flex items-center justify-center space-x-2 overflow-x-auto no-scrollbar flex-shrink-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`flex-none w-16 h-12 rounded-xs overflow-hidden border-2 transition-all ${
                  idx === activeImageIndex
                    ? 'border-white scale-105'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN VIRTUAL TOUR DIALOG ('Fn' in original Kretz) */}
      {isTourDialogOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-fadeIn no-print">
          {/* Header Bar */}
          <div className="px-6 py-4 flex items-center justify-between text-white border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <span className="font-serif-luxury text-lg tracking-widest">KRETZ</span>
              <span className="text-neutral-400 text-xs">|</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-neutral-200">
                Virtual Tour & 360° Walkthrough
              </span>
              <span className="text-neutral-500 text-xs font-mono">
                REF: {property.ref}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {property.externalTourUrl && (
                <a
                  href={property.externalTourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xs text-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open on Kretz.com</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setIsTourDialogOpen(false)}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close virtual tour dialog"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Virtual Tour Container */}
          <div className="flex-1 relative bg-black flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            <div className="w-full h-full max-w-6xl max-h-[85vh] rounded-xs overflow-hidden shadow-2xl flex flex-col">
              <VirtualTourViewer property={property} />
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN CINEMA FILM DIALOG */}
      {isFilmDialogOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-fadeIn no-print">
          {/* Header Bar */}
          <div className="px-6 py-4 flex items-center justify-between text-white border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <span className="font-serif-luxury text-lg tracking-widest">KRETZ</span>
              <span className="text-neutral-400 text-xs">|</span>
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="text-xs uppercase tracking-wider font-semibold text-neutral-200">
                  Cinematography & Property Film
                </span>
              </div>
              <span className="text-neutral-500 text-xs font-mono hidden sm:inline">
                REF: {property.ref}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {effectiveVideoUrl && (
                <a
                  href={effectiveVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xs text-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Watch on Vimeo</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setIsFilmDialogOpen(false)}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close film dialog"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Film Video Player Container */}
          <div className="flex-1 relative bg-black flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            <div className="w-full h-full max-w-5xl max-h-[85vh] rounded-xs overflow-hidden shadow-2xl flex flex-col bg-neutral-950 border border-white/10">
              {effectiveVimeoId ? (
                <div className="relative w-full h-full aspect-video">
                  <iframe
                    src={`https://player.vimeo.com/video/${effectiveVimeoId}?autoplay=1&badge=0&autopause=0&player_id=0&app_id=122963&title=0&byline=0&portrait=0`}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
                    allowFullScreen
                    title={`${property.title} - Film`}
                  />
                </div>
              ) : effectiveVideoUrl ? (
                <div className="relative w-full h-full aspect-video">
                  <iframe
                    src={effectiveVideoUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={`${property.title} - Film`}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      {/* Floating Property Support / Contact Button (Pre-filled for Ref inquiry via info@kretz.site) */}
      <aside
        aria-label="Property Support Inquiry"
        className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end animate-fadeIn"
      >
        <a
          id={`floating-property-support-btn-${property.ref}`}
          href={emailPropertyUrl}
          className="group relative flex items-center space-x-3 px-4 py-3 bg-[#1d1d1b] hover:bg-black text-white rounded-full shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 border border-neutral-700/60"
          title={`Inquire via info@kretz.site about Ref ${property.ref} - ${property.title}`}
        >
          {/* Mail Icon with active pulse beacon */}
          <div className="relative flex items-center justify-center">
            <Mail className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-semibold tracking-wide uppercase font-sans leading-none flex items-center space-x-1">
              <span>Ask about Ref {property.ref}</span>
            </span>
            <span className="text-[9px] text-amber-300/90 font-light font-mono mt-0.5">
              info@kretz.site
            </span>
          </div>
        </a>
      </aside>

      {/* Downloadable / Printable Editorial PDF Brochure Modal */}
      <PropertyBrochureModal
        property={property}
        isOpen={isBrochureOpen}
        onClose={() => setIsBrochureOpen(false)}
        currency={currency}
      />
    </div>
  );
};

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = (props) => {
  if (!props.property) return null;
  return (
    <PropertyDetailModalContent
      {...props}
      property={props.property}
    />
  );
};

