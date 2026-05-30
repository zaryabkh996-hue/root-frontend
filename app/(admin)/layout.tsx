import React from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import { NotificationProvider } from '@/app/lib/NotificationContext';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

const AdminLayoutWrapper: React.FC<AdminLayoutWrapperProps> = ({ children }) => {
  return (
    <NotificationProvider>
      <AdminLayout>{children}</AdminLayout>
    </NotificationProvider>
  );
};

export default AdminLayoutWrapper;
