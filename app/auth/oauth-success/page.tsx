'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = name + '=; Max-Age=0; path=/';
}

export default function OAuthSuccess() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const sync = async () => {
      // Get quiz token from query params or sessionStorage
      let quizToken = null;
      try {
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          quizToken = searchParams.get('quiz_token') || sessionStorage.getItem('quizToken');
        }
      } catch (e) {
        console.error('Error reading quiz token:', e);
      }

      // Primary path: read handoff cookies set by onCallback in lib/auth0.ts
      const backendToken = readCookie('_oauth_bt');
      const backendUserRaw = readCookie('_oauth_bu');

      if (backendToken) {
        let backendUser: Record<string, unknown> | null = null;
        try {
          backendUser = backendUserRaw ? JSON.parse(backendUserRaw) : null;
        } catch (_) {
          // ignore parse errors
        }

        localStorage.setItem('authToken', backendToken);
        localStorage.setItem('user', JSON.stringify(backendUser ?? {}));
        localStorage.setItem('oauth_user', 'true');
        localStorage.setItem('userRole', (backendUser as any)?.role || 'customer');
        if (quizToken) {
          localStorage.setItem('quizToken', quizToken);
        }

        deleteCookie('_oauth_bt');
        deleteCookie('_oauth_bu');

        // Save quiz data if token exists
        if (quizToken && backendUser && typeof backendUser === 'object' && 'id' in backendUser) {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
            const res = await fetch(`${apiUrl}/auth/save-quiz-data`, {
              method: 'POST',
              headers: AuthService.getAuthHeaders(),
              body: JSON.stringify({
                user_id: (backendUser as Record<string, any>).id,
                quiz_token: quizToken
              })
            });
            if (res.ok) {
              const resData = await res.json();
              if (resData.success && resData.data?.user) {
                localStorage.setItem('user', JSON.stringify(resData.data.user));
              }
            }
            // Clear quiz token from sessionStorage after saving
            sessionStorage.removeItem('quizToken');
          } catch (err) {
            console.error('Error saving quiz data:', err);
            // Continue anyway - quiz data save failure shouldn't block login
          }
        }

        const isNewUser = backendUser && (backendUser as any).is_new_user;
        if (isNewUser && quizToken) {
          router.push('/readiness');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      // Fallback: call /fe-api/auth/user if cookies were missing
      try {
        const response = await fetch('/fe-api/auth/user');

        if (!response.ok) {
          setError('Authentication failed. Please try signing in again.');
          return;
        }

        const data = await response.json();

        if (!data.user) {
          setError('No session found. Please try signing in again.');
          return;
        }

        if (data.backendToken) {
          localStorage.setItem('authToken', data.backendToken);
          localStorage.setItem('user', JSON.stringify(data.backendUser ?? data.user));
          localStorage.setItem('oauth_user', 'true');
          localStorage.setItem('userRole', data.backendUser?.role || 'customer');

          // Save quiz data if token exists
          if (quizToken && data.backendUser?.id) {
            try {
              const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
              const res = await fetch(`${apiUrl}/auth/save-quiz-data`, {
                method: 'POST',
                headers: AuthService.getAuthHeaders(),
                body: JSON.stringify({
                  user_id: data.backendUser.id,
                  quiz_token: quizToken
                })
              });
              if (res.ok) {
                const resData = await res.json();
                if (resData.success && resData.data?.user) {
                  localStorage.setItem('user', JSON.stringify(resData.data.user));
                }
              }
              // Clear quiz token from sessionStorage after saving
              sessionStorage.removeItem('quizToken');
            } catch (err) {
              console.error('Error saving quiz data:', err);
              // Continue anyway - quiz data save failure shouldn't block login
            }
          }
        }

        const isNewUser = data.backendUser && data.backendUser.is_new_user;
        if (isNewUser && quizToken) {
          router.push('/readiness');
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('[oauth-success] fallback error:', err);
        setError('Network error. Please try again.');
      }
    };

    sync();
  }, [router]);

  if (error) {
    return (
      <div className="bg-forest-deepest min-h-screen flex items-center justify-center px-8">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-light text-cream mb-2">Something went wrong</h1>
          <p className="text-cream/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/register')}
            className="px-5 py-3 bg-brass text-forest-deepest font-semibold rounded"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-forest-deepest min-h-screen flex items-center justify-center px-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-brass/20 flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-8 rounded-full border-4 border-brass border-t-transparent animate-spin" />
        </div>
        <h1 className="text-3xl font-light text-cream mb-2">Signing you in&hellip;</h1>
        <p className="text-cream/70">Setting up your account, just a moment.</p>
      </div>
    </div>
  );
}
