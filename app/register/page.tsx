'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState<'form' | 'sent'>('form');
  const [quizData, setQuizData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Retrieve name and quiz data from sessionStorage
    const reportData = sessionStorage.getItem('quizReport');
    if (reportData) {
      try {
        const data = JSON.parse(reportData);
        setName(data.name || '');
        setQuizData(data);
      } catch (e) {
        console.error('Error parsing report data:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

      const response = await fetch(`${apiUrl}/auth/magic-link/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          whatsapp: whatsapp || null,
          quiz_data: quizData
        })
      });

      console.log('Magic link response:', response);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send magic link');
        setIsSubmitting(false);
        return;
      }

      // Move to "sent" stage
      setStage('sent');
      setIsSubmitting(false);

    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    // Reset and allow resubmit
    setStage('form');
    setError('');
  };

  return (
    <div className="bg-forest-deepest min-h-screen text-cream">
      <div className="max-w-md mx-auto px-8 py-16">

        {stage === 'form' ? (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="eyebrow eyebrow-cream mb-3 ornament">Save your result</div>
              <h1 className="display text-4xl font-light leading-tight mb-3">
                Welcome home, <em className="italic text-brass-light">{name || 'friend'}</em>.
              </h1>
              <p className="text-cream/70 leading-relaxed">
                Create an account so we can save your readiness profile and reach you on WhatsApp with the next step.
              </p>
            </div>

            {/* Google & Apple Buttons */}
            <div className="space-y-4 mb-6">
              <a href="/auth/login?connection=google-oauth2&returnTo=/auth/oauth-success" className="btn-secondary w-full justify-center block text-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 12.27c0-.78-.07-1.53-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"></path><path d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"></path></svg>
                Continue with Google
              </a>
              <a href="/auth/login?connection=apple&returnTo=/auth/oauth-success" className="btn-secondary w-full justify-center block text-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"></path></svg>
                Continue with Apple
              </a>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-brass/15"></div>
              <span className="text-xs text-cream/50 mono">OR</span>
              <div className="flex-1 h-px bg-brass/15"></div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-rose/20 border border-rose/40 rounded-sm">
                <p className="text-rose text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="eyebrow eyebrow-cream block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amara@example.com"
                  className="field-dark w-full"
                  required
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="eyebrow eyebrow-cream block mb-2">WhatsApp number</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+1 404 ..."
                  className="field-dark w-full"
                />
                <p className="text-xs text-cream/50 mt-2">
                  We'll send you Stage 1 unlock + journey check-ins. Opt-out any time.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center disabled:opacity-60"
              >
                {isSubmitting ? 'Sending magic link...' : 'Send me a magic link'}
              </button>
            </form>

            {/* Privacy Notice */}
            <p className="text-xs text-cream/50 text-center">
              By continuing you agree to our Privacy Policy. Your readiness data is encrypted and never sold.
            </p>
          </>
        ) : (
          <>
            {/* Success Stage */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-brass/20 flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brass-light)" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <h2 className="display text-3xl font-light mb-3">Check your email</h2>

              <p className="text-cream/70 mb-8 leading-relaxed">
                We've sent a magic link to <strong className="text-brass-light">{email}</strong>
              </p>

              <div className="scard-dark p-6 mb-8">
                <div className="text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-brass-light text-lg">1.</span>
                    <span className="text-cream text-sm">Open the email from OurRoots.Africa</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brass-light text-lg">2.</span>
                    <span className="text-cream text-sm">Click the "Complete Registration" button</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brass-light text-lg">3.</span>
                    <span className="text-cream text-sm">You'll be logged in and taken to your dashboard</span>
                  </div>
                </div>
              </div>

              <div className="bg-brass/10 border border-brass/30 rounded-sm p-4 mb-8">
                <p className="text-xs text-cream/70 mono">
                  ⏱️ Link expires in <strong>15 minutes</strong>
                </p>
              </div>

              <button
                onClick={handleResendEmail}
                className="btn-ghost-dark w-full"
              >
                Didn't receive it? Try again
              </button>

              <p className="text-xs text-cream/50 text-center mt-6">
                Check your spam folder or try a different email
              </p>
            </div>
          </>
        )}
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

        .btn-secondary {
          background: transparent;
          color: var(--cream);
          border: 1px solid rgba(201, 161, 74, 0.3);
          padding: 12px 16px;
          border-radius: 3px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          border-color: var(--brass);
          color: var(--brass-light);
        }

        .btn-ghost-dark {
          background: transparent;
          color: var(--cream);
          padding: 9px 14px;
          border-radius: 2px;
          font-weight: 500;
          font-size: 13px;
          border: 1px solid rgba(201, 161, 74, 0.3);
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .btn-ghost-dark:hover {
          border-color: var(--brass);
          color: var(--brass-light);
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

        .ornament::before, .ornament::after {
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

