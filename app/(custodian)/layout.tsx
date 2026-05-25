import React from 'react';
import CustodianLayout from '@/app/components/CustodianLayout';

export default function CustodianRootLayout({ children }: { children: React.ReactNode }) {
  return <CustodianLayout>{children}</CustodianLayout>;
}
