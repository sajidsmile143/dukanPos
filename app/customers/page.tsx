'use client';

import React, { useState } from 'react';
import { Customer, Store } from '@/lib/types';
import { INITIAL_CUSTOMERS, INITIAL_STORE } from '@/lib/mock-data';
import { generateWhatsAppKhataReminderUrl } from '@/lib/whatsapp';
import { CustomerModal, PaymentCollectModal } from '@/components/customers/KhataModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  MessageSquare, 
  DollarSign, 
  BookOpen, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [store, setStore] = useState<Store>(INITIAL_STORE);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [collectingCustomer, setCollectingCustomer] = useState<Customer | null>(null);

  const handleSaveCustomer = (data: Partial<Customer>) => {
    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomer.id ? ({ ...c, ...data } as Customer) : c))
      );
      toast.success(`Updated customer ${data.name}`);
      setEditingCustomer(null);
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        store_id: store.id,
        name: data.name || 'New Customer',
        phone: data.phone || '',
        address: data.address || '',
        current_balance: data.current_balance || 0,
        created_at: new Date().toISOString(),
      };
      setCustomers((prev) => [newCust, ...prev]);
      toast.success(`Added ${newCust.name} to Khata Ledger`);
      setShowAddModal(false);
    }
  };

  const handlePaymentCollect = (amount: number, notes: string) => {
    if (!collectingCustomer) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === collectingCustomer.id) {
          const newBal = Math.max(0, c.current_balance - amount);
          return { ...c, current_balance: newBal };
        }
        return c;
      })
    );

    toast.success(`Received PKR ${amount.toLocaleString()} from ${collectingCustomer.name}`);
    setCollectingCustomer(null);
  };

  const totalKhataDebt = customers.reduce((sum, c) => sum + Math.max(0, c.current_balance), 0);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner & KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Customer Khata Ledger
            </h1>
            <p className="text-xs text-slate-500">
              Track customer credit accounts, receive debt payments, and send instant WhatsApp reminders
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Total Receivables Metric */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Total Outstanding Khata Debt
          </span>
          <div className="text-3xl font-black text-amber-400 my-1">
            PKR {totalKhataDebt.toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Active across {customers.filter((c) => c.current_balance > 0).length} customer ledgers
          </div>
        </div>
      </div>

      {/* Live Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Customer Name or Phone Number..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredCustomers.length} customer(s)
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Phone (WhatsApp)</th>
                <th className="p-3.5">Address</th>
                <th className="p-3.5 text-right">Khata Balance</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-400">
                    No customer accounts found matching search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const hasDebt = c.current_balance > 0;
                  const waUrl = generateWhatsAppKhataReminderUrl(c, store);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                        <span className="text-[10px] text-slate-400">ID: #{c.id.slice(-6)}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {c.phone}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{c.address || '—'}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className={`font-black text-sm ${hasDebt ? 'text-amber-700' : 'text-emerald-700'}`}>
                          PKR {c.current_balance.toLocaleString('en-PK')}
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          hasDebt ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {hasDebt ? 'Pending Due' : 'Paid Up'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasDebt && (
                            <>
                              <button
                                onClick={() => setCollectingCustomer(c)}
                                className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                Collect
                              </button>

                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                                title="Send WhatsApp Reminder"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                WhatsApp
                              </a>
                            </>
                          )}

                          <button
                            onClick={() => setEditingCustomer(c)}
                            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-100"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {(showAddModal || editingCustomer) && (
        <CustomerModal
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onClose={() => {
            setShowAddModal(false);
            setEditingCustomer(null);
          }}
        />
      )}

      {collectingCustomer && (
        <PaymentCollectModal
          customer={collectingCustomer}
          onCollect={handlePaymentCollect}
          onClose={() => setCollectingCustomer(null)}
        />
      )}
    </div>
  );
}
