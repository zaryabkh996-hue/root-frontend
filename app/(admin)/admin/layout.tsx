import React from 'react';

interface AdminSubLayoutProps {
  children: React.ReactNode;
}

const AdminSubLayout: React.FC<AdminSubLayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default AdminSubLayout;
