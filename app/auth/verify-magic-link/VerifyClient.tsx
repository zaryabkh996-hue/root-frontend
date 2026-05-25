'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type VerificationState = 'verifying' | 'success' | 'error';

export default function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>('verifying');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setState('error');
        setError('No verification token provided. Please check your email link.');
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

        const response = await fetch(`${apiUrl}/auth/magic-link/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok) {
          setState('error');
          setError(data.message || 'Failed to verify magic link');
          return;
        }

        // Save auth token and user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userRole', data.user.role);
        }

        setState('success');
        setMessage('Registration successful! Redirecting to dashboard...');

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);

      } catch (err) {
        setState('error');
        setError('Network error during verification. Please try again.');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="bg-forest-deepest min-h-screen flex items-center justify-center px-8">
      <div className="max-w-md w-full">
        {state === 'verifying' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-brass/20 flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="display text-3xl font-light text-cream mb-2">Verifying your link...</h1>
            <p className="text-cream/70">
              Hold tight while we set up your account
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-brass/20 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brass-light)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 className="display text-3xl font-light text-cream mb-2">Welcome home!</h1>
            <p className="text-cream/70 mb-4">
              {message}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-brass-light">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-6-6 6 6-6 6"></path>
              </svg>
              Redirecting...
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-rose/20 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h1 className="display text-3xl font-light text-cream mb-2">Verification failed</h1>
            <p className="text-cream/70 mb-6">
              {error}
            </p>
            <button
              onClick={() => router.push('/register')}
              className="btn-primary"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .btn-primary {
          background: var(--brass);
          color: var(--forest-deepest);
          border: none;
          padding: 12px 20px;
          border-radius: 3px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: var(--brass-light);
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
