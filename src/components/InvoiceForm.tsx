import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Building,
  User,
  CreditCard,
  QrCode,
  Save,
  Users,
  Check,
  Scroll,
  PenTool,
} from 'lucide-react';
import type { Currency, InvoiceData, LineItem, PartyDetails } from '../types';
import { CURRENCIES, calculateTotals } from '../utils/formatters';
import { ColorPicker } from './ColorPicker';
import { LogoUploader } from './LogoUploader';
import { SignatureModal } from './SignatureModal';
import { getSavedClients, saveClient } from '../utils/storage';

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (updated: InvoiceData) => void;
  onUseMyProfile: () => void;
  onSaveAsMyProfile: (profile: PartyDetails) => void;
  onConvertToContract?: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  data,
  onChange,
  onUseMyProfile,
  onSaveAsMyProfile,
  onConvertToContract,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'payment'>('details');
  const [savedClientNotice, setSavedClientNotice] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  // Recalculate totals whenever items, tax, discount or shipping change
  const handleItemChange = (id: string, field: keyof LineItem, val: string | number) => {
    const newItems = data.items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: val };
        updated.amount = (Number(updated.quantity) || 0) * (Number(updated.rate) || 0);
        return updated;
      }
      return item;
    });

    const totals = calculateTotals(
      newItems,
      data.taxRate,
      data.discountRate,
      data.shippingFee,
      data.taxType || 'single',
      data.taxRate2 || 0
    );
    onChange({
      ...data,
      items: newItems,
      ...totals,
    });
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unit: 'hrs',
      rate: 0,
      amount: 0,
    };
    const newItems = [...data.items, newItem];
    const totals = calculateTotals(
      newItems,
      data.taxRate,
      data.discountRate,
      data.shippingFee,
      data.taxType || 'single',
      data.taxRate2 || 0
    );
    onChange({
      ...data,
      items: newItems,
      ...totals,
    });
  };

  const handleRemoveItem = (id: string) => {
    if (data.items.length <= 1) return;
    const newItems = data.items.filter((item) => item.id !== id);
    const totals = calculateTotals(
      newItems,
      data.taxRate,
      data.discountRate,
      data.shippingFee,
      data.taxType || 'single',
      data.taxRate2 || 0
    );
    onChange({
      ...data,
      items: newItems,
      ...totals,
    });
  };

  const handleRateAdjustment = (
    field: 'taxRate' | 'discountRate' | 'shippingFee' | 'taxRate2',
    val: number
  ) => {
    const updated = { ...data, [field]: val };
    const totals = calculateTotals(
      updated.items,
      field === 'taxRate' ? val : updated.taxRate,
      field === 'discountRate' ? val : updated.discountRate,
      field === 'shippingFee' ? val : updated.shippingFee,
      updated.taxType || 'single',
      field === 'taxRate2' ? val : updated.taxRate2 || 0
    );
    onChange({
      ...updated,
      ...totals,
    });
  };

  const handleTaxTypeChange = (type: 'single' | 'dual') => {
    const totals = calculateTotals(
      data.items,
      data.taxRate,
      data.discountRate,
      data.shippingFee,
      type,
      data.taxRate2 || 0
    );
    onChange({
      ...data,
      taxType: type,
      taxName: data.taxName || (type === 'dual' ? 'CGST' : 'Tax'),
      taxName2: data.taxName2 || (type === 'dual' ? 'SGST' : 'Tax 2'),
      ...totals,
    });
  };

  const handleSaveCurrentClient = () => {
    if (!data.client.name && !data.client.company) return;
    saveClient({
      name: data.client.name,
      company: data.client.company,
      email: data.client.email,
      phone: data.client.phone,
      address: data.client.address,
      taxId: data.client.taxId,
    });
    setSavedClientNotice(true);
    setTimeout(() => setSavedClientNotice(false), 2000);
  };

  const handleSelectSavedClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    if (!clientId) return;
    const clients = getSavedClients();
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      onChange({
        ...data,
        client: {
          name: found.name,
          company: found.company,
          email: found.email,
          phone: found.phone,
          address: found.address,
          taxId: found.taxId || '',
        },
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-full transition-colors">
      {/* Top Meta Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
        {/* Row 1: Document Identity & Converter */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value.toUpperCase() })}
              className="text-base font-extrabold text-slate-900 dark:text-white tracking-wider bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 hover:border-slate-500 focus:border-indigo-600 focus:outline-hidden w-28 uppercase"
              placeholder="INVOICE"
            />
            <input
              type="text"
              value={data.invoiceNumber}
              onChange={(e) => onChange({ ...data, invoiceNumber: e.target.value })}
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden w-28 font-mono shadow-2xs"
              placeholder="INV-001"
            />
          </div>

          {onConvertToContract && (
            <button
              type="button"
              onClick={onConvertToContract}
              title="Transform this invoice into an agreement draft"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>To Agreement</span>
            </button>
          )}
        </div>

        {/* Row 2: Parameters Toolbar (Currency, Status, Watermark, Accent) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={data.currency}
              onChange={(e) => onChange({ ...data, currency: e.target.value as Currency })}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden shadow-2xs"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            <select
              value={data.status}
              onChange={(e) => onChange({ ...data, status: e.target.value as any })}
              className={`text-xs font-bold rounded-lg px-2.5 py-1.5 uppercase border cursor-pointer shadow-2xs ${
                data.status === 'paid'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                  : data.status === 'sent'
                  ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700'
                  : data.status === 'overdue'
                  ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700'
                  : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>

            {data.status === 'paid' && (
              <button
                type="button"
                onClick={() =>
                  onChange({ ...data, showPaidStamp: data.showPaidStamp === false ? true : false })
                }
                title="Toggle vintage rubber stamp on preview/print"
                className={`text-[11px] px-2 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                  data.showPaidStamp !== false
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}
              >
                Stamp: {data.showPaidStamp !== false ? 'ON' : 'OFF'}
              </button>
            )}

            <select
              value={data.watermark || 'none'}
              onChange={(e) => onChange({ ...data, watermark: e.target.value })}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden shadow-2xs"
              title="Document Watermark"
            >
              <option value="none">Mark: None</option>
              <option value="DRAFT">Mark: DRAFT</option>
              <option value="PAID">Mark: PAID</option>
              <option value="CONFIDENTIAL">Mark: CONFIDENTIAL</option>
              <option value="VOID">Mark: VOID</option>
              <option value="COPY">Mark: COPY</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <ColorPicker
              selectedColor={data.accentColor}
              onChange={(hex) => onChange({ ...data, accentColor: hex })}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Modern Segmented Control */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'details'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Parties & Logo</span>
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'items'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] inline-flex items-center justify-center font-bold">
              {data.items.length}
            </span>
            <span>Items & Taxes</span>
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment & Sign</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5 overflow-y-auto flex-1 space-y-5 text-sm">
        {/* TAB 1: PARTIES & DATES */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Dates row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={data.issueDate}
                  onChange={(e) => onChange({ ...data, issueDate: e.target.value })}
                  className="w-full text-xs py-1.5 px-3 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={data.dueDate}
                  onChange={(e) => onChange({ ...data, dueDate: e.target.value })}
                  className="w-full text-xs py-1.5 px-3 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Sender / From with Logo Uploader */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  From (Your Business)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onUseMyProfile}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    Auto-Fill My Details
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      onSaveAsMyProfile(data.sender);
                      setProfileSavedNotice(true);
                      setTimeout(() => setProfileSavedNotice(false), 2000);
                    }}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
                  >
                    {profileSavedNotice ? 'Saved!' : 'Save as Default'}
                  </button>
                </div>
              </div>

              {/* Logo Uploader */}
              <LogoUploader
                logoUrl={data.sender.logoUrl}
                onChange={(url) => onChange({ ...data, sender: { ...data.sender, logoUrl: url } })}
                label="Invoice Header Logo"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <input
                  type="text"
                  placeholder="Your Name / Studio"
                  value={data.sender.name}
                  onChange={(e) =>
                    onChange({ ...data, sender: { ...data.sender, name: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  placeholder="Company / Legal Entity"
                  value={data.sender.company}
                  onChange={(e) =>
                    onChange({ ...data, sender: { ...data.sender, company: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={data.sender.email}
                  onChange={(e) =>
                    onChange({ ...data, sender: { ...data.sender, email: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={data.sender.phone}
                  onChange={(e) =>
                    onChange({ ...data, sender: { ...data.sender, phone: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <textarea
                    rows={2}
                    placeholder="Physical Address"
                    value={data.sender.address}
                    onChange={(e) =>
                      onChange({ ...data, sender: { ...data.sender, address: e.target.value } })
                    }
                    className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Tax ID / GST / VAT"
                    value={data.sender.taxId || ''}
                    onChange={(e) =>
                      onChange({ ...data, sender: { ...data.sender, taxId: e.target.value } })
                    }
                    className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Client / To */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Bill To (Client)
                </span>

                <div className="flex items-center gap-2">
                  {getSavedClients().length > 0 && (
                    <select
                      onChange={handleSelectSavedClient}
                      defaultValue=""
                      className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                    >
                      <option value="" disabled>
                        Load Saved Client...
                      </option>
                      {getSavedClients().map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.company ? `(${c.company})` : ''}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveCurrentClient}
                    title="Save this client for quick reuse"
                    className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 py-0.5 px-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    {savedClientNotice ? <Check className="w-3 h-3 text-emerald-600" /> : <Save className="w-3 h-3" />}
                    {savedClientNotice ? 'Saved!' : 'Save Client'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Client Contact Name"
                  value={data.client.name}
                  onChange={(e) =>
                    onChange({ ...data, client: { ...data.client, name: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  placeholder="Client Company Name"
                  value={data.client.company}
                  onChange={(e) =>
                    onChange({ ...data, client: { ...data.client, company: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="email"
                  placeholder="Client Email"
                  value={data.client.email}
                  onChange={(e) =>
                    onChange({ ...data, client: { ...data.client, email: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  placeholder="Client Phone"
                  value={data.client.phone}
                  onChange={(e) =>
                    onChange({ ...data, client: { ...data.client, phone: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <textarea
                    rows={2}
                    placeholder="Client Billing Address"
                    value={data.client.address}
                    onChange={(e) =>
                      onChange({ ...data, client: { ...data.client, address: e.target.value } })
                    }
                    className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Client Tax ID / VAT"
                    value={data.client.taxId || ''}
                    onChange={(e) =>
                      onChange({ ...data, client: { ...data.client, taxId: e.target.value } })
                    }
                    className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ITEMS & DUAL TAX */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Line Items
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line Item
                </button>
              </div>

              {data.items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-lg border border-slate-200/90 dark:border-slate-800 space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={data.items.length <= 1}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Item or service description..."
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs py-1 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Unit</label>
                      <select
                        value={item.unit || 'qty'}
                        onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                        className="w-full text-xs py-1 px-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                      >
                        <option value="qty">Qty</option>
                        <option value="hrs">hrs</option>
                        <option value="days">days</option>
                        <option value="words">words</option>
                        <option value="units">units</option>
                        <option value="mo">mo</option>
                        <option value="flat">flat</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Rate ({data.currency})</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs py-1 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5 text-right">Amount</label>
                      <div className="text-xs py-1 px-2 bg-slate-100/90 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 font-semibold rounded-md border border-slate-200 dark:border-slate-600 text-right overflow-hidden text-ellipsis">
                        {item.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations & Dual Tax Adjustments */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Tax & Adjustments
                </span>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => handleTaxTypeChange('single')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      data.taxType !== 'dual'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Single Tax
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTaxTypeChange('dual')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      data.taxType === 'dual'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Dual Tax (CGST+SGST / GST+PST)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={data.discountRate}
                    onChange={(e) => handleRateAdjustment('discountRate', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Shipping / Extra Fee</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={data.shippingFee}
                    onChange={(e) => handleRateAdjustment('shippingFee', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Tax Rates Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                    {data.taxType === 'dual' ? 'Tax 1 Name & Rate (%)' : 'Tax Label & Rate (%)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={data.taxName || 'Tax'}
                      placeholder="e.g. VAT or CGST"
                      onChange={(e) => onChange({ ...data, taxName: e.target.value })}
                      className="w-1/2 text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.25"
                      value={data.taxRate}
                      placeholder="Rate %"
                      onChange={(e) => handleRateAdjustment('taxRate', parseFloat(e.target.value) || 0)}
                      className="w-1/2 text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {data.taxType === 'dual' && (
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Tax 2 Name & Rate (%)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.taxName2 || 'SGST'}
                        placeholder="e.g. SGST or PST"
                        onChange={(e) => onChange({ ...data, taxName2: e.target.value })}
                        className="w-1/2 text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.25"
                        value={data.taxRate2 || 0}
                        placeholder="Rate %"
                        onChange={(e) => handleRateAdjustment('taxRate2', parseFloat(e.target.value) || 0)}
                        className="w-1/2 text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{data.subtotal.toFixed(2)}</span>
                </div>
                {data.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({data.discountRate}%):</span>
                    <span>-{data.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {data.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{data.taxName || 'Tax'} ({data.taxRate}%):</span>
                    <span>+{data.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {data.taxType === 'dual' && (data.taxAmount2 || 0) > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{data.taxName2 || 'Tax 2'} ({data.taxRate2}%):</span>
                    <span>+{(data.taxAmount2 || 0).toFixed(2)}</span>
                  </div>
                )}
                {data.shippingFee > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Shipping / Extra:</span>
                    <span>+{data.shippingFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Amount:</span>
                  <span>
                    {data.currency} {data.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT & SIGNATURE */}
        {activeTab === 'payment' && (
          <div className="space-y-5">
            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Primary Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'bank', label: 'Bank Wire' },
                  { id: 'upi', label: 'UPI / QR' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'custom', label: 'Payment Link' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...data,
                        payment: { ...data.payment, method: m.id as any },
                      })
                    }
                    className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                      data.payment.method === m.id
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank details form */}
            {data.payment.method === 'bank' && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Bank Transfer Coordinates
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Bank Name (e.g. Silicon Valley Bank)"
                    value={data.payment.bankName}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        payment: { ...data.payment, bankName: e.target.value },
                      })
                    }
                    className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Account Name"
                    value={data.payment.accountName}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        payment: { ...data.payment, accountName: e.target.value },
                      })
                    }
                    className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Account Number / IBAN"
                    value={data.payment.accountNumber}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        payment: { ...data.payment, accountNumber: e.target.value },
                      })
                    }
                    className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Routing / SWIFT / IFSC Code"
                    value={data.payment.routingOrSwift}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        payment: { ...data.payment, routingOrSwift: e.target.value },
                      })
                    }
                    className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* UPI Form */}
            {data.payment.method === 'upi' && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  UPI Details (Instant QR for India)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="UPI ID (e.g. yourname@okaxis)"
                    value={data.payment.upiId || ''}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        payment: { ...data.payment, upiId: e.target.value },
                      })
                    }
                    className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Payee Display Name"
                    value={data.payment.accountName || ''}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        payment: { ...data.payment, accountName: e.target.value },
                      })
                    }
                    className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* PayPal Form */}
            {data.payment.method === 'paypal' && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">PayPal Details</span>
                <input
                  type="text"
                  placeholder="PayPal Email or PayPal.Me handle (e.g. yourstudio)"
                  value={data.payment.paypalEmail || ''}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      payment: { ...data.payment, paypalEmail: e.target.value },
                    })
                  }
                  className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
              </div>
            )}

            {/* Custom Payment Link Form */}
            {data.payment.method === 'custom' && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Direct Payment Link (Stripe, Razorpay, BuyMeACoffee)
                </span>
                <input
                  type="url"
                  placeholder="https://buy.stripe.com/..."
                  value={data.payment.paymentLink || ''}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      payment: { ...data.payment, paymentLink: e.target.value },
                    })
                  }
                  className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
              </div>
            )}

            {/* QR Code toggle */}
            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Render Payment QR Code on Invoice
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Clients can scan the QR code to open UPI or payment link directly.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={data.payment.showQr}
                onChange={(e) =>
                  onChange({
                    ...data,
                    payment: { ...data.payment, showQr: e.target.checked },
                  })
                }
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* Authorized Digital Signature */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Authorized Signature (Optional)
                </span>
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  {data.authorizedSignature?.signatureImage ? 'Change Signature' : '+ Add Signature'}
                </button>
              </div>

              {data.authorizedSignature?.signatureImage ? (
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={data.authorizedSignature.signatureImage}
                      alt="Signature"
                      className="h-10 max-w-[120px] object-contain"
                    />
                    <div className="text-xs text-slate-500">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {data.authorizedSignature.name || data.sender.name || 'Authorized'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ ...data, authorizedSignature: undefined })}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove signature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Draw or generate a clean cursive signature to stamp at the bottom of the invoice.
                </p>
              )}
            </div>

            {/* Notes and Terms */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Client Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Thank you for your business!"
                  value={data.notes}
                  onChange={(e) => onChange({ ...data, notes: e.target.value })}
                  className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Payment Terms & Conditions
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: 'Due on Receipt', text: 'Payment is due immediately upon receipt.' },
                      { label: 'Net 15', text: 'Payment is due within 15 calendar days of issue date.' },
                      { label: 'Net 30', text: 'Payment is due within 30 calendar days of issue date.' },
                      { label: '50/50 Split', text: '50% advance deposit; remaining 50% upon final delivery.' },
                      { label: '+1.5% Late Fee', text: 'Overdue invoices are subject to a 1.5% monthly late fee.' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...data,
                            terms: data.terms ? `${data.terms} ${preset.text}` : preset.text,
                          })
                        }
                        className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        +{preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Payment is due within 14 days..."
                  value={data.terms}
                  onChange={(e) => onChange({ ...data, terms: e.target.value })}
                  className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        defaultName={data.sender.name}
        title="Create Authorized Signature"
        onSave={(dataUrl) => {
          onChange({
            ...data,
            authorizedSignature: {
              name: data.sender.name || 'Authorized Signatory',
              date: new Date().toISOString().split('T')[0],
              signatureImage: dataUrl,
            },
          });
        }}
      />
    </div>
  );
};
