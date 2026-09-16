'use client';

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
