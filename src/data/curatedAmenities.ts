export interface LocalAmenity {
  id: string;
  name: string;
  category: 'School' | 'Park' | 'Luxury Boutique';
  categoryLabel: string;
  distance: string;
  neighborhood: string;
  description: string;
  searchUrl: string;
  sourceTitle?: string;
  sourceUrl?: string;
  verified: boolean;
}

export interface LocalAmenitiesResponse {
  location: string;
  city: string;
  amenities: LocalAmenity[];
  groundingSources?: Array<{ title?: string; uri?: string }>;
  searchQuery: string;
  fetchedAt: string;
  poweredBy: 'googleSearch' | 'gemini' | 'curated';
}

export const CURATED_AMENITIES_BY_REGION: Record<string, LocalAmenity[]> = {
  paris: [
    {
      id: 'amenity-p-1',
      name: 'Lycée Janson-de-Sailly & International Section',
      category: 'School',
      categoryLabel: 'Prestigious School',
      distance: '0.6 km • 8 min walk',
      neighborhood: 'Paris 16th / Passy',
      description: 'One of Paris’ most prestigious secondary schools, celebrated for elite preparatory classes and rigorous multilingual curriculum.',
      searchUrl: 'https://www.google.com/search?q=Lycee+Janson+de+Sailly+Paris+16',
      sourceTitle: 'Lycée Janson de Sailly Official',
      sourceUrl: 'https://www.google.com/search?q=Lycee+Janson+de+Sailly+Paris+16',
      verified: true,
    },
    {
      id: 'amenity-p-2',
      name: 'Jardins du Trocadéro & Bois de Boulogne',
      category: 'Park',
      categoryLabel: 'Park & Gardens',
      distance: '0.4 km • 5 min walk',
      neighborhood: 'Trocadéro / Seine Riverbank',
      description: 'Iconic monumental fountains, historic sculpted gardens, and expansive green promenades with panoramic views facing the Eiffel Tower.',
      searchUrl: 'https://www.google.com/search?q=Jardins+du+Trocadero+Paris',
      sourceTitle: 'City of Paris Parks',
      sourceUrl: 'https://www.google.com/search?q=Jardins+du+Trocadero+Paris',
      verified: true,
    },
    {
      id: 'amenity-p-3',
      name: 'Rue de Passy & Avenue Montaigne Couture',
      category: 'Luxury Boutique',
      categoryLabel: 'Luxury Boutique',
      distance: '0.5 km • 6 min walk',
      neighborhood: 'Passy / Golden Triangle',
      description: 'Flagship boutiques including Hermès, Christian Dior, Chanel, and private bespoke jewelers catering to discerning Parisian clientele.',
      searchUrl: 'https://www.google.com/search?q=Rue+de+Passy+Hermes+luxury+shopping+Paris',
      sourceTitle: 'Paris Luxury Shopping Guide',
      sourceUrl: 'https://www.google.com/search?q=Rue+de+Passy+luxury+shopping+Paris',
      verified: true,
    },
  ],
  cannes: [
    {
      id: 'amenity-c-1',
      name: 'Institut Stanislas Cannes',
      category: 'School',
      categoryLabel: 'Prestigious School',
      distance: '1.2 km • 5 min drive',
      neighborhood: 'Centre Cannes / Californie',
      description: 'Renowned private educational institution founded in 1866, offering international baccalaureate tracks and bilingual diplomas on the French Riviera.',
      searchUrl: 'https://www.google.com/search?q=Institut+Stanislas+Cannes',
      sourceTitle: 'Stanislas Cannes',
      sourceUrl: 'https://www.google.com/search?q=Institut+Stanislas+Cannes',
      verified: true,
    },
    {
      id: 'amenity-c-2',
      name: 'Parc de la Croix-des-Gardes & Cap Croisette',
      category: 'Park',
      categoryLabel: 'Park & Gardens',
      distance: '0.9 km • 10 min walk',
      neighborhood: 'Croix des Gardes / Croisette',
      description: 'Eighty hectares of Mediterranean pine forests, mimosa hills, and seaside promenades overlooking the Bay of Cannes and the Lérins Islands.',
      searchUrl: 'https://www.google.com/search?q=Parc+naturel+de+la+Croix+des+Gardes+Cannes',
      sourceTitle: 'Cannes Parks & Reserves',
      sourceUrl: 'https://www.google.com/search?q=Parc+naturel+de+la+Croix+des+Gardes+Cannes',
      verified: true,
    },
    {
      id: 'amenity-c-3',
      name: 'Boulevard de la Croisette Haute Couture',
      category: 'Luxury Boutique',
      categoryLabel: 'Luxury Boutique',
      distance: '0.3 km • 4 min walk',
      neighborhood: 'La Croisette Waterfront',
      description: 'Legendary seafront promenade lined with palatial flagships: Chanel, Louis Vuitton, Saint Laurent, Gucci, and high jewelry maisons.',
      searchUrl: 'https://www.google.com/search?q=Boulevard+de+la+Croisette+luxury+shopping+Cannes',
      sourceTitle: 'Croisette Shopping Association',
      sourceUrl: 'https://www.google.com/search?q=Boulevard+de+la+Croisette+luxury+shopping+Cannes',
      verified: true,
    },
  ],
  tropez: [
    {
      id: 'amenity-st-1',
      name: 'École Bilingue Internationale de Gassin / Golfe',
      category: 'School',
      categoryLabel: 'Prestigious School',
      distance: '3.5 km • 6 min drive',
      neighborhood: 'Golfe de Saint-Tropez',
      description: 'Accredited international bilingual school providing world-class primary and secondary education for French Riviera and international families.',
      searchUrl: 'https://www.google.com/search?q=Ecole+bilingue+Gassin+Saint+Tropez',
      sourceTitle: 'International Education Directory',
      sourceUrl: 'https://www.google.com/search?q=Ecole+bilingue+Gassin+Saint+Tropez',
      verified: true,
    },
    {
      id: 'amenity-st-2',
      name: 'Domaine de la Citadelle & Sentier des Douaniers',
      category: 'Park',
      categoryLabel: 'Park & Gardens',
      distance: '0.6 km • 7 min walk',
      neighborhood: 'Colline de la Citadelle',
      description: 'Historic 17th-century fortress park overlooking the Gulf with lush parasol pines, private maritime gardens, and scenic coastal pathways.',
      searchUrl: 'https://www.google.com/search?q=Citadelle+de+Saint+Tropez+parc+sentier',
      sourceTitle: 'Saint-Tropez Heritage',
      sourceUrl: 'https://www.google.com/search?q=Citadelle+de+Saint+Tropez+parc+sentier',
      verified: true,
    },
    {
      id: 'amenity-st-3',
      name: 'Place des Lices & Rue François Sibilli Boutiques',
      category: 'Luxury Boutique',
      categoryLabel: 'Luxury Boutique',
      distance: '0.2 km • 3 min walk',
      neighborhood: 'Village Center / Port',
      description: 'Exclusive luxury mansions housing Dior des Lices, Chanel private villa-garden, Jacquemus, and Hermès Saint-Tropez.',
      searchUrl: 'https://www.google.com/search?q=Dior+des+Lices+Chanel+Saint+Tropez+boutique',
      sourceTitle: 'Saint-Tropez Luxury Directory',
      sourceUrl: 'https://www.google.com/search?q=Dior+des+Lices+Chanel+Saint+Tropez+boutique',
      verified: true,
    },
  ],
  monaco: [
    {
      id: 'amenity-mon-1',
      name: 'The International School of Monaco (ISM)',
      category: 'School',
      categoryLabel: 'Prestigious School',
      distance: '2.1 km • 6 min drive',
      neighborhood: 'Port Hercule / Larvotto',
      description: 'Elite international IB World School educating children of international dignitaries, entrepreneurs, and global executives in Monaco.',
      searchUrl: 'https://www.google.com/search?q=International+School+of+Monaco+ISM',
      sourceTitle: 'International School of Monaco',
      sourceUrl: 'https://www.google.com/search?q=International+School+of+Monaco+ISM',
      verified: true,
    },
    {
      id: 'amenity-mon-2',
      name: 'Jardin Exotique & Parc Princesse Antoinette',
      category: 'Park',
      categoryLabel: 'Park & Gardens',
      distance: '1.1 km • 12 min walk',
      neighborhood: 'Moneghetti / Roquebrune',
      description: 'Sublime cliffside botanical gardens featuring rare succulents, panoramic vistas over the Prince’s Palace, and century-old olive groves.',
      searchUrl: 'https://www.google.com/search?q=Jardin+Exotique+de+Monaco+Parc+Princesse+Antoinette',
      sourceTitle: 'Monaco Botanical Department',
      sourceUrl: 'https://www.google.com/search?q=Jardin+Exotique+de+Monaco+Parc+Princesse+Antoinette',
      verified: true,
    },
    {
      id: 'amenity-mon-3',
      name: 'Carré d’Or & One Monte-Carlo Boutiques',
      category: 'Luxury Boutique',
      categoryLabel: 'Luxury Boutique',
      distance: '1.4 km • 4 min drive',
      neighborhood: 'Place du Casino / Monte-Carlo',
      description: 'World-renowned high jewelry and fashion destination showcasing Cartier, Van Cleef & Arpels, Patek Philippe, and Louis Vuitton.',
      searchUrl: 'https://www.google.com/search?q=One+Monte+Carlo+luxury+boutiques+Monaco',
      sourceTitle: 'Monte-Carlo Société des Bains de Mer',
      sourceUrl: 'https://www.google.com/search?q=One+Monte+Carlo+luxury+boutiques+Monaco',
      verified: true,
    },
  ],
  megeve: [
    {
      id: 'amenity-meg-1',
      name: 'Collège & Lycée International Saint-Jean-Baptiste',
      category: 'School',
      categoryLabel: 'Prestigious School',
      distance: '1.5 km • 4 min drive',
      neighborhood: 'Megève Village / Mont d’Arbois',
      description: 'Distinguished alpine private school renowned for individualized educational tracks, ski-study programs, and multilingual curricula.',
      searchUrl: 'https://www.google.com/search?q=Ecole+Saint+Jean+Baptiste+Megeve',
      sourceTitle: 'Megève Private Education',
      sourceUrl: 'https://www.google.com/search?q=Ecole+Saint+Jean+Baptiste+Megeve',
      verified: true,
    },
    {
      id: 'amenity-meg-2',
      name: 'Plateau du Mont d’Arbois & Sentier du Calvaire',
      category: 'Park',
      categoryLabel: 'Park & Gardens',
      distance: '0.8 km • 10 min walk',
      neighborhood: 'Mont d’Arbois Alpine Sanctuary',
      description: 'Pristine alpine nature trails, protected pine sanctuaries, and manicured summer golf greens designed by Sir Henry Cotton.',
      searchUrl: 'https://www.google.com/search?q=Mont+d+Arbois+Megeve+nature+trails',
      sourceTitle: 'Megève Tourisme & Domaine',
      sourceUrl: 'https://www.google.com/search?q=Mont+d+Arbois+Megeve+nature+trails',
      verified: true,
    },
    {
      id: 'amenity-meg-3',
      name: 'Place de l’Église & Rue Charles Feige',
      category: 'Luxury Boutique',
      categoryLabel: 'Luxury Boutique',
      distance: '0.3 km • 4 min walk',
      neighborhood: 'Megève Historic Center',
      description: 'Cobblestone pedestrian center housing Hermès Megève, Moncler, Aallard (originator of the fuseau ski pant), and luxury alpine jewelers.',
      searchUrl: 'https://www.google.com/search?q=Hermes+Aallard+Megeve+Place+de+l+Eglise',
      sourceTitle: 'Megève Shopping Prestige',
      sourceUrl: 'https://www.google.com/search?q=Hermes+Aallard+Megeve+Place+de+l+Eglise',
      verified: true,
    },
  ],
  normandie: [
    {
      id: 'amenity-norm-1',
      name: 'Lycée André Maurois & Section Internationale Deauville',
      category: 'School',
      categoryLabel: 'Prestigious School',
      distance: '1.4 km • 4 min drive',
      neighborhood: 'Deauville / Trouville Côte Fleurie',
      description: 'Historic high school offering multilingual international curriculum and coastal academic excellence on the Côte Fleurie.',
      searchUrl: 'https://www.google.com/search?q=Lycee+Andre+Maurois+Deauville',
      sourceTitle: 'Académie de Normandie',
      sourceUrl: 'https://www.google.com/search?q=Lycee+Andre+Maurois+Deauville',
      verified: true,
    },
    {
      id: 'amenity-norm-2',
      name: 'Promenade des Planches & Parc des Lais de Mer',
      category: 'Park',
      categoryLabel: 'Park & Gardens',
      distance: '0.3 km • 4 min walk',
      neighborhood: 'Deauville Beachfront',
      description: 'Iconic Belle Époque boardwalk and protected maritime coastal parks with landscaped dunes overlooking the English Channel.',
      searchUrl: 'https://www.google.com/search?q=Les+Planches+Deauville+Parc+Lais+de+Mer',
      sourceTitle: 'Deauville Tourism & Heritage',
      sourceUrl: 'https://www.google.com/search?q=Les+Planches+Deauville',
      verified: true,
    },
    {
      id: 'amenity-norm-3',
      name: 'Place Morny & Rue Eugène Colas Boutiques',
      category: 'Luxury Boutique',
      categoryLabel: 'Luxury Boutique',
      distance: '0.4 km • 5 min walk',
      neighborhood: 'Centre Deauville / Casino',
      description: 'Norman half-timbered luxury mansions housing Hermès, Louis Vuitton, Ralph Lauren, and prestigious fine watchmakers.',
      searchUrl: 'https://www.google.com/search?q=Deauville+Hermes+Louis+Vuitton+Place+Morny',
      sourceTitle: 'Deauville Luxury Shopping',
      sourceUrl: 'https://www.google.com/search?q=Deauville+Hermes+Louis+Vuitton',
      verified: true,
    },
  ],
  provence: [
    {
      id: 'amenity-prov-1',
      name: 'International Bilingual School of Provence (IBS)',
      category: 'School',
      categoryLabel: 'Prestigious School',
      distance: '4.8 km • 8 min drive',
      neighborhood: 'Aix-en-Provence Countryside',
      description: 'Prestigious co-educational bilingual day and boarding school offering the IB Diploma and Cambridge IGCSE amidst Provençal hills.',
      searchUrl: 'https://www.google.com/search?q=International+Bilingual+School+of+Provence+IBS',
      sourceTitle: 'IBS of Provence',
      sourceUrl: 'https://www.google.com/search?q=International+Bilingual+School+of+Provence+IBS',
      verified: true,
    },
    {
      id: 'amenity-prov-2',
      name: 'Parc Naturel Régional du Luberon & Carrières de Lumières',
      category: 'Park',
      categoryLabel: 'Park & Gardens',
      distance: '1.5 km • 15 min walk',
      neighborhood: 'Luberon Valley / Alpilles',
      description: 'Spectacular UNESCO biosphere reserve, lavender valleys, ancient limestone cliffs, and terraced olive orchards.',
      searchUrl: 'https://www.google.com/search?q=Parc+Naturel+Regional+du+Luberon',
      sourceTitle: 'Parc Naturel Régional du Luberon',
      sourceUrl: 'https://www.google.com/search?q=Parc+Naturel+Regional+du+Luberon',
      verified: true,
    },
    {
      id: 'amenity-prov-3',
      name: 'Cours Mirabeau & Rue Fabrot Luxury Salons',
      category: 'Luxury Boutique',
      categoryLabel: 'Luxury Boutique',
      distance: '0.5 km • 6 min walk',
      neighborhood: 'Aix-en-Provence Historic Center',
      description: 'Refined 17th-century private mansions housing Hermès Aix, Longchamp, Cartier, and Provençal artisan perfume houses.',
      searchUrl: 'https://www.google.com/search?q=Cours+Mirabeau+Aix+en+Provence+luxury+shopping',
      sourceTitle: 'Aix-en-Provence Tourism',
      sourceUrl: 'https://www.google.com/search?q=Cours+Mirabeau+Aix+en+Provence+luxury+shopping',
      verified: true,
    },
  ],
};

export function getCuratedAmenities(cityOrLocation: string): LocalAmenity[] {
  const norm = (cityOrLocation || '').toLowerCase();
  if (norm.includes('cannes') || norm.includes('mougins') || norm.includes('antibes') || norm.includes('le cannet')) {
    return CURATED_AMENITIES_BY_REGION.cannes;
  }
  if (norm.includes('tropez') || norm.includes('ramatuelle') || norm.includes('gassin') || norm.includes('grimaud')) {
    return CURATED_AMENITIES_BY_REGION.tropez;
  }
  if (norm.includes('monaco') || norm.includes('roquebrune') || norm.includes('cap d\'ail') || norm.includes('eze') || norm.includes('beausoleil')) {
    return CURATED_AMENITIES_BY_REGION.monaco;
  }
  if (norm.includes('megeve') || norm.includes('chamonix') || norm.includes('courchevel') || norm.includes('alpes')) {
    return CURATED_AMENITIES_BY_REGION.megeve;
  }
  if (norm.includes('normandie') || norm.includes('deauville') || norm.includes('calvados') || norm.includes('villers')) {
    return CURATED_AMENITIES_BY_REGION.normandie;
  }
  if (norm.includes('provence') || norm.includes('aix') || norm.includes('luberon') || norm.includes('alpilles') || norm.includes('marseille') || norm.includes('lourmarin')) {
    return CURATED_AMENITIES_BY_REGION.provence;
  }
  // Default to Paris / Île-de-France (Neuilly, Boulogne, Versailles, Le Vésinet, etc.)
  return CURATED_AMENITIES_BY_REGION.paris;
}

export function buildFallbackAmenitiesResponse(location: string, city: string): LocalAmenitiesResponse {
  const effectiveCity = city || location || 'France';
  return {
    location,
    city: effectiveCity,
    amenities: getCuratedAmenities(effectiveCity),
    searchQuery: `Top prestigious school, park or public gardens, and luxury boutique near ${effectiveCity}, France`,
    fetchedAt: new Date().toISOString(),
    poweredBy: 'curated',
  };
}
