import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const goto = (page: string) => {
  
      router.push(`/${page}`);
    
    setIsOpen(false); // Close mobile menu after navigation
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('oauth_user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('ourroots_progress');
    router.push('/login');
  };

  const isActive = (page: string) => {
    if (page === 'dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    if (page === 'modules') {
      return pathname.startsWith('/modules');
    }
    return pathname === `/${page}`;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-brass text-forest-deepest rounded-lg"
      >
        ☰
      </button>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-screen w-64
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          z-40 overflow-y-auto app-side
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-3 px-3 py-4 mb-4 cursor-pointer hover:opacity-95 transition-all"
          >
            <img src="/logo-icon.svg" alt="Our Roots Africa" className="w-12 h-12 flex-shrink-0" />
            <div className="flex flex-col">
              <div className="font-serif text-lg font-bold leading-tight text-[#f3ede0]">
                OurRoots<span className="text-[#c9a14a]">.Africa</span>
              </div>
              <div className="text-[8px] text-[#c9a14a] font-mono tracking-[0.2em] font-bold mt-0.5 leading-none">
                SANCTUARY
              </div>
            </div>
          </div>
          <div className="eyebrow eyebrow-cream px-3 mb-3" style={{fontSize: '9px'}}>Sanctuary</div>

          {/* Navigation */}
          <nav className="flex-1">
            <div className={`nav-item ${isActive('dashboard') ? 'active' : ''}`} onClick={() => goto('dashboard')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </div>
            <div className={`nav-item ${isActive('modules') ? 'active' : ''}`} onClick={() => goto('modules')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
              Six-Stage Journey
            </div>
            <div className={`nav-item ${isActive('library') ? 'active' : ''}`} onClick={() => goto('library')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20V2H6.5A2.5 2.5 0 004 4.5z"></path>
              </svg>
              Library
            </div>
            <div className={`nav-item ${isActive('custodians') ? 'active' : ''}`} onClick={() => goto('custodians')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0116 11"></path>
              </svg>
              Custodians
            </div>
            <div className={`nav-item ${isActive('amen') ? 'active' : ''}`} onClick={() => goto('amenai')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
              </svg>
              Amen AI
            </div>
            <div className={`nav-item ${isActive('community') ? 'active' : ''}`} onClick={() => goto('community')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              Community
            </div>
            <div className={`nav-item ${isActive('profile') ? 'active' : ''}`} onClick={() => goto('profile')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 21v-1a8 8 0 0116 0v1"></path>
              </svg>
              Profile
            </div>
          </nav>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-brass/10 px-3">
            <div className="eyebrow eyebrow-cream mb-2" style={{fontSize: '9px'}}>Tier</div>
            <div className="text-sm font-medium text-cream mb-1">Preparation</div>
            <div className="text-xs text-cream/50 mono mb-4">Active · renews 12 Jun · access until period end</div>
            <button className="text-xs text-brass-light/80 hover:text-brass-light underline mb-4">Manage subscription</button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-900 bg-opacity-30 text-red-300 hover:bg-red-900 hover:bg-opacity-50 transition-all duration-300 font-semibold"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
