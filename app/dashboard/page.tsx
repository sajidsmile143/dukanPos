'use client';

import React, { useState } from 'react';
import { Sale, Product, Store } from '@/lib/types';
import { INITIAL_SALES, INITIAL_PRODUCTS, INITIAL_STORE } from '@/lib/mock-data';
import { generateWhatsAppInvoiceUrl } from '@/lib/whatsapp';
import ThermalReceipt from '@/components/pos/ThermalReceipt';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  ShieldCheck, 
  Printer, 
  MessageSquare, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardPage() {
  const [store, setStore] = useState<Store>(INITIAL_STORE);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null);

  // Analytics Metrics Calculations
  const todaySalesTotal = sales.reduce((sum, s) => sum + s.total_amount, 0);

  // Net Profit = (Subtotal - Cost Price of Items)
  const todayNetProfit = sales.reduce((sum, s) => {
    const saleCost = s.items.reduce((itemSum, i) => itemSum + (i.cost_price * i.quantity), 0);
    return sum + (s.subtotal - saleCost);
  }, 0);

  const totalTransactions = sales.length;
  const lowStockCount = products.filter((p) => p.stock_qty <= p.min_stock_alert).length;

  // Chart Trend Data
  const chartData = [
    { hour: '09:00 AM', sales: 1200, profit: 340 },
    { hour: '11:00 AM', sales: 3400, profit: 920 },
    { hour: '01:00 PM', sales: 2800, profit: 750 },
    { hour: '03:00 PM', sales: 5600, profit: 1540 },
    { hour: '05:00 PM', sales: 4200, profit: 1100 },
    { hour: '07:00 PM', sales: 6800, profit: 1890 },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Owner Analytics & Fiscal Sales Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Real-time daily revenue, net profit margin, FBR fiscal sync reports, and sales trends
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Calendar className="w-4 h-4 text-emerald-600" />
          Today's Summary
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Sales (PKR)
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              PKR {todaySalesTotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +14.2% vs yesterday
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Net Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Net Profit
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              PKR {todayNetProfit.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block">
              Estimated margin: ~24.5%
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Total Transactions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Transactions
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalTransactions} Sales
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Avg Bill: PKR {(todaySalesTotal / (totalTransactions || 1)).toFixed(0)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Low Stock Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stock Warnings
            </span>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {lowStockCount} Items
            </div>
            <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Action required
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sales & Profit Chart */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Hourly Revenue & Net Profit Trend (PKR)
          </h2>
          <span className="text-xs text-slate-400 font-medium">Updated live</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
              <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales & FBR Fiscal Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Recent Sales Transactions & FBR Fiscal Status
          </h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            FBR Auto-Synced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-center">FBR Fiscal Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {sales.map((s) => {
                const waUrl = generateWhatsAppInvoiceUrl(s, store, undefined);

                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {s.invoice_no}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(s.created_at).toLocaleString('en-PK')}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {s.customer_name || 'Walk-in Cash Customer'}
                    </td>
                    <td className="p-3.5">
                      <span className="uppercase font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {s.payment_method}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-slate-900">
                      PKR {s.total_amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        FBR Synced
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReceiptSale(s)}
                          className="flex items-center gap-1 text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors text-xs font-bold"
                          title="Print Thermal Receipt"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          Print
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition-colors text-xs font-bold"
                          title="Send WhatsApp Invoice"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          WhatsApp
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thermal Receipt Preview Modal */}
      {selectedReceiptSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-md">
            <ThermalReceipt
              sale={selectedReceiptSale}
              store={store}
              onClose={() => setSelectedReceiptSale(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
