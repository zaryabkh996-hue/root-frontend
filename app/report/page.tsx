'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReportData {
  name: string;
  totalScore: number;
  scores: {
    identity: number;
    emotional: number;
    authenticity: number;
    protocol: number;
    community: number;
  };
  tier: string;
  persona: string;
  tier_display: string;
}

const getDimensionLabel = (value: number): string => {
  if (value >= 80) return 'High';
  if (value >= 60) return 'Strong';
  if (value >= 40) return 'Medium';
  if (value >= 20) return 'Developing';
  return 'Emerging';
};

const getDimensionTag = (value: number): string => {
  if (value >= 80) return 'tag-emerald';
  if (value >= 60) return 'tag-brass';
  if (value >= 40) return 'tag-brass';
  return 'tag-terra';
};

const getRationale = (totalScore: number): string => {
  if (totalScore < 40) {
    return 'Your responses show early-stage readiness with plenty of room for growth. Stage 1 (Emotional Preparation) will give you the foundation you need to begin this journey with intention.';
  } else if (totalScore < 60) {
    return 'Your responses show emerging readiness with room to grow in several areas. We routed you to Community because the structured cultural fluency materials will support you most at this stage.';
  } else {
    return 'Your responses show strong readiness across multiple dimensions. You are prepared for our most comprehensive tier. The Preparation track will deepen your mastery and prepare you for an immersive return home.';
  }
};

const getTierDescription = (tier: string): string => {
  if (tier === 'Latent') {
    return 'Foundation Explorer';
  } else if (tier === 'Active') {
    return 'Cultural Intelligence & Community';
  }
  return 'Immersive Preparation & Mastery';
};

export default function Report() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem('quizReport');
    if (data) {
      setReportData(JSON.parse(data));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="display text-2xl mb-4">Loading your report...</div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="display text-3xl mb-4">No quiz data found</div>
          <p className="text-ink-dim mb-6">Please complete the quiz first.</p>
          <button onClick={() => router.push('/quiz')} className="btn-primary">
            Take the quiz →
          </button>
        </div>
      </div>
    );
  }

  const rationale = getRationale(reportData.totalScore);
  const ringProgress = (reportData.totalScore / 100) * 552.9;
  const ringOffset = 552.9 - ringProgress;

  return (
    <div className="bg-cream min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Registration Gate */}
        <div
          className="bg-forest-deepest text-cream rounded-lg p-7 md:p-8 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div>
            <div className="eyebrow eyebrow-cream mb-3">Your Travel DNA Score is ready</div>
            <div className="display text-xl md:text-2xl mb-2">
              You scored <span className="text-brass">{reportData.totalScore}</span> — {reportData.persona} ·{' '}
              {getTierDescription(reportData.tier)}
            </div>
            <p className="text-cream/70 text-sm leading-relaxed max-w-md">
              This is a preview. To unlock your full Readiness Report, Amen AI guidance, and the six-stage preparation
              curriculum, create your free account. Only enrolled members have scores registered on the platform.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto md:flex-shrink-0">
            <button 
              onClick={() => router.push('/register')}
              className="btn-primary w-full md:w-auto justify-center whitespace-nowrap"
            >
              Create free account →
            </button>
            <button className="btn-secondary w-full md:w-auto justify-center whitespace-nowrap">
              View preview only
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="eyebrow mb-4 ornament">Your Readiness Report</div>
          <h1 className="display text-5xl md:text-6xl font-light leading-tight mb-4">
            Welcome home, <em className="italic text-brass-dim">{reportData.name}</em>.
          </h1>
          <p className="text-ink-dim text-lg mb-4">
            You are in the <strong className="text-ink">{getTierDescription(reportData.tier)}</strong> stage.
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="eyebrow">Your archetype</span>
            <span className="tag tag-brass">{reportData.persona}</span>
          </div>
        </div>

        {/* Score Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-14 items-start">
          {/* Circular Indicator */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="readiness-ring">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(201,161,74,0.15)" strokeWidth="10"></circle>
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke="#c9a14a"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="552.9"
                  strokeDashoffset={ringOffset}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="display text-5xl font-light leading-none">{reportData.totalScore}</div>
                <div className="eyebrow mt-2">Readiness</div>
              </div>
            </div>
          </div>

          {/* Dimensional Cards */}
          <div className="lg:col-span-3 space-y-3">
            <div className="scard p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Identity & Belonging</span>
                <span className={`tag ${getDimensionTag(reportData.scores.identity)}`}>
                  {getDimensionLabel(reportData.scores.identity)}
                </span>
              </div>
              <div className="dim-bar">
                <div
                  className="dim-bar-fill"
                  style={{ width: `${reportData.scores.identity}%`, transition: 'width 0.8s ease' }}
                ></div>
              </div>
            </div>

            <div className="scard p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Emotional Readiness</span>
                <span className={`tag ${getDimensionTag(reportData.scores.emotional)}`}>
                  {getDimensionLabel(reportData.scores.emotional)}
                </span>
              </div>
              <div className="dim-bar">
                <div
                  className="dim-bar-fill"
                  style={{ width: `${reportData.scores.emotional}%`, transition: 'width 0.8s ease' }}
                ></div>
              </div>
            </div>

            <div className="scard p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Authenticity</span>
                <span className={`tag ${getDimensionTag(reportData.scores.authenticity)}`}>
                  {getDimensionLabel(reportData.scores.authenticity)}
                </span>
              </div>
              <div className="dim-bar">
                <div
                  className="dim-bar-fill"
                  style={{ width: `${reportData.scores.authenticity}%`, transition: 'width 0.8s ease' }}
                ></div>
              </div>
            </div>

            <div className="scard p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Cultural Protocol</span>
                <span className={`tag ${getDimensionTag(reportData.scores.protocol)}`}>
                  {getDimensionLabel(reportData.scores.protocol)}
                </span>
              </div>
              <div className="dim-bar">
                <div
                  className="dim-bar-fill"
                  style={{ width: `${reportData.scores.protocol}%`, transition: 'width 0.8s ease' }}
                ></div>
              </div>
            </div>

            <div className="scard p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Community Connection</span>
                <span className={`tag ${getDimensionTag(reportData.scores.community)}`}>
                  {getDimensionLabel(reportData.scores.community)}
                </span>
              </div>
              <div className="dim-bar">
                <div
                  className="dim-bar-fill"
                  style={{ width: `${reportData.scores.community}%`, transition: 'width 0.8s ease' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="scard-warm p-7 mb-10 border-l-4" style={{ borderLeftColor: 'var(--brass)' }}>
          <div className="eyebrow mb-3">Why we routed you here</div>
          <p className="display text-xl leading-snug mb-4">{rationale}</p>
          <p className="text-sm text-ink-dim">
            Our recommendation is below. It is a recommendation, not a destination — you may begin anywhere you wish.
          </p>
        </div>

        {/* Tier Offer */}
        <div className="scard-dark p-8 md:p-10 mb-8" style={{ background: 'var(--forest-deepest)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="eyebrow eyebrow-cream mb-3">Recommended for you</div>
              <h3 className="display text-3xl text-cream mb-3">
                {reportData.tier_display} tier · $
                {reportData.tier_display === 'Free'
                  ? '0'
                  : reportData.tier_display === 'Community'
                    ? '27'
                    : '67'}
                /month
              </h3>
              <p className="text-cream/75 leading-relaxed mb-4">
                {reportData.tier_display === 'Free'
                  ? 'Stage 1 — Emotional Preparation. Full access to the foundation module. Amen AI · 10 messages/month.'
                  : reportData.tier_display === 'Community'
                    ? 'Cultural fluency tools, preliminary itinerary work, community participation. Amen AI · 75 messages/month.'
                    : 'All 6 stages unlocked, unlimited Amen AI access, complete custodian marketplace, Day Name & Stage certificates.'}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-cream/70 mono">
                <span>Cancel any time · No lock-in</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button className="btn-primary w-full justify-center">Save my result & continue</button>
              <button className="btn-secondary w-full justify-center">Retake quiz</button>
            </div>
          </div>
        </div>

        {/* Lifecycle Note */}
        <p className="text-center text-xs text-ink-faint mono">
          Your readiness profile is saved when you create an account. We do not show this score to anyone.
        </p>
      </div>

      <style jsx>{`
        .readiness-ring {
          position: relative;
          width: 200px;
          height: 200px;
          margin: 0 auto;
        }

        .readiness-ring svg {
          display: block;
        }

        .readiness-ring .absolute {
          position: absolute;
        }

        .readiness-ring .inset-0 {
          inset: 0;
        }

        .readiness-ring .flex {
          display: flex;
        }

        .readiness-ring .flex-col {
          flex-direction: column;
        }

        .readiness-ring .items-center {
          align-items: center;
        }

        .readiness-ring .justify-center {
          justify-content: center;
        }

        .dim-bar {
          width: 100%;
          height: 6px;
          background: var(--line);
          border-radius: 3px;
          overflow: hidden;
        }

        .dim-bar-fill {
          height: 100%;
          background: var(--brass);
          transition: width 0.8s ease;
        }
      `}</style>
    </div>
  );
}
