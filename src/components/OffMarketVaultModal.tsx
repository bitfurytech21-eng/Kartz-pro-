import React, { useState } from 'react';
import {
  X,
  Lock,
  Unlock,
  Key,
  Shield,
  FileCheck,
  CheckCircle2,
  Building,
  MapPin,
  Maximize2,
  Sparkles,
  Phone,
  Mail,
  Eye,
} from 'lucide-react';
import { submitInquiry } from '../services/firestoreService';
import { Currency } from '../types';

interface OffMarketVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onSelectPropertyRef?: (ref: string) => void;
}

export const OffMarketVaultModal: React.FC<OffMarketVaultModalProps> = ({
  isOpen,
  onClose,
  currency,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    investorType: 'Private Collector',
    targetBudget: '€10M - €25M',
    acceptedNDA: false,
  });

  if (!isOpen) return null;

  // Ultra-exclusive off-market confidential inventory
  const confidentialEstates = [
    {
      code: 'KRETZ-OFF-901',
      title: 'Hôtel Particulier Avenue Montaigne - Triangle d’Or',
      location: 'Paris 8ème, France',
      type: 'Private Mansion (Hôtel Particulier)',
      surface: '920 m²',
      grounds: '350 m² Private Courtyard & English Garden',
      rooms: '14 Rooms · 7 Master Suites',
      estimatedPriceEUR: 45000000,
      imageBlur: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      description:
        'A classified 19th-century private mansion discreetly nestled behind monumental carriage gates on Avenue Montaigne. Monumental stone staircases, 5.2m ceiling heights, private subterranean wellness pavilion with 18m lap pool, and 4 secure underground parking bays.',
      curator: 'Valentin & Olivier Kretz',
    },
    {
      code: 'KRETZ-OFF-902',
      title: 'Waterfront Estate "Pieds-dans-l’eau" - Cap d’Antibes',
      location: 'Cap d’Antibes (West Coast), France',
      type: 'Waterfront Palace & Private Dock',
      surface: '780 m²',
      grounds: '8,200 m² Landscaped Pine Grove & Direct Sea Access',
      rooms: '10 Suites · Staff Quarters',
      estimatedPriceEUR: 38000000,
      imageBlur: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      description:
        'A rare waterfront haven offering total privacy on the tip of Cap d’Antibes. Private deep-water mooring for tenders up to 15m, infinity sea-water pool, helipad authorization, and 360° unobstructed Mediterranean sunset panoramas.',
      curator: 'Louis Kretz',
    },
    {
      code: 'KRETZ-OFF-903',
      title: 'Ski-in / Ski-out Master Chalet - Courchevel 1850',
      location: 'Courchevel 1850 (Bellecôte), France',
      type: 'Prestige Alpine Chalet',
      surface: '640 m²',
      grounds: 'Direct Bellecôte Piste Departure',
      rooms: '6 Suites · Ski Room · Cinema & Spa',
      estimatedPriceEUR: 28500000,
      imageBlur: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      description:
        'Pure contemporary Alpine craftsmanship pairing century-old Austrian larch wood with Italian stone. Complete subterranean private spa with hammam, sauna, waterfall jacuzzi, and bespoke humidor lounge.',
      curator: 'Martin Kretz',
    },
  ];

  const formatPrice = (priceEUR: number) => {
    let converted = priceEUR;
    let symbol = '€';
    if (currency === 'USD') {
      converted = Math.round(priceEUR * 1.09);
      symbol = '$';
    } else if (currency === 'GBP') {
      converted = Math.round(priceEUR * 0.85);
      symbol = '£';
    }
    const formatted = converted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return currency === 'EUR' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
  };

  const handleNDASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptedNDA) return;

    setIsSubmitting(true);
    try {
      // Record NDA access request in Firestore
      await submitInquiry({
        propertyRef: 'OFF-MARKET-VAULT-ACCESS',
        propertyTitle: `VIP Confidential Vault Clearance - ${formData.investorType}`,
        senderName: formData.fullName,
        senderEmail: formData.email,
        senderPhone: formData.phone,
        message: `Digital NDA executed. Investor Category: ${formData.investorType}. Target Allocation: ${formData.targetBudget}.`,
      });
      setIsUnlocked(true);
    } catch (err) {
      console.warn('Off-market NDA submission notice:', err);
      // Still unlock locally for uninterrupted client experience
      setIsUnlocked(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-neutral-900 text-white rounded-sm shadow-2xl border border-neutral-700 overflow-hidden my-auto">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center space-x-2.5">
            <div className={`p-1.5 rounded-full ${isUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-400">
                  Private Collection & Off-Market
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase border border-amber-500/40 text-amber-300 bg-amber-500/10">
                  {isUnlocked ? 'Clearance Granted' : 'Confidentiality Protocol'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-10 space-y-8 max-h-[80vh] overflow-y-auto">
          {!isUnlocked ? (
            /* Locked Gate with Digital NDA Clearance Form */
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                  <Key className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-light font-serif-luxury tracking-wide text-white">
                  Exclusive Off-Market Collection
                </h2>
                <p className="text-sm text-neutral-300 font-light leading-relaxed">
                  The most prestigious French estates are never publicly indexed. Sign the digital confidentiality agreement below to unlock verified off-market dossiers, architectural plans, and private acquisitions.
                </p>
              </div>

              {/* Teaser Previews Blurred */}
              <div className="grid grid-cols-3 gap-3">
                {confidentialEstates.map((item, idx) => (
                  <div key={idx} className="relative aspect-4/3 rounded-xs overflow-hidden border border-neutral-800 group">
                    <img
                      src={item.imageBlur}
                      alt="Confidential Asset"
                      className="w-full h-full object-cover filter blur-xs scale-105 opacity-50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center">
                      <Lock className="w-4 h-4 text-amber-400 mb-1" />
                      <span className="text-[10px] font-mono text-neutral-300 uppercase">{item.code}</span>
                      <span className="text-[9px] text-neutral-400 font-light truncate max-w-full">{item.location}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Digital NDA Agreement Form */}
              <form onSubmit={handleNDASubmit} className="bg-neutral-950 p-6 sm:p-8 rounded-sm border border-neutral-800 space-y-5">
                <div className="flex items-center space-x-2 pb-3 border-b border-neutral-800">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-neutral-200">
                    Bespoke Non-Disclosure Agreement (Loi Informatique & Confidentialité)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Lord Harrington / Alexandre de V."
                      className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xs px-3 py-2 text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium mb-1">
                      Confidential Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@familyoffice.com"
                      className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xs px-3 py-2 text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium mb-1">
                      Private Telephone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+33 6 00 00 00 00"
                      className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xs px-3 py-2 text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium mb-1">
                      Investor Profile
                    </label>
                    <select
                      value={formData.investorType}
                      onChange={(e) => setFormData({ ...formData, investorType: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xs px-3 py-2 text-xs focus:border-amber-400 focus:outline-hidden"
                    >
                      <option value="Private Collector">Private Collector / Individual</option>
                      <option value="Family Office">Family Office / Sovereign Wealth</option>
                      <option value="Institutional Fund">Institutional Fund / Mandate</option>
                      <option value="Public Figure">Diplomatic / Public Figure</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acceptedNDA}
                      onChange={(e) => setFormData({ ...formData, acceptedNDA: e.target.checked })}
                      className="mt-0.5 accent-amber-400 rounded-xs"
                    />
                    <span className="text-xs text-neutral-300 font-light leading-relaxed">
                      I formally commit to maintaining absolute confidentiality regarding all cadastral records, architectural plans, and pricing parameters provided in this Off-Market portfolio.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.acceptedNDA}
                  className="w-full py-3 bg-amber-400 text-neutral-950 hover:bg-amber-300 font-semibold text-xs uppercase tracking-widest rounded-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign Digital NDA & Unlock Vault'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* Unlocked View: Full Off-Market Portfolios */
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Clearance Granted: {formData.fullName || 'VIP Client'}</span>
                  </div>
                  <h3 className="text-2xl font-light font-serif-luxury text-white mt-1">
                    Off-Market Mandates & Confidential Assets
                  </h3>
                </div>
                <div className="text-xs text-neutral-400 font-light sm:text-right">
                  <span>Authorized by KRETZ Family Partners</span>
                  <p className="text-[11px] text-amber-300 font-mono">Dossiers strictly non-transferable</p>
                </div>
              </div>

              {/* Listing Cards */}
              <div className="space-y-6">
                {confidentialEstates.map((estate, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-950 rounded-sm border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all flex flex-col md:flex-row"
                  >
                    <div className="md:w-5/12 relative aspect-16/10 md:aspect-auto">
                      <img
                        src={estate.imageBlur}
                        alt={estate.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 rounded-xs border border-neutral-700 text-[10px] font-mono tracking-widest text-amber-300">
                        {estate.code}
                      </div>
                    </div>

                    <div className="p-6 md:w-7/12 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                          <span className="uppercase tracking-wider">{estate.type}</span>
                          <span className="flex items-center gap-1 text-neutral-300">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            {estate.location}
                          </span>
                        </div>

                        <h4 className="text-xl font-serif-luxury font-light text-white mb-2">
                          {estate.title}
                        </h4>

                        <p className="text-xs text-neutral-300 font-light leading-relaxed mb-4">
                          {estate.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 py-3 border-y border-neutral-800 text-xs">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">
                              Living Space
                            </span>
                            <span className="text-sm font-medium text-white">{estate.surface}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">
                              Grounds & Exterior
                            </span>
                            <span className="text-sm font-medium text-white">{estate.grounds}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">
                            Confidential Valuation
                          </span>
                          <span className="text-lg font-serif-luxury font-light text-amber-300">
                            {formatPrice(estate.estimatedPriceEUR)}
                          </span>
                        </div>

                        <a
                          href="mailto:info@kretz.site?subject=Confidential%20Off-Market%20Inquiry%20Ref:%20KRETZ-OFF"
                          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Request Private Dossier</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
