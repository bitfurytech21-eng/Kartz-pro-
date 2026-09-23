import React, { useState, useEffect } from 'react';
import { Sparkles, Quote, Award, Eye, BookOpen, Layers } from 'lucide-react';

interface MagazineSpreadProps {
  className?: string;
}

export const FamilyMagazineSpread: React.FC<MagazineSpreadProps> = ({ className = '' }) => {
  const [activeCover, setActiveCover] = useState<'cover' | 'estate'>('cover');

  // Candidate sources with multi-path resolution
  const coverCandidates = ['/IMG_6451.jpeg', '/images/family/IMG_6451.jpeg', '/images/owners/IMG_6451.jpeg', '/IMG_6413.jpeg', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'];
  const estateCandidates = ['/IMG_6412.jpeg', '/images/family/IMG_6412.jpeg', '/images/owners/IMG_6412.jpeg', 'https://images.unsplash.com/photo-1542314831-c6a4d27f3299?auto=format&fit=crop&w=1200&q=85'];

  const [coverIndex, setCoverIndex] = useState(0);
  const [estateIndex, setEstateIndex] = useState(0);

  const [customCover, setCustomCover] = useState<string | null>(null);
  const [customEstate, setCustomEstate] = useState<string | null>(null);

  // Sync with localStorage and query server on mount and when admin updates photos
  const loadMagazinePhotos = () => {
    const savedCover = localStorage.getItem('kretz_photo_IMG_6451.jpeg') || localStorage.getItem('kretz_photo_IMG_6413.jpeg');
    if (savedCover) {
      setCustomCover(savedCover);
    }
    const savedEstate = localStorage.getItem('kretz_photo_IMG_6412.jpeg');
    if (savedEstate) {
      setCustomEstate(savedEstate);
    }
  };

  const currentCoverSrc = customCover || coverCandidates[coverIndex];
  const currentEstateSrc = customEstate || estateCandidates[estateIndex];

  useEffect(() => {
    loadMagazinePhotos();
    const handleUpdate = () => loadMagazinePhotos();
    window.addEventListener('kretz_family_photos_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('kretz_family_photos_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <div className={`mb-20 ${className}`}>
      {/* Magazine Sub-navigation / Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#1d1d1b] text-white flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-500">
                Collector's Edition
              </span>
              <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-800 rounded-xs border border-neutral-300">
                N° 04 • TMC & Netflix
              </span>
            </div>
            <h3 className="text-lg font-serif-luxury font-light text-[#1d1d1b]">
              L’Agence : L’Immobilier de Luxe en Famille
            </h3>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-sm border border-neutral-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveCover('cover')}
            className={`px-3.5 py-1.5 rounded-xs font-medium transition-all flex items-center gap-1.5 ${
              activeCover === 'cover'
                ? 'bg-white text-[#1d1d1b] shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Couverture Officielle</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCover('estate')}
            className={`px-3.5 py-1.5 rounded-xs font-medium transition-all flex items-center gap-1.5 ${
              activeCover === 'estate'
                ? 'bg-white text-[#1d1d1b] shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Série Manoir Historique</span>
          </button>
        </div>
      </div>

      {/* Editorial Spread Container: Styled like an open luxury spread */}
      <div className="bg-[#fcfbf9] border border-neutral-300 rounded-sm shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12 relative">
        {/* Subtle decorative paper texture bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neutral-800 via-[#1d1d1b] to-neutral-700" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column (5 Cols): The Magazine Cover Presentation */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[380px] group">
              {/* Luxury Magazine Book/Shadow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-neutral-900/20 via-neutral-600/10 to-transparent rounded-sm blur-md -z-10 transform group-hover:scale-[1.02] transition-transform duration-500" />

              {/* Glossy Cover Card */}
              <div className="relative aspect-[3/4] bg-neutral-900 rounded-xs overflow-hidden border-2 border-white shadow-2xl transition-all duration-500">
                <img
                  src={activeCover === 'cover' ? currentCoverSrc : currentEstateSrc}
                  alt={activeCover === 'cover' ? "L'Agence Family Cover" : "The Kretz Family at Historic Estate"}
                  onError={() => {
                    if (activeCover === 'cover') {
                      if (coverIndex + 1 < coverCandidates.length) setCoverIndex((prev) => prev + 1);
                    } else {
                      if (estateIndex + 1 < estateCandidates.length) setEstateIndex((prev) => prev + 1);
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                />

                {/* Magazine Sheen Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                {/* Magazine Masthead Header (When viewing estate or fallback) */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white/90 pointer-events-none drop-shadow-md">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-semibold">
                    {activeCover === 'cover' ? 'Édition Spéciale' : 'Dossier Patrimoine'}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest font-mono">
                    VOL. IV • PARIS
                  </span>
                </div>

                {/* Bottom Magazine Headline Bar */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md p-3.5 rounded-xs border border-white/20 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      L'Agence Exclusive
                    </span>
                    <span className="text-[9px] text-neutral-300 font-mono">
                      {activeCover === 'cover' ? 'IMG_6413' : 'IMG_6412'}
                    </span>
                  </div>
                  <p className="text-xs font-serif-luxury font-light leading-snug">
                    {activeCover === 'cover'
                      ? 'Olivier, Sandrine, Majo, Valentin, Martin, Louis & Raphaël réunis dans leur salon parisien.'
                      : 'Olivier, Martin, Valentin & Raphaël Kretz devant le manoir anglo-normand.'}
                  </p>
                </div>
              </div>

              {/* Editorial Caption beneath magazine cover */}
              <div className="flex items-center justify-between mt-3 px-1 text-[11px] text-neutral-500 font-light">
                <span>Photographie exclusive • Les associés & fondateurs Kretz</span>
                <span className="italic text-neutral-400">Archives L'Agence</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Editorial Feature & Editorial Text */}
          <div className="lg:col-span-7 space-y-6">
            {/* Editorial Category & Header */}
            <div>
              <div className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-500 mb-2">
                <span>Grands Récits & Prestige</span>
                <span className="w-1 h-1 rounded-full bg-neutral-400" />
                <span className="text-neutral-700">Art de Vivre</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light font-serif-luxury text-[#1d1d1b] leading-tight">
                « L’immobilier d’exception est avant tout une aventure de famille. »
              </h2>
            </div>

            {/* Editorial Pull Quote */}
            <div className="relative pl-6 border-l-2 border-[#1d1d1b] py-1 my-4">
              <Quote className="w-5 h-5 text-neutral-400 absolute -left-2.5 -top-3 bg-[#fcfbf9] px-0.5" />
              <p className="text-base sm:text-lg font-serif-luxury italic text-neutral-800 leading-relaxed">
                « Quand nos clients nous confient leur maison, ils ne mandatent pas simplement une agence : ils entrent dans notre cercle intime. La confiance ne se délègue pas. »
              </p>
              <span className="text-xs uppercase tracking-widest font-semibold text-neutral-600 block mt-2">
                — Olivier & Sandrine Kretz, Fondateurs
              </span>
            </div>

            {/* Dual Column Editorial Body */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
              <div>
                <p>
                  <span className="float-left text-3xl font-serif-luxury font-normal leading-none pr-2 pt-1 text-[#1d1d1b]">
                    N
                  </span>
                  ée en 2007 au cœur de la maison familiale de Boulogne-Billancourt, <strong>Kretz Real Estate</strong> a redéfini les codes de l'immobilier ultra-prime. Loin des structures corporatives anonymes, la famille orchestre la transmission de châteaux centenaires, d'hôtels particuliers confidentiels et de villas d’exception.
                </p>
              </div>
              <div>
                <p>
                  Propulsée sur la scène mondiale par la série documentaire acclamée sur TMC et Netflix, la dynastie Kretz allie discrétion absolue, négociation haute couture et présence internationale de Paris à Monaco, Saint-Barth et Saint-Tropez.
                </p>
              </div>
            </div>

            {/* Editorial Highlight Grid */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200">
              <div className="bg-white p-3 rounded-xs border border-neutral-200 shadow-2xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 block">
                  Fondation
                </span>
                <span className="text-base font-serif-luxury font-light text-[#1d1d1b]">
                  2007
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">
                  Boulogne-Billancourt
                </span>
              </div>
              <div className="bg-white p-3 rounded-xs border border-neutral-200 shadow-2xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 block">
                  Diffusion
                </span>
                <span className="text-base font-serif-luxury font-light text-[#1d1d1b]">
                  Netflix & TMC
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">
                  4 Saisons Mondiales
                </span>
              </div>
              <div className="bg-white p-3 rounded-xs border border-neutral-200 shadow-2xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 block">
                  Gouvernance
                </span>
                <span className="text-base font-serif-luxury font-light text-[#1d1d1b]">
                  100% Famille
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">
                  Indépendante & Dédiée
                </span>
              </div>
            </div>

            {/* Photo Pairing Callout Card */}
            <div className="bg-white p-4 rounded-xs border border-neutral-200 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0 border border-neutral-300">
                  <img
                    src={activeCover === 'cover' ? currentEstateSrc : currentCoverSrc}
                    alt="Secondary photo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-700 block">
                    {activeCover === 'cover' ? 'Voir aussi : La série Manoir de Normandie' : 'Voir aussi : La couverture officielle'}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {activeCover === 'cover' ? 'IMG_6412.jpeg • Les 4 associés en tournage' : 'IMG_6413.jpeg • Toute la famille réunie'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCover(activeCover === 'cover' ? 'estate' : 'cover')}
                className="px-3 py-1.5 bg-[#1d1d1b] text-white hover:bg-neutral-800 text-[11px] font-medium rounded-xs uppercase tracking-wider transition-colors shrink-0"
              >
                Alterner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
