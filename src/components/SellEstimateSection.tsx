import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';
import { submitValuation } from '../services/firestoreService';

export const SellEstimateSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    city: '',
    postalCode: '',
    propertyType: 'Apartment',
    surface: '',
    rooms: '',
    fullName: '',
    email: '',
    phone: '',
    intent: 'sell', // 'sell' or 'rent'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    submitValuation({
      city: formData.city,
      postalCode: formData.postalCode,
      propertyType: formData.propertyType,
      surface: formData.surface,
      rooms: formData.rooms,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      intent: formData.intent as any,
    }).catch((err) => {
      console.warn('Firestore valuation submission notice:', err);
    });
  };

  return (
    <section id="sell-section" className="py-20 bg-[#fae9e5]/40 border-t border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-600">
            Valuation & Mandates
          </span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-wide text-[#1d1d1b] font-serif-luxury mt-2 mb-4">
            Looking to sell or rent an exceptional property?
          </h2>
          <p className="text-sm text-neutral-600 font-light leading-relaxed">
            Benefit from the expertise and global network of the Kretz family.
            We provide confidential valuations and tailored marketing strategies for prime properties.
          </p>
        </div>

        <div className="bg-white rounded-sm shadow-xl border border-neutral-200/60 p-6 sm:p-10 max-w-3xl mx-auto">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-light font-serif-luxury text-[#1d1d1b]">
                Thank you for your request
              </h3>
              <p className="text-sm text-neutral-600 max-w-md mx-auto font-light">
                A dedicated advisor from Kretz Real Estate will review your property details and contact you within 24 hours in complete confidentiality.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 text-xs uppercase tracking-wider font-semibold border border-neutral-300 rounded-sm hover:border-black transition-colors"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Intent Toggle: Sell or Rent */}
              <div className="flex items-center justify-center space-x-4 pb-2">
                <label className="flex items-center space-x-2 text-xs uppercase tracking-wider font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="intent"
                    value="sell"
                    checked={formData.intent === 'sell'}
                    onChange={() => setFormData({ ...formData, intent: 'sell' })}
                    className="text-black focus:ring-0 cursor-pointer"
                  />
                  <span>I want to sell</span>
                </label>
                <label className="flex items-center space-x-2 text-xs uppercase tracking-wider font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="intent"
                    value="rent"
                    checked={formData.intent === 'rent'}
                    onChange={() => setFormData({ ...formData, intent: 'rent' })}
                    className="text-black focus:ring-0 cursor-pointer"
                  />
                  <span>I want to rent out</span>
                </label>
              </div>

              {/* Property Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">
                    Property Location / City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paris 8e, Cannes, Megève"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">
                    Property Type *
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="Apartment">Apartment / Penthouse</option>
                    <option value="Private Mansion">Private Mansion (Hôtel Particulier)</option>
                    <option value="Villa">Villa / Waterfront</option>
                    <option value="House">Townhouse / Country House</option>
                    <option value="Castle">Château / Historic Domain</option>
                    <option value="Chalet">Alpine Chalet</option>
                    <option value="Wine Estate">Wine Estate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">
                    Approximate Surface (sqm)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 350"
                    value={formData.surface}
                    onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">
                    Number of Rooms
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 8"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Owner Contact Information */}
              <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First & Last name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Trust Badge and Submit button */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
                <div className="flex items-center space-x-2 text-xs text-neutral-500">
                  <ShieldCheck className="w-4 h-4 text-neutral-700" />
                  <span>100% Confidential • Discretion guaranteed</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-[#1d1d1b] hover:bg-neutral-800 text-white rounded-sm text-xs uppercase tracking-[0.15em] font-semibold transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Request an estimate</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
