'use client';

import { useEffect, useState } from 'react';

export default function HeaderAuthButtons() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashPath, setDashPath] = useState('/dashboard');

  useEffect(() => {
    const check = async () => {
      // Check localStorage first (magic link users)
      if (localStorage.getItem('authToken')) {
        const role = localStorage.getItem('userRole');
        setIsLoggedIn(true);
        if (role === 'custodian') setDashPath('/custodian/dashboard');
        else if (role === 'admin') setDashPath('/admin/dashboard');
        else setDashPath('/dashboard');
        return;
      }
      // Check Auth0 session (OAuth users) without throwing 401 errors in console
      try {
        const res = await fetch('/fe-api/auth/check-session');
        if (res.ok) {
          const data = await res.json();
          if (data.session?.user) {
            setIsLoggedIn(true);
            setDashPath('/dashboard');
          }
        }
      } catch {
        // ignore
      }
    };
    check();
  }, []);

  if (isLoggedIn) {
    return (
      <a
        href={dashPath}
        className="btn-primary inline-flex"
        style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
      >
        Dashboard →
      </a>
    );
  }

  return (
    <>
      <a
        href="/login"
        className="btn-secondary inline-flex"
        style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
      >
        Login →
      </a>
      <a
        href="/onboarding"
        className="btn-primary inline-flex"
        style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
      >
        Begin →
      </a>
    </>
  );
}
