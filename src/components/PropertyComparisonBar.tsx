import React from 'react';
import { Property, Currency } from '../types';
import { Layers, X, ArrowRight, Trash2 } from 'lucide-react';
import { formatPlanCurrency } from '../utils/paymentPlan';

interface PropertyComparisonBarProps {
  comparedProperties: Property[];
  onOpenComparison: () => void;
  onRemoveProperty: (id: string) => void;
  onClearAll: () => void;
  currency: Currency;
}

export const PropertyComparisonBar: React.FC<PropertyComparisonBarProps> = ({
  comparedProperties,
  onOpenComparison,
  onRemoveProperty,
  onClearAll,
  currency,
}) => {
  if (comparedProperties.length === 0) return null;

  return (
    <aside
      id="property-comparison-dock"
      aria-label="Estate comparison dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-[#1d1d1b] text-white rounded-xs shadow-2xl border border-neutral-700/80 px-4 py-3 flex items-center justify-between gap-3 animate-slide-up"
    >
      <div className="flex items-center space-x-3 overflow-x-auto py-1">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#fae9e5] text-[#1d1d1b] flex items-center justify-center font-bold text-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold tracking-wider uppercase text-white">
              Estate Comparison
            </div>
            <div className="text-[10px] text-neutral-400">
              {comparedProperties.length} / 4 Estates selected
            </div>
          </div>
        </div>

        {/* Thumbnail Avatars */}
        <div className="flex items-center space-x-2">
          {comparedProperties.map((prop) => (
            <div
              key={prop.id}
              className="relative group shrink-0 w-10 h-10 rounded-xs overflow-hidden border border-white/20 bg-neutral-800"
            >
              <img
                src={prop.images && prop.images[0] ? prop.images[0] : '/files/default.jpg'}
                alt={prop.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveProperty(prop.id);
                }}
                className="absolute inset-0 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title={`Remove ${prop.title}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          type="button"
          onClick={onClearAll}
          className="p-2 text-neutral-400 hover:text-white transition rounded-xs text-xs"
          title="Clear all selected"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenComparison}
          className="px-4 py-2 bg-white text-[#1d1d1b] hover:bg-[#fae9e5] text-xs font-semibold tracking-wider uppercase rounded-xs transition flex items-center space-x-1.5 shadow-sm"
        >
          <span>Compare Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
