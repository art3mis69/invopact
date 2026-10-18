import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { InvoiceData } from '../types';
import { formatDate, formatCurrency, generateQrPayload } from '../utils/formatters';

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  const qrPayload = data.payment.showQr
    ? generateQrPayload(data.payment.method, {
        upiId: data.payment.upiId,
        accountName: data.payment.accountName || data.sender.name,
        amount: data.total,
        currency: data.currency,
        paypalEmail: data.payment.paypalEmail,
        paymentLink: data.payment.paymentLink,
      })
    : null;

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 overflow-x-auto w-full">
      {/* A4 Sheet Container - strictly white with dark text regardless of dark mode */}
      <div
        id="invoice-preview-sheet"
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

        {/* Vintage Rubber Stamp for PAID Status */}
        {data.status === 'paid' && data.showPaidStamp !== false && (
          <div className="absolute top-10 right-10 pointer-events-none select-none z-10">
            <div className="border-4 border-emerald-600/80 text-emerald-600/90 font-black tracking-widest uppercase text-xl px-4 py-1.5 rounded-lg -rotate-12 shadow-xs bg-emerald-50/20 backdrop-blur-[0.5px] flex flex-col items-center">
              <span>PAID</span>
              <span className="text-[9px] font-semibold tracking-normal normal-case opacity-80">{formatDate(data.issueDate)}</span>
            </div>
          </div>
        )}

        <div className="space-y-6 relative z-1">
          {/* Top Header & Accent Bar */}
          <div>
            <div
              className="h-1.5 w-full rounded-full mb-5"
              style={{ backgroundColor: data.accentColor }}
            />

            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {data.sender.logoUrl && (
                  <img
                    src={data.sender.logoUrl}
                    alt="Logo"
                    className="h-12 w-auto max-w-[120px] object-contain rounded"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {data.title || 'INVOICE'}
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    #{data.invoiceNumber || 'INV-0000'}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1 text-xs">
                <div className="flex sm:justify-end gap-3 text-slate-600">
                  <span className="text-slate-400 font-medium">Issue Date:</span>
                  <span className="font-semibold text-slate-800">{formatDate(data.issueDate)}</span>
                </div>
                <div className="flex sm:justify-end gap-3 text-slate-600">
                  <span className="text-slate-400 font-medium">Payment Due:</span>
                  <span className="font-semibold text-slate-800">{formatDate(data.dueDate)}</span>
                </div>
                <div className="pt-1 flex sm:justify-end">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      data.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : data.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : data.status === 'overdue'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {data.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parties Section (From & Bill To) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-3 border-t border-slate-100 text-xs">
            {/* Sender */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                From
              </span>
              <p className="font-bold text-sm text-slate-900">
                {data.sender.name || (
                  <span className="text-slate-400 font-normal italic print:hidden">
                    [Your Name / Business]
                  </span>
                )}
              </p>
              {data.sender.company && (
                <p className="font-medium text-slate-700">{data.sender.company}</p>
              )}
              {data.sender.email && <p className="text-slate-600">{data.sender.email}</p>}
              {data.sender.phone && <p className="text-slate-600">{data.sender.phone}</p>}
              {data.sender.address && (
                <p className="text-slate-500 whitespace-pre-line leading-relaxed pt-0.5">
                  {data.sender.address}
                </p>
              )}
              {data.sender.taxId && (
                <p className="text-slate-500 pt-0.5 font-mono text-[11px]">
                  Tax ID: {data.sender.taxId}
                </p>
              )}
            </div>

            {/* Client / Bill To */}
            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Billed To
              </span>
              <p className="font-bold text-sm text-slate-900">
                {data.client.name || (
                  <span className="text-slate-400 font-normal italic print:hidden">
                    [Client Name / Contact]
                  </span>
                )}
              </p>
              {data.client.company && (
                <p className="font-medium text-slate-700">{data.client.company}</p>
              )}
              {data.client.email && <p className="text-slate-600">{data.client.email}</p>}
              {data.client.phone && <p className="text-slate-600">{data.client.phone}</p>}
              {data.client.address && (
                <p className="text-slate-500 whitespace-pre-line leading-relaxed pt-0.5">
                  {data.client.address}
                </p>
              )}
              {data.client.taxId && (
                <p className="text-slate-500 pt-0.5 font-mono text-[11px]">
                  Tax ID: {data.client.taxId}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="pt-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2 w-8">#</th>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center w-16">Qty</th>
                  <th className="py-2 text-right w-24">Unit Rate</th>
                  <th className="py-2 text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item, idx) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="py-2.5 text-slate-400 font-mono text-[11px] align-top">{idx + 1}</td>
                    <td className="py-2.5 pr-4 font-medium text-slate-900 align-top">
                      {item.description || (
                        <span className="text-slate-400 font-normal italic print:hidden">
                          [Item or service description]
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-center align-top whitespace-nowrap">
                      <span>{item.quantity}</span>
                      {item.unit && (
                        <span className="text-[10px] text-slate-500 font-medium ml-1">
                          {item.unit}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono align-top">
                      {formatCurrency(item.rate, data.currency)}
                    </td>
                    <td className="py-2.5 text-right font-semibold font-mono text-slate-900 align-top">
                      {formatCurrency(item.amount, data.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Breakdown & Payment */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-5 pt-3 border-t border-slate-200">
            {/* Payment Coordinates Box & QR */}
            <div className="w-full sm:w-7/12 bg-slate-50/70 p-3.5 rounded-lg border border-slate-100 text-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Payment Instructions
              </span>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  {data.payment.method === 'bank' && (
                    <>
                      {data.payment.bankName ? (
                        <p className="text-slate-700">
                          <span className="text-slate-400">Bank:</span> {data.payment.bankName}
                        </p>
                      ) : null}
                      {data.payment.accountName ? (
                        <p className="text-slate-700">
                          <span className="text-slate-400">Account:</span>{' '}
                          {data.payment.accountName}
                        </p>
                      ) : null}
                      {data.payment.accountNumber ? (
                        <p className="text-slate-700 font-mono">
                          <span className="text-slate-400 font-sans">Account #:</span>{' '}
                          {data.payment.accountNumber}
                        </p>
                      ) : null}
                      {data.payment.routingOrSwift ? (
                        <p className="text-slate-700 font-mono text-[11px]">
                          <span className="text-slate-400 font-sans">Routing/SWIFT:</span>{' '}
                          {data.payment.routingOrSwift}
                        </p>
                      ) : null}
                      {!data.payment.bankName && !data.payment.accountNumber && (
                        <p className="text-slate-400 italic text-[11px]">
                          Bank details will appear here once entered.
                        </p>
                      )}
                    </>
                  )}

                  {data.payment.method === 'upi' && (
                    <>
                      <p className="text-slate-700">
                        <span className="text-slate-400">Pay via UPI:</span>{' '}
                        <span className="font-semibold text-slate-900">{data.payment.upiId || '—'}</span>
                      </p>
                      {data.payment.accountName && (
                        <p className="text-slate-600 text-[11px]">
                          Payee: {data.payment.accountName}
                        </p>
                      )}
                    </>
                  )}

                  {data.payment.method === 'paypal' && (
                    <p className="text-slate-700">
                      <span className="text-slate-400">PayPal:</span>{' '}
                      <span className="font-semibold text-slate-900">
                        {data.payment.paypalEmail || '—'}
                      </span>
                    </p>
                  )}

                  {data.payment.method === 'custom' && (
                    <p className="text-slate-700 break-all">
                      <span className="text-slate-400">Payment Link:</span>{' '}
                      {data.payment.paymentLink ? (
                        <a
                          href={data.payment.paymentLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 underline font-medium"
                        >
                          {data.payment.paymentLink}
                        </a>
                      ) : (
                        '—'
                      )}
                    </p>
                  )}

                  {data.payment.notes && (
                    <p className="text-[11px] text-slate-500 italic pt-1">{data.payment.notes}</p>
                  )}
                </div>

                {/* Optional QR Code */}
                {data.payment.showQr && qrPayload && (
                  <div className="shrink-0 flex flex-col items-center bg-white p-1.5 rounded-md border border-slate-200">
                    <QRCodeSVG
                      value={qrPayload}
                      size={64}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                    />
                    <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-tighter mt-0.5">
                      Scan to Pay
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="w-full sm:w-5/12 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between py-0.5">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(data.subtotal, data.currency)}</span>
              </div>

              {data.discountAmount > 0 && (
                <div className="flex justify-between py-0.5 text-emerald-600">
                  <span>Discount ({data.discountRate}%)</span>
                  <span className="font-mono">
                    -{formatCurrency(data.discountAmount, data.currency)}
                  </span>
                </div>
              )}

              {/* Dual vs Single Tax breakdown */}
              {data.taxType === 'dual' ? (
                <>
                  {data.taxAmount > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span>{data.taxName || 'Tax 1'} ({data.taxRate}%)</span>
                      <span className="font-mono">
                        +{formatCurrency(data.taxAmount, data.currency)}
                      </span>
                    </div>
                  )}
                  {(data.taxAmount2 || 0) > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span>{data.taxName2 || 'Tax 2'} ({data.taxRate2}%)</span>
                      <span className="font-mono">
                        +{formatCurrency(data.taxAmount2 || 0, data.currency)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                data.taxAmount > 0 && (
                  <div className="flex justify-between py-0.5">
                    <span>{data.taxName || 'Tax'} ({data.taxRate}%)</span>
                    <span className="font-mono">
                      +{formatCurrency(data.taxAmount, data.currency)}
                    </span>
                  </div>
                )
              )}

              {data.shippingFee > 0 && (
                <div className="flex justify-between py-0.5">
                  <span>Shipping / Extra</span>
                  <span className="font-mono">
                    +{formatCurrency(data.shippingFee, data.currency)}
                  </span>
                </div>
              )}

              <div
                className="flex justify-between pt-2 pb-0.5 border-t-2 border-slate-900 text-slate-900 font-extrabold text-base"
                style={{ color: data.accentColor }}
              >
                <span>Total Due</span>
                <span className="font-mono">{formatCurrency(data.total, data.currency)}</span>
              </div>

              {/* Optional Authorized Digital Signature */}
              {data.authorizedSignature?.signatureImage && (
                <div className="pt-3 border-t border-slate-200 text-right">
                  <img
                    src={data.authorizedSignature.signatureImage}
                    alt="Authorized signature"
                    className="h-9 max-w-[130px] ml-auto object-contain"
                  />
                  <div className="border-t border-slate-300 pt-0.5 mt-0.5">
                    <p className="font-bold text-[10px] text-slate-800">
                      {data.authorizedSignature.name || data.sender.name}
                    </p>
                    <p className="text-[9px] text-slate-400">Authorized Signature</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Notes & Terms */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 mt-6 print:mt-4">
          {data.notes && (
            <div>
              <span className="font-bold text-slate-600 uppercase text-[9px] tracking-wider block">
                Notes
              </span>
              <p className="text-slate-600 leading-relaxed">{data.notes}</p>
            </div>
          )}

          {data.terms && (
            <div>
              <span className="font-bold text-slate-600 uppercase text-[9px] tracking-wider block">
                Terms & Conditions
              </span>
              <p className="text-slate-500 leading-relaxed">{data.terms}</p>
            </div>
          )}

          <div className="pt-1 text-center text-[10px] text-slate-400">
            Generated via InvoPact • Professional & Frictionless Invoicing
          </div>
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
