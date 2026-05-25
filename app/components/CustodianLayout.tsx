'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustodianSidebar from './CustodianSidebar';

interface CustodianLayoutProps {
  children: React.ReactNode;
}

const CustodianLayout: React.FC<CustodianLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');

      // Redirect admin users to admin portal
      if (token && role === 'admin') {
        router.push('/admin/dashboard');
        return;
      }

      if (token && role === 'custodian') {
        setIsAuthenticated(true);
        return;
      }

      if (token && !role) {
        // Token exists but no role set — allow access (dev/demo mode)
        setIsAuthenticated(true);
        return;
      }

      // Try Auth0 session
      try {
        const res = await fetch('/api/auth/user');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            if (data.backendToken) {
              localStorage.setItem('authToken', data.backendToken);
              localStorage.setItem('user', JSON.stringify(data.backendUser ?? data.user));
            }

            // Check backend role and redirect if needed
            const backendRole = data.backendUser?.role;
            if (backendRole === 'admin') {
              localStorage.setItem('userRole', 'admin');
              router.push('/admin/dashboard');
              return;
            }

            if (backendRole === 'custodian') {
              localStorage.setItem('userRole', 'custodian');
              setIsAuthenticated(true);
              return;
            }

            // For other roles, still allow (dev/demo mode)
            setIsAuthenticated(true);
            return;
          }
        }
      } catch (_) {}

      router.push('/login');
    };

    checkAuth();
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <div className="cust-screen">
      <div className="cust-shell">
        <CustodianSidebar />
        <main className="cust-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CustodianLayout;
