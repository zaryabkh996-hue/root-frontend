'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AdminSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const goto = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ background: '#c9a14a', color: '#1a1f35' }}
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
      <aside
        className={`admin-side fixed md:static top-0 left-0 h-screen w-64 transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div 
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-3 px-3 py-4 mb-4 cursor-pointer hover:opacity-95 transition-all"
          >
            <img src="/logo-icon.svg" alt="Our Roots Africa" className="w-12 h-12 flex-shrink-0" />
            <div className="flex flex-col">
              <div className="font-serif text-lg font-bold leading-tight text-[#f3ede0]">
                OurRoots<span className="text-[#c9a14a]">.Africa</span>
              </div>
              <div className="text-[8px] text-[#c9a14a] font-mono tracking-[0.2em] font-bold mt-0.5 leading-none">
                ADMIN PORTAL
              </div>
            </div>
          </div>

          {/* Admin info */}
          <div className="admin-user-tag" style={{ margin: '20px 14px 20px 14px', flex: '0 0 auto' }}>
            <div className="admin-user-tag-name">3Men Pty Ltd</div>
            <div className="admin-user-tag-role">Admin · Dennis Obel</div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 ">
            {/* Platform Section */}
            <div className="admin-side-section">Platform</div>

            <div
              className={`admin-nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
              onClick={() => goto('/admin/dashboard')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>Overview</span>
            </div>

            <div
              className={`admin-nav-item ${isActive('/admin/users') ? 'active' : ''}`}
              onClick={() => goto('/admin/users')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0116 11" />
              </svg>
              <span>Users</span>
            </div>

            <div
              className={`admin-nav-item ${isActive('/admin/custodians') ? 'active' : ''}`}
              onClick={() => goto('/admin/custodians')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 10-16 0" />
              </svg>
              <span>Custodians</span>
            </div>

 <div
              className={`admin-nav-item ${isActive('/admin/conduct') ? 'active' : ''}`}
              onClick={() => goto('/admin/conduct')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Code of Conduct</span>
              {isActive('/admin/conduct') && <span className="admin-nav-badge">2</span>}
            </div>
  
            <div
              className={`admin-nav-item ${isActive('/admin/reviews') ? 'active' : ''}`}
              onClick={() => goto('/admin/reviews')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Afrofeast Reviews</span>
            </div>

           

        
            <div
              className={`admin-nav-item ${isActive('/admin/financial') ? 'active' : ''}`}
              onClick={() => goto('/admin/financial')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              <span>Financial</span>
            </div>

            <div
              className={`admin-nav-item ${isActive('/admin/content') ? 'active' : ''}`}
              onClick={() => goto('/admin/content')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20V2H6.5A2.5 2.5 0 004 4.5z" />
              </svg>
              <span>Content</span>
            </div>

            <div
              className={`admin-nav-item ${isActive('/admin/stories') ? 'active' : ''}`}
              onClick={() => goto('/admin/stories')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Story Reviews</span>
            </div>
          </nav>

          {/* Logout */}
          <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                background: '#1f2937',
                color: '#f9fafb',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#374151')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#1f2937')}
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
