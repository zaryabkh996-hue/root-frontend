import React from 'react';
import CustodianLayout from '@/app/components/CustodianLayout';
import { NotificationProvider } from '@/app/lib/NotificationContext';

export default function CustodianRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <CustodianLayout>{children}</CustodianLayout>
    </NotificationProvider>
  );
}
