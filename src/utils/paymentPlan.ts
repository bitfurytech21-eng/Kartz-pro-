// Kretz Luxury Real Estate Payment Plan Utilities
// Standard: 55% initial payment + 45% structured across flexible installments

export interface PaymentMilestone {
  step: number;
  title: string;
  milestoneDescription: string;
  percentage: number;
  amount: number;
  dueDate: string;
  cumulativePercentage: number;
  cumulativeAmount: number;
  isInitial: boolean;
}

export interface PaymentPlanSummary {
  totalPrice: number;
  initialPaymentPercentage: number; // 55%
  initialPaymentAmount: number;
  remainingBalancePercentage: number; // 45%
  remainingBalanceAmount: number;
  installmentCount: number;
  installmentAmount: number;
  installmentPercentage: number;
  termMonths: number;
  monthlyAmount: number;
  schedule: PaymentMilestone[];
}

export const INSTALLMENT_OPTIONS = [
  { count: 3, label: '3 Milestones', desc: 'Quarterly disbursements' },
  { count: 6, label: '6 Months', desc: 'Bi-monthly luxury tranche' },
  { count: 12, label: '12 Months', desc: 'Monthly installments (Standard)' },
  { count: 24, label: '24 Months', desc: 'Extended 2-year financing' },
  { count: 36, label: '36 Months', desc: 'Family office 3-year plan' },
];

/**
 * Format currency with conversion rates aligned with application standards
 */
export function formatPlanCurrency(
  amount: number | null,
  currency: 'EUR' | 'USD' | 'GBP' = 'EUR',
  isConfidential: boolean = false
): string {
  if (isConfidential || amount === null || amount <= 0) {
    return 'Confidential price';
  }

  let converted = amount;
  let symbol = '€';
  if (currency === 'USD') {
    converted = Math.round(amount * 1.09);
    symbol = '$';
  } else if (currency === 'GBP') {
    converted = Math.round(amount * 0.85);
    symbol = '£';
  }

  const formatted = Math.round(converted)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return currency === 'EUR' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

/**
 * Calculate the complete 55% upfront + installments payment schedule
 */
export function calculatePaymentPlan(
  totalPrice: number,
  installmentCount: number = 12,
  startDate: Date = new Date()
): PaymentPlanSummary {
  const price = Math.max(0, totalPrice);
  const initialPercentage = 55;
  const initialAmount = Math.round(price * 0.55);

  const remainingPercentage = 45;
  const remainingAmount = price - initialAmount;

  const validCount = Math.max(1, installmentCount);
  const perInstallmentPercentage = Number((45 / validCount).toFixed(3));
  const rawPerInstallmentAmount = remainingAmount / validCount;

  const schedule: PaymentMilestone[] = [];

  // Step 1: 55% Initial Payment
  const initialDateStr = startDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  schedule.push({
    step: 1,
    title: 'Initial Payment',
    milestoneDescription: 'Compromis de vente / Mandate signature deposit',
    percentage: 55,
    amount: initialAmount,
    dueDate: initialDateStr,
    cumulativePercentage: 55,
    cumulativeAmount: initialAmount,
    isInitial: true,
  });

  let runningAmount = initialAmount;
  let runningPercent = 55;

  for (let i = 1; i <= validCount; i++) {
    // calculate due date
    const dueDate = new Date(startDate);
    if (validCount === 3) {
      // 3 milestones: every 3 months
      dueDate.setMonth(dueDate.getMonth() + i * 3);
    } else if (validCount === 6) {
      // 6 installments: every 2 months or month-by-month
      dueDate.setMonth(dueDate.getMonth() + i);
    } else {
      dueDate.setMonth(dueDate.getMonth() + i);
    }

    const dateStr = dueDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const isLast = i === validCount;
    // ensure exact rounding on last payment
    const thisAmount = isLast
      ? remainingAmount - Math.round(rawPerInstallmentAmount) * (validCount - 1)
      : Math.round(rawPerInstallmentAmount);

    runningAmount += thisAmount;
    runningPercent = Number(Math.min(100, runningPercent + perInstallmentPercentage).toFixed(2));
    if (isLast) runningPercent = 100;

    let milestoneDesc = `Installment #${i} via escrow wire`;
    if (validCount === 3) {
      if (i === 1) milestoneDesc = 'Tranche 1: Deed execution & title conveyance';
      if (i === 2) milestoneDesc = 'Tranche 2: Structural sign-off & key transition';
      if (i === 3) milestoneDesc = 'Tranche 3: Final notary balance & clear handover';
    }

    schedule.push({
      step: i + 1,
      title: `Installment #${i}`,
      milestoneDescription: milestoneDesc,
      percentage: isLast ? Number((100 - (55 + perInstallmentPercentage * (validCount - 1))).toFixed(2)) : perInstallmentPercentage,
      amount: thisAmount,
      dueDate: dateStr,
      cumulativePercentage: runningPercent,
      cumulativeAmount: runningAmount,
      isInitial: false,
    });
  }

  return {
    totalPrice: price,
    initialPaymentPercentage: 55,
    initialPaymentAmount: initialAmount,
    remainingBalancePercentage: 45,
    remainingBalanceAmount: remainingAmount,
    installmentCount: validCount,
    installmentAmount: Math.round(rawPerInstallmentAmount),
    installmentPercentage: perInstallmentPercentage,
    termMonths: validCount === 3 ? 9 : validCount,
    monthlyAmount: Math.round(rawPerInstallmentAmount),
    schedule,
  };
}
