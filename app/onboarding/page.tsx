'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<'step1' | 'step2' | 'saving'>('step1');
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [onboardingAnswers, setOnboardingAnswers] = useState({
    whatBroughtYouHere: '',
    travelTimeline: '',
  });
  const [quizToken, setQuizToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = searchParams.get('quiz_token');
      if (tokenFromUrl) {
        setQuizToken(tokenFromUrl);
        sessionStorage.setItem('quizToken', tokenFromUrl);
      } else {
        setQuizToken(sessionStorage.getItem('quizToken'));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userRaw = localStorage.getItem('user');

      setAuthToken(token);

      if (token && userRaw) {
        try {
          const user = JSON.parse(userRaw);
          if (user && user.onboarded) {
            router.push('/dashboard');
            return;
          }
        } catch (e) {
          console.error('Error checking user onboard status:', e);
        }
      }
    }
  }, [router]);

  const handleSelectOnboarding1 = (val: string) => {
    setOnboardingAnswers(prev => ({ ...prev, whatBroughtYouHere: val }));
    setStep('step2');
  };

  const handleSelectOnboarding2 = async (val: string) => {
    const updated = { ...onboardingAnswers, travelTimeline: val };
    setOnboardingAnswers(updated);
    setStep('saving');

    const tokenToUse = authToken || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    const tokenVal = quizToken || (typeof window !== 'undefined' ? sessionStorage.getItem('quizToken') : null);

    if (!tokenToUse) {
      // Guest Mode: Store in sessionStorage and redirect to readiness report
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('onboardingAnswers', JSON.stringify(updated));

        // Save onboarding answers to backend cache using quizToken
        if (tokenVal) {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
            await fetch(`${apiUrl}/quiz/onboarding`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quiz_token: tokenVal,
                onboarding_answers: updated
              })
            });
          } catch (e) {
            console.error('Error saving onboardingAnswers to backend cache:', e);
          }
        }
      }
      const tokenQuery = tokenVal ? `?quiz_token=${tokenVal}` : '';
      setTimeout(() => router.push(`/register${tokenQuery}`), 800);
      return;
    }

    // Authenticated Mode: Save to Database
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

      const res = await fetch(`${apiUrl}/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
          learning_preference: updated.whatBroughtYouHere,
          travel_date: updated.travelTimeline
        })
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.data?.user) {
          localStorage.setItem('user', JSON.stringify(resData.data.user));
        }
        setTimeout(() => router.push('/dashboard'), 800);
      } else {
        console.error('Failed to save onboarding data:', await res.text());
        // Proceed to dashboard page anyway to avoid blocking the user
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    } catch (err) {
      console.error('Network error during onboarding save:', err);
      setTimeout(() => router.push('/dashboard'), 1000);
    }
  };

  const handleBack = () => {
    if (step === 'step2') {
      setStep('step1');
    }
  };

  return (
    <div className="bg-forest-deepest min-h-screen text-cream flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-8 py-12">

        {/* Step 1: What brought you here? */}
        {step === 'step1' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-10">
              <div className="eyebrow eyebrow-cream mb-4 ornament">Step 1 of 2</div>
              <h1 className="display text-5xl font-light leading-tight mb-6">
                What brought you here?
              </h1>
              <p className="text-cream/70 text-lg leading-relaxed max-w-xl mx-auto">
                Help us understand your connection to the continent to guide your return.
              </p>
            </div>

            <div className="space-y-3 mb-10">
              {[
                { value: 'DNA result', label: 'DNA result' },
                { value: 'Heritage trip planning', label: 'Heritage trip planning' },
                { value: 'Citizenship journey', label: 'Citizenship journey' },
                { value: 'General interest', label: 'General interest' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelectOnboarding1(opt.value)}
                  className="onboard-option"
                >
                  <div className="flex items-center gap-3">
                    <span className="opt-key font-bold text-brass">➔</span>
                    <span className="text-base font-medium text-cream">{opt.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Travel Timeline */}
        {step === 'step2' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-10">
              <div className="eyebrow eyebrow-cream mb-4 ornament">Step 2 of 2</div>
              <h1 className="display text-5xl font-light leading-tight mb-6">
                Travel timeline
              </h1>
              <p className="text-cream/70 text-lg leading-relaxed max-w-xl mx-auto">
                When are you hoping to stand on African soil?
              </p>
            </div>

            <div className="space-y-3 mb-10">
              {[
                { value: 'In the next 3 months', label: 'In the next 3 months' },
                { value: 'In the next 6~12 months', label: 'In the next 6~12 months' },
                { value: 'In the next 1-2 years', label: 'In the next 1-2 years' },
                { value: 'Not planning a trip yet', label: 'Not planning a trip yet' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelectOnboarding2(opt.value)}
                  className="onboard-option"
                >
                  <div className="flex items-center gap-3">
                    <span className="opt-key font-bold text-brass">➔</span>
                    <span className="text-base font-medium text-cream">{opt.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-line">
              <button onClick={handleBack} className="btn-ghost-dark">
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Saving State */}
        {step === 'saving' && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-brass/15 flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="display text-3xl font-light mb-3">Aligning your journey map...</h2>
            <p className="text-cream/70 max-w-sm mx-auto leading-relaxed">
              Saving your responses.
            </p>
          </div>
        )}

      </div>

      <style jsx>{`
        .onboard-option {
          background: var(--forest-mid);
          border: 1px solid rgba(201, 161, 74, 0.15);
          color: var(--cream);
          border-radius: 6px;
          padding: 16px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .onboard-option:hover {
          border-color: rgba(201, 161, 74, 0.4);
          background: var(--forest-light);
        }

        .opt-key {
          display: inline-flex;
          width: 24px;
          height: 24px;
          align-items: center;
          justify-content: center;
          background: rgba(201, 161, 74, 0.1);
          border-radius: 50%;
          flex-shrink: 0;
          font-size: 12px;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
