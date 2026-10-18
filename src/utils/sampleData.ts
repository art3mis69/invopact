import type { ContractData, InvoiceData, PartyDetails } from '../types';

export const DEFAULT_SENDER: PartyDetails = {
  name: 'Alex Rivera',
  company: 'Rivera Studio & Dev',
  email: 'alex@riverastudio.design',
  phone: '+1 (555) 234-5678',
  address: '742 Evergreen Terrace, Suite 300\nSan Francisco, CA 94107',
  taxId: 'US-EIN-98-7654321',
};

export const DEFAULT_CLIENT: PartyDetails = {
  name: 'Sarah Chen',
  company: 'Acme Technologies Inc.',
  email: 'billing@acmetech.io',
  phone: '+1 (555) 890-1234',
  address: '100 Innovation Blvd, Fl 4\nAustin, TX 78701',
  taxId: 'TX-VAT-445566',
};

export const SAMPLE_INVOICE: InvoiceData = {
  id: 'inv-sample-001',
  type: 'invoice',
  title: 'INVOICE',
  invoiceNumber: 'INV-2026-042',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: 'USD',
  status: 'sent',
  sender: { ...DEFAULT_SENDER },
  client: { ...DEFAULT_CLIENT },
  items: [
    {
      id: 'item-1',
      description: 'Web Application Frontend Architecture & Implementation (React / Next.js)',
      quantity: 1,
      rate: 3200,
      amount: 3200,
    },
    {
      id: 'item-2',
      description: 'RESTful API & Database Schema Integration with Supabase / PostgreSQL',
      quantity: 1,
      rate: 1800,
      amount: 1800,
    },
    {
      id: 'item-3',
      description: 'Responsive UI Design Polish, Accessibility Audit & Cross-Browser Testing',
      quantity: 12,
      rate: 85,
      amount: 1020,
    },
  ],
  subtotal: 6020,
  discountRate: 5,
  discountAmount: 301,
  taxType: 'single',
  taxName: 'Tax',
  taxRate: 8,
  taxAmount: 457.52,
  shippingFee: 0,
  total: 6176.52,
  payment: {
    method: 'bank',
    bankName: 'Silicon Valley Commercial Bank',
    accountName: 'Rivera Studio LLC',
    accountNumber: '**** **** 8921',
    routingOrSwift: 'SVBKUS6S',
    upiId: 'alexrivera@upi',
    paypalEmail: 'alex@riverastudio.design',
    paymentLink: 'https://buy.stripe.com/demo_sample_link',
    notes: 'Please quote invoice number INV-2026-042 in payment reference.',
    showQr: true,
  },
  notes: 'Thank you for your business! It has been a pleasure collaborating on this phase.',
  terms: 'Payment is due within 14 calendar days of issue. Overdue invoices are subject to a 1.5% monthly late fee.',
  watermark: 'none',
  showPaidStamp: true,
  accentColor: '#4f46e5', // Indigo
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const SAMPLE_CONTRACT: ContractData = {
  id: 'con-sample-001',
  type: 'contract',
  title: 'Independent Freelance Services Agreement',
  contractNumber: 'AGR-2026-018',
  effectiveDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'pending',
  provider: { ...DEFAULT_SENDER },
  client: { ...DEFAULT_CLIENT },
  projectScope:
    'The Service Provider will design, implement, and deploy a responsive customer portal web application based on the agreed Figma prototypes and technical specifications.',
  deliverables: [
    'Clean, modular TypeScript / React codebase with Tailwind CSS design system',
    'Authentication, user profile management, and dashboard modules',
    'Automated integration tests and comprehensive deployment documentation',
    '30-day post-launch critical bug fix warranty support',
  ],
  feeType: 'fixed',
  totalFee: 6500,
  currency: 'USD',
  paymentSchedule:
    '50% deposit upon contract execution prior to work commencement; 50% remaining balance upon final acceptance and code handover.',
  sections: [
    {
      id: 'sec-1',
      title: '1. Services & Deliverables',
      content:
        'The Service Provider agrees to perform the services described in the Project Scope and Deliverables section in a timely, professional, and workmanlike manner in accordance with industry standards.',
    },
    {
      id: 'sec-2',
      title: '2. Compensation & Invoicing',
      content:
        'The Client agrees to pay the Service Provider the Total Fee in accordance with the specified Payment Schedule. Late payments after 14 business days may incur interest at 1.5% per month or the maximum permitted by law.',
    },
    {
      id: 'sec-3',
      title: '3. Intellectual Property Rights',
      content:
        'Upon receipt of full and final payment, the Service Provider assigns to the Client all right, title, and interest in and to the custom deliverables created exclusively for the Client under this Agreement. The Provider retains ownership of pre-existing frameworks, generic utility code, and development tools.',
    },
    {
      id: 'sec-4',
      title: '4. Confidentiality & Non-Disclosure',
      content:
        'Both parties agree to treat all proprietary technical data, business plans, and financial information disclosed during the engagement as strictly confidential and shall not disclose such information to any third party without written consent.',
    },
    {
      id: 'sec-5',
      title: '5. Term & Termination',
      content:
        'Either party may terminate this Agreement upon 14 days written notice. In the event of early termination, the Client shall pay the Provider for all work completed up to the termination effective date.',
    },
  ],
  providerSignature: {
    name: 'Alex Rivera',
    title: 'Principal Developer',
    date: new Date().toISOString().split('T')[0],
  },
  clientSignature: {
    name: 'Sarah Chen',
    title: 'VP of Product',
    date: '',
  },
  watermark: 'none',
  accentColor: '#059669', // Emerald
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export function createBlankInvoice(): InvoiceData {
  const today = new Date().toISOString().split('T')[0];
  const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  return {
    id: `inv-${Date.now()}`,
    type: 'invoice',
    title: 'INVOICE',
    invoiceNumber: `INV-${new Date().getFullYear()}-${randomNum}`,
    issueDate: today,
    dueDate: due,
    currency: 'USD',
    status: 'draft',
    sender: {
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
    },
    client: {
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
    },
    items: [
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],
    subtotal: 0,
    discountRate: 0,
    discountAmount: 0,
    taxType: 'single',
    taxName: 'Tax',
    taxRate: 0,
    taxAmount: 0,
    taxName2: 'Tax 2',
    taxRate2: 0,
    taxAmount2: 0,
    shippingFee: 0,
    total: 0,
    payment: {
      method: 'bank',
      bankName: '',
      accountName: '',
      accountNumber: '',
      routingOrSwift: '',
      showQr: false,
    },
    notes: 'Thank you for your business!',
    terms: 'Payment is due within 14 days of issue.',
    watermark: 'none',
    showPaidStamp: true,
    accentColor: '#4f46e5',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createBlankContract(): ContractData {
  const today = new Date().toISOString().split('T')[0];
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  return {
    id: `con-${Date.now()}`,
    type: 'contract',
    title: 'Freelance Services Agreement',
    contractNumber: `AGR-${new Date().getFullYear()}-${randomNum}`,
    effectiveDate: today,
    status: 'draft',
    provider: {
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
    },
    client: {
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
    },
    projectScope: '',
    deliverables: [''],
    feeType: 'fixed',
    totalFee: 0,
    currency: 'USD',
    paymentSchedule: '',
    sections: [...SAMPLE_CONTRACT.sections],
    providerSignature: {
      name: '',
      title: '',
      date: today,
    },
    clientSignature: {
      name: '',
      title: '',
      date: '',
    },
    watermark: 'none',
    accentColor: '#059669',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
