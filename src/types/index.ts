export type DocumentType = 'invoice' | 'contract';

export type Currency =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'INR'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'SGD'
  | 'CHF'
  | 'AED'
  | 'NZD'
  | 'BRL'
  | 'ZAR';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  unit?: string; // e.g. 'hrs', 'qty', 'days', 'words', 'mos'
}

export interface PartyDetails {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string; // VAT / GST / EIN
  logoUrl?: string; // base64 or URL
}

export interface PaymentDetails {
  method: 'bank' | 'upi' | 'paypal' | 'custom';
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingOrSwift: string;
  upiId?: string;
  paypalEmail?: string;
  paymentLink?: string;
  notes?: string;
  showQr: boolean;
}

export interface SignatureData {
  name: string;
  title?: string;
  date: string;
  signatureImage?: string; // transparent PNG dataURL
}

export interface InvoiceData {
  id: string;
  type: 'invoice';
  title: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: Currency;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  
  sender: PartyDetails;
  client: PartyDetails;
  
  items: LineItem[];
  
  subtotal: number;
  discountRate: number; // percentage
  discountAmount: number;
  
  taxType: 'single' | 'dual';
  taxName: string; // e.g. "Tax", "VAT", "CGST"
  taxRate: number; // percentage
  taxAmount: number;
  taxName2?: string; // e.g. "SGST", "PST"
  taxRate2?: number; // percentage
  taxAmount2?: number;

  shippingFee: number;
  total: number;
  
  payment: PaymentDetails;
  notes: string;
  terms: string;
  
  authorizedSignature?: SignatureData;
  
  watermark?: string; // 'none' | 'DRAFT' | 'PAID' | 'CONFIDENTIAL' | 'VOID' | 'CUSTOM'
  showPaidStamp?: boolean;

  accentColor: string;
  createdAt: number;
  updatedAt: number;
}

export interface ContractSection {
  id: string;
  title: string;
  content: string;
}

export interface ContractData {
  id: string;
  type: 'contract';
  title: string;
  contractNumber: string;
  effectiveDate: string;
  endDate?: string;
  status: 'draft' | 'pending' | 'signed';
  
  provider: PartyDetails;
  client: PartyDetails;
  
  projectScope: string;
  deliverables: string[];
  
  feeType: 'fixed' | 'hourly' | 'milestone' | 'retainer';
  totalFee: number;
  currency: Currency;
  paymentSchedule: string;
  
  sections: ContractSection[];
  
  providerSignature: SignatureData;
  clientSignature: SignatureData;
  
  watermark?: string; // 'none' | 'DRAFT' | 'CONFIDENTIAL' | 'VOID' | 'CUSTOM'

  accentColor: string;
  createdAt: number;
  updatedAt: number;
}

export type AnyDocument = InvoiceData | ContractData;

export interface ClientProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
}
