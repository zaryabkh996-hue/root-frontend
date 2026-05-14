'use client';

import { useRouter } from 'next/navigation';

export default function Journey() {
  const router = useRouter();

  const stages = [
    {
      id: 1,
      number: 1,
      status: 'current',
      tags: ['Free · current', '60% complete'],
      title: 'Emotional Preparation',
      description: 'Mindset, expectations, and emotional readiness. Five modules — Welcome, Ghana is Not Wakanda, The Uncomfortable Truths, the Emotional Weight meditation, and the Stage 1 quiz.',
      progress: '3/5 modules complete',
      progressPercent: 60,
      meta: '~50 min'
    },
    {
      id: 2,
      number: 2,
      status: 'locked',
      tags: ['Community+', 'Click to browse →'],
      title: 'Cultural Intelligence',
      description: 'Greetings, protocols, elder etiquette, market language, the depth Western travel guides skip. Eight modules with spaced-repetition Pop Quiz Cards to lock the protocols in.',
      meta: '8 modules · ~80 min'
    },
    {
      id: 3,
      number: 3,
      status: 'locked',
      tags: ['Preparation+', 'Click to browse →'],
      title: 'Practical Preparation',
      description: 'Visa paperwork, health, packing, money, transport. The DIY budget travel guide and the "Ghana reality check" briefing — six modules with origin-country lookups for US, UK, AU, BR, FR, EU passports.',
      meta: '6 modules · ~80 min'
    },
    {
      id: 4,
      number: 4,
      status: 'locked',
      tags: ['Preparation+', 'Click to browse →'],
      title: 'Arrival Orientation',
      description: 'First 72 hours. Airport handover, host family, jet-lag protocol, the chief\'s blessing if a Day Name awaits. Six modules to land softly in Ghana.',
      meta: '6 modules · ~80 min'
    },
    {
      id: 5,
      number: 5,
      status: 'locked',
      tags: ['Preparation+', 'Click to browse →'],
      title: 'Heritage Journey Experience',
      description: 'The deepest part. Cape Coast Castle. The Door of No Return. Identity tension, sensory overload, holding space for grief. Real-time Amen AI on WhatsApp throughout.',
      meta: '7 modules · live support'
    },
    {
      id: 6,
      number: 6,
      status: 'locked',
      tags: ['Preparation+', 'Click to browse →'],
      title: 'Post-Journey Integration',
      description: 'Reverse culture shock, from reflection to habit, reframing the narrative, eudaimonic well-being, commitment to action. Five modules unlocked across days 3 / 7 / 14 / 30 / 60 post-return. Sankofa badge on completion.',
      meta: '5 modules · ~50 min'
    }
  ];

  const renderStageDot = (status: string, number: number) => {
    if (status === 'current') {
      return (
        <div className="w-12 h-12 rounded-full bg-brass flex items-center justify-center text-forest-deepest font-bold text-lg">
          {number}
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-forest-deep border-2 border-brass/30 flex items-center justify-center text-cream font-bold text-lg">
        {number}
      </div>
    );
  };

  return (
    <div className="bg-forest-deep min-h-screen text-cream">
      {/* App Shell */}
      <div className="flex h-screen">
      
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-12">
          <button className="crisis-btn mb-8 px-4 py-2 rounded bg-rose/10 text-rose border border-rose/30 text-sm font-semibold hover:bg-rose/20 transition">
            SOS · Talk to a human
          </button>

          <div className="mb-10">
            <div className="eyebrow eyebrow-cream mb-3">Your journey · v6 · Sanctuary Edition</div>
            <h1 className="display text-5xl font-light leading-tight mb-3">Six stages, one homecoming.</h1>
            <p className="text-cream/70 max-w-2xl">
              A trauma-informed framework. Each stage builds on the last. Stage 1 is free for everyone, forever. Stages 2–6 unlock with Community or Preparation.
            </p>
          </div>

          {/* Stages Grid */}
          <div className="space-y-4">
            {stages.map((stage) => (
              <div
                key={stage.id}
                onClick={() => router.push(`/journey/${stage.id}`)}
                className={`scard-dark p-7 cursor-pointer hover:border-brass/40 transition ${
                  stage.status === 'current' ? 'border-l-4 border-brass' : ''
                }`}
                style={{
                  opacity: stage.status === 'locked' ? 0.85 : 1,
                  borderLeftColor: stage.status === 'current' ? 'var(--brass)' : undefined,
                  borderLeftWidth: stage.status === 'current' ? '4px' : undefined
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Stage Dot */}
                  <div className="md:col-span-1">
                    {renderStageDot(stage.status, stage.number)}
                  </div>

                  {/* Content */}
                  <div className="md:col-span-7">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {stage.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`tag text-xs px-3 py-1 rounded-full ${
                            idx === 0 ? 'tag-emerald' : 'text-cream/50'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className={`display text-2xl mb-1 ${
                      stage.status === 'locked' ? 'text-cream/80' : ''
                    }`}>
                      {stage.title}
                    </h3>
                    <p className={`text-sm ${
                      stage.status === 'locked' ? 'text-cream/50' : 'text-cream/70'
                    }`}>
                      {stage.description}
                    </p>
                  </div>

                  {/* Right Section */}
                  <div className="md:col-span-3">
                    {stage.status === 'current' ? (
                      <>
                        <div className="text-xs text-cream/50 mono mb-2">{stage.progress}</div>
                        <div className="audio-bar" style={{ height: '6px', background: 'rgba(201,161,74,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              background: 'var(--brass)',
                              borderRadius: '3px',
                              width: `${stage.progressPercent}%`,
                              transition: 'width 0.3s ease'
                            }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-cream/40 mono">{stage.meta}</div>
                    )}
                  </div>

                  {/* Right Arrow */}
                  <div className="md:col-span-1 text-right">
                    {stage.status === 'locked' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
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
            ))}
          </div>

          {/* Amen Bubble Button */}
          <button className="amen-bubble fixed bottom-8 right-8 w-14 h-14 rounded-full bg-brass text-forest-deepest font-bold text-2xl hover:bg-brass-light transition shadow-lg">
            ?
          </button>
        </main>
      </div>

      <style jsx>{`
        .app-side {
          scrollbar-width: thin;
        }

        .eyebrow-cream {
          color: rgba(201, 161, 74, 0.7);
        }

        .mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .scard-dark {
          border: 1px solid rgba(201, 161, 74, 0.15);
          border-radius: 4px;
          background: rgba(10, 24, 16, 0.4);
        }

        .tag {
          display: inline-flex;
          align-items: center;
          background: rgba(201, 161, 74, 0.12);
          border: 1px solid rgba(201, 161, 74, 0.2);
          border-radius: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 4px 12px;
        }

        .tag-emerald {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .crisis-btn:hover {
          background: rgba(249, 115, 115, 0.15);
        }

        .amen-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
      `}</style>
    </div>
  );
}
