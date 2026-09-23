import React, { useState, useMemo } from 'react';
import { Property, Currency } from '../types';
import { formatPlanCurrency } from '../utils/paymentPlan';
import {
  Calculator,
  Percent,
  Calendar,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  Send,
  RotateCcw,
  Check,
  Copy,
  Info,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react';

interface MortgageCalculatorProps {
  property: Property;
  currency: Currency;
  compact?: boolean;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  property,
  currency,
  compact = false,
}) => {
  // Base property purchase price
  const initialBasePrice =
    property.price && property.price > 0 ? property.price : 2500000;
  const isConfidential = !property.price || property.isConfidential;

  const [purchasePrice, setPurchasePrice] = useState<number>(initialBasePrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20% standard
  const [loanTermYears, setLoanTermYears] = useState<number>(20); // 20 years standard
  const [interestRate, setInterestRate] = useState<number>(3.45); // 3.45% typical French luxury rate
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);
  const [insuranceRate, setInsuranceRate] = useState<number>(0.30); // 0.30% annual assurance emprunteur
  const [includeNotaryFees, setIncludeNotaryFees] = useState<boolean>(false);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const downPaymentAmount = useMemo(() => {
    return Math.round((purchasePrice * downPaymentPercent) / 100);
  }, [purchasePrice, downPaymentPercent]);

  // Notary fees estimate (typically ~7.5% in France for existing property)
  const notaryFees = useMemo(() => {
    return Math.round(purchasePrice * 0.075);
  }, [purchasePrice]);

  const loanAmount = useMemo(() => {
    const base = purchasePrice - downPaymentAmount;
    return Math.max(0, includeNotaryFees ? base + notaryFees : base);
  }, [purchasePrice, downPaymentAmount, includeNotaryFees, notaryFees]);

  // Monthly Principal & Interest calculation
  const monthlyPaymentPI = useMemo(() => {
    if (loanAmount <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;

    if (monthlyRate === 0) {
      return Math.round(loanAmount / totalMonths);
    }

    const factor = Math.pow(1 + monthlyRate, totalMonths);
    const payment = loanAmount * ((monthlyRate * factor) / (factor - 1));
    return Math.round(payment);
  }, [loanAmount, interestRate, loanTermYears]);

  // Monthly Insurance
  const monthlyInsurance = useMemo(() => {
    if (!includeInsurance || loanAmount <= 0) return 0;
    return Math.round((loanAmount * (insuranceRate / 100)) / 12);
  }, [includeInsurance, loanAmount, insuranceRate]);

  // Total Monthly Commitment
  const totalMonthlyPayment = monthlyPaymentPI + monthlyInsurance;

  // Total loan lifetime figures
  const totalMonths = loanTermYears * 12;
  const totalPaymentLifetime = monthlyPaymentPI * totalMonths;
  const totalInterestPaid = Math.max(0, totalPaymentLifetime - loanAmount);
  const totalInsurancePaid = monthlyInsurance * totalMonths;
  const totalCostOfFinancing = totalInterestPaid + totalInsurancePaid;

  // Amortization snapshot milestones (Year 1, 3, 5, 10, 15, 20, etc.)
  const amortizationSchedule = useMemo(() => {
    if (loanAmount <= 0) return [];
    const monthlyRate = interestRate / 100 / 12;
    let balance = loanAmount;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    const yearlyData: Array<{
      year: number;
      remainingBalance: number;
      paidPrincipal: number;
      paidInterest: number;
    }> = [];

    for (let month = 1; month <= totalMonths; month++) {
      const interestForMonth = balance * monthlyRate;
      const principalForMonth = monthlyPaymentPI - interestForMonth;
      balance = Math.max(0, balance - principalForMonth);
      cumulativeInterest += interestForMonth;
      cumulativePrincipal += principalForMonth;

      if (month % 12 === 0 || month === totalMonths) {
        const year = Math.ceil(month / 12);
        yearlyData.push({
          year,
          remainingBalance: Math.round(balance),
          paidPrincipal: Math.round(cumulativePrincipal),
          paidInterest: Math.round(cumulativeInterest),
        });
      }
    }

    return yearlyData;
  }, [loanAmount, interestRate, totalMonths, monthlyPaymentPI]);

  // Reset to default
  const handleReset = () => {
    setPurchasePrice(initialBasePrice);
    setDownPaymentPercent(20);
    setLoanTermYears(20);
    setInterestRate(3.45);
    setIncludeInsurance(true);
    setIncludeNotaryFees(false);
  };

  // Email link with pre-filled mortgage parameters
  const emailUrl = useMemo(() => {
    const pStr = formatPlanCurrency(purchasePrice, currency, false);
    const mStr = formatPlanCurrency(totalMonthlyPayment, currency, false);
    const lStr = formatPlanCurrency(loanAmount, currency, false);
    const dStr = formatPlanCurrency(downPaymentAmount, currency, false);

    const subject = `Mortgage Financing Inquiry - Ref ${property.ref} (${property.title})`;
    const body = `Hello Kretz Real Estate,

I simulated mortgage financing for property ref ${property.ref}:
• Property: ${property.title}
• Reference: ${property.ref}
• Location: ${property.location}
• Purchase Price: ${pStr}

Mortgage Simulation:
- Down Payment (${downPaymentPercent}%): ${dStr}
- Loan Amount: ${lStr}
- Loan Term: ${loanTermYears} years
- Interest Rate: ${interestRate}%
- Est. Monthly Payment: ${mStr}/month

Could your private banking partners provide a formal pre-approval and financing dossier?

Kind regards,`;

    return `mailto:info@kretz.site?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [
    property,
    purchasePrice,
    totalMonthlyPayment,
    loanAmount,
    downPaymentAmount,
    downPaymentPercent,
    loanTermYears,
    interestRate,
    currency,
  ]);

  // Copy loan summary
  const handleCopy = () => {
    const pStr = formatPlanCurrency(purchasePrice, currency, false);
    const mStr = formatPlanCurrency(totalMonthlyPayment, currency, false);
    const lStr = formatPlanCurrency(loanAmount, currency, false);
    const dStr = formatPlanCurrency(downPaymentAmount, currency, false);
    const iStr = formatPlanCurrency(totalInterestPaid, currency, false);

    let text = `KRETZ REAL ESTATE — MORTGAGE FINANCING ESTIMATE\n`;
    text += `Property: ${property.title} (Ref: ${property.ref})\n`;
    text += `Location: ${property.location}\n`;
    text += `Acquisition Price: ${pStr}\n\n`;
    text += `FINANCING PARAMETERS:\n`;
    text += `• Down Payment: ${dStr} (${downPaymentPercent}%)\n`;
    text += `• Loan Principal: ${lStr}\n`;
    text += `• Loan Term: ${loanTermYears} Years (${loanTermYears * 12} months)\n`;
    text += `• Fixed Interest Rate: ${interestRate}%\n`;
    text += `• Loan Insurance: ${includeInsurance ? `${insuranceRate}% p.a.` : 'Excluded'}\n\n`;
    text += `ESTIMATED COMMITMENTS:\n`;
    text += `• Total Monthly Payment: ${mStr} / month\n`;
    text += `  - Principal & Interest: ${formatPlanCurrency(monthlyPaymentPI, currency, false)}/mo\n`;
    if (includeInsurance) {
      text += `  - Insurance: ${formatPlanCurrency(monthlyInsurance, currency, false)}/mo\n`;
    }
    text += `• Total Lifetime Interest: ${iStr}\n`;
    text += `\nPrivate Banking Advisory: info@kretz.site (+33 7 53 07 75 72)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id={`mortgage-calculator-${property.id}`}
      className={`border border-neutral-200 bg-white rounded-none ${
        compact ? 'p-4' : 'p-6'
      } shadow-xs space-y-6`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#1d1d1b] text-white text-[10px] font-semibold tracking-wider uppercase">
              <Calculator className="w-3 h-3 text-amber-400" />
              <span>Mortgage & Loan Calculator</span>
            </span>
            <span className="text-xs text-neutral-500 font-light flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private Banking Model</span>
            </span>
          </div>
          <h3 className="text-lg font-serif-luxury text-[#1d1d1b] font-normal mt-1.5">
            Estimate Monthly Financing
          </h3>
          <p className="text-xs text-neutral-500 font-light">
            Adjust interest rates, loan terms, and down payments to calculate your exact monthly investment.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-900 px-2.5 py-1.5 border border-neutral-200 hover:bg-neutral-50 transition-colors"
            title="Reset parameters to default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <a
            href={emailUrl}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-[#1d1d1b] text-white hover:bg-black transition-colors shadow-xs"
            title="Consult private banker via info@kretz.site"
          >
            <Mail className="w-3 h-3 text-amber-300" />
            <span>Financing via info@kretz.site</span>
          </a>
        </div>
      </div>

      {/* Confidential Listing Notice */}
      {isConfidential && (
        <div className="bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-900 flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Confidential Listing:</span> The base valuation has been initialized at{' '}
            {formatPlanCurrency(initialBasePrice, currency, false)}. You can freely adjust the purchase price slider below to simulate your acquisition budget.
          </div>
        </div>
      )}

      {/* Main Grid: Controls on Left, Dynamic Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Property Purchase Price */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-neutral-700 flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                <span>Acquisition Price</span>
              </label>
              <span className="font-mono font-semibold text-[#1d1d1b] text-sm">
                {formatPlanCurrency(purchasePrice, currency, false)}
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="35000000"
              step="100000"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="w-full accent-[#1d1d1b] cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>{formatPlanCurrency(500000, currency, false)}</span>
              <span>{formatPlanCurrency(35000000, currency, false)}</span>
            </div>
          </div>

          {/* 2. Down Payment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-neutral-700 flex items-center space-x-1.5">
                <Percent className="w-3.5 h-3.5 text-neutral-500" />
                <span>Down Payment ({downPaymentPercent}%)</span>
              </label>
              <span className="font-mono font-semibold text-[#1d1d1b] text-sm">
                {formatPlanCurrency(downPaymentAmount, currency, false)}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[15, 20, 30, 45, 55].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`py-1.5 text-xs font-mono transition-colors border ${
                    downPaymentPercent === pct
                      ? 'border-[#1d1d1b] bg-[#1d1d1b] text-white font-semibold'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="1"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-[#1d1d1b] cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
            />
          </div>

          {/* 3. Loan Term */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-neutral-700 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Loan Term ({loanTermYears} Years / {loanTermYears * 12} Months)</span>
              </label>
              <span className="font-mono font-semibold text-[#1d1d1b] text-sm">
                {loanTermYears} Years
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[10, 15, 20, 25, 30].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLoanTermYears(term)}
                  className={`py-1.5 text-xs font-mono transition-colors border ${
                    loanTermYears === term
                      ? 'border-[#1d1d1b] bg-[#1d1d1b] text-white font-semibold'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {term} Yrs
                </button>
              ))}
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(Number(e.target.value))}
              className="w-full accent-[#1d1d1b] cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
            />
          </div>

          {/* 4. Annual Interest Rate (%) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-neutral-700 flex items-center space-x-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-neutral-500" />
                <span>Fixed Interest Rate (Annual)</span>
              </label>
              <div className="flex items-center space-x-1 font-mono">
                <input
                  type="number"
                  min="0.5"
                  max="10.0"
                  step="0.05"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                  className="w-16 px-1.5 py-0.5 text-right font-semibold text-sm border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                />
                <span className="text-xs font-semibold text-neutral-600">%</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1.0"
                max="7.0"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-[#1d1d1b] cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>Prime (2.50%)</span>
              <span>European Avg (3.45%)</span>
              <span>High (6.00%)</span>
            </div>
          </div>

          {/* Optional French Notary & Insurance Add-ons */}
          <div className="pt-2 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Loan Insurance Toggle */}
            <label className="flex items-start space-x-2.5 p-2.5 bg-neutral-50 border border-neutral-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInsurance}
                onChange={(e) => setIncludeInsurance(e.target.checked)}
                className="mt-0.5 accent-neutral-900"
              />
              <div className="text-xs">
                <div className="font-semibold text-neutral-800">Borrower's Insurance</div>
                <div className="text-[10px] text-neutral-500 font-light">
                  Assurance emprunteur ({insuranceRate}% p.a.)
                </div>
              </div>
            </label>

            {/* Include Notary in Loan Toggle */}
            <label className="flex items-start space-x-2.5 p-2.5 bg-neutral-50 border border-neutral-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNotaryFees}
                onChange={(e) => setIncludeNotaryFees(e.target.checked)}
                className="mt-0.5 accent-neutral-900"
              />
              <div className="text-xs">
                <div className="font-semibold text-neutral-800">Finance Notary Fees</div>
                <div className="text-[10px] text-neutral-500 font-light">
                  Include ~7.5% notary ({formatPlanCurrency(notaryFees, currency, false)}) in loan
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Dynamic Results Card (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900 text-white p-5 flex flex-col justify-between space-y-5">
          {/* Main Monthly Commitment Hero */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono uppercase tracking-wider">
              <span>Estimated Monthly Commitment</span>
              <span className="text-emerald-400 font-medium">Pre-tax</span>
            </div>
            <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-sans">
              {formatPlanCurrency(totalMonthlyPayment, currency, false)}
              <span className="text-xs font-normal text-neutral-400 ml-1">/ month</span>
            </div>
            <p className="text-[11px] text-neutral-300 font-light">
              Fixed rate amortized over {loanTermYears} years ({totalMonths} monthly payments)
            </p>
          </div>

          {/* Breakdown Pills */}
          <div className="bg-white/5 border border-white/10 p-3 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-300">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                <span>Principal & Interest</span>
              </span>
              <span className="font-mono font-medium text-white">
                {formatPlanCurrency(monthlyPaymentPI, currency, false)}/mo
              </span>
            </div>
            {includeInsurance && (
              <div className="flex justify-between text-neutral-300">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  <span>Borrower's Insurance</span>
                </span>
                <span className="font-mono font-medium text-amber-300">
                  {formatPlanCurrency(monthlyInsurance, currency, false)}/mo
                </span>
              </div>
            )}
            <div className="border-t border-white/10 pt-1.5 flex justify-between text-neutral-400 text-[11px]">
              <span>Financed Loan Amount</span>
              <span className="font-mono text-white">
                {formatPlanCurrency(loanAmount, currency, false)}
              </span>
            </div>
          </div>

          {/* Visual Ratio Bar: Loan vs Down Payment vs Interest */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>Down Pay ({downPaymentPercent}%)</span>
              <span>Principal ({Math.round((loanAmount / (purchasePrice + totalInterestPaid)) * 100)}%)</span>
              <span>Interest ({Math.round((totalInterestPaid / (purchasePrice + totalInterestPaid)) * 100)}%)</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 flex overflow-hidden">
              <div
                style={{ width: `${downPaymentPercent}%` }}
                className="bg-emerald-500 h-full"
                title={`Down Payment: ${formatPlanCurrency(downPaymentAmount, currency, false)}`}
              />
              <div
                style={{ width: `${100 - downPaymentPercent - 20}%` }}
                className="bg-white h-full"
                title={`Financed Principal: ${formatPlanCurrency(loanAmount, currency, false)}`}
              />
              <div
                style={{ width: '20%' }}
                className="bg-amber-400 h-full"
                title={`Total Interest: ${formatPlanCurrency(totalInterestPaid, currency, false)}`}
              />
            </div>
          </div>

          {/* Financial Summary Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase font-mono">
                Total Interest Paid
              </span>
              <span className="font-mono font-semibold text-neutral-200">
                {formatPlanCurrency(totalInterestPaid, currency, false)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase font-mono">
                Total Financing Cost
              </span>
              <span className="font-mono font-semibold text-neutral-200">
                {formatPlanCurrency(totalCostOfFinancing, currency, false)}
              </span>
            </div>
          </div>

          {/* CTAs in Card */}
          <div className="space-y-2 pt-1">
            <a
              href={emailUrl}
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-3 bg-[#1d1d1b] hover:bg-black text-white text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span>Request Financing via info@kretz.site</span>
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Estimate Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-300" />
                  <span>Copy Mortgage Estimate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Amortization Milestone Accordion */}
      <div className="border border-neutral-200">
        <button
          type="button"
          onClick={() => setShowAmortization(!showAmortization)}
          className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-[#1d1d1b] transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <span>
              Annual Amortization Projection ({loanTermYears} Years Schedule)
            </span>
          </span>
          <span className="flex items-center space-x-1 text-neutral-500 text-[11px]">
            <span>{showAmortization ? 'Hide Amortization' : 'View Yearly Amortization'}</span>
            {showAmortization ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>
        </button>

        {showAmortization && (
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100/70 text-neutral-600 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-medium">End of Year</th>
                  <th className="py-2.5 px-3 font-medium text-right">Remaining Principal</th>
                  <th className="py-2.5 px-3 font-medium text-right">Cumulative Principal Paid</th>
                  <th className="py-2.5 px-3 font-medium text-right">Cumulative Interest Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-light font-mono text-[11px]">
                {amortizationSchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-neutral-50/70">
                    <td className="py-2 px-3 font-semibold text-neutral-900">
                      Year {row.year} ({row.year * 12} mos)
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-800">
                      {formatPlanCurrency(row.remainingBalance, currency, false)}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700">
                      {formatPlanCurrency(row.paidPrincipal, currency, false)}
                    </td>
                    <td className="py-2 px-3 text-right text-amber-700">
                      {formatPlanCurrency(row.paidInterest, currency, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
