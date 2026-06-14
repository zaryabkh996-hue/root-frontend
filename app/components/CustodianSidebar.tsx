'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const CustodianSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  const goto = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  
  
   
    localStorage.removeItem('oauth_user');

    localStorage.removeItem('ourroots_progress');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ background: 'var(--c-amber)', color: 'var(--c-navy-deep)' }}
      >
        ☰
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="cust-side">
        {/* Logo */}
        <div 
          onClick={() => router.push('/custodian/dashboard')}
          className="cust-side-logo flex items-center gap-3 px-3 py-4 hover:opacity-95 transition-all"
          style={{ cursor: 'pointer' }}
        >
          <img src="/logo-icon.svg" alt="Our Roots Africa" className="w-12 h-12 flex-shrink-0" />
          <div className="flex flex-col">
            <div className="font-serif text-lg font-bold leading-tight text-[#f0ebe0]">
              OurRoots<span className="text-[#c9a14a]">.Africa</span>
            </div>
            <div className="text-[8px] text-[#c9a14a] font-mono tracking-[0.2em] font-bold mt-0.5 leading-none">
              CUSTODIAN PORTAL
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="cust-user-card">
          <div className="avatar avatar-photo" style={{ width: '34px', height: '34px', fontSize: '12px', border: '2px solid rgba(201,161,74,0.5)' }}>
            {user?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div className="cust-user-name">{user?.name || 'Custodian'}</div>
            
            <div className="cust-cert-badge">{user?.certification || 'Afrofeast Certified'}</div>
          </div>
        </div>

        {/* Share section */}
        <div className="cust-share-section">
          <div className="cust-share-label">Share my profile</div>
          <div className="cust-share-btns">
            <button
              onClick={() => {
                const link = user?.whatsapp || `https://wa.me/?text=Check out my profile on OurRoots: ${window.location.origin}/custodians/${user?.id}`;
                window.open(link.startsWith('http') ? link : `https://wa.me/${link}`, '_blank');
              }}
              className="cust-share-btn"
              style={{ background: 'rgba(37,211,102,0.15)', borderColor: 'rgba(37,211,102,0.4)', color: '#a7f3d0' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#4ade80">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.76.46 3.41 1.26 4.84L2 22l5.31-1.23A10 10 0 1012 2zm0 18.16a8.12 8.12 0 01-4.14-1.14l-.3-.18-3.13.82.84-3.04-.2-.31A8.13 8.13 0 013.84 12c0-4.51 3.67-8.18 8.16-8.18 4.51 0 8.18 3.67 8.18 8.18 0 4.51-3.67 8.16-8.16 8.16z" />
              </svg>
              WhatsApp
            </button>
            <button
              onClick={() => {
                const link = user?.linkedin || `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.origin}/custodians/${user?.id}`;
                window.open(link.startsWith('http') ? link : `https://www.linkedin.com/in/${link}`, '_blank');
              }}
              className="cust-share-btn"
              style={{ background: 'rgba(10,102,194,0.15)', borderColor: 'rgba(10,102,194,0.4)', color: '#93c5fd' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#93c5fd">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </button>
            <button
              onClick={() => {
                const link = user?.instagram || `https://www.instagram.com/`;
                window.open(link.startsWith('http') ? link : `https://www.instagram.com/${link}`, '_blank');
              }}
              className="cust-share-btn"
              style={{ background: 'rgba(225,48,108,0.12)', borderColor: 'rgba(225,48,108,0.35)', color: '#f9a8d4' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f9a8d4" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              IG
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="cust-side-section">Navigation</div>

        <div className={`cust-nav-item ${isActive('/custodian/dashboard') ? 'active' : ''}`} onClick={() => goto('/custodian/dashboard')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </div>

        <div className={`cust-nav-item ${isActive('/custodian/training') ? 'active' : ''}`} onClick={() => goto('/custodian/training')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          Heritage Training
        </div>

        <div className={`cust-nav-item ${isActive('/custodian/clients') ? 'active' : ''}`} onClick={() => goto('/custodian/clients')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          My Clients
        </div>

        <div className={`cust-nav-item ${isActive('/custodian/profile') ? 'active' : ''}`} onClick={() => goto('/custodian/profile')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21v-1a8 8 0 0116 0v1" />
          </svg>
          My Profile
        </div>

        <div className={`cust-nav-item ${isActive('/custodian/earnings') ? 'active' : ''}`} onClick={() => goto('/custodian/earnings')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
          Earnings
        </div>

        <div className={`cust-nav-item`} onClick={() => goto('/custodian/contribute')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Contribute Knowledge
        </div>

        <div className={`cust-nav-item`} onClick={() => goto('/custodian/lounge')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          Custodian Lounge
        </div>

        {/* Status section */}
        <div className="cust-status-section">
          <div className="cust-status-label">Standing</div>
          <span className="status-ok">✓ Good standing</span>
          <div className="cust-status-text">0 warnings · {user?.sessions || 0} sessions<br />{user?.review_avg || '5.0'} avg Afrofeast Review</div>
        </div>

        {/* Logout */}
        <div style={{ marginTop: 'auto', padding: '16px 0', borderTop: '1px solid var(--c-line)' }}>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default CustodianSidebar;
