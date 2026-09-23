import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import {
  calculatePaymentPlan,
  formatPlanCurrency,
  INSTALLMENT_OPTIONS,
} from '../utils/paymentPlan';
import {
  Calendar,
  CreditCard,
  Send,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Percent,
  Sparkles,
  Info,
  Mail,
} from 'lucide-react';

interface PropertyPaymentPlanProps {
  property: Property;
  currency: 'EUR' | 'USD' | 'GBP';
  compact?: boolean;
}

export const PropertyPaymentPlan: React.FC<PropertyPaymentPlanProps> = ({
  property,
  currency,
  compact = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<number>(12);
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Custom simulation price for confidential listings
  const [simulatedPrice, setSimulatedPrice] = useState<number>(
    property.price && property.price > 0 ? property.price : 2500000
  );

  const effectivePrice = property.price && property.price > 0 ? property.price : simulatedPrice;
  const isConfidential = !property.price || property.isConfidential;

  const plan = useMemo(() => {
    return calculatePaymentPlan(effectivePrice, selectedOption, new Date());
  }, [effectivePrice, selectedOption]);

  const emailUrl = useMemo(() => {
    const initStr = formatPlanCurrency(plan.initialPaymentAmount, currency, false);
    const instStr = formatPlanCurrency(plan.installmentAmount, currency, false);
    const totStr = formatPlanCurrency(plan.totalPrice, currency, isConfidential);
    const subject = `Payment Plan Inquiry - Ref ${property.ref} (${property.title})`;
    const body = `Hello Kretz Real Estate,

I am inquiring about the Payment Plan for:
• Property: ${property.title}
• Ref: ${property.ref}
• Location: ${property.location}
• Total Price: ${totStr}

Payment Plan Structure:
- 1st Initial Payment: ${initStr}
- Remaining Balance: Split across ${plan.installmentCount} installments of ${instStr} each.

Please share the notary reservation agreement and financing details.

Kind regards,`;

    return `mailto:info@kretz.site?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [plan, property, currency, isConfidential]);

  const handleCopySchedule = () => {
    const initStr = formatPlanCurrency(plan.initialPaymentAmount, currency, false);
    const instStr = formatPlanCurrency(plan.installmentAmount, currency, false);
    const totStr = formatPlanCurrency(plan.totalPrice, currency, isConfidential);

    let text = `KRETZ PROPERTIES — STRUCTURED PAYMENT PLAN\n`;
    text += `Property: ${property.title} (Ref: ${property.ref})\n`;
    text += `Location: ${property.location}\n`;
    text += `Total Price: ${totStr}\n\n`;
    text += `1. INITIAL PAYMENT: ${initStr} (Upon compromis de vente / reservation)\n`;
    text += `2. STRUCTURED BALANCE: ${plan.installmentCount} installments of ${instStr}\n\n`;
    text += `SCHEDULE BREAKDOWN:\n`;
    plan.schedule.forEach((item) => {
      text += `• Step ${item.step}: ${item.title} — ${formatPlanCurrency(item.amount, currency, false)} (${item.percentage}%) | Due: ${item.dueDate}\n`;
    });
    text += `\nRepresentative: info@kretz.site (+33 7 53 07 75 72)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id={`payment-plan-${property.id}`}
      className={`border border-neutral-200 bg-white rounded-none ${
        compact ? 'p-4' : 'p-6'
      } shadow-xs space-y-5`}
    >
      {/* Plan Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-neutral-900 text-white text-[10px] font-semibold tracking-wider uppercase">
              <Percent className="w-3 h-3 text-amber-400" />
              <span>Structured Payment Plan</span>
            </span>
            <span className="text-xs text-neutral-500 font-light flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tailored Installments</span>
            </span>
          </div>
          <h3 className="text-lg font-serif-luxury text-[#1d1d1b] font-normal mt-1.5">
            Acquisition Financing Schedule
          </h3>
          <p className="text-xs text-neutral-500 font-light">
            Secure this property with a tailored initial payment, spreading the remaining balance across structured installments.
          </p>
        </div>

        {/* Email Direct Action Badge */}
        <a
          href={emailUrl}
          className="inline-flex items-center self-start sm:self-auto space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-[#1d1d1b] text-white hover:bg-black transition-colors shadow-xs"
          title="Direct discussion via info@kretz.site"
        >
          <Mail className="w-3 h-3 text-amber-300" />
          <span>Inquire via info@kretz.site</span>
        </a>
      </div>

      {/* If confidential price, display simulator slider */}
      {isConfidential && (
        <div className="bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-none space-y-2">
          <div className="flex items-start space-x-2 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Confidential Listing Simulation: </span>
              Select or customize an acquisition valuation to project your initial payment and installment breakdown.
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-1">
            <input
              type="range"
              min="1000000"
              max="25000000"
              step="250000"
              value={simulatedPrice}
              onChange={(e) => setSimulatedPrice(Number(e.target.value))}
              className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
            />
            <span className="font-mono text-xs font-semibold text-neutral-900 shrink-0 min-w-[100px] text-right">
              {formatPlanCurrency(simulatedPrice, currency, false)}
            </span>
          </div>
        </div>
      )}

      {/* Installment Term Selector */}
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium block">
          Choose Installment Term (Remaining 45%)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {INSTALLMENT_OPTIONS.map((opt) => {
            const isSelected = selectedOption === opt.count;
            return (
              <button
                key={opt.count}
                type="button"
                onClick={() => setSelectedOption(opt.count)}
                className={`py-2 px-2.5 text-left border transition-all ${
                  isSelected
                    ? 'border-[#1d1d1b] bg-[#1d1d1b] text-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100/70 text-neutral-700'
                }`}
              >
                <div className="text-xs font-semibold">{opt.label}</div>
                <div
                  className={`text-[10px] truncate ${
                    isSelected ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {opt.count === 3 ? '15% per step' : `${(45 / opt.count).toFixed(2)}%/installment`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Progress Bar Breakdown */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-neutral-700">
          <span className="text-[#1d1d1b] flex items-center space-x-1">
            <span className="inline-block w-2 h-2 bg-[#1d1d1b]"></span>
            <span>Initial Payment</span>
          </span>
          <span className="text-neutral-500 flex items-center space-x-1">
            <span className="inline-block w-2 h-2 bg-amber-500"></span>
            <span>Installments ({plan.installmentCount} tranches)</span>
          </span>
        </div>
        <div className="w-full h-3 bg-neutral-100 flex overflow-hidden border border-neutral-200">
          <div
            style={{ width: '55%' }}
            className="bg-[#1d1d1b] h-full transition-all duration-300 relative group"
            title="Initial Payment"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div
            style={{ width: '45%' }}
            className="bg-amber-500/85 h-full transition-all duration-300 flex"
            title="Split Installments"
          >
            {Array.from({ length: plan.installmentCount }).map((_, idx) => (
              <div
                key={idx}
                className="h-full border-r border-amber-600/40 last:border-r-0 flex-1"
                title={`Installment ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Initial */}
        <div className="bg-neutral-900 text-white p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
            <span>Step 1</span>
            <span className="text-amber-400 font-medium">Initial Due</span>
          </div>
          <div className="text-xl sm:text-2xl font-semibold tracking-tight font-sans">
            {formatPlanCurrency(plan.initialPaymentAmount, currency, false)}
          </div>
          <div className="text-[11px] text-neutral-300 font-light">
            Due upon compromis / signature of mandate
          </div>
        </div>

        {/* Card 2: Installment Amount */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
            <span>Installments</span>
            <span className="text-[#1d1d1b] font-medium">{plan.installmentCount} Tranches</span>
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-[#1d1d1b] tracking-tight font-sans">
            {formatPlanCurrency(plan.installmentAmount, currency, false)}
            <span className="text-xs font-normal text-neutral-500 ml-1">
              /{plan.installmentCount === 3 ? 'tranche' : 'mo'}
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 font-light">
            {plan.installmentPercentage}% per installment
          </div>
        </div>

        {/* Card 3: Remaining 45% */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
            <span>Balance • 45%</span>
            <span className="text-neutral-600 font-medium">Financed</span>
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-[#1d1d1b] tracking-tight font-sans">
            {formatPlanCurrency(plan.remainingBalanceAmount, currency, false)}
          </div>
          <div className="text-[11px] text-neutral-500 font-light">
            0% penalty flexible amortization
          </div>
        </div>
      </div>

      {/* Expandable Schedule Breakdown Table */}
      <div className="border border-neutral-200">
        <button
          type="button"
          onClick={() => setShowFullSchedule(!showFullSchedule)}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-[#1d1d1b] transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <span>
              Detailed Disbursement Schedule ({plan.schedule.length} Milestones)
            </span>
          </span>
          <span className="flex items-center space-x-1 text-neutral-500 text-[11px]">
            <span>{showFullSchedule ? 'Collapse Schedule' : 'Expand Schedule'}</span>
            {showFullSchedule ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>
        </button>

        {showFullSchedule && (
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100/70 text-neutral-600 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-medium">Milestone</th>
                  <th className="py-2.5 px-3 font-medium">Description</th>
                  <th className="py-2.5 px-3 font-medium">Estimated Date</th>
                  <th className="py-2.5 px-3 font-medium text-right">Share</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                  <th className="py-2.5 px-3 font-medium text-right">Cumulative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-light">
                {plan.schedule.map((row) => (
                  <tr
                    key={row.step}
                    className={
                      row.isInitial
                        ? 'bg-neutral-900/5 font-medium'
                        : 'hover:bg-neutral-50/70'
                    }
                  >
                    <td className="py-2.5 px-3 font-mono text-neutral-900 font-medium">
                      {row.isInitial ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-800 bg-emerald-100 px-1.5 py-0.5 text-[10px]">
                          <span>Step 1 (Initial)</span>
                        </span>
                      ) : (
                        `Step ${row.step}`
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-700">
                      <div>{row.title}</div>
                      <div className="text-[10px] text-neutral-400">
                        {row.milestoneDescription}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 font-mono text-[11px]">
                      {row.dueDate}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                      {row.percentage}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[#1d1d1b]">
                      {formatPlanCurrency(row.amount, currency, false)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-neutral-500 text-[11px]">
                      {row.cumulativePercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Footer: Direct Contact & Copy Plan */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
        <a
          href={emailUrl}
          className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#1d1d1b] hover:bg-black text-white text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
          title="Inquire on Payment Plan via info@kretz.site"
        >
          <Mail className="w-3.5 h-3.5 text-amber-300" />
          <span>Inquire on Payment Plan (info@kretz.site)</span>
        </a>

        <button
          type="button"
          onClick={handleCopySchedule}
          className="inline-flex items-center justify-center space-x-2 py-2.5 px-4 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Schedule Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-neutral-600" />
              <span>Copy Payment Schedule</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
