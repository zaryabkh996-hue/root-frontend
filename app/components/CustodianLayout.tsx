'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustodianSidebar from './CustodianSidebar';
import { useNotification } from '@/app/lib/NotificationContext';

interface CustodianLayoutProps {
  children: React.ReactNode;
}

const CustodianLayout: React.FC<CustodianLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { notification, hideNotification } = useNotification();
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
      {/* Notification */}
      {notification && (
        <div 
          className={`a-alert ${notification.type === 'error' ? 'a-alert-high' : notification.type === 'info' ? 'a-alert-med' : 'a-alert-low'}`}
          style={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            zIndex: 2000, 
            minWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div className="a-alert-title" style={{ textTransform: 'capitalize' }}>
            {notification.type === 'success' ? '✓ Success' : notification.type === 'error' ? '⚠ Error' : 'ℹ Info'}
          </div>
          <div className="a-alert-sub" style={{ color: '#111', marginBottom: 0 }}>
            {notification.message}
          </div>
          <button 
            onClick={hideNotification}
            style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '16px',
              color: '#6b7280'
            }}
          >
            ×
          </button>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

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
