'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');

      // Redirect non-admin users
      if (token && role === 'custodian') {
        router.push('/custodian/dashboard');
        return;
      }

      if (token && role === 'customer') {
        router.push('/dashboard');
        return;
      }

      // Check if user has admin role
      if (token && role === 'admin') {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Try Auth0 session
      try {
        const res = await fetch('/api/auth/user');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            // Check backend role
            const backendRole = data.backendUser?.role;

            if (backendRole === 'custodian') {
              localStorage.setItem('userRole', 'custodian');
              router.push('/custodian/dashboard');
              return;
            }

            if (backendRole === 'customer') {
              localStorage.setItem('userRole', 'customer');
              router.push('/dashboard');
              return;
            }

            // Admin role
            if (backendRole === 'admin') {
              if (data.backendToken) {
                localStorage.setItem('authToken', data.backendToken);
                localStorage.setItem('userRole', 'admin');
                localStorage.setItem('user', JSON.stringify(data.backendUser ?? data.user));
              }
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (_) {}

      // Not authenticated or not admin
      router.push('/login');
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#fafaf9'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#1a1f35', marginBottom: '12px' }}>
            OurRoots.Africa
          </div>
          <div style={{ fontSize: '13px', color: '#999' }}>Loading admin portal...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafaf9' }}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
       
          {children}
       
      </main>
    </div>
  );
};

export default AdminLayout;
