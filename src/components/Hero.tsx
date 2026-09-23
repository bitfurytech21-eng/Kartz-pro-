import React from 'react';
import { ArrowDown } from 'lucide-react';
import { useTranslation, Language } from '../i18n';

interface HeroProps {
  onExploreClick: () => void;
  language?: Language;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, language }) => {
  const { t } = useTranslation();

  return (
    <section
      id="buy-region-dream-destination"
      className="relative w-full pt-20 sm:pt-24 min-h-[600px] sm:min-h-[700px] flex items-center justify-center overflow-hidden bg-neutral-900"
    >
      {/* Background Hero Banner Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://kretzrealestate.com/static/france-553e51d0d9fe4b78569569f6a8a1f4be.jpg"
          alt="Luxury Real Estate France Banner"
          className="w-full h-full object-cover object-center scale-105 animate-subtleZoom"
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.includes('kretzrealestate.com/static')) {
              target.src = target.src.replace('https://kretzrealestate.com', '/kretz-proxy');
            }
          }}
        />
        {/* Subtle dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/25"></div>
      </div>

      {/* Floating Center Card (Exact text from kretzrealestate.com/en/france/) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-12 md:p-14 shadow-2xl rounded-sm border border-neutral-100/80 max-w-3xl mx-auto transform transition-all">
          <h1
            id="hero-title"
            className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-[#1d1d1b] font-serif-luxury mb-6 leading-tight"
          >
            {t.hero.title}
          </h1>

          <p className="text-sm sm:text-base md:text-[15px] leading-relaxed text-[#4a4a4a] font-light max-w-2xl mx-auto mb-8 font-sans">
            {t.hero.subtitle}
          </p>

          <a
            href="#selection-section"
            onClick={(e) => {
              e.preventDefault();
              onExploreClick();
            }}
            className="inline-flex items-center space-x-2 text-xs sm:text-sm uppercase tracking-[0.2em] font-medium text-[#1d1d1b] hover:text-neutral-600 transition-colors group cursor-pointer border-b border-black/30 hover:border-black pb-1"
            id="find-out-more-link"
          >
            <span>{t.hero.cta}</span>
            <ArrowDown className="w-4 h-4 transform group-hover:translate-y-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
