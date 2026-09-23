import React, { useState, useEffect, useRef } from 'react';
import { Property, PropertyOwner } from '../types';
import {
  ShieldCheck,
  Crown,
  Sparkles,
  Award,
  Mail,
  Building2,
  Calendar,
  FileCheck,
  UserCheck,
  Camera,
  Upload,
  CheckCircle2,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  getOwnerPhoto,
  saveOwnerPhoto,
  deleteOwnerPhoto,
  subscribeOwnerPhotos,
} from '../services/ownerPhotosService';

interface PropertyOwnerCardProps {
  property: Property;
  owner: PropertyOwner;
  onPhotoUpdated?: (newPhotoUrl: string | null) => void;
}

export const PropertyOwnerCard: React.FC<PropertyOwnerCardProps> = ({
  property,
  owner,
  onPhotoUpdated,
}) => {
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(
    owner.photo || getOwnerPhoto(property.ref, owner.name)
  );
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to photo changes in ownerPhotosService
  useEffect(() => {
    const unsub = subscribeOwnerPhotos((photos) => {
      const updated = photos[property.ref] || (owner.name ? photos[owner.name] : null);
      if (updated !== undefined) {
        setCurrentPhoto(updated || null);
      }
    });
    return unsub;
  }, [property.ref, owner.name]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const savedUrl = await saveOwnerPhoto(property.ref, owner.name, dataUrl, file.name);
        setCurrentPhoto(savedUrl || dataUrl);
        if (onPhotoUpdated) onPhotoUpdated(savedUrl || dataUrl);
        setFeedback('Photo de profil du propriétaire enregistrée avec succès');
        setTimeout(() => setFeedback(null), 4000);
      } catch (err) {
        console.error('Failed to upload owner photo:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Supprimer la photo de profil de ce propriétaire ?')) return;
    await deleteOwnerPhoto(property.ref, owner.name);
    setCurrentPhoto(null);
    if (onPhotoUpdated) onPhotoUpdated(null);
    setFeedback('Photo réinitialisée');
    setTimeout(() => setFeedback(null), 3000);
  };

  // Email link for owner-mandate inquiries
  const ownerInquiryUrl = `mailto:info@kretz.site?subject=${encodeURIComponent(`Owner Mandate Inquiry - Ref ${property.ref} (${property.title})`)}&body=${encodeURIComponent(
    `Hello Kretz Real Estate,\n\nRegarding property ref ${property.ref} ("${property.title}" in ${property.location}):\n\nI would like to inquire about the owner mandate and historical provenance of ${owner.name} (${owner.category} - ${owner.ownershipType}).\n\nCould you share the confidential owner dossier?\n\nKind regards,`
  )}`;

  // Category Icon helper
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'Aristocracy & Royalty':
        return <Crown className="w-3.5 h-3.5 text-amber-500" />;
      case 'Haute Couture & Luxury':
        return <Sparkles className="w-3.5 h-3.5 text-rose-500" />;
      case 'Arts, Cinema & Architecture':
        return <Award className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Building2 className="w-3.5 h-3.5 text-neutral-600" />;
    }
  };

  return (
    <div
      id={`owner-card-${property.id}`}
      className="border border-neutral-200/90 bg-neutral-50/50 p-5 sm:p-6 space-y-4 rounded-sm"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/70 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#1d1d1b] text-white text-[10px] font-semibold tracking-wider uppercase">
            <UserCheck className="w-3 h-3 text-amber-400" />
            <span>Real Owner & Provenance</span>
          </span>
          <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Title / Mandate</span>
          </span>
          {currentPhoto && (
            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Photo Réelle Active</span>
            </span>
          )}
        </div>

        {owner.periodOrAcquired && (
          <div className="flex items-center space-x-1 text-[11px] text-neutral-500 font-mono">
            <Calendar className="w-3 h-3 text-neutral-400" />
            <span>{owner.periodOrAcquired}</span>
          </div>
        )}
      </div>

      {feedback && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        </div>
      )}

      {/* Main Identity Grid */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Profile Avatar: Real Photo or Monogram Crest with Quick Upload Overlay */}
        <div className="relative group shrink-0">
          {currentPhoto ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-400/50 shadow-md bg-neutral-900 relative">
              <img
                src={currentPhoto}
                alt={owner.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              {/* Hover overlay to change photo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Changer la photo du propriétaire"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer text-[10px]"
              >
                <Camera className="w-4 h-4 mb-0.5 text-amber-300" />
                <span>Changer</span>
              </button>
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1d1d1b] text-amber-300 border-2 border-amber-400/30 flex flex-col items-center justify-center font-serif-luxury text-xl sm:text-2xl font-normal shadow-sm relative overflow-hidden">
              <span>{owner.avatarInitials || 'KR'}</span>

              {/* Upload prompt hover button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Uploader la photo de profil du propriétaire"
                className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer text-[9px] uppercase tracking-wider"
              >
                <Upload className="w-4 h-4 mb-0.5 text-amber-300" />
                <span>Ajouter</span>
              </button>
            </div>
          )}

          {/* Quick upload camera pill */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title={currentPhoto ? 'Changer la photo de profil' : 'Ajouter photo de profil'}
            className="absolute -bottom-1 -right-1 p-1.5 bg-[#1d1d1b] hover:bg-black text-amber-300 rounded-full border border-neutral-300 shadow-sm transition-transform hover:scale-110 cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="w-3 h-3 animate-spin text-white" />
            ) : (
              <Camera className="w-3 h-3" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Owner Details */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-serif-luxury font-medium text-[#1d1d1b] tracking-wide">
              {owner.name}
            </h3>

            {/* Direct button to upload/change photo */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded text-[11px] font-medium transition-colors shadow-2xs cursor-pointer"
              >
                <Upload className="w-3 h-3 text-neutral-500" />
                <span>{currentPhoto ? 'Remplacer photo' : 'Ajouter photo propriétaire'}</span>
              </button>

              {currentPhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title="Supprimer la photo du propriétaire"
                  className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category tag */}
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-neutral-200 text-neutral-800 font-medium">
              {renderCategoryIcon(owner.category)}
              <span>{owner.category}</span>
            </span>

            {/* Ownership Type */}
            <span className="px-2 py-0.5 bg-neutral-200/80 text-neutral-700 font-mono text-[11px]">
              {owner.ownershipType}
            </span>

            {owner.nationality && (
              <span className="text-[11px] text-neutral-500 font-light">
                • {owner.nationality}
              </span>
            )}
          </div>

          {/* Quick Bio */}
          <div className="pt-2 text-xs sm:text-[13px] text-neutral-700 font-light leading-relaxed">
            <p className="italic text-neutral-800">"{owner.bio}"</p>
          </div>
        </div>
      </div>

      {/* Highlights checklist if present */}
      {owner.highlights && owner.highlights.length > 0 && (
        <div className="pt-3 border-t border-neutral-200/70 space-y-2">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 font-mono">
            Key Provenance & Estate Highlights
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {owner.highlights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-1.5 text-xs text-neutral-700 bg-white p-2 border border-neutral-200/80"
              >
                <FileCheck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-light">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact about owner mandate */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <p className="text-[11px] text-neutral-500 font-light">
          Private owner mandates are handled strictly under non-disclosure confidentiality.
        </p>
        <a
          href={ownerInquiryUrl}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-[#1d1d1b] hover:bg-neutral-800 text-white transition-colors self-start sm:self-auto"
        >
          <Mail className="w-3 h-3 text-amber-300" />
          <span>Inquire on Owner Mandate (info@kretz.site)</span>
        </a>
      </div>
    </div>
  );
};

