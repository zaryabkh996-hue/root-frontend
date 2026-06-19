'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<string>('community');

  useEffect(() => {
    const syncSubscription = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
        const token = AuthService.getToken();

        if (!token) {
          setError('Authentication token not found in local storage.');
          setLoading(false);
          return;
        }

        // Fetch user profile from the backend to get the updated subscription_tier
        const response = await fetch(`${backendUrl}/user/profile`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const profileData = await response.json();
          if (profileData.data) {
            const userProfile = profileData.data;
            
            // Sync user object in localStorage
            const userRaw = localStorage.getItem('user');
            if (userRaw) {
              const localUser = JSON.parse(userRaw);
              localUser.subscription_tier = userProfile.subscriptionTier;
              localStorage.setItem('user', JSON.stringify(localUser));
            }
            
            setTier(userProfile.subscriptionTier || 'community');
          }
        } else {
          setError('We could not verify your subscription immediately, but it is being processed.');
        }
      } catch (err) {
        console.error('Error syncing subscription:', err);
        setError('An error occurred while confirming your subscription.');
      } finally {
        setLoading(false);
      }
    };

    syncSubscription();
  }, [sessionId]);

  const handleGoToDashboard = () => {
    router.push('/modules');
  };

  return (
    <div 
      className="scard-dark p-8 md:p-12 w-full max-w-xl text-center relative z-10"
      style={{
        border: '1px solid rgba(201, 161, 74, 0.25)',
        background: 'var(--forest-deep)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
      }}
    >
      {loading ? (
        <div className="space-y-6 py-8">
          <div className="animate-spin w-12 h-12 border-4 border-brass border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-cream/70 font-mono tracking-wider">SECURELY SYNCING YOUR SANCTUARY ACCESS...</p>
        </div>
      ) : (
        <>
          <div 
            className="w-20 h-20 bg-brass/10 border border-brass/40 rounded-full flex items-center justify-center text-brass text-4xl mx-auto mb-8 animate-bounce"
            style={{ boxShadow: '0 0 20px rgba(201, 161, 74, 0.15)' }}
          >
            ✓
          </div>
          
          <div className="eyebrow eyebrow-cream mb-3 tracking-widest text-brass">TRANSACTION SECURED</div>
          <h2 className="display text-4xl md:text-5xl font-light mb-4 text-cream font-serif">
            Welcome, Relative
          </h2>

          {error ? (
            <div className="mb-8">
              <p className="text-sm text-amber-300 leading-relaxed max-w-md mx-auto">
                {error}
              </p>
              <p className="text-xs text-cream/50 mt-4 leading-relaxed max-w-md mx-auto">
                Please refresh the page, or check back in a few minutes. Stripe webhooks will activate your account automatically once the payment settles.
              </p>
            </div>
          ) : (
            <p className="text-sm text-cream/80 leading-relaxed mb-8 max-w-md mx-auto">
              Your payment was successful and your account is now upgraded to the <strong className="text-brass-light capitalize font-serif font-semibold">{tier}</strong> tier. Your digital sanctuary and heritage journey are fully ready for you.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleGoToDashboard} 
              className="btn-primary w-full sm:w-auto px-8 py-3 justify-center text-sm font-semibold"
            >
              Go to Learning Dashboard
            </button>
            <button 
              onClick={() => router.push('/profile')} 
              className="btn-ghost-dark w-full sm:w-auto px-8 py-3 justify-center text-sm"
            >
              View Billing &amp; Profile
            </button>
          </div>

          <div className="text-[10px] text-cream/40 mono mt-10 tracking-widest uppercase">
            OurRoots.Africa · Sanctuary Edition 2026
          </div>
        </>
      )}
    </div>
  );
}

export default function SubscriptionSuccess() {
  return (
    <div className="min-h-screen bg-forest-deepest text-cream flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brass filter blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-700 filter blur-[120px]" />
      </div>

      <Suspense fallback={
        <div className="scard-dark p-8 md:p-12 w-full max-w-xl text-center relative z-10" style={{ border: '1px solid rgba(201, 161, 74, 0.25)', background: 'var(--forest-deep)', borderRadius: '12px' }}>
          <div className="space-y-6 py-8">
            <div className="animate-spin w-12 h-12 border-4 border-brass border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-cream/70 font-mono tracking-wider">LOADING YOUR PAYMENT DETAILS...</p>
          </div>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
    </div>
  );
}
