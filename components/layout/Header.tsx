'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  WifiOff, 
  RefreshCw, 
  Keyboard, 
  ShieldCheck, 
  Clock,
  Menu
} from 'lucide-react';
import { getPendingOfflineSales, flushPendingOfflineSales } from '@/lib/offline-sync';
import { toast } from 'sonner';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Dukaan Retail & Pharmacy';

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setPendingCount(getPendingOfflineSales().length);

    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Network reconnected!');
      autoSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Switched to Offline Mode. Sales will queue locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const autoSync = async () => {
    const queue = getPendingOfflineSales();
    if (queue.length === 0) return;

    setIsSyncing(true);
    toast.info(`Flushing ${queue.length} offline sale(s) to server...`);
    
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const result = await flushPendingOfflineSales(async () => true);

    setIsSyncing(false);
    setPendingCount(getPendingOfflineSales().length);
    toast.success(`Successfully synced ${result.success} sale(s)!`);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 md:px-6 flex items-center justify-between shadow-xs z-30 relative shrink-0">
      {/* Left: Mobile Hamburger Toggle & Store Title */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <h1 className="font-bold text-slate-800 text-xs sm:text-sm md:text-base leading-snug truncate max-w-[150px] sm:max-w-none">
              {storeName}
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] md:text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 md:px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              FBR POS #123456
            </span>
          </div>
          <p className="text-[11px] md:text-xs text-slate-500 hidden sm:block">
            Main Boulevard, Lahore • NTN: 7891234-5
          </p>
        </div>
      </div>

      {/* Right: Network Status, Live Clock, Shortcuts */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Offline Queue Badge & Sync Button */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1 text-[11px] md:text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Online</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] md:text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              Offline
            </span>
          )}

          {pendingCount > 0 && (
            <button
              onClick={autoSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-lg shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync {pendingCount}
            </button>
          )}
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {currentTime}
        </div>

        {/* Shortcuts Cheat Sheet Modal Trigger */}
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>
      </div>

      {/* Shortcuts Modal Dropdown */}
      {showShortcuts && (
        <div className="absolute right-4 top-16 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-emerald-600" />
              POS Shortcuts
            </h3>
            <button 
              onClick={() => setShowShortcuts(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">Focus Barcode Search</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] font-bold bg-white border border-slate-300 rounded shadow-2xs">F2 /</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">Switch Payment Method</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] font-bold bg-white border border-slate-300 rounded shadow-2xs">F4</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">Select Customer (Khata)</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] font-bold bg-white border border-slate-300 rounded shadow-2xs">F8</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 font-medium">
              <span className="text-emerald-700">Checkout & Complete</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] font-bold bg-emerald-600 text-white rounded shadow-2xs">F9 / Enter</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">Clear Cart / Close Modal</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] font-bold bg-white border border-slate-300 rounded shadow-2xs">Esc</kbd>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
