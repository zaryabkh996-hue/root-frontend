'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

      const response = await fetch(`${apiUrl}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to login. Please check your credentials.');
        setIsSubmitting(false);
        return;
      }

      // Store token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.role);
      }

      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-forest-deepest min-h-screen text-cream">
      <div className="max-w-md mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="eyebrow eyebrow-cream mb-3 ornament">Admin Access</div>
          <h1 className="display text-4xl font-light leading-tight mb-3">
            Administrator Login
          </h1>
          <p className="text-cream/70 leading-relaxed">
            Enter your credentials to access the admin dashboard.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose/20 border border-rose/40 rounded-sm">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p className="text-rose text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mb-6">
          {/* Email Field */}
          <div>
            <label className="eyebrow eyebrow-cream block mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="field-dark w-full"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="eyebrow eyebrow-cream block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field-dark w-full pr-10"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/50 hover:text-cream transition-colors"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-5-11-5s1.678-1.694 2.908-2.906m5.032-5.026A9.98 9.98 0 0 1 12 4c7 0 11 5 11 5s-1.333 1.364-2.612 2.62m-5.597 5.573A3 3 0 1 0 9.427 9.427"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center disabled:opacity-60 mt-6"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-brass/15"></div>
          <span className="text-xs text-cream/50 mono">ADMIN ONLY</span>
          <div className="flex-1 h-px bg-brass/15"></div>
        </div>

        {/* Security Notice */}
        <div className="scard-dark p-4 text-center">
          <p className="text-xs text-cream/60 leading-relaxed">
            This is a restricted area. Unauthorized access attempts are logged and monitored.
          </p>
        </div>
      </div>

      <style jsx>{`
        .field-dark {
          background: rgba(243, 237, 224, 0.08);
          border: 1px solid rgba(201, 161, 74, 0.2);
          border-radius: 3px;
          padding: 12px 16px;
          font-family: inherit;
          font-size: 16px;
          color: var(--cream);
          transition: all 0.2s;
        }

        .field-dark::placeholder {
          color: rgba(243, 237, 224, 0.4);
        }

        .field-dark:focus {
          outline: none;
          border-color: var(--brass);
          box-shadow: 0 0 0 3px rgba(201, 161, 74, 0.15);
        }

        .field-dark:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

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

        .btn-primary:hover:not(:disabled) {
          background: var(--brass-light);
        }

        .btn-primary:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .eyebrow-cream {
          color: rgba(201, 161, 74, 0.7);
        }

        .scard-dark {
          background: var(--forest-mid);
          border: 1px solid rgba(201, 161, 74, 0.15);
          border-radius: 3px;
        }

        .mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .ornament::before,
        .ornament::after {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: var(--brass);
        }

        .ornament {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
