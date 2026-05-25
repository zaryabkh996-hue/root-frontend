'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { ProgressProvider } from '../lib/progressContext';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      // First check localStorage (magic link users) - instant, no loading
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');

      // Role-based routing - redirect admin and custodian users
      if (token && role === 'admin') {
        router.push('/admin/dashboard');
        return;
      }

      if (token && role === 'custodian') {
        router.push('/custodian/dashboard');
        return;
      }

      if (token && role === 'customer') {
        setIsAuthenticated(true);
        return;
      }

      // Check Auth0 session via API (OAuth users)
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Populate localStorage with the backend token
            if (data.backendToken) {
              localStorage.setItem('authToken', data.backendToken);
              localStorage.setItem(
                'user',
                JSON.stringify(data.backendUser ?? data.user)
              );
              localStorage.setItem('oauth_user', 'true');
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
              router.push('/custodian/dashboard');
              return;
            }

            // For customer or no role - allow access to protected layout
            setIsAuthenticated(true);
            return;
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }

      // No authentication found - redirect immediately (no loading state)
      router.push('/login');
    };

    checkAuthentication();
  }, [router]);

  if (!isAuthenticated) {
    // Redirect is in progress - render nothing (no loading spinner)
    return null;
  }

  return (
    <ProgressProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <button className="crisis-btn">SOS · Talk to a human</button>
          {children}
          <button onClick={() => router.push('/amen')} className="amen-bubble">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Ask Amen AI
          </button>
        </main>
      </div>
    </ProgressProvider>
  );
};

export default ProtectedLayout;
