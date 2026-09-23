import React, { useState } from 'react';
import { X, Bell, Check, ShieldCheck } from 'lucide-react';
import { submitAlert } from '../services/firestoreService';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    propertyType: 'All',
    region: 'All France',
    maxBudget: 'Any',
    frequency: 'instant',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Save alert to Firestore
    submitAlert({
      email: formData.email,
      propertyType: formData.propertyType,
      region: formData.region,
      maxBudget: formData.maxBudget,
      frequency: formData.frequency as any,
    }).catch((err) => {
      console.warn('Firestore alert save notice:', err);
    });

    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        destination: formData.region,
        propertyType: formData.propertyType,
        budgetMax: formData.maxBudget !== 'Any' ? parseInt(formData.maxBudget.replace(/\D/g, ''), 10) || null : null,
      }),
    }).catch((err) => {
      console.error('Failed to save alert to database:', err);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-sm shadow-2xl p-6 sm:p-8 border border-neutral-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-black rounded-full"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-light font-serif-luxury text-[#1d1d1b]">
              Your Alert is Activated
            </h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto font-light leading-relaxed">
              We will notify you at <strong className="text-black">{formData.email}</strong> as soon as a rare property matching your exact criteria is listed or released off-market.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-[#1d1d1b] text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-neutral-800"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 text-neutral-500 text-xs uppercase tracking-widest font-semibold mb-2">
              <Bell className="w-4 h-4 text-black" />
              <span>Real-Time Property Alert</span>
            </div>
            <h2 className="text-2xl font-light font-serif-luxury text-[#1d1d1b] mb-2">
              Never Miss an Exceptional Estate
            </h2>
            <p className="text-xs text-neutral-500 font-light mb-6">
              Be first to discover new prestige listings and confidential off-market opportunities in France.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@luxury.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-600 mb-1">
                    Property Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) =>
                      setFormData({ ...formData, propertyType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Apartment">Apartment / Penthouse</option>
                    <option value="Villa">Villa / Waterfront</option>
                    <option value="Private Mansion">Private Mansion</option>
                    <option value="Castle">Château</option>
                    <option value="Chalet">Alpine Chalet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-600 mb-1">
                    Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="All France">All France</option>
                    <option value="Paris">Paris & Île-de-France</option>
                    <option value="Côte d'Azur">French Riviera / Côte d'Azur</option>
                    <option value="Provence">Provence</option>
                    <option value="Alps">Alps & Megève</option>
                    <option value="South-West">Bordeaux & South-West</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-600 mb-1">
                  Target Budget
                </label>
                <select
                  value={formData.maxBudget}
                  onChange={(e) =>
                    setFormData({ ...formData, maxBudget: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="Any">Any Budget</option>
                  <option value="5M">Up to 5 000 000 €</option>
                  <option value="10M">Up to 10 000 000 €</option>
                  <option value="25M">Up to 25 000 000 €</option>
                  <option value="50M+">50 000 000 € +</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-600 mb-1">
                  Notification Frequency
                </label>
                <div className="flex items-center space-x-4 pt-1">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value="instant"
                      checked={formData.frequency === 'instant'}
                      onChange={() =>
                        setFormData({ ...formData, frequency: 'instant' })
                      }
                      className="text-black focus:ring-0 cursor-pointer"
                    />
                    <span>Instant Alert</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={formData.frequency === 'daily'}
                      onChange={() =>
                        setFormData({ ...formData, frequency: 'daily' })
                      }
                      className="text-black focus:ring-0 cursor-pointer"
                    />
                    <span>Daily Digest</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1d1d1b] hover:bg-neutral-800 text-white rounded-sm text-xs uppercase tracking-widest font-semibold transition-colors shadow-md"
                >
                  Create Property Alert
                </button>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-neutral-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>No spam. Unsubscribe at any time with a single click.</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
