import React, { useState } from 'react';
import {
  X,
  User,
  Heart,
  Calendar,
  MessageSquare,
  Bell,
  Building,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Property, Currency } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  savedProperties: Property[];
  onRemoveFavorite: (id: string) => void;
  onOpenProperty: (property: Property) => void;
  onOpenCalendar: (property?: Property) => void;
  onOpenAlertModal: () => void;
  onSignOut: () => void;
  currency: Currency;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  savedProperties,
  onRemoveFavorite,
  onOpenProperty,
  onOpenCalendar,
  onOpenAlertModal,
  onSignOut,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'viewings' | 'inquiries' | 'alerts'>('favorites');

  if (!isOpen) return null;

  const formatPrice = (priceNum: number | null, isConfidential?: boolean) => {
    if (isConfidential || !priceNum) return 'Confidential price';
    let converted = priceNum;
    let symbol = '€';
    if (currency === 'USD') {
      converted = Math.round(priceNum * 1.09);
      symbol = '$';
    } else if (currency === 'GBP') {
      converted = Math.round(priceNum * 0.85);
      symbol = '£';
    }
    const formatted = converted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return currency === 'EUR' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
  };

  const totalPortfolioValue = savedProperties.reduce(
    (sum, p) => sum + (p.priceNumber || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-sm shadow-2xl border border-neutral-200 overflow-hidden my-auto text-[#1d1d1b]">
        {/* Header Bar */}
        <div className="bg-[#fae9e5]/40 border-b border-neutral-200 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[#1d1d1b] shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-serif-luxury font-light text-[#1d1d1b]">
                  {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'VIP Private Client'}
                </h3>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Kretz VIP Member</span>
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-light">
                {currentUser?.email || 'Authenticated client session'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-black rounded-full ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50/50 text-xs uppercase tracking-wider font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`px-5 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'favorites'
                ? 'border-black text-black font-semibold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Saved Portfolio ({savedProperties.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('viewings')}
            className={`px-5 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'viewings'
                ? 'border-black text-black font-semibold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Private Viewings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`px-5 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'inquiries'
                ? 'border-black text-black font-semibold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inquiries & Dossiers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`px-5 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
              activeTab === 'alerts'
                ? 'border-black text-black font-semibold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Active Alerts</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
                <div>
                  <h4 className="text-lg font-serif-luxury font-light text-[#1d1d1b]">
                    Curated Property Wishlist
                  </h4>
                  <p className="text-xs text-neutral-500 font-light">
                    Synchronized securely with your private Kretz cloud profile.
                  </p>
                </div>
                {savedProperties.length > 0 && totalPortfolioValue > 0 && (
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">
                      Total Shortlist Valuation
                    </span>
                    <span className="text-base font-serif-luxury font-light text-[#1d1d1b]">
                      {formatPrice(totalPortfolioValue)}
                    </span>
                  </div>
                )}
              </div>

              {savedProperties.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Heart className="w-8 h-8 text-neutral-300 mx-auto" />
                  <p className="text-sm text-neutral-600 font-light">
                    No properties shortlisted in your collection yet.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 text-xs uppercase tracking-wider font-semibold underline text-[#1d1d1b]"
                  >
                    Explore Selected Listings
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedProperties.map((property) => (
                    <div
                      key={property.id}
                      className="border border-neutral-200 rounded-sm overflow-hidden flex flex-col justify-between group hover:border-neutral-400 transition-colors bg-white shadow-xs"
                    >
                      <div className="relative aspect-16/10 overflow-hidden">
                        <img
                          src={property.mainImage}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveFavorite(property.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span className="uppercase tracking-wider font-medium">{property.typeDisplay}</span>
                          <span>{property.city}</span>
                        </div>
                        <h5 className="text-sm font-medium text-[#1d1d1b] line-clamp-1">
                          {property.title}
                        </h5>
                        <p className="text-sm font-serif-luxury font-light text-[#1d1d1b]">
                          {formatPrice(property.priceNumber, property.isPriceConfidential)}
                        </p>

                        <div className="flex items-center space-x-2 pt-2 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() => {
                              onOpenProperty(property);
                              onClose();
                            }}
                            className="flex-1 py-1.5 text-xs text-center border border-neutral-200 rounded-xs hover:border-black font-medium transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenCalendar(property);
                              onClose();
                            }}
                            className="flex-1 py-1.5 text-xs text-center bg-[#1d1d1b] text-white rounded-xs hover:bg-neutral-800 font-medium transition-colors"
                          >
                            Schedule Tour
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'viewings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h4 className="text-lg font-serif-luxury font-light text-[#1d1d1b]">
                  Private Viewing Appointments
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    onOpenCalendar();
                    onClose();
                  }}
                  className="text-xs uppercase tracking-wider font-semibold text-black underline"
                >
                  Book New Tour
                </button>
              </div>

              <div className="p-5 bg-neutral-50 rounded-sm border border-neutral-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Confirmed Scheduling
                    </span>
                    <h5 className="text-sm font-medium text-[#1d1d1b] mt-1">
                      Private Viewing & Architectural Briefing
                    </h5>
                    <p className="text-xs text-neutral-600 font-light flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      45-Minute On-Site Accompanied Tour · Kretz Family Partner
                    </p>
                  </div>
                  <Calendar className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-xs text-neutral-600 font-light leading-relaxed border-t border-neutral-200/60 pt-2">
                  All viewing itineraries include chauffeur rendezvous, technical Loi Carrez documentation, and direct Q&A with your dedicated broker.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <h4 className="text-lg font-serif-luxury font-light text-[#1d1d1b] pb-2 border-b border-neutral-100">
                Active Client Requests & Mandates
              </h4>

              <div className="p-4 bg-white border border-neutral-200 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1d1d1b]">Confidential Property Inquiry</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs font-semibold text-[10px] uppercase">
                    Advisor Assigned
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-light">
                  Your inquiry has been assigned to Valentin & Martin Kretz. Direct contact will be initiated via email or telephone.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h4 className="text-lg font-serif-luxury font-light text-[#1d1d1b]">
                  Custom Real Estate Alerts
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAlertModal();
                    onClose();
                  }}
                  className="text-xs uppercase tracking-wider font-semibold text-black underline"
                >
                  Create New Alert
                </button>
              </div>

              <div className="p-4 bg-neutral-50 rounded-sm border border-neutral-200 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1b]">
                    Prestige France & Riviera
                  </h5>
                  <p className="text-xs text-neutral-600 font-light">
                    Apartments & Waterfront Villas · Instant notification on new listings
                  </p>
                </div>
                <Bell className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
