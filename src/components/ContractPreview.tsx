import React from 'react';
import type { ContractData } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';

interface ContractPreviewProps {
  data: ContractData;
}

export const ContractPreview: React.FC<ContractPreviewProps> = ({ data }) => {
  return (
    <div className="flex flex-col items-center p-2 sm:p-4 overflow-x-auto w-full">
      {/* A4 Sheet Container - strictly white with dark text regardless of dark mode */}
      <div
        id="contract-preview-sheet"
        className="relative overflow-hidden print-container bg-white text-slate-900 shadow-xl rounded-lg w-full max-w-[210mm] min-h-[297mm] print:min-h-0 print:h-auto print:max-w-none print:shadow-none print:border-none p-6 sm:p-10 print:p-0 flex flex-col justify-between border border-slate-200 transition-all select-text"
        style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {/* Subtle Background Watermark (Optional) */}
        {data.watermark && data.watermark !== 'none' && (
          <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
            <span className="text-slate-900/[0.04] text-8xl font-black uppercase tracking-widest -rotate-30 select-none">
              {data.watermark}
            </span>
          </div>
        )}

        {/* Vintage Rubber Stamp for SIGNED Status */}
        {data.status === 'signed' && (
          <div className="absolute top-10 right-10 pointer-events-none select-none z-10">
            <div className="border-4 border-emerald-600/80 text-emerald-600/90 font-black tracking-widest uppercase text-xl px-4 py-1.5 rounded-lg -rotate-12 shadow-xs bg-emerald-50/20 backdrop-blur-[0.5px] flex flex-col items-center">
              <span>EXECUTED</span>
              <span className="text-[9px] font-semibold tracking-normal normal-case opacity-80">{formatDate(data.effectiveDate)}</span>
            </div>
          </div>
        )}

        <div className="space-y-6 relative z-1">
          {/* Header Accent Bar */}
          <div>
            <div
              className="h-1.5 w-full rounded-full mb-5"
              style={{ backgroundColor: data.accentColor }}
            />

            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-start gap-3.5">
                {data.provider.logoUrl && (
                  <img
                    src={data.provider.logoUrl}
                    alt="Logo"
                    className="h-12 w-auto max-w-[120px] object-contain rounded"
                  />
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {data.title || 'Freelance Services Agreement'}
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Document Ref: #{data.contractNumber || 'AGR-0000'}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1 text-xs">
                <div className="flex sm:justify-end gap-3 text-slate-600">
                  <span className="text-slate-400 font-medium">Effective Date:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(data.effectiveDate)}
                  </span>
                </div>
                {data.endDate && (
                  <div className="flex sm:justify-end gap-3 text-slate-600">
                    <span className="text-slate-400 font-medium">Target End Date:</span>
                    <span className="font-semibold text-slate-800">{formatDate(data.endDate)}</span>
                  </div>
                )}
                <div className="pt-1 flex sm:justify-end">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      data.status === 'signed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : data.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {data.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preamble / Recitals */}
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-lg border border-slate-100">
            <p>
              This <strong>{data.title || 'Agreement'}</strong> (&ldquo;Agreement&rdquo;) is entered into and made effective as of{' '}
              <strong>{formatDate(data.effectiveDate) || '[Effective Date]'}</strong>, by and between:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Service Provider
                </span>
                <p className="font-bold text-slate-900">
                  {data.provider.name || (
                    <span className="text-slate-400 font-normal italic print:hidden">
                      [Provider Name / Studio]
                    </span>
                  )}
                </p>
                {data.provider.company && <p className="font-medium text-slate-700">{data.provider.company}</p>}
                {data.provider.email && <p className="text-slate-600">{data.provider.email}</p>}
                {data.provider.address && (
                  <p className="text-slate-500 whitespace-pre-line text-[11px] pt-0.5">
                    {data.provider.address}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  Client
                </span>
                <p className="font-bold text-slate-900">
                  {data.client.name || (
                    <span className="text-slate-400 font-normal italic print:hidden">
                      [Client Name / Business]
                    </span>
                  )}
                </p>
                {data.client.company && <p className="font-medium text-slate-700">{data.client.company}</p>}
                {data.client.email && <p className="text-slate-600">{data.client.email}</p>}
                {data.client.address && (
                  <p className="text-slate-500 whitespace-pre-line text-[11px] pt-0.5">
                    {data.client.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="space-y-2 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              Project Scope & Key Deliverables
            </h2>
            <p className="text-slate-700 leading-relaxed pt-1">
              {data.projectScope || (
                <span className="text-slate-400 font-normal italic print:hidden">
                  [Enter project scope and objectives in the editor]
                </span>
              )}
            </p>

            {data.deliverables.filter(Boolean).length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-slate-700 pt-1 pl-2">
                {data.deliverables.filter(Boolean).map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Compensation & Fees */}
          <div className="space-y-2 text-xs bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Compensation & Payment Terms
            </h2>
            <div className="flex items-center gap-6 pt-0.5">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Fee Structure</span>
                <span className="font-semibold text-slate-900 capitalize">{data.feeType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Total Agreed Fee</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatCurrency(data.totalFee, data.currency)}
                </span>
              </div>
            </div>
            {data.paymentSchedule && (
              <p className="text-slate-600 pt-1 leading-relaxed">
                <strong>Schedule:</strong> {data.paymentSchedule}
              </p>
            )}
          </div>

          {/* Structured Clauses */}
          <div className="space-y-3.5 pt-1 text-xs text-slate-700">
            {data.sections.map((section) => (
              <div key={section.id} className="space-y-1">
                <h3 className="font-bold text-slate-900 text-xs">{section.title}</h3>
                <p className="leading-relaxed text-slate-600 whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Signatures Block with digital signatures */}
          <div className="pt-6 border-t-2 border-slate-200 mt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-5">
              In Witness Whereof, the parties have executed this Agreement:
            </h3>

            <div className="grid grid-cols-2 gap-8 text-xs">
              {/* Provider Signature */}
              <div className="space-y-3">
                <div className="border-b border-slate-400 pb-1 h-12 flex items-end">
                  {data.providerSignature.signatureImage ? (
                    <img
                      src={data.providerSignature.signatureImage}
                      alt="Provider signature"
                      className="h-11 max-w-[160px] object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-base text-slate-800 font-semibold">
                      {data.providerSignature.name || ''}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900">
                    By: {data.providerSignature.name || 'Service Provider'}
                  </p>
                  <p className="text-slate-500">
                    Title: {data.providerSignature.title || 'Representative'}
                  </p>
                  <p className="text-slate-500">
                    Date: {formatDate(data.providerSignature.date) || '________________'}
                  </p>
                </div>
              </div>

              {/* Client Signature */}
              <div className="space-y-3">
                <div className="border-b border-slate-400 pb-1 h-12 flex items-end">
                  {data.clientSignature.signatureImage ? (
                    <img
                      src={data.clientSignature.signatureImage}
                      alt="Client signature"
                      className="h-11 max-w-[160px] object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-base text-slate-800 font-semibold">
                      {data.clientSignature.name || ''}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900">
                    By: {data.clientSignature.name || 'Authorized Client'}
                  </p>
                  <p className="text-slate-500">
                    Title: {data.clientSignature.title || 'Representative'}
                  </p>
                  <p className="text-slate-500">
                    Date: {formatDate(data.clientSignature.date) || '________________'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-5 border-t border-slate-100 text-[10px] text-slate-400 text-center mt-6 print:mt-4">
          Generated via InvoPact • Professional Legal & Freelance Contracts
        </div>
      </div>

      {/* Screen-only A4 Fit Indicator */}
      <div className="no-print mt-3.5 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-medium">Single-Sheet A4 Fit Guaranteed</span>
        <span className="text-slate-400 dark:text-slate-500">• Ready for Print or PDF Export</span>
      </div>
    </div>
  );
};
