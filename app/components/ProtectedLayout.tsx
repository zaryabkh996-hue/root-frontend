'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { ProgressProvider } from '../lib/progressContext';
import { useNotification } from '../lib/NotificationContext';
import CommandPalette from './CommandPalette';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { notification, hideNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Shortcut listener for Cmd+K and Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        const response = await fetch('/fe-api/auth/user');
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
            const finalUser = data.backendUser ?? data.user;
            if (finalUser && !finalUser.onboarded) {
              router.push('/onboarding');
              return;
            }

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
      {/* Notification Toast */}
      {notification && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            zIndex: 9999, 
            minWidth: '300px',
            background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : notification.type === 'info' ? 'rgba(59, 130, 246, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            padding: '16px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(4px)',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: '4px', fontSize: '13px' }}>
            {notification.type === 'success' ? '✓ Success' : notification.type === 'error' ? '⚠ Error' : 'ℹ Info'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
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
              color: '#fff',
              opacity: 0.7
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

       <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          {/* Desktop Search Toggle */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:block"
            style={{
              position: 'fixed',
              top: '30px',
              right: '220px',
              zIndex: 90,
              background: 'rgba(10, 24, 16, 0.9)',
              color: 'var(--cream)',
              border: '1px solid rgba(201, 161, 74, 0.3)',
              borderRadius: '30px',
              padding: '6px 14px',
              fontSize: '10.5px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
            }}
          >
            🔍 Search <kbd style={{ marginLeft: '4px', fontSize: '9px', opacity: 0.6 }}>⌘K</kbd>
          </button>
          
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden"
            style={{
              position: 'fixed',
              top: '40px',
              right: '180px',
              zIndex: 90,
              background: 'rgba(10, 24, 16, 0.9)',
              color: 'var(--cream)',
              border: '1px solid rgba(201, 161, 74, 0.3)',
              borderRadius: '30px',
              padding: '5px 12px',
              fontSize: '9.5px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
            }}
          >
            🔍 Search
          </button>

          <button 
            onClick={() => router.push('/amenai?trigger_sos=true')}
            className="crisis-btn"
          >
            SOS · Talk to a human
          </button>
          {children}
          
          <button onClick={() => router.push('/amenai')} className="amen-bubble">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Ask Amen AI
          </button>

          <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </main>
      </div>
    </ProgressProvider>
  );
};

export default ProtectedLayout;
