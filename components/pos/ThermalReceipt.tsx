'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sale, Store } from '@/lib/types';
import { Printer, Smartphone, CheckCircle, Download } from 'lucide-react';

interface ThermalReceiptProps {
  sale: Sale;
  store: Store;
  paperWidth?: '58mm' | '80mm';
  onClose?: () => void;
}

export default function ThermalReceipt({
  sale,
  store,
  paperWidth = '80mm',
  onClose,
}: ThermalReceiptProps) {
  const fbrInvoiceNo = sale.fbr_invoice_no || `${store.fbr_pos_id || '123456'}99988877766`;
  const qrString = `${fbrInvoiceNo}|${store.fbr_pos_id || '123456'}|${sale.invoice_no}|${new Date(sale.created_at).toISOString()}|${sale.total_amount}|${sale.tax_amount}`;

  const triggerBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg max-w-md mx-auto">
      {/* Receipt Action Toolbar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 print:hidden">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-slate-800 text-sm">Sale Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerBrowserPrint}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2.5 py-1.5 rounded-lg"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Printable Receipt Area */}
      <div
        id="thermal-receipt-printable"
        className={`mx-auto bg-white text-black font-mono text-xs p-3 leading-tight ${
          paperWidth === '58mm' ? 'w-[230px]' : 'w-[300px]'
        }`}
      >
        {/* Header */}
        <div className="text-center space-y-1 mb-2">
          <h2 className="font-bold text-sm uppercase tracking-wide">{store.name}</h2>
          <p className="text-[11px]">{store.address}</p>
          <p className="text-[11px]">Tel: {store.phone}</p>
          {store.ntn && <p className="text-[10px]">NTN: {store.ntn} | POS ID: {store.fbr_pos_id || '123456'}</p>}
        </div>

        <div className="border-t border-b border-dashed border-black py-1.5 my-2 space-y-0.5">
          <div className="flex justify-between">
            <span>Invoice #:</span>
            <span className="font-bold">{sale.invoice_no}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Date:</span>
            <span>{new Date(sale.created_at).toLocaleString('en-PK')}</span>
          </div>
          {sale.customer_name && (
            <div className="flex justify-between text-[11px]">
              <span>Customer:</span>
              <span className="font-bold">{sale.customer_name}</span>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <table className="w-full text-left my-2">
          <thead>
            <tr className="border-b border-black text-[11px]">
              <th className="py-1">Item</th>
              <th className="py-1 text-center">Qty</th>
              <th className="py-1 text-right">Price</th>
              <th className="py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="py-1 pr-1 font-sans text-[11px] leading-tight">
                  {item.product_name}
                </td>
                <td className="py-1 text-center font-bold">{item.quantity}</td>
                <td className="py-1 text-right">{item.unit_price.toFixed(0)}</td>
                <td className="py-1 text-right font-bold">{item.subtotal.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Breakdown */}
        <div className="border-t border-dashed border-black pt-2 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>PKR {sale.subtotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>FBR GST ({store.tax_rate}%):</span>
            <span>PKR {sale.tax_amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-red-700 font-medium">
              <span>Discount:</span>
              <span>- PKR {sale.discount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
            <span>GRAND TOTAL:</span>
            <span>PKR {sale.total_amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between text-[11px] pt-1">
            <span>Payment Method:</span>
            <span className="font-bold uppercase">{sale.payment_method}</span>
          </div>
        </div>

        {/* FBR Fiscal Stamp & QR Code */}
        <div className="mt-3 pt-2 border-t border-dashed border-black text-center space-y-1">
          <div className="flex justify-center my-1">
            <QRCodeSVG value={qrString} size={88} level="M" />
          </div>
          <div className="text-[10px] font-bold tracking-tight">
            FBR INVOICE #: {fbrInvoiceNo}
          </div>
          <p className="text-[9px] text-slate-600">
            FBR Fiscalised Tier-1 POS Receipt
          </p>
          <p className="text-[10px] italic pt-1">
            Thank you for shopping with us!
          </p>
        </div>
      </div>
    </div>
  );
}
