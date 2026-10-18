import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileText,
  Scroll,
  Search,
  Trash2,
  Copy,
  Download,
  Upload,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import type { AnyDocument } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';

interface SavedDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: AnyDocument[];
  onSelectDoc: (doc: AnyDocument) => void;
  onDuplicateDoc: (doc: AnyDocument) => void;
  onDeleteDoc: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SavedDocsModal: React.FC<SavedDocsModalProps> = ({
  isOpen,
  onClose,
  documents,
  onSelectDoc,
  onDuplicateDoc,
  onDeleteDoc,
  onExportBackup,
  onImportBackup,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'contract'>('all');

  if (!isOpen) return null;

  // Calculate high-level financial summary
  const stats = documents.reduce(
    (acc, doc) => {
      const amount = doc.type === 'invoice' ? doc.total : doc.totalFee;
      acc.totalAmount += amount;
      if (doc.status === 'paid' || doc.status === 'signed') {
        acc.paidAmount += amount;
      } else {
        acc.pendingAmount += amount;
      }
      if (doc.status === 'overdue') acc.overdueCount++;
      return acc;
    },
    { totalAmount: 0, paidAmount: 0, pendingAmount: 0, overdueCount: 0 }
  );

  const filteredDocs = documents.filter((doc) => {
    if (filterType !== 'all' && doc.type !== filterType) return false;
    const term = search.toLowerCase();
    const clientName = (doc.type === 'invoice' ? doc.client.name : doc.client.name).toLowerCase();
    const clientComp = (doc.type === 'invoice' ? doc.client.company : doc.client.company).toLowerCase();
    const docNum = (doc.type === 'invoice' ? doc.invoiceNumber : doc.contractNumber).toLowerCase();
    const title = doc.title.toLowerCase();

    return (
      clientName.includes(term) ||
      clientComp.includes(term) ||
      docNum.includes(term) ||
      title.includes(term)
    );
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Saved Documents</h2>
            <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-medium">
              {documents.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Metrics Dashboard */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/70 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Billed</span>
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-0.5 block truncate">
              ${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Collected / Signed</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block truncate">
              ${stats.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50/30">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending / Due</span>
              {stats.overdueCount > 0 ? (
                <span className="flex items-center gap-0.5 text-[9px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1 rounded font-bold">
                  <AlertCircle className="w-2.5 h-2.5" />
                  {stats.overdueCount} Overdue
                </span>
              ) : (
                <Calendar className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="text-sm sm:text-base font-extrabold text-amber-700 dark:text-amber-300 font-mono mt-0.5 block truncate">
              ${stats.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Filters and search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({documents.length})
            </button>
            <button
              onClick={() => setFilterType('invoice')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                filterType === 'invoice'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Invoices
            </button>
            <button
              onClick={() => setFilterType('contract')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                filterType === 'contract'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Scroll className="w-3.5 h-3.5 text-emerald-500" />
              Agreements
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client, title, #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="p-4 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 flex-1">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 stroke-1" />
              <p className="text-sm font-medium">No saved documents found.</p>
              <p className="text-xs text-slate-400 mt-1">Click &ldquo;Save&rdquo; on the top bar or load &ldquo;Demo Data&rdquo; to populate your library.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isInvoice = doc.type === 'invoice';
              const docNum = isInvoice ? doc.invoiceNumber : doc.contractNumber;
              const date = isInvoice ? doc.issueDate : doc.effectiveDate;
              const amount = isInvoice ? doc.total : doc.totalFee;
              const client = doc.client;

              return (
                <div
                  key={doc.id}
                  className="py-3 px-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 rounded-lg flex items-center justify-between gap-4 transition-colors group"
                >
                  <div
                    className="flex items-start gap-3 flex-1 cursor-pointer"
                    onClick={() => {
                      onSelectDoc(doc);
                      onClose();
                    }}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                        isInvoice
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isInvoice ? <FileText className="w-5 h-5" /> : <Scroll className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {docNum || 'Untitled'}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.2 rounded-full font-medium uppercase ${
                            doc.status === 'paid' || doc.status === 'signed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : doc.status === 'sent' || doc.status === 'pending'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{client.company ? `${client.name} (${client.company})` : client.name || 'Unnamed Client'}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(date)}
                        </span>
                        {amount !== undefined && (
                          <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3 text-slate-400" />
                            {formatCurrency(amount, doc.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        onSelectDoc(doc);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => onDuplicateDoc(doc)}
                      title="Duplicate as new draft"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDoc(doc.id)}
                      title="Delete document"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Backup Tools */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <button
              onClick={onExportBackup}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium py-1 px-2 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Backup to JSON
            </button>
            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium py-1 px-2 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Restore Backup
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={onImportBackup}
              />
            </label>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            100% saved locally in your browser
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
