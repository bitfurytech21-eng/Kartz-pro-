import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Why invest in luxury real estate in France?',
      a: 'France is a safe bet thanks to its international appeal, political and economic stability, and unique heritage. By investing in an exceptional property in France, you can enjoy a piece of the French art de vivre, while benefiting from an asset that tends to increase in value over the long term.',
    },
    {
      q: 'How do I go about buying a luxury property in France?',
      a: 'Define your expectations (type of property, location, budget). Select available properties that meet your criteria. Visit the properties and validate the technical and legal aspects with our dedicated family advisors. Negotiate and finalize the transaction with the assistance of real estate and legal experts to ensure confidentiality and optimal financial structuring.',
    },
    {
      q: 'What types of property can I find with Kretz Real Estate in France?',
      a: "Kretz Real Estate offers a selection of exclusive properties, from Haussmann-style apartments and private mansions in Paris to contemporary waterfront villas on the Côte d'Azur, authentic Alpine ski chalets in Megève and Courchevel, wine estates in Bordeaux, and historic châteaux across the Loire Valley and Île-de-France.",
    },
    {
      q: 'Why use a luxury real estate agency to buy in France?',
      a: 'A specialized agency offers tailor-made support, absolute discretion, and in-depth market expertise. Thanks to our exclusive family network and off-market portfolio, we give you access to rare, confidential properties that are never publicly advertised, while guiding you through every step from negotiation to notary deeds.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-20 bg-[#fcfbf9] border-t border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-wide text-[#1d1d1b] font-serif-luxury mt-2">
            Acquiring Luxury Real Estate in France
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-neutral-200/80 rounded-sm overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between space-x-4 hover:bg-neutral-50/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-light text-[#1d1d1b] font-serif-luxury">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-black' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-[14px] text-neutral-600 font-light leading-relaxed border-t border-neutral-100/60 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
