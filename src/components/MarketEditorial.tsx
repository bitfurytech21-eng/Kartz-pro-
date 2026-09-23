import React from 'react';
import { Compass, Sparkles, ShieldCheck, MapPin, Building, Trees, Wine } from 'lucide-react';
import { useTranslation } from '../i18n';

export const MarketEditorial: React.FC = () => {
  const { t, language } = useTranslation();
  const regionsList = [
    {
      name: 'Paris',
      tag: 'Capital of Luxury',
      description:
        'The world\'s capital of luxury, with its Haussmann-style apartments, private mansions and penthouses offering spectacular views of iconic monuments.',
      image: 'https://files.kretzrealestate.com/4e1dd51b1174dee18d319e7582a8d4.jpg',
    },
    {
      name: 'Côte d\'Azur',
      tag: 'French Riviera',
      description:
        'From Cannes to Saint-Tropez and Monaco, this region attracts visitors with its contemporary villas, seaside properties and exclusive ambience.',
      image: 'https://files.kretzrealestate.com/e57b49cbc087d79deec896f6f65c19da.jpg',
    },
    {
      name: 'Provence',
      tag: 'Mediterranean Art de Vivre',
      description:
        'Its bastides, renovated farmhouses and wine estates embody the Mediterranean art of living in enchanting, lavender-scented surroundings.',
      image: 'https://files.kretzrealestate.com/f2e8c13b8a4c31ffad399f7fddf3b69.jpg',
    },
    {
      name: 'The Alps',
      tag: 'Alpine Luxury',
      description:
        'Luxury ski-in / ski-out chalets in Courchevel or Megève, combining traditional woodwork, bespoke spa wellness and Alpine scenery.',
      image: 'https://files.kretzrealestate.com/5be2ee156cff5c54bdaf6466e38ea.jpg',
    },
    {
      name: 'Brittany & Normandy',
      tag: 'Atlantic Heritage',
      description:
        'Renowned for their seaside manor houses, granite estates and timelessly charming historic properties overlooking dramatic coastlines.',
      image: 'https://files.kretzrealestate.com/a88e3e17b7a34f10b9c1fca765a96388.jpg',
    },
    {
      name: 'South-West & Bordeaux',
      tag: 'Gastronomy & Wine',
      description:
        'Bordeaux and the surrounding area offer grand châteaux, prestigious wine estates and bourgeois residences in the heart of a region rich in terroir.',
      image: 'https://files.kretzrealestate.com/532db770df5cb8c46994471a3a8198b1.jpg',
    },
  ];

  const propertyTypesList = [
    {
      title: 'Country houses & Bastides',
      desc: 'From Provençal bastides to renovated traditional mas, perfect for enjoying the French way of life.',
    },
    {
      title: 'Prestigious apartments',
      desc: 'Haussmannian or contemporary penthouses with panoramic views over Paris, Lyon or Bordeaux.',
    },
    {
      title: 'Châteaux & Historic residences',
      desc: 'Embodying an exceptional heritage, often set on private domains steeped in centuries of history.',
    },
    {
      title: 'Seaside villas',
      desc: 'Ideally located on the Côte d\'Azur or Brittany, offering luxury, privacy and breathtaking panoramas.',
    },
    {
      title: 'Alpine chalets',
      desc: 'Combining alpine craft and modern design, upscale mountain chalets for winter sports enthusiasts.',
    },
    {
      title: 'Wine estates',
      desc: 'Perfect for wine and wine-tourism enthusiasts, combining authentic lifestyle and heritage investment.',
    },
  ];

  return (
    <section id="market-editorial" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 1: Luxury real estate trends in France */}
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500">
              {t.marketEditorial.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-wide text-[#1d1d1b] font-serif-luxury leading-tight">
              {t.marketEditorial.title}
            </h2>
            <p className="text-sm sm:text-[15px] leading-relaxed text-[#4a4a4a] font-light">
              {t.marketEditorial.subtitle}
            </p>
            <p className="text-sm sm:text-[15px] leading-relaxed text-[#4a4a4a] font-light">
              Regions such as the Côte d'Azur, Provence and the Alps remain highly
              attractive, thanks to their exceptional landscapes and incomparable
              quality of life. Paris, meanwhile, remains a benchmark market, while
              other regions such as Brittany, Burgundy and the South-West appeal
              for their authentic settings and unique heritage. The scarcity of
              certain properties and the stability of high-end real estate
              investment in France continue to drive this dynamic market.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[16/11] rounded-sm overflow-hidden shadow-xl border border-neutral-100">
              <img
                src="https://files.kretzrealestate.com/67ec4082a8f72d825044d16021ae9bdf.jpg"
                alt="Château d'Armainvilliers Kretz"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-sm shadow-md text-xs font-serif-luxury text-[#1d1d1b]">
                Exclusive Heritage Portfolio • Kretz Real Estate
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: The most sought-after regions for luxury real estate in France */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-light tracking-wide text-[#1d1d1b] font-serif-luxury mb-4">
              {t.marketEditorial.regionsTitle}
            </h2>
            <p className="text-sm text-neutral-500 font-light">
              {t.marketEditorial.regionsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regionsList.map((reg, idx) => (
              <div
                key={idx}
                className="bg-[#fcfbf9] border border-neutral-200/70 rounded-sm overflow-hidden flex flex-col group hover:border-black transition-colors"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
                  <img
                    src={reg.image}
                    alt={reg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black/80 text-white rounded-sm">
                    {reg.tag}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-light font-serif-luxury text-[#1d1d1b] mb-2">
                      {reg.name}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-neutral-600 font-light leading-relaxed">
                      {reg.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 & 4: Types of luxury real estate & Criteria for investing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 border-t border-neutral-200">
          {/* Types of luxury real estate in France */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-[#1d1d1b] font-serif-luxury">
              Types of luxury real estate in France
            </h2>
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
              Architectural Diversity & Prestige
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {propertyTypesList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-neutral-50 border border-neutral-100 rounded-sm"
                >
                  <h4 className="text-sm font-medium text-[#1d1d1b] mb-1 font-serif-luxury">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-600 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Criteria for investing in luxury real estate in France */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-[#1d1d1b] font-serif-luxury">
              Criteria for investing in luxury real estate in France
            </h2>
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
              Strategic Evaluation Checklist
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-[#fae9e5]/30 border border-[#fae9e5] rounded-sm">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#1d1d1b] mb-1">
                  1. Prime Location
                </h4>
                <p className="text-xs text-neutral-700 font-light leading-relaxed">
                  Location remains the primary determining factor in the valuation and long-term liquidity of a prestigious property.
                </p>
              </div>

              <div className="p-4 bg-[#fae9e5]/30 border border-[#fae9e5] rounded-sm">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#1d1d1b] mb-1">
                  2. Unique Features & Finishes
                </h4>
                <p className="text-xs text-neutral-700 font-light leading-relaxed">
                  Panoramic view, ceiling height, volume, finish quality, architectural heritage, and exclusive amenities (spa, pool, screening room).
                </p>
              </div>

              <div className="p-4 bg-[#fae9e5]/30 border border-[#fae9e5] rounded-sm">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#1d1d1b] mb-1">
                  3. Investment Potential & Art de Vivre
                </h4>
                <p className="text-xs text-neutral-700 font-light leading-relaxed">
                  Balancing personal secondary residence enjoyment with generational wealth preservation and seasonal rental yield opportunities.
                </p>
              </div>

              <div className="p-4 bg-[#fae9e5]/30 border border-[#fae9e5] rounded-sm">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#1d1d1b] mb-1">
                  4. Authenticity & Heritage Value
                </h4>
                <p className="text-xs text-neutral-700 font-light leading-relaxed">
                  Properties steeped in history or situated in protected natural preserves hold irreplaceable emotional and cultural equity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
