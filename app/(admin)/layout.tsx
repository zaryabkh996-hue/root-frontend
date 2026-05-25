import React from 'react';
import AdminLayout from '@/app/components/AdminLayout';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

const AdminLayoutWrapper: React.FC<AdminLayoutWrapperProps> = ({ children }) => {
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminLayoutWrapper;
