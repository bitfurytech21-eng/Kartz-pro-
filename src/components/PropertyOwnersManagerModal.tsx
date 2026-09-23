import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Property, PropertyOwner } from '../types';
import {
  X,
  Upload,
  Camera,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  Building2,
  Sparkles,
  Crown,
  Award,
  ExternalLink,
  RefreshCw,
  FolderUp,
} from 'lucide-react';
import {
  getAllOwnerPhotos,
  saveOwnerPhoto,
  deleteOwnerPhoto,
  bulkUploadOwnerPhotos,
  subscribeOwnerPhotos,
  syncOwnerPhotosWithServer,
} from '../services/ownerPhotosService';

interface PropertyOwnersManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSelectProperty?: (property: Property) => void;
}

export const PropertyOwnersManagerModal: React.FC<PropertyOwnersManagerModalProps> = ({
  isOpen,
  onClose,
  properties,
  onSelectProperty,
}) => {
  const [photosMap, setPhotosMap] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'with-photo' | 'without-photo'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const individualInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  // Subscribe to photo changes
  useEffect(() => {
    const unsub = subscribeOwnerPhotos((photos) => {
      setPhotosMap(photos);
    });
    return unsub;
  }, []);

  // Sync with server on open
  useEffect(() => {
    if (isOpen) {
      syncOwnerPhotosWithServer().catch(() => {});
    }
  }, [isOpen]);

  // Distinct property list with owners
  const propertiesWithOwners = useMemo(() => {
    return properties.filter((p) => Boolean(p.owner || p.ref));
  }, [properties]);

  // Filtered properties
  const filteredList = useMemo(() => {
    return propertiesWithOwners.filter((p) => {
      const owner = p.owner;
      const ref = p.ref.toLowerCase();
      const title = p.title.toLowerCase();
      const ownerName = owner?.name?.toLowerCase() || '';
      const category = owner?.category?.toLowerCase() || '';
      const location = p.location?.toLowerCase() || '';

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        ref.includes(query) ||
        title.includes(query) ||
        ownerName.includes(query) ||
        category.includes(query) ||
        location.includes(query);

      if (!matchesSearch) return false;

      const hasPhoto = Boolean(photosMap[p.ref] || (owner?.name && photosMap[owner.name]));
      if (filterMode === 'with-photo') return hasPhoto;
      if (filterMode === 'without-photo') return !hasPhoto;
      return true;
    });
  }, [propertiesWithOwners, searchQuery, filterMode, photosMap]);

  // Statistics
  const totalCount = propertiesWithOwners.length;
  const withPhotoCount = useMemo(() => {
    return propertiesWithOwners.filter((p) => {
      const owner = p.owner;
      return Boolean(photosMap[p.ref] || (owner?.name && photosMap[owner.name]));
    }).length;
  }, [propertiesWithOwners, photosMap]);

  const percentageCovered = totalCount > 0 ? Math.round((withPhotoCount / totalCount) * 100) : 0;

  // Handle individual upload
  const handleIndividualUpload = (
    propertyRef: string,
    ownerName: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await saveOwnerPhoto(propertyRef, ownerName, dataUrl, file.name);
      setFeedback(`Photo mise à jour pour le propriétaire de ${propertyRef}`);
      setTimeout(() => setFeedback(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  // Handle individual delete
  const handleDeletePhoto = async (propertyRef: string, ownerName: string) => {
    if (!window.confirm(`Supprimer la photo du propriétaire pour la référence ${propertyRef} ?`)) return;
    await deleteOwnerPhoto(propertyRef, ownerName);
    setFeedback(`Photo supprimée pour ${propertyRef}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Handle bulk upload
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsBulkUploading(true);
    try {
      const result = await bulkUploadOwnerPhotos(
        files,
        properties.map((p) => ({
          ref: p.ref,
          title: p.title,
          owner: p.owner ? { name: p.owner.name } : undefined,
        }))
      );

      if (result.matchedCount > 0) {
        setFeedback(
          `Succès ! ${result.matchedCount} photo(s) de propriétaires importée(s) et synchronisée(s).`
        );
      } else {
        setFeedback(
          `Aucune correspondance automatique trouvée. Nommez vos fichiers avec la référence (ex: ${properties[0]?.ref || 'KP1-173'}.jpg) ou le nom du propriétaire.`
        );
      }
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error('Bulk upload failed', err);
      setFeedback('Erreur lors de l’import en masse.');
    } finally {
      setIsBulkUploading(false);
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="property-owners-manager-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-md shadow-2xl flex flex-col overflow-hidden border border-neutral-200 text-[#1d1d1b]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#fae9e5]/20 flex items-center justify-center text-[#fae9e5]">
              <UserCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-serif font-bold tracking-wide">
                  Gestionnaire des Photos des Propriétaires
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Real Owners Provenance
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Uploadez et gérez les photos de profil réelles des propriétaires de chaque bien du portefeuille.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => syncOwnerPhotosWithServer()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition cursor-pointer"
              title="Rafraîchir les photos depuis le serveur"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rafraîchir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="bg-emerald-50 text-emerald-900 border-b border-emerald-200 px-6 py-2.5 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{feedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats & Bulk Upload Action Banner */}
        <div className="p-4 sm:p-6 bg-neutral-50 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                Total Propriétés / Mandats
              </span>
              <span className="text-xl font-bold font-serif text-[#1d1d1b]">
                {totalCount}
              </span>
            </div>

            <div className="border-l border-neutral-200 pl-6">
              <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold block">
                Photos Réelles Actives
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-serif text-emerald-800">
                  {withPhotoCount}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  ({percentageCovered}% couvert)
                </span>
              </div>
            </div>

            <div className="border-l border-neutral-200 pl-6 hidden sm:block">
              <span className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold block">
                En attente de photo
              </span>
              <span className="text-xl font-bold font-serif text-amber-800">
                {totalCount - withPhotoCount}
              </span>
            </div>
          </div>

          {/* Bulk Import Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => bulkFileInputRef.current?.click()}
              disabled={isBulkUploading}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1d1d1b] hover:bg-neutral-800 text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition shadow-sm cursor-pointer"
            >
              <FolderUp className="w-4 h-4 text-amber-300" />
              <span>
                {isBulkUploading ? 'Importation en cours...' : 'Importer des photos en masse'}
              </span>
            </button>
            <input
              ref={bulkFileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleBulkUpload}
            />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-neutral-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, titre, nom du propriétaire..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded text-[#1d1d1b] focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as any)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-[#1d1d1b] focus:outline-none focus:border-black"
            >
              <option value="all">Tous les propriétaires ({totalCount})</option>
              <option value="with-photo">Avec photo réelle ({withPhotoCount})</option>
              <option value="without-photo">Sans photo ({totalCount - withPhotoCount})</option>
            </select>
          </div>
        </div>

        {/* Owners Directory Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-100/50">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 bg-white border border-neutral-200 rounded p-8">
              <UserCheck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-600">
                Aucun propriétaire ne correspond à vos critères.
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Modifiez vos filtres ou réinitialisez la recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((property) => {
                const owner = property.owner || {
                  name: 'Propriétaire Privé',
                  category: 'Industrialists & Tech Pioneers' as any,
                  ownershipType: 'Current Propriétaire' as any,
                  bio: 'Mandat de vente confidentiel confié à la famille Kretz.',
                  avatarInitials: 'PR',
                };

                const currentPhoto =
                  photosMap[property.ref] ||
                  (owner.name ? photosMap[owner.name] : null) ||
                  owner.photo;

                return (
                  <div
                    key={property.id || property.ref}
                    className="bg-white border border-neutral-200/90 rounded-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative"
                  >
                    <div>
                      {/* Top Bar with Reference & Property Title */}
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-3">
                        <span className="font-mono text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {property.ref}
                        </span>
                        <span className="text-[11px] text-neutral-500 truncate max-w-[180px]">
                          {property.location}
                        </span>
                      </div>

                      {/* Main Profile Info */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Avatar / Photo with direct upload click */}
                        <div className="relative group shrink-0">
                          {currentPhoto ? (
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-sm bg-neutral-900 relative">
                              <img
                                src={currentPhoto}
                                alt={owner.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  individualInputsRef.current[property.ref]?.click()
                                }
                                title="Remplacer la photo"
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer text-[10px]"
                              >
                                <Camera className="w-4 h-4 text-amber-300" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-[#1d1d1b] text-amber-300 border-2 border-amber-400/30 flex items-center justify-center font-serif-luxury text-lg font-normal shadow-sm relative group overflow-hidden">
                              <span>{owner.avatarInitials || 'KR'}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  individualInputsRef.current[property.ref]?.click()
                                }
                                title="Ajouter une photo"
                                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer text-[9px] uppercase"
                              >
                                <Upload className="w-3.5 h-3.5 text-amber-300" />
                              </button>
                            </div>
                          )}

                          {/* Mini camera badge */}
                          <button
                            type="button"
                            onClick={() =>
                              individualInputsRef.current[property.ref]?.click()
                            }
                            className="absolute -bottom-1 -right-1 p-1 bg-[#1d1d1b] hover:bg-neutral-800 text-amber-300 rounded-full border border-neutral-300 shadow-2xs transition-transform hover:scale-110 cursor-pointer"
                            title={currentPhoto ? 'Changer' : 'Uploader'}
                          >
                            <Camera className="w-2.5 h-2.5" />
                          </button>

                          <input
                            ref={(el) => {
                              individualInputsRef.current[property.ref] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleIndividualUpload(property.ref, owner.name, e)
                            }
                          />
                        </div>

                        {/* Owner Details */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-medium text-sm text-[#1d1d1b] leading-tight truncate">
                            {owner.name}
                          </h4>
                          <p className="text-[11px] text-neutral-500 font-light truncate mt-0.5">
                            {property.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px]">
                            <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 font-medium">
                              {owner.category}
                            </span>
                            {currentPhoto ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Photo Réelle</span>
                              </span>
                            ) : (
                              <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 border border-amber-200">
                                Sans photo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bio preview */}
                      <p className="text-xs text-neutral-600 font-light line-clamp-2 italic border-t border-neutral-100 pt-2">
                        "{owner.bio}"
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 mt-3 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          individualInputsRef.current[property.ref]?.click()
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium rounded transition cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-neutral-600" />
                        <span>{currentPhoto ? 'Remplacer' : 'Uploader photo'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {currentPhoto && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeletePhoto(property.ref, owner.name)
                            }
                            className="p-1 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                            title="Supprimer la photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onSelectProperty && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProperty(property);
                              onClose();
                            }}
                            className="p-1 text-neutral-400 hover:text-black transition cursor-pointer"
                            title="Voir l'annonce complète"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span>
            {filteredList.length} propriétaire(s) affiché(s) • Les photos sont sauvegardées localement et sur le serveur Kretz.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-black text-white text-xs font-medium rounded transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
