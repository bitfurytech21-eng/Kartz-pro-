import React, { useState, useMemo } from 'react';
import { Property, Currency } from '../types';
import {
  Calculator,
  Percent,
  Calendar,
  X,
  ShieldCheck,
  Check,
  Copy,
  Info,
  DollarSign,
  ArrowRight,
  TrendingDown,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatPlanCurrency } from '../utils/paymentPlan';

interface FinancialSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  initialProperty?: Property | null;
  onSelectProperty?: (property: Property) => void;
}

export const FinancialSuiteModal: React.FC<FinancialSuiteModalProps> = ({
  isOpen,
  onClose,
  currency,
  initialProperty,
}) => {
  const [activeTab, setActiveTab] = useState<'mortgage' | 'notary' | 'ifi'>('mortgage');

  // Acquisition price state
  const [price, setPrice] = useState<number>(
    initialProperty?.price && initialProperty.price > 0 ? initialProperty.price : 6500000
  );
  const [propertyType, setPropertyType] = useState<'ancient' | 'neuf'>('ancient');
  const [residencyStatus, setResidencyStatus] = useState<'resident' | 'non_resident'>('resident');
  const [holdingStructure, setHoldingStructure] = useState<'direct' | 'sci'>('direct');

  // Loan parameters
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(25);
  const [loanTermYears, setLoanTermYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(3.35);
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);
  const [insuranceRate, setInsuranceRate] = useState<number>(0.28);
  const [includeNotaryInLoan, setIncludeNotaryInLoan] = useState<boolean>(false);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Notary calculation based on French Barème
  // Existing/Ancient: ~7.5% - 8.0%
  // Neuf/VEFA: ~2.2% - 2.8%
  const notaryBreakdown = useMemo(() => {
    if (propertyType === 'neuf') {
      const droitsMutation = Math.round(price * 0.00715);
      const emoluments = Math.round(price * 0.008);
      const debours = 1200;
      const securiteImmo = Math.round(price * 0.001);
      const total = droitsMutation + emoluments + debours + securiteImmo;
      return {
        droitsMutation,
        emoluments,
        debours,
        securiteImmo,
        total,
        ratePercent: (total / price) * 100,
      };
    } else {
      // Ancient
      const droitsMutation = Math.round(price * 0.058); // 5.80% Taxe de publicité foncière
      const emoluments = Math.round(price * 0.0082); // Regulated scale ~0.82% average on high brackets
      const debours = 1450;
      const securiteImmo = Math.round(price * 0.001); // 0.10%
      const total = droitsMutation + emoluments + debours + securiteImmo;
      return {
        droitsMutation,
        emoluments,
        debours,
        securiteImmo,
        total,
        ratePercent: (total / price) * 100,
      };
    }
  }, [price, propertyType]);

  // Down Payment & Loan
  const downPaymentAmount = useMemo(() => {
    return Math.round((price * downPaymentPercent) / 100);
  }, [price, downPaymentPercent]);

  const effectiveLoanAmount = useMemo(() => {
    const principal = price - downPaymentAmount;
    return Math.max(0, includeNotaryInLoan ? principal + notaryBreakdown.total : principal);
  }, [price, downPaymentAmount, includeNotaryInLoan, notaryBreakdown.total]);

  // Monthly Payment
  const monthlyPaymentPI = useMemo(() => {
    if (effectiveLoanAmount <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;
    if (monthlyRate === 0) return Math.round(effectiveLoanAmount / totalMonths);
    const payment =
      (effectiveLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(payment);
  }, [effectiveLoanAmount, interestRate, loanTermYears]);

  const monthlyInsurance = useMemo(() => {
    if (!includeInsurance || effectiveLoanAmount <= 0) return 0;
    return Math.round((effectiveLoanAmount * (insuranceRate / 100)) / 12);
  }, [includeInsurance, effectiveLoanAmount, insuranceRate]);

  const totalMonthlyPayment = monthlyPaymentPI + monthlyInsurance;
  const totalLoanCost = totalMonthlyPayment * loanTermYears * 12;
  const totalInterestPaid = Math.max(0, totalLoanCost - effectiveLoanAmount);

  // French IFI (Impôt sur la Fortune Immobilière) Estimator
  // Only applies if net taxable real estate wealth exceeds €1,300,000
  // Liabilities (mortgages) are deductible from the gross taxable value!
  const ifiSimulation = useMemo(() => {
    // Net wealth for this property = price - remaining loan (initially effectiveLoanAmount)
    // If primary residence, 30% allowance applies
    const primaryAllowance = residencyStatus === 'resident' ? 0.3 : 0.0;
    const grossTaxableValue = Math.round(price * (1 - primaryAllowance));
    const netTaxableValue = Math.max(0, grossTaxableValue - effectiveLoanAmount);

    let ifiTax = 0;
    if (netTaxableValue > 1300000) {
      // Brackets:
      // 800,000 to 1,300,000: 0.5%
      // 1,300,000 to 2,570,000: 0.7%
      // 2,570,000 to 5,000,000: 1.0%
      // 5,000,000 to 10,000,000: 1.25%
      // > 10,000,000: 1.5%
      const b1 = Math.min(Math.max(0, netTaxableValue - 800000), 500000) * 0.005;
      const b2 = Math.min(Math.max(0, netTaxableValue - 1300000), 1270000) * 0.007;
      const b3 = Math.min(Math.max(0, netTaxableValue - 2570000), 2430000) * 0.01;
      const b4 = Math.min(Math.max(0, netTaxableValue - 5000000), 5000000) * 0.0125;
      const b5 = Math.max(0, netTaxableValue - 10000000) * 0.015;
      ifiTax = Math.round(b1 + b2 + b3 + b4 + b5);
    }

    const ifiTaxWithoutLoan = (() => {
      if (grossTaxableValue <= 1300000) return 0;
      const b1 = Math.min(Math.max(0, grossTaxableValue - 800000), 500000) * 0.005;
      const b2 = Math.min(Math.max(0, grossTaxableValue - 1300000), 1270000) * 0.007;
      const b3 = Math.min(Math.max(0, grossTaxableValue - 2570000), 2430000) * 0.01;
      const b4 = Math.min(Math.max(0, grossTaxableValue - 5000000), 5000000) * 0.0125;
      const b5 = Math.max(0, grossTaxableValue - 10000000) * 0.015;
      return Math.round(b1 + b2 + b3 + b4 + b5);
    })();

    const annualSavingsFromMortgage = Math.max(0, ifiTaxWithoutLoan - ifiTax);

    return {
      grossTaxableValue,
      netTaxableValue,
      ifiTax,
      ifiTaxWithoutLoan,
      annualSavingsFromMortgage,
      isExempt: netTaxableValue <= 1300000,
    };
  }, [price, effectiveLoanAmount, residencyStatus]);

  const copySummary = () => {
    const text = `KRETZ FINANCIAL & NOTARY SIMULATION
Acquisition Price: ${formatPlanCurrency(price, currency)}
Property Type: ${propertyType === 'ancient' ? 'Ancient / Historic Estate' : 'New Program / VEFA'}
Notary & Transfer Fees: ${formatPlanCurrency(notaryBreakdown.total, currency)} (${notaryBreakdown.ratePercent.toFixed(2)}%)
Down Payment (${downPaymentPercent}%): ${formatPlanCurrency(downPaymentAmount, currency)}
Loan Financed: ${formatPlanCurrency(effectiveLoanAmount, currency)}
Term: ${loanTermYears} years @ ${interestRate}%
Monthly Payment: ${formatPlanCurrency(totalMonthlyPayment, currency)} / month
Estimated Annual French IFI (Wealth Tax): ${formatPlanCurrency(ifiSimulation.ifiTax, currency)} / yr`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        id="financial-suite-modal"
        className="relative w-full max-w-4xl bg-white text-[#1d1d1b] border border-neutral-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 bg-[#fbf9f8]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xs bg-[#fae9e5] flex items-center justify-center text-[#1d1d1b]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-serif tracking-tight text-[#1d1d1b]">
                  Kretz Private Financing & Notary Suite
                </h2>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-[#1d1d1b] text-white rounded-xs">
                  Advisory
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                French Notary Duties (*Frais de Notaire*), Luxury Mortgage Structuring & Wealth Tax (IFI) Simulator
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={copySummary}
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-xs transition-colors text-xs flex items-center space-x-1"
              title="Copy financial simulation"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-xs transition-colors hidden sm:block"
              title="Print simulation"
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('mortgage')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'mortgage'
                ? 'border-[#1d1d1b] text-[#1d1d1b] font-semibold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Mortgage & Leverage Simulator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notary')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'notary'
                ? 'border-[#1d1d1b] text-[#1d1d1b] font-semibold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>French Notary Duties & Transfer Taxes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ifi')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'ifi'
                ? 'border-[#1d1d1b] text-[#1d1d1b] font-semibold bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>French Wealth Tax (IFI) Optimization</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Universal Acquisition Price Controller */}
          <div className="bg-[#fbf9f8] p-4 border border-neutral-200/80 rounded-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                  Target Acquisition Price
                </span>
                <p className="text-[11px] text-neutral-500 font-light">
                  Input transaction value or select from prime asset benchmarks
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-serif font-bold text-[#1d1d1b]">
                  {formatPlanCurrency(price, currency)}
                </span>
              </div>
            </div>

            {/* Price Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[2500000, 5000000, 8500000, 15000000, 30000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPrice(preset)}
                  className={`px-2.5 py-1 rounded-xs border text-[11px] transition ${
                    price === preset
                      ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  {formatPlanCurrency(preset, currency)}
                </button>
              ))}
            </div>

            {/* Slider */}
            <input
              type="range"
              min={1000000}
              max={50000000}
              step={250000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 accent-[#1d1d1b] rounded-lg cursor-pointer"
            />
          </div>

          {/* TAB 1: MORTGAGE SIMULATOR */}
          {activeTab === 'mortgage' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs Column */}
                <div className="space-y-4">
                  {/* Down Payment */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-neutral-700">
                        Equity Down Payment ({downPaymentPercent}%)
                      </span>
                      <span className="font-mono text-neutral-900 font-medium">
                        {formatPlanCurrency(downPaymentAmount, currency)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={70}
                      step={5}
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 accent-[#1d1d1b] rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400">
                      <span>10% (Ultra High Net Worth)</span>
                      <span>25% (Standard French Private Bank)</span>
                      <span>50%+</span>
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-neutral-700">Loan Term</span>
                      <span className="font-mono text-neutral-900 font-medium">{loanTermYears} Years</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 15, 20, 25].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setLoanTermYears(term)}
                          className={`py-1.5 text-center rounded-xs border font-medium transition ${
                            loanTermYears === term
                              ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                              : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-black'
                          }`}
                        >
                          {term} yrs
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-neutral-700">Nominal Interest Rate</span>
                      <span className="font-mono text-neutral-900 font-medium">{interestRate.toFixed(2)}%</span>
                    </div>
                    <input
                      type="range"
                      min={1.5}
                      max={6.0}
                      step={0.05}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 accent-[#1d1d1b] rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400">
                      <span>1.50%</span>
                      <span>3.35% (Prime Fixed Rate Benchmark)</span>
                      <span>6.00%</span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-neutral-800">Borrower Insurance</span>
                        <p className="text-[10px] text-neutral-500">French statutory assurance emprunteur (0.28%/yr)</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeInsurance}
                        onChange={(e) => setIncludeInsurance(e.target.checked)}
                        className="rounded-xs text-[#1d1d1b] focus:ring-black h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer border-t border-neutral-200/60 pt-2">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-neutral-800">Finance Notary Duties in Loan</span>
                        <p className="text-[10px] text-neutral-500">Add ~{formatPlanCurrency(notaryBreakdown.total, currency)} into loan principal</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeNotaryInLoan}
                        onChange={(e) => setIncludeNotaryInLoan(e.target.checked)}
                        className="rounded-xs text-[#1d1d1b] focus:ring-black h-4 w-4"
                      />
                    </label>
                  </div>
                </div>

                {/* Results Column */}
                <div className="bg-[#1d1d1b] text-white p-5 rounded-xs flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                        Monthly Debt Service
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-xs">
                        Fixed French Rate
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="text-3xl sm:text-4xl font-serif font-light text-white tracking-tight">
                        {formatPlanCurrency(totalMonthlyPayment, currency)}
                        <span className="text-sm font-sans text-neutral-400 font-normal"> / month</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-3 text-[11px] text-neutral-400">
                        <span>P&I: {formatPlanCurrency(monthlyPaymentPI, currency)}</span>
                        {includeInsurance && <span>• Ins: {formatPlanCurrency(monthlyInsurance, currency)}</span>}
                      </div>
                    </div>

                    <div className="mt-6 space-y-2.5 border-t border-neutral-800 pt-4 text-xs">
                      <div className="flex justify-between text-neutral-300">
                        <span>Net Loan Financed</span>
                        <span className="font-mono text-white">{formatPlanCurrency(effectiveLoanAmount, currency)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>Total Interest Cost</span>
                        <span className="font-mono text-neutral-300">{formatPlanCurrency(totalInterestPaid, currency)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>Notary & Transfer Duties</span>
                        <span className="font-mono text-neutral-300">{formatPlanCurrency(notaryBreakdown.total, currency)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-300 font-semibold border-t border-neutral-800/80 pt-2">
                        <span>Total Capital Required at Signing</span>
                        <span className="font-mono text-white">
                          {formatPlanCurrency(
                            includeNotaryInLoan
                              ? downPaymentAmount
                              : downPaymentAmount + notaryBreakdown.total,
                            currency
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <a
                      href="#customer-support-widget"
                      onClick={onClose}
                      className="w-full py-2.5 bg-white text-[#1d1d1b] font-semibold text-center uppercase tracking-wider text-xs hover:bg-[#fae9e5] transition rounded-xs block"
                    >
                      Connect with Kretz Private Banking Desk
                    </a>
                    <p className="text-[10px] text-center text-neutral-400">
                      Discreet advisory in partnership with top tier Swiss & French private banks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Toggle Amortization Schedule */}
              <div className="border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="flex items-center space-x-1.5 font-semibold text-neutral-800 hover:text-black"
                >
                  <span>{showAmortization ? 'Hide' : 'View'} 5-Year Amortization Schedule</span>
                  {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAmortization && (
                  <div className="mt-3 overflow-x-auto border border-neutral-200 rounded-xs">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700">
                        <tr>
                          <th className="py-2 px-3">Year</th>
                          <th className="py-2 px-3">Annual Debt Service</th>
                          <th className="py-2 px-3">Principal Repaid</th>
                          <th className="py-2 px-3">Interest Paid</th>
                          <th className="py-2 px-3">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {[1, 2, 3, 4, 5].map((yr) => {
                          const annualPayment = totalMonthlyPayment * 12;
                          const interestPortion = Math.round(effectiveLoanAmount * (interestRate / 100) * Math.pow(0.96, yr - 1));
                          const principalPortion = Math.max(0, annualPayment - interestPortion);
                          const remaining = Math.max(0, effectiveLoanAmount - principalPortion * yr);

                          return (
                            <tr key={yr} className="hover:bg-neutral-50 font-mono">
                              <td className="py-2 px-3 font-sans font-medium text-neutral-800">Year {yr}</td>
                              <td className="py-2 px-3">{formatPlanCurrency(annualPayment, currency)}</td>
                              <td className="py-2 px-3 text-emerald-700">{formatPlanCurrency(principalPortion, currency)}</td>
                              <td className="py-2 px-3 text-neutral-600">{formatPlanCurrency(interestPortion, currency)}</td>
                              <td className="py-2 px-3 text-neutral-900 font-semibold">{formatPlanCurrency(remaining, currency)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NOTARY & ACQUISITION COSTS */}
          {activeTab === 'notary' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setPropertyType('ancient')}
                  className={`p-4 border rounded-xs cursor-pointer transition ${
                    propertyType === 'ancient'
                      ? 'border-[#1d1d1b] bg-[#fbf9f8] shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 text-xs">Ancient / Historic Estate</span>
                    <span className="text-[10px] px-2 py-0.5 bg-neutral-200 rounded-xs font-mono">~7.5 - 8.0%</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2 font-light">
                    Classic Haussmannian residences, châteaux, Belle Époque villas, and existing luxury estates.
                  </p>
                </div>

                <div
                  onClick={() => setPropertyType('neuf')}
                  className={`p-4 border rounded-xs cursor-pointer transition ${
                    propertyType === 'neuf'
                      ? 'border-[#1d1d1b] bg-[#fbf9f8] shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 text-xs">New Program / VEFA</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs font-mono">~2.2 - 2.8%</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2 font-light">
                    Off-plan new developments, contemporary architectural builds, and fully reconstructed estates.
                  </p>
                </div>

                <div className="p-4 border border-neutral-200 rounded-xs bg-white space-y-2">
                  <span className="font-semibold text-neutral-900 text-xs">Legal Holding Structure</span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setHoldingStructure('direct')}
                      className={`py-1.5 text-center rounded-xs border text-[11px] font-medium ${
                        holdingStructure === 'direct'
                          ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      Direct Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => setHoldingStructure('sci')}
                      className={`py-1.5 text-center rounded-xs border text-[11px] font-medium ${
                        holdingStructure === 'sci'
                          ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      French SCI
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-light">
                    {holdingStructure === 'sci'
                      ? 'Société Civile Immobilière facilitates multi-generational estate transfers & co-ownership.'
                      : 'Direct holding under personal civil ownership.'}
                  </p>
                </div>
              </div>

              {/* Notary Breakdown Itemized Card */}
              <div className="border border-neutral-200 rounded-xs overflow-hidden">
                <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center">
                  <h3 className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">
                    Itemized French Notarial Registry Estimation
                  </h3>
                  <span className="font-serif font-bold text-neutral-900 text-sm">
                    Total: {formatPlanCurrency(notaryBreakdown.total, currency)} ({notaryBreakdown.ratePercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="divide-y divide-neutral-200 text-xs">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-800">
                        Transfer Duties & Registration Taxes (*Droits d'enregistrement*)
                      </span>
                      <p className="text-[11px] text-neutral-500">
                        Collected by the Notary on behalf of the French Department & State Treasury (5.80% ancient, 0.715% neuf).
                      </p>
                    </div>
                    <span className="font-mono font-medium text-neutral-900 text-sm">
                      {formatPlanCurrency(notaryBreakdown.droitsMutation, currency)}
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-800">
                        Regulated Notarial Emoluments (*Émoluments du Notaire*)
                      </span>
                      <p className="text-[11px] text-neutral-500">
                        Statutory fee schedule regulated by the French Ministry of Justice + 20% TVA.
                      </p>
                    </div>
                    <span className="font-mono font-medium text-neutral-900 text-sm">
                      {formatPlanCurrency(notaryBreakdown.emoluments, currency)}
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-800">
                        Real Estate Security Contribution (*Contribution de sécurité immobilière*)
                      </span>
                      <p className="text-[11px] text-neutral-500">
                        Land registry filing and cadastral archival fees (0.10%).
                      </p>
                    </div>
                    <span className="font-mono font-medium text-neutral-900 text-sm">
                      {formatPlanCurrency(notaryBreakdown.securiteImmo, currency)}
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-800">
                        Administrative Disbursements (*Débours & Formalités*)
                      </span>
                      <p className="text-[11px] text-neutral-500">
                        Cadastral surveys, urban planning certificates, and mortgage office verifications.
                      </p>
                    </div>
                    <span className="font-mono font-medium text-neutral-900 text-sm">
                      {formatPlanCurrency(notaryBreakdown.debours, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FRENCH WEALTH TAX (IFI) */}
          {activeTab === 'ifi' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#fbf9f8] p-5 border border-neutral-200 rounded-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm">
                      French Real Estate Wealth Tax (*Impôt sur la Fortune Immobilière - IFI*)
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                      Progressive wealth tax assessed exclusively on net real estate assets exceeding €1,300,000.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-neutral-600 font-medium">Tax Residency:</span>
                    <button
                      type="button"
                      onClick={() => setResidencyStatus('resident')}
                      className={`px-3 py-1 rounded-xs border text-[11px] font-medium ${
                        residencyStatus === 'resident'
                          ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                          : 'bg-white text-neutral-700 border-neutral-200'
                      }`}
                    >
                      French Resident (30% Primary Abatement)
                    </button>
                    <button
                      type="button"
                      onClick={() => setResidencyStatus('non_resident')}
                      className={`px-3 py-1 rounded-xs border text-[11px] font-medium ${
                        residencyStatus === 'non_resident'
                          ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                          : 'bg-white text-neutral-700 border-neutral-200'
                      }`}
                    >
                      Non-Resident
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white p-4 border border-neutral-200 rounded-xs space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-neutral-500">Gross Taxable Value</span>
                    <div className="text-lg font-mono font-bold text-neutral-900">
                      {formatPlanCurrency(ifiSimulation.grossTaxableValue, currency)}
                    </div>
                    {residencyStatus === 'resident' && (
                      <p className="text-[10px] text-emerald-700">Includes 30% statutory primary residence allowance</p>
                    )}
                  </div>

                  <div className="bg-white p-4 border border-neutral-200 rounded-xs space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-neutral-500">Deductible Mortgage Debt</span>
                    <div className="text-lg font-mono font-bold text-neutral-900">
                      - {formatPlanCurrency(effectiveLoanAmount, currency)}
                    </div>
                    <p className="text-[10px] text-neutral-500">Acquisition bank debt deducts 100% from taxable base</p>
                  </div>

                  <div className="bg-white p-4 border border-neutral-200 rounded-xs space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-neutral-500">Net Taxable Wealth Base</span>
                    <div className="text-lg font-mono font-bold text-[#1d1d1b]">
                      {formatPlanCurrency(ifiSimulation.netTaxableValue, currency)}
                    </div>
                    <p className="text-[10px] text-neutral-500">
                      {ifiSimulation.isExempt ? 'Below €1.3M threshold: 0€ Tax Due' : 'Subject to progressive IFI brackets'}
                    </p>
                  </div>
                </div>

                {/* Final Tax Impact */}
                <div className="p-4 bg-white border border-neutral-300 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-neutral-700">
                      Annual Estimated IFI Liability
                    </span>
                    <div className="text-2xl font-serif font-bold text-[#1d1d1b]">
                      {formatPlanCurrency(ifiSimulation.ifiTax, currency)}
                      <span className="text-xs font-sans text-neutral-500 font-normal"> / year</span>
                    </div>
                  </div>

                  {ifiSimulation.annualSavingsFromMortgage > 0 && (
                    <div className="text-right">
                      <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                        Annual Tax Shield from Leverage
                      </span>
                      <p className="text-xs text-neutral-600 font-mono mt-1">
                        Saves ~{formatPlanCurrency(ifiSimulation.annualSavingsFromMortgage, currency)} / yr vs 100% cash purchase
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* IFI Scale Reference */}
              <div className="border border-neutral-200 rounded-xs p-4 bg-white space-y-3">
                <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Official French IFI Tax Brackets Reference
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-center">
                  <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-xs">
                    <div className="font-semibold text-neutral-700">800k - 1.3M €</div>
                    <div className="text-neutral-500">0.50%</div>
                  </div>
                  <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-xs">
                    <div className="font-semibold text-neutral-700">1.3M - 2.57M €</div>
                    <div className="text-neutral-500">0.70%</div>
                  </div>
                  <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-xs">
                    <div className="font-semibold text-neutral-700">2.57M - 5.0M €</div>
                    <div className="text-neutral-500">1.00%</div>
                  </div>
                  <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-xs">
                    <div className="font-semibold text-neutral-700">5.0M - 10M €</div>
                    <div className="text-neutral-500">1.25%</div>
                  </div>
                  <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-xs">
                    <div className="font-semibold text-neutral-700">&gt; 10.0M €</div>
                    <div className="text-neutral-500">1.50%</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-[#fbf9f8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-[11px] text-neutral-500 font-light">
            Estimates provided for informational advisory purposes only. Not binding legal or financial counsel.
          </p>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-neutral-300 text-neutral-700 hover:text-black hover:border-black rounded-xs transition text-xs font-semibold tracking-wider uppercase"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
