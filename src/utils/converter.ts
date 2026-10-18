import type { ContractData, InvoiceData, LineItem } from '../types';
import { SAMPLE_CONTRACT } from './sampleData';

export function convertContractToInvoice(contract: ContractData): InvoiceData {
  const today = new Date().toISOString().split('T')[0];
  const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  // Convert deliverables to line items
  const validDeliverables = contract.deliverables.filter((d) => d.trim().length > 0);
  let items: LineItem[] = [];

  if (validDeliverables.length > 0) {
    const ratePerItem = contract.totalFee / validDeliverables.length;
    items = validDeliverables.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      description: item,
      quantity: 1,
      rate: parseFloat(ratePerItem.toFixed(2)),
      amount: parseFloat(ratePerItem.toFixed(2)),
    }));
  } else {
    items = [
      {
        id: `item-${Date.now()}`,
        description: contract.projectScope || 'Professional Services & Deliverables',
        quantity: 1,
        rate: contract.totalFee,
        amount: contract.totalFee,
      },
    ];
  }

  return {
    id: `inv-${Date.now()}`,
    type: 'invoice',
    title: 'INVOICE',
    invoiceNumber: `INV-${new Date().getFullYear()}-${randomNum}`,
    issueDate: today,
    dueDate: due,
    currency: contract.currency,
    status: 'draft',
    sender: { ...contract.provider },
    client: { ...contract.client },
    items,
    subtotal: contract.totalFee,
    discountRate: 0,
    discountAmount: 0,
    taxType: 'single',
    taxName: 'Tax',
    taxRate: 0,
    taxAmount: 0,
    shippingFee: 0,
    total: contract.totalFee,
    payment: {
      method: 'bank',
      bankName: '',
      accountName: contract.provider.company || contract.provider.name,
      accountNumber: '',
      routingOrSwift: '',
      showQr: false,
    },
    notes: `Billed as per Agreement #${contract.contractNumber}`,
    terms: contract.paymentSchedule || 'Payment is due within 14 days of issue.',
    watermark: contract.watermark || 'none',
    showPaidStamp: true,
    accentColor: contract.accentColor,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function convertInvoiceToContract(invoice: InvoiceData): ContractData {
  const today = new Date().toISOString().split('T')[0];
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  const deliverables = invoice.items
    .filter((item) => item.description.trim().length > 0)
    .map((item) => item.description);

  return {
    id: `con-${Date.now()}`,
    type: 'contract',
    title: 'Independent Freelance Services Agreement',
    contractNumber: `AGR-${new Date().getFullYear()}-${randomNum}`,
    effectiveDate: today,
    endDate: invoice.dueDate,
    status: 'draft',
    provider: { ...invoice.sender },
    client: { ...invoice.client },
    projectScope: `Perform and deliver professional services including: ${deliverables.slice(0, 3).join(', ')}.`,
    deliverables: deliverables.length > 0 ? deliverables : ['Implementation of agreed deliverables.'],
    feeType: 'fixed',
    totalFee: invoice.total,
    currency: invoice.currency,
    paymentSchedule: invoice.terms || '50% upfront deposit upon signing, 50% upon final delivery.',
    sections: [...SAMPLE_CONTRACT.sections],
    providerSignature: {
      name: invoice.sender.name,
      title: 'Authorized Provider',
      date: today,
    },
    clientSignature: {
      name: invoice.client.name,
      title: 'Authorized Client',
      date: '',
    },
    watermark: invoice.watermark || 'none',
    accentColor: invoice.accentColor,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
