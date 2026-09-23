import React, { useState } from 'react';
import { Property, Currency } from '../types';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  Check,
  Minus,
  Sparkles,
  Printer,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
  Waves,
  Sun,
  Wind,
  Building,
  Trees,
  Flame,
  Trophy,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { formatPlanCurrency } from '../utils/paymentPlan';

interface PropertyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onRemoveProperty: (id: string) => void;
  onClearAll: () => void;
  onSelectProperty: (property: Property) => void;
  onOpenCalendar: (property: Property) => void;
  currency: Currency;
  allProperties?: Property[];
  onAddProperty?: (property: Property) => void;
}

export const PropertyComparisonModal: React.FC<PropertyComparisonModalProps> = ({
  isOpen,
  onClose,
  properties,
  onRemoveProperty,
  onClearAll,
  onSelectProperty,
  onOpenCalendar,
  currency,
  allProperties = [],
  onAddProperty,
}) => {
  const { t } = useTranslation();
  const [showAddPicker, setShowAddPicker] = useState(false);

  if (!isOpen) return null;

  // Filter candidates that can be added
  const availableCandidates = allProperties.filter(
    (p) => !properties.some((selected) => selected.id === p.id)
  );

  const formatPrice = (priceNum: number | null, isConfidential: boolean) => {
    if (isConfidential || priceNum === null || priceNum === 0) {
      return t.propertyCard.priceOnRequest;
    }
    return formatPlanCurrency(priceNum, currency);
  };

  const getPricePerSqm = (prop: Property) => {
    if (!prop.price || prop.price === 0 || !prop.surface || prop.surface === 0) {
      return '—';
    }
    const perSqm = Math.round(prop.price / prop.surface);
    return `${formatPlanCurrency(perSqm, currency)} / m²`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        id="property-comparison-modal"
        className="relative w-full max-w-6xl bg-white text-[#1d1d1b] border border-neutral-200 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-[#fbf9f8]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xs bg-[#fae9e5] flex items-center justify-center text-[#1d1d1b]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-serif tracking-tight text-[#1d1d1b]">
                  Prestige Estate Side-by-Side Comparison
                </h2>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-[#1d1d1b] text-white rounded-xs">
                  {properties.length} / 4 Selected
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Multi-attribute structural, architectural & financial benchmarking matrix
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {properties.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="px-2.5 py-1 text-xs text-neutral-500 hover:text-red-700 transition flex items-center space-x-1"
                title="Clear all properties"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-xs transition-colors hidden sm:block"
              title="Print comparative dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-xs transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs space-y-6">
          {properties.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 mx-auto flex items-center justify-center text-neutral-400">
                <Layers className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-serif font-medium text-neutral-800">
                  No properties currently selected for comparison
                </h3>
                <p className="text-xs text-neutral-500">
                  Click the "Compare" checkbox or icon on any estate card to compare up to 4 trophy properties side-by-side.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1d1d1b] text-white text-xs font-semibold tracking-wider uppercase rounded-xs hover:bg-neutral-800 transition"
              >
                Browse Estate Portfolio
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-neutral-200">
                <thead>
                  {/* Property Visual & Title Header */}
                  <tr className="bg-neutral-50 border-b border-neutral-200 divide-x divide-neutral-200">
                    <th className="w-48 p-4 text-left font-semibold text-neutral-700 text-xs uppercase tracking-wider bg-[#fbf9f8]">
                      Estate Specification
                    </th>
                    {properties.map((prop) => (
                      <th key={prop.id} className="w-64 p-4 text-left align-top font-normal bg-white">
                        <div className="space-y-3 relative group">
                          {/* Close/Remove button */}
                          <button
                            type="button"
                            onClick={() => onRemoveProperty(prop.id)}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-full z-10 transition"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Image */}
                          <div
                            onClick={() => onSelectProperty(prop)}
                            className="aspect-[16/10] bg-neutral-100 overflow-hidden rounded-xs cursor-pointer relative"
                          >
                            <img
                              src={prop.images && prop.images[0] ? prop.images[0] : '/files/default.jpg'}
                              alt={prop.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {prop.chips && prop.chips.length > 0 && (
                              <div className="absolute bottom-2 left-2 flex gap-1">
                                <span className="bg-[#1d1d1b] text-white text-[9px] uppercase px-1.5 py-0.5 font-bold tracking-wider rounded-xs">
                                  {prop.chips[0]}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Ref & Location */}
                          <div>
                            <span className="text-[10px] text-neutral-400 font-mono">Ref. {prop.ref}</span>
                            <h4
                              onClick={() => onSelectProperty(prop)}
                              className="text-xs font-semibold text-[#1d1d1b] hover:underline cursor-pointer line-clamp-2"
                            >
                              {prop.title}
                            </h4>
                            <p className="text-[11px] text-neutral-500 mt-0.5">{prop.location}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => onSelectProperty(prop)}
                              className="w-full py-1.5 px-2 bg-[#1d1d1b] hover:bg-neutral-800 text-white text-[11px] font-semibold uppercase tracking-wider rounded-xs transition text-center"
                            >
                              View Dossier
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenCalendar(prop)}
                              className="w-full py-1 px-2 border border-neutral-300 hover:border-black text-[#1d1d1b] text-[10px] font-medium uppercase tracking-wider rounded-xs transition flex items-center justify-center space-x-1"
                            >
                              <Calendar className="w-3 h-3 text-neutral-600" />
                              <span>Private Viewing</span>
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}

                    {/* Add property slot if < 4 */}
                    {properties.length < 4 && (
                      <th className="w-56 p-4 text-center align-middle bg-neutral-50/50 border-dashed border-2 border-neutral-200">
                        <div className="flex flex-col items-center justify-center space-y-2 py-8">
                          <button
                            type="button"
                            onClick={() => setShowAddPicker(true)}
                            className="w-10 h-10 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 hover:border-black hover:text-black transition shadow-xs"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <span className="text-xs font-semibold text-neutral-700">Add Another Estate</span>
                          <span className="text-[10px] text-neutral-400">Up to 4 estates</span>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-200 text-xs">
                  {/* Price */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Listed Price</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3 font-serif font-bold text-sm text-[#1d1d1b]">
                        {formatPrice(p.price, p.isConfidential)}
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Price / m² */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Price per m²</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3 font-mono text-neutral-700">
                        {getPricePerSqm(p)}
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Surface */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Living Surface</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3 font-mono text-neutral-900 font-medium">
                        {p.surface > 0 ? `${p.surface} m² (${Math.round(p.surface * 10.764)} sq ft)` : 'Upon Request'}
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Ground/Plot Surface */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Plot / Grounds</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-700">
                        {p.groundSurface ? `${p.groundSurface} m²` : 'Urban Residence / Penthouse'}
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Bedrooms & Suites */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Bedrooms / Suites</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800">
                        {p.bedrooms} Suites ({p.rooms} Total Rooms)
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Bathrooms */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Bathrooms</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800">
                        {p.bathrooms || 2} Bathrooms
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Energy Diagnostic (DPE / GES) */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Energy Diagnostic (DPE)</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded-xs">
                            DPE {p.energyGrade || 'C'}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-xs">
                            GES {p.gesGrade || 'B'}
                          </span>
                        </div>
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Swimming Pool */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Swimming Pool</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3">
                        {p.amenities?.pool ? (
                          <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Private Pool</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 flex items-center space-x-1">
                            <Minus className="w-3.5 h-3.5" />
                            <span>None</span>
                          </span>
                        )}
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Terrace / Exterior */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Terrace / Loggia</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3">
                        {p.amenities?.terrace ? (
                          <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              Yes {p.amenities.terraceSurface ? `(${p.amenities.terraceSurface} m²)` : ''}
                            </span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 flex items-center space-x-1">
                            <Minus className="w-3.5 h-3.5" />
                            <span>None</span>
                          </span>
                        )}
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Private Elevator */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Private Elevator</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3">
                        {p.amenities?.elevator ? (
                          <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Private Lift</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 flex items-center space-x-1">
                            <Minus className="w-3.5 h-3.5" />
                            <span>None</span>
                          </span>
                        )}
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Air Conditioning */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Air Conditioning</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3">
                        {p.amenities?.ac ? (
                          <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Integrated Climatisation</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 flex items-center space-x-1">
                            <Minus className="w-3.5 h-3.5" />
                            <span>None</span>
                          </span>
                        )}
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Estimated French Notary Fees */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Est. Notary Duties (~7.5%)</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-3 font-mono text-neutral-700">
                        {p.price ? formatPlanCurrency(Math.round(p.price * 0.075), currency) : 'Upon Request'}
                      </td>
                    ))}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>

                  {/* Est. 20-Yr Monthly Mortgage (25% down, 3.35%) */}
                  <tr className="divide-x divide-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-3 font-semibold text-neutral-800 bg-[#fbf9f8]">Est. Monthly Debt Service</td>
                    {properties.map((p) => {
                      if (!p.price) return <td key={p.id} className="p-3 text-neutral-400">—</td>;
                      const loan = p.price * 0.75;
                      const r = 0.0335 / 12;
                      const n = 240;
                      const monthly = Math.round((loan * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1));
                      return (
                        <td key={p.id} className="p-3 font-mono text-neutral-900 font-medium">
                          {formatPlanCurrency(monthly, currency)} / mo
                        </td>
                      );
                    })}
                    {properties.length < 4 && <td className="p-3 bg-neutral-50/20"></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-[#fbf9f8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-[11px] text-neutral-500 font-light">
            All comparative figures reflect published mandates, official architectural declarations, and current financial benchmarks.
          </p>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-[#1d1d1b] text-white hover:bg-neutral-800 rounded-xs transition text-xs font-semibold tracking-wider uppercase"
            >
              Done
            </button>
          </div>
        </div>

        {/* Candidate Property Picker Drawer/Modal */}
        {showAddPicker && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-30 p-6 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-base font-serif font-semibold text-neutral-900">
                  Select Estate to Add to Comparison
                </h3>
                <p className="text-xs text-neutral-500 font-light">
                  Choose from available portfolio listings
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPicker(false)}
                className="p-1.5 text-neutral-500 hover:text-black rounded-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 overflow-y-auto flex-1 p-1">
              {availableCandidates.map((cand) => (
                <div
                  key={cand.id}
                  onClick={() => {
                    if (onAddProperty) onAddProperty(cand);
                    setShowAddPicker(false);
                  }}
                  className="p-3 border border-neutral-200 hover:border-black rounded-xs cursor-pointer transition flex items-center space-x-3 bg-white hover:bg-[#fbf9f8]"
                >
                  <img
                    src={cand.images && cand.images[0] ? cand.images[0] : '/files/default.jpg'}
                    alt={cand.title}
                    className="w-16 h-14 object-cover rounded-xs shrink-0"
                  />
                  <div className="overflow-hidden">
                    <h5 className="font-semibold text-neutral-900 truncate text-xs">{cand.title}</h5>
                    <p className="text-[11px] text-neutral-500 truncate">{cand.location}</p>
                    <p className="text-xs font-serif font-bold text-[#1d1d1b] mt-0.5">
                      {formatPrice(cand.price, cand.isConfidential)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
