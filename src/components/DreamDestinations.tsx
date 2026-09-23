import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '../i18n';

export const DreamDestinations: React.FC = () => {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const destinations = [
    {
      name: 'Spain',
      subtitle: 'Costa del Sol, Ibiza & Madrid',
      image: 'https://kretzrealestate.com/static/DDR_Esp-84cb138ac7e3108c42fb94a8437c3e86.jpg',
      url: '#selection-section',
    },
    {
      name: 'Morocco',
      subtitle: 'Marrakech & Tangier Luxury Palaces',
      image: 'https://kretzrealestate.com/static/maroc-83dbfbf8c91d71373f68923eb3efa57c.jpg',
      url: '#selection-section',
    },
    {
      name: 'Mauritius',
      subtitle: 'Waterfront Villas & Tropical Estates',
      image: 'https://kretzrealestate.com/static/DDR_Paris-59025beeaf5c4b076346d5c3402de62b.jpg',
      url: '#selection-section',
    },
    {
      name: 'Saint-Barthélemy',
      subtitle: 'Caribbean Exclusivity & Ocean Vistas',
      image: 'https://files.kretzrealestate.com/72e556114388e76ca70773e6e355e5f.jpg',
      url: '#selection-section',
    },
    {
      name: 'Monaco',
      subtitle: 'Carré d\'Or & Port Hercule Penthouses',
      image: 'https://files.kretzrealestate.com/c14ac294f7bd4cb3ebaba4ad5c915fc.jpg',
      url: '#selection-section',
    },
    {
      name: 'United States',
      subtitle: 'New York Penthouses & Miami Mansions',
      image: 'https://files.kretzrealestate.com/faed4cd5ee8a7d9a8f70973f5ac825.jpg',
      url: '#selection-section',
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="dream-destinations" className="py-16 bg-[#fcfbf9] border-t border-b border-neutral-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title and Nav Controls */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wide text-[#1d1d1b] font-serif-luxury">
              {t.destinationsSection.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-light mt-1">
              {t.destinationsSection.subtitle}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border border-neutral-300 hover:border-black flex items-center justify-center bg-white text-black transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border border-neutral-300 hover:border-black flex items-center justify-center bg-white text-black transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Row */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-5 overflow-x-auto pb-4 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {destinations.map((dest, idx) => (
            <div
              key={idx}
              className="flex-none w-56 sm:w-64 group relative rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-[212/370] w-full bg-neutral-200 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('files.kretzrealestate.com')) {
                      target.src = target.src.replace('https://files.kretzrealestate.com', '/files');
                    }
                  }}
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Bottom details card */}
                <div className="absolute bottom-0 inset-x-0 p-5 text-white flex flex-col justify-end">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl font-light font-serif-luxury tracking-wide">
                      {dest.name}
                    </span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0.5 -translate-y-0.5 transition-all" />
                  </div>
                  <span className="text-[11px] text-white/80 font-light line-clamp-1">
                    {dest.subtitle}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
