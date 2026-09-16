import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Dukaan POS - Pakistan Retail & Pharmacy Management',
  description: 'Ultra-fast Retail POS with FBR Fiscal Integration, Thermal Printing, WhatsApp Receipts, and Offline Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden flex bg-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50">
            {children}
          </main>
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
