import React from 'react';
import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function RootProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
