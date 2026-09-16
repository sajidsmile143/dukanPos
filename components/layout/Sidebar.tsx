'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Zap, 
  QrCode,
  FileText
} from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'POS Billing',
    path: '/pos',
    icon: ShoppingCart,
    badge: 'F9',
    description: 'Fast Billing & Cart',
  },
  {
    label: 'Inventory & Stock',
    path: '/products',
    icon: Package,
    description: 'Products & Expiry Alerts',
  },
  {
    label: 'Customer Khata',
    path: '/customers',
    icon: Users,
    description: 'Ledger & Reminders',
  },
  {
    label: 'Analytics Dashboard',
    path: '/dashboard',
    icon: BarChart3,
    description: 'Sales & Profit Reports',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        {/* Brand Banner */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
            D
          </div>
          <div>
            <h2 className="font-bold text-white text-base leading-tight tracking-tight">
              Dukaan POS
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
              Pakistan Retail v1.0
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Main Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path === '/pos' && pathname === '/');

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <div>
                    <div className="leading-tight">{item.label}</div>
                    <div className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Feature Highlights */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/50">
          <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] leading-tight">
            FBR Tier-1 Tax Sync Enabled (Sandbox Ready)
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Zero-Network Offline Queue</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
      </div>
    </aside>
  );
}
