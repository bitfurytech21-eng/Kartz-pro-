import React from 'react';
import { X, Trash2, ExternalLink, Heart, ChevronRight } from 'lucide-react';
import { Property, Currency } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedProperties: Property[];
  onRemove: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  currency: Currency;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  savedProperties,
  onRemove,
  onSelectProperty,
  currency,
}) => {
  if (!isOpen) return null;

  const formatCurrency = (priceNum: number | null, isConfidential: boolean) => {
    if (isConfidential || priceNum === null || priceNum === 0) {
      return 'Confidential price';
    }
    let converted = priceNum;
    let symbol = '€';
    if (currency === 'USD') {
      converted = Math.round(priceNum * 1.09);
      symbol = '$';
    } else if (currency === 'GBP') {
      converted = Math.round(priceNum * 0.85);
      symbol = '£';
    }
    const formatted = converted
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return currency === 'EUR' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 fill-black text-black" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1d1d1b]">
                Saved Properties ({savedProperties.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-neutral-500 hover:text-black rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {savedProperties.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Heart className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-sm font-light text-neutral-500">
                  You have not saved any properties yet.
                </p>
                <p className="text-xs text-neutral-400">
                  Click the heart icon on any listing to save it to your confidential wishlist.
                </p>
              </div>
            ) : (
              savedProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex border border-neutral-200 rounded-sm overflow-hidden p-3 space-x-3 group hover:border-black transition-colors"
                >
                  <div
                    className="w-24 h-20 bg-neutral-100 flex-shrink-0 overflow-hidden rounded-xs cursor-pointer"
                    onClick={() => {
                      onSelectProperty(property);
                      onClose();
                    }}
                  >
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {property.ref}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemove(property.id)}
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4
                        className="font-medium text-[#1d1d1b] truncate cursor-pointer hover:underline"
                        onClick={() => {
                          onSelectProperty(property);
                          onClose();
                        }}
                      >
                        {property.location}
                      </h4>
                      <p className="text-neutral-500 text-[11px]">
                        {property.surface} sqm • {property.rooms} Rooms
                      </p>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="font-semibold text-black">
                        {formatCurrency(property.price, property.isConfidential)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProperty(property);
                          onClose();
                        }}
                        className="text-[11px] font-medium text-black hover:underline flex items-center"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer action */}
          {savedProperties.length > 0 && (
            <div className="p-6 border-t border-neutral-200 bg-neutral-50">
              <button
                type="button"
                onClick={() => {
                  alert(
                    `Inquiry dossier prepared for ${savedProperties.length} saved properties. Our team will contact you.`
                  );
                  onClose();
                }}
                className="w-full py-3 bg-[#1d1d1b] hover:bg-neutral-800 text-white rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors shadow-md"
              >
                Inquire on all {savedProperties.length} properties
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
