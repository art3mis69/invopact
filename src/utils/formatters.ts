import type { Currency, CurrencyConfig, LineItem } from '../types';

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  CHF: { code: 'CHF', symbol: 'CHF ', name: 'Swiss Franc (CHF)' },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar (NZ$)' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (R$)' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)' },
};

export const ACCENT_COLORS = [
  { name: 'Slate', hex: '#334155', ring: 'ring-slate-500' },
  { name: 'Indigo', hex: '#4f46e5', ring: 'ring-indigo-500' },
  { name: 'Emerald', hex: '#059669', ring: 'ring-emerald-500' },
  { name: 'Sky Blue', hex: '#0284c7', ring: 'ring-sky-500' },
  { name: 'Rose', hex: '#e11d48', ring: 'ring-rose-500' },
  { name: 'Violet', hex: '#7c3aed', ring: 'ring-violet-500' },
  { name: 'Amber', hex: '#d97706', ring: 'ring-amber-500' },
];

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  const symbol = CURRENCIES[currency]?.symbol || '$';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return `${symbol}${formatted}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateTotals(
  items: LineItem[],
  taxRate: number = 0,
  discountRate: number = 0,
  shippingFee: number = 0,
  taxType: 'single' | 'dual' = 'single',
  taxRate2: number = 0
) {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  const discountAmount = (subtotal * (Number(discountRate) || 0)) / 100;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableBase * (Number(taxRate) || 0)) / 100;
  const taxAmount2 = taxType === 'dual' ? (taxableBase * (Number(taxRate2) || 0)) / 100 : 0;
  const total = taxableBase + taxAmount + taxAmount2 + (Number(shippingFee) || 0);

  return {
    subtotal,
    discountAmount,
    taxAmount,
    taxAmount2,
    total: Math.max(0, total),
  };
}

export function generateQrPayload(
  method: 'bank' | 'upi' | 'paypal' | 'custom',
  details: {
    upiId?: string;
    accountName?: string;
    amount?: number;
    currency?: Currency;
    paypalEmail?: string;
    paymentLink?: string;
  }
): string | null {
  if (method === 'upi' && details.upiId) {
    const name = encodeURIComponent(details.accountName || 'Merchant');
    const amt = details.amount ? `&am=${details.amount.toFixed(2)}` : '';
    return `upi://pay?pa=${details.upiId}&pn=${name}${amt}&cu=INR`;
  }
  if (method === 'paypal' && details.paypalEmail) {
    return `https://paypal.me/${details.paypalEmail}/${details.amount || ''}`;
  }
  if (method === 'custom' && details.paymentLink) {
    return details.paymentLink;
  }
  return null;
}
