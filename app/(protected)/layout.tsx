import React from 'react';
import ProtectedLayout from '@/app/components/ProtectedLayout';
import { NotificationProvider } from '@/app/lib/NotificationContext';

export default function RootProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </NotificationProvider>
  );
}
