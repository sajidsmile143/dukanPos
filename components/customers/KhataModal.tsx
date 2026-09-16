'use client';

import React, { useState } from 'react';
import { Customer } from '@/lib/types';
import { X, UserPlus, Save, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerModalProps {
  customer?: Customer | null;
  onSave: (customerData: Partial<Customer>) => void;
  onClose: () => void;
}

export function CustomerModal({ customer, onSave, onClose }: CustomerModalProps) {
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [balance, setBalance] = useState(customer?.current_balance ? String(customer.current_balance) : '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Customer Name and Phone Number are required!');
      return;
    }

    onSave({
      id: customer?.id,
      name,
      phone,
      address,
      current_balance: parseFloat(balance) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <h2 className="font-bold text-base flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chaudhry Rashid Sahib"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number (WhatsApp) *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +92 321 4567890"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House #, Colony, City..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Opening Khata Debt Balance (PKR)
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Positive amount indicates customer owes store money.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PaymentCollectModalProps {
  customer: Customer;
  onCollect: (amount: number, notes: string) => void;
  onClose: () => void;
}

export function PaymentCollectModal({ customer, onCollect, onClose }: PaymentCollectModalProps) {
  const [amount, setAmount] = useState(String(customer.current_balance));
  const [notes, setNotes] = useState('Khata cash payment received');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount) || 0;
    if (val <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }
    onCollect(val, notes);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <h2 className="font-bold text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Receive Khata Payment
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-emerald-800">
              Customer: {customer.name}
            </span>
            <div className="text-xl font-black text-emerald-700 mt-0.5">
              Current Due: PKR {customer.current_balance.toLocaleString('en-PK')}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Received (PKR) *
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment reference / cash receipt notes"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
