'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '../../lib/progressContext';
import { AuthService } from '@/app/lib/authService';

export default function Modules() {
  const router = useRouter();
  const { computed } = useProgress();
  const { stageStatuses } = computed;

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalCurrentTier, setModalCurrentTier] = useState('free');
  const [modalRequiredTier, setModalRequiredTier] = useState('community');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const upgrade = params.get('upgrade');
      const stageIdStr = params.get('stageId');
      if (upgrade === '1' && stageIdStr) {
        const stageId = parseInt(stageIdStr);
        const user = AuthService.getUser();
        const userTier = user?.subscription_tier || 'free';
        setModalCurrentTier(userTier);
        setModalRequiredTier(stageId === 2 ? 'Community or Preparation' : 'Preparation');
        setShowUpgradeModal(true);
        
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const handleStageClick = (stage: any) => {
    const user = AuthService.getUser();
    const userTier = user?.subscription_tier || 'free';

    let isTierAllowed = false;
    let requiredTiersLabel = '';
    
    if (stage.id === 1) {
      isTierAllowed = true;
    } else if (stage.id === 2) {
      isTierAllowed = (userTier === 'community' || userTier === 'preparation');
      requiredTiersLabel = 'Community or Preparation';
    } else {
      isTierAllowed = (userTier === 'preparation');
      requiredTiersLabel = 'Preparation';
    }

    if (!isTierAllowed) {
      setModalCurrentTier(userTier);
      setModalRequiredTier(requiredTiersLabel);
      setShowUpgradeModal(true);
    } else if (!stage.isUnlocked) {
      alert('Please complete the previous stages first before starting this stage.');
    } else {
      router.push(`/modules/${stage.id}`);
    }
  };

  return (
    <>
      <div className="mb-10">
        <div className="eyebrow eyebrow-cream mb-3">Your learning path · v6 · Sanctuary Edition</div>
        <h1 className="display text-5xl font-light leading-tight mb-3">Six stages, one homecoming.</h1>
        <p className="text-cream/70 max-w-2xl">
          A trauma-informed framework. Each stage builds on the last. Stage 1 is free for everyone, forever. Stages 2–6 unlock with Community or Preparation.
        </p>
      </div>

      <div className="space-y-4">
        {stageStatuses.map(stage => {
          const tierTag = stage.tier === 'Free' ? 'tag-emerald' : 'tag-brass';

          return (
            <div
              key={stage.id}
              onClick={() => handleStageClick(stage)}
              className="scard-dark p-7 cursor-pointer hover:border-brass/40 transition"
              style={{
                opacity: !stage.isUnlocked ? 0.85 : 1,
                borderLeft: stage.isCurrent ? '4px solid var(--brass)' : undefined,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Stage Dot */}
                <div className="md:col-span-1">
                  {stage.isCompleted ? (
                    <div className="w-12 h-12 rounded-full bg-brass-light flex items-center justify-center text-forest-deepest">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : stage.isCurrent ? (
                    <div className="w-12 h-12 rounded-full bg-brass flex items-center justify-center text-forest-deepest font-bold text-lg">
                      {stage.id}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-forest-deep border-2 border-brass/30 flex items-center justify-center text-cream font-bold text-lg">
                      {stage.id}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:col-span-7">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`tag text-xs px-3 py-1 rounded-full ${tierTag}`}>{stage.tier}</span>
                    {stage.isCompleted && <span className="tag tag-emerald text-xs px-3 py-1 rounded-full">Completed ✓</span>}
                    {stage.isCurrent && <span className="text-cream/50 text-xs">{stage.progressPercent}% complete</span>}
                    {!stage.isUnlocked && <span className="text-cream/40 text-xs">Locked · Click to browse →</span>}
                  </div>
                  <h3 className={`display text-2xl mb-1 ${!stage.isUnlocked ? 'text-cream/80' : ''}`}>
                    {stage.title}
                  </h3>
                  <p className={`text-sm ${!stage.isUnlocked ? 'text-cream/50' : 'text-cream/70'}`}>
                    {stage.description}
                  </p>
                </div>

                {/* Progress / Meta */}
                <div className="md:col-span-3">
                  {stage.isCurrent ? (
                    <>
                      <div className="text-xs text-cream/50 mono mb-2">
                        {stage.completedCount}/{stage.totalModules} modules complete
                      </div>
                      <div style={{ height: '6px', background: 'rgba(201,161,74,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: 'var(--brass)',
                            borderRadius: '3px',
                            width: `${stage.progressPercent}%`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </>
                  ) : stage.isCompleted ? (
                    <div className="text-xs text-brass-light mono">All {stage.totalModules} modules done</div>
                  ) : (
                    <div className="text-xs text-cream/40 mono">{stage.meta}</div>
                  )}
                </div>

                {/* Arrow / Unlock */}
                <div className="md:col-span-1 text-right">
                  {!stage.isUnlocked ? (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleStageClick(stage);
                      }}
                      className="btn-ghost-dark text-xs px-3 py-1 border border-brass/30 rounded hover:border-brass hover:bg-brass/10 transition"
                    >
                      Unlock
                    </button>
                  ) : (
                    <span className="text-cream/40">→</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 24, 16, 0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="scard-dark p-8 w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              border: '1px solid var(--brass)',
              background: 'var(--forest-deep)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-brass/10 border border-brass/30 flex items-center justify-center mx-auto mb-4 text-brass">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            
            <div className="eyebrow eyebrow-cream mb-2">Stage Locked</div>
            <h2 className="display text-2xl text-cream mb-3">Upgrade Tier Required</h2>
            <p className="text-sm text-cream/70 leading-relaxed mb-6">
              You are currently on the <span className="text-brass-light font-semibold capitalize">{modalCurrentTier}</span> tier. Please upgrade to the <span className="text-brass-light font-semibold">{modalRequiredTier}</span> tier to access this stage.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="btn-ghost-dark text-xs flex-1"
              >
                Maybe later
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  router.push('/#pricing');
                }}
                className="btn-primary text-xs flex-1"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
