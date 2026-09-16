import type { Metadata } from 'next';
import './globals.css';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';
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
      <body>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
