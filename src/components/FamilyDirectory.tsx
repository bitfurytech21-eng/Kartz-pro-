import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  Award,
  MapPin,
  Sparkles,
  ArrowRight,
  Users,
  Send,
} from 'lucide-react';
import { FamilyMagazineSpread } from './FamilyMagazineSpread';

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  location: string;
  photoFilename: string;
  initials: string;
  bio: string;
  landmarkSale: string;
  phone: string;
  email: string;
}

export const defaultFamilyMembers: FamilyMember[] = [
  {
    id: 'olivier',
    name: 'Olivier Kretz',
    role: 'Founder & Senior Partner',
    location: 'Boulogne-Billancourt & Paris West',
    photoFilename: 'IMG_6408.jpeg',
    initials: 'OK',
    bio: 'Pioneered Kretz Real Estate in 2007 from the family residence in Boulogne-Billancourt. Olivier oversees strategic governance, historic monuments, and discrete family office mandates worldwide.',
    landmarkSale: '€24,000,000 Historic Château in Île-de-France',
    phone: '+33 1 41 10 00 00',
    email: 'olivier@kretz.site',
  },
  {
    id: 'sandrine',
    name: 'Sandrine Kretz',
    role: 'Co-Founder & Associate Director',
    location: 'Boulogne-Billancourt & Parisian Estates',
    photoFilename: 'IMG_6407.jpeg',
    initials: 'SK',
    bio: 'Co-founder of Kretz Real Estate alongside Olivier. Sandrine shapes the warm, familial culture of the agency and directs bespoke private family mandates with exquisite discretion.',
    landmarkSale: '€16,500,000 Hôtel Particulier in Neuilly-sur-Seine',
    phone: '+33 1 41 10 00 00',
    email: 'sandrine@kretz.site',
  },
  {
    id: 'valentin',
    name: 'Valentin Kretz',
    role: 'Chief Executive Officer & International Luxury',
    location: 'Triangle d’Or, French Riviera & Global Markets',
    photoFilename: 'IMG_6419.jpeg',
    initials: 'VK',
    bio: 'Leading the agency’s international expansion across Saint-Barth, New York, and Monaco. Specialized in high-profile negotiations and trophy penthouses.',
    landmarkSale: '€18,500,000 Avenue Montaigne Duplex Penthouse',
    phone: '+33 6 12 34 56 78',
    email: 'valentin@kretz.site',
  },
  {
    id: 'martin',
    name: 'Martin Kretz',
    role: 'Partner & Architectural Heritage',
    location: 'Paris Rive Droite, Marais & Contemporary Estates',
    photoFilename: 'IMG_6410.jpeg',
    initials: 'MK',
    bio: 'An architectural connoisseur specializing in historic Hôtels Particuliers, artist lofts, and exceptional Haussmannian properties.',
    landmarkSale: '€32,000,000 Private Mansion in Paris 7ème',
    phone: '+33 6 98 76 54 32',
    email: 'martin@kretz.site',
  },
  {
    id: 'louis',
    name: 'Louis Kretz',
    role: 'Partner & French Riviera Director',
    location: 'Cannes, Cap d’Antibes, Saint-Tropez & Monaco',
    photoFilename: 'IMG_6430.jpeg',
    initials: 'LK',
    bio: 'Directs the Mediterranean branch with unmatched local insight into waterfront "pieds-dans-l’eau" sanctuaries and discreet Provençal bastides.',
    landmarkSale: '€34,000,000 Waterfront Estate in Cap d’Antibes',
    phone: '+33 6 54 32 10 98',
    email: 'louis@kretz.site',
  },
  {
    id: 'raphael',
    name: 'Raphaël Kretz',
    role: 'Associate Partner & Digital Innovation',
    location: 'Paris Prime & Creative Quarters',
    photoFilename: 'IMG_6439.jpeg',
    initials: 'RK',
    bio: 'Bringing a fresh perspective to high-end client experience, new media storytelling, and next-generation real estate stewardship.',
    landmarkSale: '€9,800,000 Rooftop Terrace in Saint-Germain-des-Prés',
    phone: '+33 6 11 22 33 44',
    email: 'raphael@kretz.site',
  },
  {
    id: 'majo',
    name: 'Majo (Mireille)',
    role: 'Family Icon & Goodwill Ambassador',
    location: 'Boulogne-Billancourt & Worldwide',
    photoFilename: 'IMG_6444.jpeg',
    initials: 'MK',
    bio: 'The beloved matriarch and soul of the Kretz family. Majo brings wisdom, warmth, and iconic Parisian flair to every family milestone and international gathering.',
    landmarkSale: 'Guardian of the Family Legacy & Parisian Heritage',
    phone: '+33 1 41 10 00 00',
    email: 'majo@kretz.site',
  },
  {
    id: 'charline',
    name: 'Charline Dray',
    role: 'Associate & Interior Curation Director',
    location: 'Paris & International Destinations',
    photoFilename: 'IMG_6438.jpeg',
    initials: 'CD',
    bio: 'Advising private sellers on bespoke aesthetic curation, architectural staging, and collectible design to maximize estate valuation.',
    landmarkSale: 'Architectural Curation for €16M Triplex in Paris 16e',
    phone: '+33 1 41 10 00 00',
    email: 'charline@kretz.site',
  },
];

const FamilyMemberCard: React.FC<{
  member: FamilyMember;
  customPhoto?: string;
}> = ({ member, customPhoto }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(customPhoto || `/${member.photoFilename}`);

  useEffect(() => {
    setImgSrc(customPhoto || `/${member.photoFilename}`);
  }, [customPhoto, member.photoFilename]);

  return (
    <div className="bg-neutral-50/50 rounded-sm border border-neutral-200 overflow-hidden flex flex-col justify-between hover:border-neutral-400 transition-all duration-300 group shadow-xs">
      <div>
        {/* Advisor Photo or Luxury Monogram Placeholder */}
        <div className="relative aspect-4/3 overflow-hidden bg-neutral-900 flex items-center justify-center">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={member.name}
              onError={() => {
                // If the image fails to load, show the bespoke luxury monogram avatar
                setImgSrc(null);
              }}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-[#1d1d1b] flex flex-col items-center justify-center p-6 text-center text-white relative">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="w-16 h-16 rounded-full border border-amber-300/30 bg-amber-400/10 flex items-center justify-center mb-3">
                <span className="font-serif-luxury text-2xl font-light text-amber-200 tracking-wider">
                  {member.initials}
                </span>
              </div>
              <h4 className="font-serif-luxury text-lg font-light text-white">{member.name}</h4>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-0.5">
                {member.role}
              </p>
            </div>
          )}

          {/* Location Badge */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xs border border-neutral-200 text-[10px] font-medium uppercase tracking-wider text-[#1d1d1b] flex items-center gap-1 z-10">
            <MapPin className="w-3 h-3 text-neutral-500" />
            <span>{member.location}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-3">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500 block">
              {member.role}
            </span>
            <h3 className="text-xl font-serif-luxury font-light text-[#1d1d1b] mt-0.5">
              {member.name}
            </h3>
          </div>

          <p className="text-xs text-neutral-600 font-light leading-relaxed line-clamp-3">
            {member.bio}
          </p>

          <div className="bg-[#fae9e5]/30 p-2.5 rounded-xs border border-neutral-200/60 text-xs">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-neutral-500 block">
              Mandat Historique Notale
            </span>
            <span className="text-xs font-serif-luxury font-light text-[#1d1d1b] flex items-center gap-1.5 mt-0.5">
              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {member.landmarkSale}
            </span>
          </div>
        </div>
      </div>

      {/* Action Contact Bar */}
      <div className="px-6 py-4 border-t border-neutral-200 bg-white flex items-center justify-between">
        <a
          href={`tel:${member.phone.replace(/\s+/g, '')}`}
          className="inline-flex items-center space-x-1.5 text-xs text-neutral-700 hover:text-black font-medium transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-neutral-400" />
          <span>Appeler</span>
        </a>

        <a
          href={`mailto:${member.email}?subject=Mandat%20Exclusif%20pour%20${encodeURIComponent(member.name)}`}
          className="inline-flex items-center space-x-1.5 text-xs text-[#1d1d1b] hover:underline font-semibold uppercase tracking-wider"
        >
          <span>Message Direct</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export const FamilyDirectory: React.FC = () => {
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});

  // Load any previously uploaded photos from localStorage and server on startup, and listen for admin updates
  const loadPhotos = () => {
    const loaded: Record<string, string> = {};
    defaultFamilyMembers.forEach((member) => {
      const saved =
        localStorage.getItem(`kretz_photo_${member.photoFilename}`) ||
        localStorage.getItem(`kretz_member_photo_${member.id}`);
      if (saved) {
        loaded[member.id] = saved;
      }
    });
    setPhotoMap(loaded);

    // Also probe server to see if files exist on server
    fetch('/api/family-photos')
      .then((res) => res.json())
      .then((data) => {
        if (data?.photos && Array.isArray(data.photos)) {
          const serverPhotos = data.photos as string[];
          defaultFamilyMembers.forEach((m) => {
            if (serverPhotos.includes(m.photoFilename) && !loaded[m.id]) {
              loaded[m.id] = `/${m.photoFilename}`;
            }
          });
          setPhotoMap({ ...loaded });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadPhotos();
    const handleUpdate = () => loadPhotos();
    window.addEventListener('kretz_family_photos_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('kretz_family_photos_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <section id="family-directory" className="py-24 bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-[0.3em] font-semibold text-neutral-600">
            <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
            <span>Héritage Familial & Direction</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light font-serif-luxury tracking-wide text-[#1d1d1b]">
            La Famille Kretz & Associés Dirigeants
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
            Fondée sur la confiance, la discrétion et un esprit de famille inaltérable. Chaque associé apporte son expertise locale pointue et un accès direct aux biens off-market les plus convoités.
          </p>
        </div>

        {/* Magazine Editorial Spread */}
        <FamilyMagazineSpread />

        {/* Individual Advisors Grid Subheading */}
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-8 pb-3 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-neutral-800" />
            <h3 className="text-xl font-serif-luxury font-light text-[#1d1d1b]">
              Associés de la Famille & Mandats Privés
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-light">
            Olivier Kretz en premier • Contact direct avec les associés de la famille
          </span>
        </div>

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {defaultFamilyMembers.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              customPhoto={photoMap[member.id]}
            />
          ))}
        </div>

        {/* Family Consultation Banner */}
        <div className="mt-16 bg-[#1d1d1b] text-white p-8 sm:p-10 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold block">
              Représentation Confidentielle
            </span>
            <h3 className="text-2xl font-light font-serif-luxury tracking-wide text-white">
              Confiez Votre Propriété à la Famille Kretz
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xl">
              Qu'il s'agisse d'acquérir un bien d'exception ou de céder un monument architectural en toute discrétion, nos associés familiaux vous accompagnent sur-mesure.
            </p>
          </div>

          <a
            href="mailto:info@kretz.site?subject=Mandat%20Confidentiel%20-%20Famille%20Kretz"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black hover:bg-neutral-100 text-xs font-semibold uppercase tracking-widest rounded-xs transition-colors shrink-0 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Consulter les Associés Kretz</span>
          </a>
        </div>
      </div>
    </section>
  );
};
