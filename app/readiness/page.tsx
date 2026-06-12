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
  return 'Your responses show emerging readiness with room to grow in protocol mastery. We routed you to Community because the structured cultural fluency materials will support you most at this stage.';
};

const getTierDescription = (tier: string): string => {
  if (tier === 'Latent') {
    return 'Foundation Explorer';
  } else if (tier === 'Active') {
    return 'Active Maturation';
  }
  return 'Immersive Preparation';
};

export default function Readiness() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationGate, setShowRegistrationGate] = useState(true);

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
        {showRegistrationGate && (
          <div
            className="rounded-lg p-7 md:p-8 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            style={{ background: '#1a2e1f', color: '#f3ede0' }}
          >
            <div>
              <div
                className="mb-3"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#c9a14a',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                Your Afrofeast Score is ready
              </div>
              <div
                className="mb-2"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '22px',
                  fontWeight: '400',
                  color: '#f3ede0'
                }}
              >
                You scored <strong style={{ color: '#c9a14a' }}>{reportData.totalScore}</strong> — {reportData.persona} ·{' '}
                {getTierDescription(reportData.tier)}
              </div>
              <p
                className="leading-relaxed max-w-md"
                style={{
                  fontSize: '13px',
                  color: 'rgba(243,237,224,0.65)',
                  lineHeight: '1.5'
                }}
              >
                This is a preview. To unlock your full Readiness Report, Amen AI guidance, and the six-stage preparation
                curriculum, create your free account. Only enrolled members have scores registered on the platform.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-shrink-0">
              <button
                onClick={() => router.push('/register')}
                className="whitespace-nowrap"
                style={{
                  background: '#c9a14a',
                  color: '#1a2e1f',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: "'Instrument Sans', sans-serif"
                }}
              >
                Create free account →
              </button>
              <button
                onClick={() => setShowRegistrationGate(false)}
                className="whitespace-nowrap"
                style={{
                  background: 'transparent',
                  color: 'rgba(243,237,224,0.5)',
                  border: '1px solid rgba(243,237,224,0.2)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: 'center'
                }}
              >
                View preview only
              </button>
            </div>
          </div>
        )}

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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-14 items-center">
          {/* Circular Indicator */}
          <div className="lg:col-span-2 flex justify-center lg:justify-start">
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
          <div className="lg:col-span-3 space-y-2">
            <div className="scard p-3">
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

            <div className="scard p-3">
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

            <div className="scard p-3">
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

            <div className="scard p-3">
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

            <div className="scard p-3">
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

        {/* Tier-specific recommendations */}
        <div className="mb-12">
          <div className="eyebrow mb-3">Your next steps</div>
          <h2 className="display text-3xl mb-6" id="report-next-heading">Build your cultural fluency.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="report-next-modules">
            <div className="scard p-5">
              <div className="eyebrow mb-2">Mandatory · Module 1.4</div>
              <h3 className="font-medium mb-2">Preparing for the Emotional Weight</h3>
              <p className="text-sm text-ink-dim leading-relaxed mb-4">A guided audio meditation that prepares your nervous system for the dungeons at Cape Coast.</p>
              <div className="text-xs mono text-ink-dim">10 min · audio · free</div>
            </div>
            <div className="scard p-5">
              <div className="eyebrow mb-2">Recommended · Stage 2</div>
              <h3 className="font-medium mb-2">Cultural Protocol — Greetings & Elders</h3>
              <p className="text-sm text-ink-dim leading-relaxed mb-4">Your Cultural Protocol score suggests this is your highest-leverage area to grow.</p>
              <div className="text-xs mono text-ink-dim">30 min · video · paid</div>
            </div>
            <div className="scard p-5">
              <div className="eyebrow mb-2">Suggested</div>
              <h3 className="font-medium mb-2">Connect with Akosua, Accra</h3>
              <p className="text-sm text-ink-dim leading-relaxed mb-4">A Custodian whose specialty matches your dimensional balance. Free 15-min introduction.</p>
              <div className="text-xs mono text-ink-dim">scheduling · open</div>
            </div>
          </div>
        </div>

        {/* Tier Offer */}
        <div className="scard-dark p-9 mb-8" style={{ background: 'var(--forest-deepest)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="eyebrow eyebrow-cream mb-3">Recommended for you</div>
              <h3 className="display text-3xl text-cream mb-3" id="report-offer-tier">Community tier · $27/month</h3>
              <p className="text-cream/75 leading-relaxed mb-4" id="report-offer-body">Cultural fluency tools, preliminary itinerary work, community participation. Pay only for the months you are actively planning. Cancel any time — access continues until your billing period ends.</p>
              <div className="flex flex-wrap gap-2 text-xs text-cream/70 mono">
                <span>3-month $177 · save 12%</span>
                <span>·</span>
                <span>6-month $347 · save 14%</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push('/register')} className="btn-primary justify-center">Save my result & continue</button>
              <button onClick={() => router.push('/register')} className="btn-secondary justify-center">Stay free · Stage 1 only</button>
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
