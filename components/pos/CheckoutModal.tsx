'use client';

import React, { useState } from 'react';
import { Sale, Customer, Store, CartItem } from '@/lib/types';
import { generateWhatsAppInvoiceUrl } from '@/lib/whatsapp';
import { 
  CreditCard, 
  Banknote, 
  BookOpen, 
  MessageSquare, 
  Printer, 
  CheckCircle2, 
  X, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import ThermalReceipt from './ThermalReceipt';
import { toast } from 'sonner';

interface CheckoutModalProps {
  cart: CartItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  store: Store;
  customers: Customer[];
  onCompleteSale: (saleData: {
    paymentMethod: 'cash' | 'card' | 'khata';
    customerId?: string;
    customerName?: string;
    amountPaid: number;
  }) => Promise<Sale | null>;
  onClose: () => void;
}

export default function CheckoutModal({
  cart,
  subtotal,
  taxAmount,
  discount,
  grandTotal,
  store,
  customers,
  onCompleteSale,
  onClose,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'khata'>('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>(grandTotal.toFixed(0));
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const cashGiven = parseFloat(amountPaid) || 0;
  const changeDue = Math.max(0, cashGiven - grandTotal);

  const handleCheckout = async () => {
    if (paymentMethod === 'khata' && !selectedCustomerId) {
      toast.error('Please select a customer for Khata credit sale!');
      return;
    }

    setIsProcessing(true);
    try {
      const sale = await onCompleteSale({
        paymentMethod,
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomer?.name,
        amountPaid: cashGiven,
      });

      if (sale) {
        setCompletedSale(sale);
        toast.success(`Invoice ${sale.invoice_no} created & FBR synced!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (completedSale) {
    const waUrl = generateWhatsAppInvoiceUrl(
      completedSale,
      store,
      selectedCustomer?.phone
    );

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="w-full max-w-lg space-y-4">
          <ThermalReceipt sale={completedSale} store={store} onClose={onClose} />

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Send Customer Invoice</p>
              <p className="text-sm font-bold text-slate-800">WhatsApp Instant Receipt</p>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Send WhatsApp Receipt
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Complete Checkout
            </h2>
            <p className="text-xs text-slate-400">Select payment option & confirm sale</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Total Payable Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Total Amount Payable
            </span>
            <div className="text-3xl font-black text-emerald-700 mt-0.5">
              PKR {grandTotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-emerald-700/80 mt-1">
              <span>Subtotal: PKR {subtotal.toFixed(0)}</span>
              <span>•</span>
              <span>FBR GST ({store.tax_rate}%): PKR {taxAmount.toFixed(0)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all font-semibold text-xs ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                Cash
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all font-semibold text-xs ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-blue-600" />
                Card / POS
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('khata')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all font-semibold text-xs ${
                  paymentMethod === 'khata'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <BookOpen className="w-5 h-5 mb-1 text-amber-600" />
                Khata (Credit)
              </button>
            </div>
          </div>

          {/* Cash Details */}
          {paymentMethod === 'cash' && (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Cash Received (PKR)
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Change Due
                </label>
                <div className="text-lg font-bold text-emerald-700 pt-1">
                  PKR {changeDue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          )}

          {/* Customer Selection for Khata or Invoice standard */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Customer Ledger (Khata) {paymentMethod === 'khata' && <span className="text-red-500">* Required</span>}
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Walk-in Cash Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - Current Khata: PKR {c.current_balance.toLocaleString()}
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Selected: <span className="font-bold text-slate-700">{selectedCustomer.name}</span> ({selectedCustomer.phone})
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Cancel (Esc)
          </button>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50"
          >
            {isProcessing ? 'Processing & FBR Sync...' : 'Complete & Print (F9)'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
