'use client';

import { Fragment, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '../../lib/progressContext';
import { STAGES } from '../../lib/progressStore';

// Radial chart constants (r = 84, circumference ≈ 527.8)
const CIRC = 527.8;
const SEG_LEN = 84.5;
const SEG_GAP = 3.5;
const SEG_TOTAL = SEG_LEN + SEG_GAP; // 88

export default function DashboardPage() {
  const router = useRouter();
  const { progress, computed } = useProgress();
  const { stageStatuses, currentStage, currentModule } = computed;

  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const remainingInStage = currentStage.totalModules - currentStage.completedCount;

  // Last 2 completed modules for "Recent" section
  const recentCompleted = useMemo(() => {
    return [...progress.completedModules]
      .reverse()
      .slice(0, 2)
      .map(id => {
        for (const stage of STAGES) {
          const m = stage.modules.find(mod => mod.id === id);
          if (m) return { ...m, stageTitle: stage.title };
        }
        return null;
      })
      .filter(Boolean);
  }, [progress.completedModules]);

  return (
    <>
      {/* Welcome strip */}
      <div className="mb-10">
        <div className="eyebrow eyebrow-cream mb-3">{today}</div>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="display text-5xl font-light leading-tight mb-2">
              Welcome back, <em className="italic text-brass-light">{progress.userName}</em>.
            </h1>
            <p className="text-cream/70">
              You are in{' '}
              <strong className="text-cream">
                Stage {currentStage.id} · {currentStage.title}
              </strong>
              .{' '}
              {remainingInStage > 0
                ? `${remainingInStage} module${remainingInStage === 1 ? '' : 's'} remain${remainingInStage === 1 ? 's' : ''}.`
                : 'Stage complete.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="eyebrow eyebrow-cream" style={{ fontSize: '9px' }}>Afrofeast Score</div>
              <div className="display text-3xl font-light text-brass-light">{progress.afroScore}</div>
            </div>
            <div className="w-px h-12 bg-brass/15"></div>
            <div className="text-right">
              <div className="eyebrow eyebrow-cream" style={{ fontSize: '9px' }}>Persona</div>
              <div className="font-medium text-sm text-cream">{progress.userPersona}</div>
            </div>
          </div>
        </div>

        {/* Lifecycle phase */}
        <div className="mt-5 flex items-center gap-3 text-sm text-cream/60">
          <span className="inline-flex items-center gap-2 mono" style={{ fontSize: '11px', letterSpacing: '.12em', color: 'var(--brass-dim)', textTransform: 'uppercase' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            Lifecycle phase
          </span>
          <span className="text-cream/85">
            You are in <strong className="text-brass-light">{progress.lifecyclePhase}</strong> — building cultural readiness before departure.
          </span>
        </div>
      </div>

      {/* 6-stage progress */}
      <div className="scard-dark p-7 mb-10" style={{ background: 'rgba(20,48,37,0.5)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="eyebrow eyebrow-cream mb-1">Your six-stage journey</div>
            <div className="display text-xl">
              Stage {currentStage.id} of 6 · {currentStage.progressPercent}% complete
            </div>
          </div>
          <button className="btn-ghost-dark" onClick={() => router.push('/journey')}>
            View full journey →
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Radial SVG */}
          <div style={{ flex: '0 0 160px', minWidth: '120px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '160px', height: '160px', margin: '0 auto' }}>
              <svg viewBox="0 0 200 200" width="100%" height="160px" style={{ transform: 'rotate(-90deg)' }}>
                {stageStatuses.map((stage, idx) => {
                  const offset = -(idx * SEG_TOTAL);
                  const fillLen = SEG_LEN * (stage.progressPercent / 100);
                  return (
                    <Fragment key={stage.id}>
                      {/* Background arc */}
                      <circle
                        cx="100" cy="100" r="84"
                        fill="none"
                        stroke="rgba(201,161,74,0.12)"
                        strokeWidth="20"
                        strokeDasharray={`${SEG_LEN} ${CIRC}`}
                        strokeDashoffset={offset}
                      />
                      {/* Fill arc */}
                      {fillLen > 0 && (
                        <circle
                          cx="100" cy="100" r="84"
                          fill="none"
                          stroke={stage.isCompleted ? 'var(--brass-light)' : 'var(--brass)'}
                          strokeWidth="20"
                          strokeDasharray={`${fillLen} ${CIRC}`}
                          strokeDashoffset={offset}
                        />
                      )}
                    </Fragment>
                  );
                })}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div className="eyebrow eyebrow-cream" style={{ fontSize: '9px', marginBottom: '2px' }}>Stage {currentStage.id}</div>
                <div className="display text-cream" style={{ fontSize: '17px', lineHeight: 1.1, letterSpacing: '-0.01em'  }}>
                  {currentStage.title.split(' ')[0]}
                </div>
                <div className="text-xs text-brass-light mono" style={{ marginTop: '3px' }}>{currentStage.progressPercent}%</div>
              </div>
            </div>
          </div>

          {/* Stage flow dots */}
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px',  paddingBottom: '8px' }}>
              {stageStatuses.map((stage, idx) => (
                <Fragment key={stage.id}>
                  <div
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: stage.isUnlocked ? 'pointer' : 'default' }}
                    onClick={() => stage.isUnlocked && router.push(`/journey/${stage.id}`)}
                  >
                    <div className={`stage-dot ${stage.isCompleted ? 'done' : stage.isCurrent ? 'current' : 'locked'}`}>
                      {stage.isCompleted ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : stage.id}
                    </div>
                    <div className={`text-xs text-center leading-tight`} style={{ width: '78px', color: stage.isCurrent ? 'var(--brass-light)' : stage.isUnlocked ? 'var(--cream)' : 'rgba(243,237,224,0.4)' }}>
                      {stage.title.split(' ').slice(0, 2).join(' ')}
                    </div>
                  </div>
                  {idx < stageStatuses.length - 1 && (
                    <div style={{ flex: '1 1 auto', height: '1px', background: 'rgba(201,161,74,0.2)', marginTop: '17px', minWidth: '14px' }} />
                  )}
                </Fragment>
              ))}
            </div>
            <div className="text-xs text-cream/50 mt-4 leading-relaxed">
              No streaks. No daily goals. The journey unfolds at your pace — each segment fills as modules complete.
            </div>
          </div>
        </div>
      </div>

      {/* 3 quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Continue card */}
        <div
          className="scard-dark p-6 cursor-pointer hover:border-brass/40 transition"
          onClick={() => currentModule && router.push(`/module?id=${currentModule.id}`)}
        >
          <div className="eyebrow eyebrow-cream mb-3">
            Continue · Module {currentModule?.id ?? '—'}
          </div>
          <h3 className="display text-xl text-cream mb-2">
            {currentModule?.title ?? 'No module in progress'}
          </h3>
          <p className="text-sm text-cream/60 leading-relaxed mb-4">
            {currentModule
              ? `A ${currentModule.duration} ${currentModule.type.toLowerCase()}. Pick up where you left off.`
              : 'Complete the current stage to continue.'}
          </p>
          <div className="flex items-center gap-2 text-brass-light text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Continue
          </div>
        </div>

        {/* Amen AI */}
        <div className="scard-dark p-6 cursor-pointer hover:border-brass/40 transition">
          <div className="eyebrow eyebrow-cream mb-3">Companion</div>
          <h3 className="display text-xl text-cream mb-2">Chat with Amen AI</h3>
          <p className="text-sm text-cream/60 leading-relaxed mb-4">He's here. WhatsApp via Vonage or in-app — your conversation follows you.</p>
          <div className="flex items-center gap-2 text-brass-light text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Open chat
          </div>
        </div>

        {/* Community */}
        <div className="scard-dark p-6 cursor-pointer hover:border-brass/40 transition" style={{ borderLeft: '3px solid var(--rose)' }}>
          <div className="eyebrow eyebrow-cream mb-3 flex items-center gap-2">
            <span>Community</span>
            <span className="text-rose" style={{ fontSize: '11px' }}>· Akoma 💕</span>
          </div>
          <h3 className="display text-xl text-cream mb-2">Visit The Love Hub</h3>
          <p className="text-sm text-cream/60 leading-relaxed mb-4">Free for everyone, always. Where heritage seekers process identity and grief together.</p>
          <div className="flex items-center gap-2 text-brass-light text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Visit
          </div>
        </div>
      </div>

      {/* Today's reflection */}
      <div className="scard-warm p-6 mb-10 border-l-4" style={{ borderLeftColor: 'var(--brass)', background: 'rgba(201,161,74,0.08)', color: 'var(--cream)' }}>
        <div className="eyebrow eyebrow-cream mb-2">Today's reflection · optional</div>
        <p className="display text-xl leading-snug mb-3 text-cream">&ldquo;Write one sentence about what &lsquo;home&rsquo; means to you, before you go.&rdquo;</p>
        <p className="text-cream/60 text-sm">No pace, no streak, no urgency. Saved privately to your journal.</p>
      </div>

      {/* Recent activity */}
      <div>
        <div className="eyebrow eyebrow-cream mb-4">Recent</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentCompleted.length > 0 ? (
            recentCompleted.map((mod: any) => (
              <div
                key={mod.id}
                className="flex items-start gap-3 p-4 scard-dark cursor-pointer hover:border-brass/40 transition"
                onClick={() => router.push(`/module?id=${mod.id}`)}
              >
                <div className="w-9 h-9 rounded-full bg-brass/15 flex items-center justify-center flex-shrink-0 text-brass-light text-xs mono">
                  {mod.id}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-cream">Completed · {mod.title}</div>
                  <div className="text-xs text-cream/50 mt-1">{mod.duration} · {mod.type}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-start gap-3 p-4 scard-dark col-span-2">
              <div className="flex-1">
                <div className="font-medium text-sm text-cream">No modules completed yet</div>
                <div className="text-xs text-cream/50 mt-1">
                  Start with Module 1.1 — Welcome, Your Journey Begins.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
