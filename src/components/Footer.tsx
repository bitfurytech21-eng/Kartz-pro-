import React, { useState } from 'react';
import { CompanyLogo } from './CompanyLogo';
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ChevronDown,
  ArrowUp,
  Send,
} from 'lucide-react';
import { useTranslation } from '../i18n';

interface FooterProps {
  onOpenLegal?: (type: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  const { t } = useTranslation();
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  const toggleMobile = (name: string) => {
    setMobileSection(mobileSection === name ? null : name);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const destinations = [
    'France',
    'Spain',
    'Morocco',
    'Mauritius',
    'Saint-Barthélemy',
    'Monaco',
    'United States',
    'Brazil',
    'Portugal',
    'Belgium',
    'Réunion Island',
  ];

  const propertyTypes = [
    'Apartment',
    'Villa',
    'Private mansion',
    'House',
    'Castle',
    'Alpine chalet',
    'Wine estate',
    'Penthouse',
    'Duplex',
    'Hunting estate',
  ];

  const services = [
    'Buy a property',
    'Sell your property',
    'Rent exceptional estates',
    'Off-Market Portfolio',
    'Property Estimation',
    'The Kretz Family',
    'Private Advisory & Family Office',
    'Careers',
    'Press & Series',
  ];

  return (
    <footer id="contact-footer" className="bg-[#1d1d1b] text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Branding & Philosophy Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-12 mb-12 border-b border-neutral-800 gap-8">
          <div className="max-w-xl">
            <div className="mb-4">
              <CompanyLogo variant="compact" theme="dark" />
            </div>
            <p className="text-xs sm:text-[13px] text-neutral-400 font-light leading-relaxed">
              {t.footer.agencyDescription}
            </p>
          </div>

          {/* Social icons & Back to top button */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 text-neutral-400">
              <a
                href="https://www.instagram.com/kretzrealestate/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center hover:text-white hover:border-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.facebook.com/kretzrealestate/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center hover:text-white hover:border-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.linkedin.com/company/kretz-family-real-estate/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center hover:text-white hover:border-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.youtube.com/@kretzrealestate"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center hover:text-white hover:border-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 border border-neutral-700 rounded-full hover:border-white text-neutral-400 hover:text-white transition-colors"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Navigation Columns (Desktop) & Accordions (Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 mb-12 border-b border-neutral-800 text-xs">
          {/* Column 1: Destinations */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer md:cursor-default"
              onClick={() => toggleMobile('destinations')}
            >
              <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-white mb-4">
                {t.footer.destinations}
              </h4>
              <ChevronDown
                className={`w-3.5 h-3.5 md:hidden transition-transform ${
                  mobileSection === 'destinations' ? 'rotate-180' : ''
                }`}
              />
            </div>
            <ul
              className={`space-y-2 text-neutral-400 font-light ${
                mobileSection === 'destinations' ? 'block' : 'hidden md:block'
              }`}
            >
              {destinations.map((d, i) => (
                <li key={i}>
                  <a
                    href="#selection-section"
                    className="hover:text-white transition-colors"
                  >
                    {d}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Property Types */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer md:cursor-default"
              onClick={() => toggleMobile('types')}
            >
              <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-white mb-4">
                {t.footer.propertyTypes}
              </h4>
              <ChevronDown
                className={`w-3.5 h-3.5 md:hidden transition-transform ${
                  mobileSection === 'types' ? 'rotate-180' : ''
                }`}
              />
            </div>
            <ul
              className={`space-y-2 text-neutral-400 font-light ${
                mobileSection === 'types' ? 'block' : 'hidden md:block'
              }`}
            >
              {propertyTypes.map((t, i) => (
                <li key={i}>
                  <a
                    href="#selection-section"
                    className="hover:text-white transition-colors"
                  >
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services & Agency */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer md:cursor-default"
              onClick={() => toggleMobile('services')}
            >
              <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-white mb-4">
                {t.footer.theAgency}
              </h4>
              <ChevronDown
                className={`w-3.5 h-3.5 md:hidden transition-transform ${
                  mobileSection === 'services' ? 'rotate-180' : ''
                }`}
              />
            </div>
            <ul
              className={`space-y-2 text-neutral-400 font-light ${
                mobileSection === 'services' ? 'block' : 'hidden md:block'
              }`}
            >
              {services.map((s, i) => (
                <li key={i}>
                  <a
                    href="#selection-section"
                    className="hover:text-white transition-colors"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact details */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-white mb-4">
              {t.footer.directContact}
            </h4>
            <div className="space-y-3 text-neutral-400 font-light">
              <div className="flex items-center space-x-3">
                <Phone className="w-3.5 h-3.5 text-white" />
                <a
                  href="tel:+33753077572"
                  className="hover:text-white transition-colors font-mono"
                >
                  +33 (0)7 53 07 75 72
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <a
                  href="mailto:info@kretz.site"
                  className="hover:text-white transition-colors"
                >
                  info@kretz.site
                </a>
              </div>
              <div className="flex items-start space-x-3 pt-1">
                <MapPin className="w-3.5 h-3.5 text-white mt-0.5" />
                <span>
                  Boulogne-Billancourt & Paris, France
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 font-light gap-4">
          <div>
            <span>{t.footer.allRightsReserved}</span>
          </div>

          <div className="flex flex-wrap items-center space-x-4">
            <button
              type="button"
              onClick={() => onOpenLegal ? onOpenLegal('terms') : undefined}
              className="hover:text-white transition-colors"
            >
              {t.footer.termsOfUse}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenLegal ? onOpenLegal('privacy') : undefined}
              className="hover:text-white transition-colors"
            >
              {t.footer.privacyPolicy}
            </button>
            <span>•</span>
            <a href="#contact-footer" className="hover:text-white transition-colors">
              {t.footer.legalNotice}
            </a>
            <span>•</span>
            <a href="#contact-footer" className="hover:text-white transition-colors">
              {t.footer.feeSchedule}
            </a>
            <span>•</span>
            <a href="#contact-footer" className="hover:text-white transition-colors">
              {t.footer.sitemap}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
