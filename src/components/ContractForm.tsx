import React, { useState } from 'react';
import {
  Building,
  User,
  Users,
  Scroll,
  Plus,
  Trash2,
  FileCheck,
  Check,
  Save,
  PenTool,
  FileText,
} from 'lucide-react';
import type { ContractData, ContractSection, Currency, PartyDetails } from '../types';
import { CURRENCIES } from '../utils/formatters';
import { ColorPicker } from './ColorPicker';
import { LogoUploader } from './LogoUploader';
import { SignatureModal } from './SignatureModal';
import { getSavedClients, saveClient } from '../utils/storage';

interface ContractFormProps {
  data: ContractData;
  onChange: (updated: ContractData) => void;
  onUseMyProfile: () => void;
  onSaveAsMyProfile: (profile: PartyDetails) => void;
  onConvertToInvoice?: () => void;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  data,
  onChange,
  onUseMyProfile,
  onSaveAsMyProfile,
  onConvertToInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'parties' | 'scope' | 'clauses' | 'signatures'>('parties');
  const [savedClientNotice, setSavedClientNotice] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);
  const [activeSignTarget, setActiveSignTarget] = useState<'provider' | 'client' | null>(null);

  // Deliverables handler
  const handleAddDeliverable = () => {
    onChange({
      ...data,
      deliverables: [...data.deliverables, ''],
    });
  };

  const handleUpdateDeliverable = (index: number, val: string) => {
    const updated = [...data.deliverables];
    updated[index] = val;
    onChange({ ...data, deliverables: updated });
  };

  const handleRemoveDeliverable = (index: number) => {
    if (data.deliverables.length <= 1) return;
    const updated = data.deliverables.filter((_, i) => i !== index);
    onChange({ ...data, deliverables: updated });
  };

  // Sections / Clauses handler
  const handleAddSection = () => {
    const newSec: ContractSection = {
      id: `sec-${Date.now()}`,
      title: `${data.sections.length + 1}. Additional Terms`,
      content: '',
    };
    onChange({
      ...data,
      sections: [...data.sections, newSec],
    });
  };

  const handleUpdateSection = (id: string, field: 'title' | 'content', val: string) => {
    const updated = data.sections.map((sec) => (sec.id === id ? { ...sec, [field]: val } : sec));
    onChange({ ...data, sections: updated });
  };

  const handleRemoveSection = (id: string) => {
    const updated = data.sections.filter((sec) => sec.id !== id);
    onChange({ ...data, sections: updated });
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
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 hover:border-slate-500 focus:border-indigo-600 focus:outline-hidden min-w-[200px]"
              placeholder="Services Agreement"
            />
            <input
              type="text"
              value={data.contractNumber}
              onChange={(e) => onChange({ ...data, contractNumber: e.target.value })}
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden w-28 font-mono shadow-2xs"
              placeholder="AGR-001"
            />
          </div>

          {onConvertToInvoice && (
            <button
              type="button"
              onClick={onConvertToInvoice}
              title="Generate a billing invoice from this contract"
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>To Invoice</span>
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
                data.status === 'signed'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                  : data.status === 'pending'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                  : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="signed">Signed</option>
            </select>

            <select
              value={data.watermark || 'none'}
              onChange={(e) => onChange({ ...data, watermark: e.target.value })}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden shadow-2xs"
              title="Document Watermark"
            >
              <option value="none">Mark: None</option>
              <option value="DRAFT">Mark: DRAFT</option>
              <option value="CONFIDENTIAL">Mark: CONFIDENTIAL</option>
              <option value="VOID">Mark: VOID</option>
              <option value="ORIGINAL">Mark: ORIGINAL</option>
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
            onClick={() => setActiveTab('parties')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'parties'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Parties & Logo</span>
            <span className="sm:hidden">Parties</span>
          </button>
          <button
            onClick={() => setActiveTab('scope')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'scope'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scope & Terms</span>
            <span className="sm:hidden">Scope</span>
          </button>
          <button
            onClick={() => setActiveTab('clauses')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'clauses'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] inline-flex items-center justify-center font-bold">
              {data.sections.length}
            </span>
            <span className="hidden sm:inline">Clauses</span>
            <span className="sm:hidden">Terms</span>
          </button>
          <button
            onClick={() => setActiveTab('signatures')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'signatures'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Signatures</span>
            <span className="sm:hidden">Sign</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5 overflow-y-auto flex-1 space-y-5 text-sm">
        {/* TAB 1: PARTIES & DATES */}
        {activeTab === 'parties' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Effective Date (Start)
                </label>
                <input
                  type="date"
                  value={data.effectiveDate}
                  onChange={(e) => onChange({ ...data, effectiveDate: e.target.value })}
                  className="w-full text-xs py-1.5 px-3 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  End / Delivery Date
                </label>
                <input
                  type="date"
                  value={data.endDate || ''}
                  onChange={(e) => onChange({ ...data, endDate: e.target.value })}
                  className="w-full text-xs py-1.5 px-3 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Provider Section */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Service Provider
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
                      onSaveAsMyProfile(data.provider);
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
                logoUrl={data.provider.logoUrl}
                onChange={(url) => onChange({ ...data, provider: { ...data.provider, logoUrl: url } })}
                label="Agreement Header Logo"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <input
                  type="text"
                  placeholder="Provider Full Name"
                  value={data.provider.name}
                  onChange={(e) =>
                    onChange({ ...data, provider: { ...data.provider, name: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Provider Entity / Studio"
                  value={data.provider.company}
                  onChange={(e) =>
                    onChange({ ...data, provider: { ...data.provider, company: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={data.provider.email}
                  onChange={(e) =>
                    onChange({ ...data, provider: { ...data.provider, email: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={data.provider.phone}
                  onChange={(e) =>
                    onChange({ ...data, provider: { ...data.provider, phone: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Provider Address"
                value={data.provider.address}
                onChange={(e) =>
                  onChange({ ...data, provider: { ...data.provider, address: e.target.value } })
                }
                className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
              />
            </div>

            {/* Client Section */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Client
                </span>

                <div className="flex items-center gap-2">
                  {getSavedClients().length > 0 && (
                    <select
                      onChange={handleSelectSavedClient}
                      defaultValue=""
                      className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-slate-700 dark:text-slate-300"
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
                  placeholder="Client Authorized Representative"
                  value={data.client.name}
                  onChange={(e) =>
                    onChange({ ...data, client: { ...data.client, name: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Client Business Name"
                  value={data.client.company}
                  onChange={(e) =>
                    onChange({ ...data, client: { ...data.client, company: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
                <input
                  type="email"
                  placeholder="Client Email"
                  value={data.client.email}
                  onChange={(e) =>
                    onChange({ ...data, client: { ...data.client, email: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Client Phone"
                  value={data.client.phone}
                  onChange={(e) =>
                    onChange({ ...data, client: { ...data.client, phone: e.target.value } })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Client Business Address"
                value={data.client.address}
                onChange={(e) =>
                  onChange({ ...data, client: { ...data.client, address: e.target.value } })
                }
                className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* TAB 2: SCOPE & PAYMENT */}
        {activeTab === 'scope' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Project Scope Overview
              </label>
              <textarea
                rows={3}
                placeholder="Describe the goals and overall scope of the project..."
                value={data.projectScope}
                onChange={(e) => onChange({ ...data, projectScope: e.target.value })}
                className="w-full text-xs py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
              />
            </div>

            {/* Deliverables */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Key Deliverables / Milestones
                </label>
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Deliverable
                </button>
              </div>

              {data.deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    value={item}
                    placeholder="Milestone or deliverable item..."
                    onChange={(e) => handleUpdateDeliverable(idx, e.target.value)}
                    className="flex-1 text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(idx)}
                    disabled={data.deliverables.length <= 1}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Fee Structure */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Fee & Payment Terms
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Fee Model</label>
                  <select
                    value={data.feeType}
                    onChange={(e) => onChange({ ...data, feeType: e.target.value as any })}
                    className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md capitalize"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="milestone">Milestone-based</option>
                    <option value="retainer">Monthly Retainer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Currency</label>
                  <select
                    value={data.currency}
                    onChange={(e) => onChange({ ...data, currency: e.target.value as Currency })}
                    className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Fee Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={data.totalFee}
                    onChange={(e) => onChange({ ...data, totalFee: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Payment Schedule</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 50% upfront upon signing, 50% upon final delivery."
                  value={data.paymentSchedule}
                  onChange={(e) => onChange({ ...data, paymentSchedule: e.target.value })}
                  className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEGAL CLAUSES */}
        {activeTab === 'clauses' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Contract Clauses & Provisions
                </span>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Clause
                </button>
              </div>

              {/* One-Click Standard Clause Presets */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Standard Clauses
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      title: 'Revisions & Scope Policy',
                      content:
                        'Up to two (2) rounds of reasonable revisions are included within the original scope. Any substantial alterations or additional feature requests will be estimated and billed separately.',
                    },
                    {
                      title: 'Intellectual Property Assignment',
                      content:
                        'All intellectual property rights and copyrights in the deliverables transfer exclusively to the Client upon receipt of full and final payment. The Provider retains rights to standard utility libraries and portfolio display.',
                    },
                    {
                      title: 'Confidentiality & Non-Disclosure',
                      content:
                        'Both parties agree to treat all disclosed proprietary materials, client data, and trade secrets as strictly confidential and shall not disclose them to third parties without prior written consent.',
                    },
                    {
                      title: 'Early Termination & Kill Fee',
                      content:
                        'Either party may terminate this agreement with 14 calendar days written notice. In the event of early client termination, the Client agrees to pay for all completed milestones plus a 20% project kill fee.',
                    },
                    {
                      title: 'Independent Contractor Status',
                      content:
                        'The Provider performs all services as an independent contractor. Nothing in this agreement shall create or imply an employer-employee, partnership, or agency relationship between the parties.',
                    },
                  ].map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        const newSec = {
                          id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                          title: `${data.sections.length + 1}. ${preset.title}`,
                          content: preset.content,
                        };
                        onChange({ ...data, sections: [...data.sections, newSec] });
                      }}
                      className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors shadow-2xs"
                    >
                      +{preset.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {data.sections.map((section) => (
              <div
                key={section.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                    className="text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(section.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete clause"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={section.content}
                  onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                  className="w-full text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md"
                />
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SIGNATORIES & eSIGN */}
        {activeTab === 'signatures' && (
          <div className="space-y-5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter signatory representative details and adopt a hand-drawn or stylized digital signature.
            </p>

            {/* Provider Signatory */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Provider Signatory
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSignTarget('provider')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  {data.providerSignature.signatureImage ? 'Change Signature' : '+ Draw / Type Signature'}
                </button>
              </div>

              {data.providerSignature.signatureImage && (
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <img
                    src={data.providerSignature.signatureImage}
                    alt="Provider signature"
                    className="h-10 max-w-[140px] object-contain"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...data,
                        providerSignature: { ...data.providerSignature, signatureImage: undefined },
                      })
                    }
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove signature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Printed Name"
                  value={data.providerSignature.name}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      providerSignature: { ...data.providerSignature, name: e.target.value },
                    })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Title (e.g. Founder, Principal)"
                  value={data.providerSignature.title || ''}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      providerSignature: { ...data.providerSignature, title: e.target.value },
                    })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md"
                />
                <input
                  type="date"
                  value={data.providerSignature.date}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      providerSignature: { ...data.providerSignature, date: e.target.value },
                    })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md"
                />
              </div>
            </div>

            {/* Client Signatory */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Client Signatory
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSignTarget('client')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  {data.clientSignature.signatureImage ? 'Change Signature' : '+ Draw / Type Signature'}
                </button>
              </div>

              {data.clientSignature.signatureImage && (
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <img
                    src={data.clientSignature.signatureImage}
                    alt="Client signature"
                    className="h-10 max-w-[140px] object-contain"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...data,
                        clientSignature: { ...data.clientSignature, signatureImage: undefined },
                      })
                    }
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove signature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Printed Name"
                  value={data.clientSignature.name}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      clientSignature: { ...data.clientSignature, name: e.target.value },
                    })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Title (e.g. VP Engineering, CEO)"
                  value={data.clientSignature.title || ''}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      clientSignature: { ...data.clientSignature, title: e.target.value },
                    })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md"
                />
                <input
                  type="date"
                  value={data.clientSignature.date}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      clientSignature: { ...data.clientSignature, date: e.target.value },
                    })
                  }
                  className="text-xs py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={activeSignTarget !== null}
        onClose={() => setActiveSignTarget(null)}
        defaultName={
          activeSignTarget === 'provider'
            ? data.providerSignature.name || data.provider.name
            : data.clientSignature.name || data.client.name
        }
        title={
          activeSignTarget === 'provider'
            ? 'Adopt Provider Digital Signature'
            : 'Adopt Client Digital Signature'
        }
        onSave={(dataUrl) => {
          if (activeSignTarget === 'provider') {
            onChange({
              ...data,
              providerSignature: {
                ...data.providerSignature,
                name: data.providerSignature.name || data.provider.name,
                signatureImage: dataUrl,
              },
            });
          } else if (activeSignTarget === 'client') {
            onChange({
              ...data,
              clientSignature: {
                ...data.clientSignature,
                name: data.clientSignature.name || data.client.name,
                signatureImage: dataUrl,
              },
            });
          }
        }}
      />
    </div>
  );
};
