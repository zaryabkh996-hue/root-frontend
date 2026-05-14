'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ModulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('id') || '1.4';

  return (
    <div className="p-12">
      <button className="crisis-btn mb-8 px-4 py-2 rounded bg-rose/10 text-rose border border-rose/30 text-sm font-semibold hover:bg-rose/20 transition">
        SOS
      </button>

      <button 
        onClick={() => router.push('/journey/1')}
        className="text-cream/60 hover:text-cream text-sm mb-6 flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5m6 7-7-7 7-7"></path>
        </svg>
        <span>Stage 1 · Emotional Preparation</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="eyebrow eyebrow-cream">Module {moduleId} · Guided audio · 10 min</div>
            <span className="tag tag-rose">High sensitivity</span>
          </div>
          <h1 className="display text-4xl font-light leading-tight mb-3">
            Preparing for the Emotional Weight.
          </h1>

          <div className="mb-6 inline-flex items-center gap-2 text-xs text-cream/50 p-3 rounded border border-brass/20" style={{ background: 'rgba(201,161,74,0.05)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"></path>
            </svg>
            <span>This module opens with a version written for <strong className="text-cream/85">United States & Canada</strong> — your diaspora group. Want a different framing? <button className="underline text-brass-light/80 hover:text-brass-light">Switch</button></span>
          </div>

          <div className="scard-dark p-7 mb-8">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-16 h-16 rounded-full bg-brass flex items-center justify-center cursor-pointer hover:bg-brass-light transition flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--forest-deepest)">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm text-cream mb-2">Narrated by Ama · Heritage educator, Accra</div>
                <div className="audio-bar mb-2" style={{ height: '6px', background: 'rgba(201,161,74,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--brass)', width: '34%', borderRadius: '3px' }}></div>
                </div>
                <div className="flex justify-between text-xs text-cream/50 mono"><span>3:24</span><span>10:00</span></div>
              </div>
              <div className="flex items-center gap-2 text-cream/50">
                <button className="hover:text-cream">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14m-7-7 7 7 7-7"></path>
                  </svg>
                </button>
                <span className="text-xs mono">DL</span>
              </div>
            </div>
          </div>

          <div className="prose-invert max-w-none">
            <p className="display text-xl leading-relaxed text-cream mb-5 italic">
              "Find a comfortable place to sit or lie down. Close your eyes if you feel safe to do so. Take a deep breath in… and out."
            </p>
            <p className="text-cream/80 leading-relaxed mb-4">
              You are preparing for a journey that will touch the deepest parts of your soul. When you visit Cape Coast Castle, when you walk through the Door of No Return, you will be standing where your ancestors stood in their final moments on African soil.
            </p>
            <p className="text-cream/80 leading-relaxed mb-4">
              This is not a tourist attraction. This is sacred ground. This is a place of immense suffering, and immense strength.
            </p>
            <p className="text-cream/80 leading-relaxed mb-4">
              It is okay to feel overwhelmed. It is okay to cry. It is okay to feel anger, grief, confusion, or numbness. There is no 'right' way to feel.
            </p>
          </div>

          <div className="scard-warm p-7 mt-8" style={{ background: 'rgba(201,161,74,0.08)', borderLeft: '4px solid var(--brass)', color: 'var(--cream)' }}>
            <div className="eyebrow eyebrow-cream mb-3">Private reflection · only you see this</div>
            <p className="display text-lg mb-4 text-cream">
              "Imagine your ancestors looking at you, their descendant, who has returned. What would they want you to know?"
            </p>
            <textarea 
              className="field-dark w-full min-h-[140px] resize-y"
              placeholder="Take your time. There's no right way to answer this."
            ></textarea>
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-cream/50 flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Encrypted · admin cannot read this</span>
              </div>
              <button className="btn-primary">Save to journal</button>
            </div>
          </div>

          <div className="scard-dark mt-8 p-6">
            <div className="eyebrow eyebrow-cream mb-3">How did that land?</div>
            <p className="text-cream/70 text-sm mb-5">One tap. No pressure. This shapes what comes next — never compared, never scored.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className="emoji-fb scard-dark p-5 text-left transition hover:border-brass/40 cursor-pointer" style={{ border: '1px solid rgba(201,161,74,0.15)', background: 'rgba(20,48,37,0.4)' }}>
                <div className="text-3xl mb-2 leading-none">🌱</div>
                <div className="font-medium text-cream mb-1">Sprout</div>
                <p className="text-xs text-cream/60 leading-relaxed">This planted something. I want to sit with a Reflection Lab next.</p>
              </button>
              <button className="emoji-fb scard-dark p-5 text-left transition hover:border-brass/40 cursor-pointer" style={{ border: '1px solid rgba(201,161,74,0.15)', background: 'rgba(20,48,37,0.4)' }}>
                <div className="text-3xl mb-2 leading-none">🪶</div>
                <div className="font-medium text-cream mb-1">Feather</div>
                <p className="text-xs text-cream/60 leading-relaxed">Light enough. I'm ready for the next module.</p>
              </button>
              <button className="emoji-fb scard-dark p-5 text-left transition hover:border-brass/40 cursor-pointer" style={{ border: '1px solid rgba(201,161,74,0.15)', background: 'rgba(20,48,37,0.4)' }}>
                <div className="text-3xl mb-2 leading-none">🪨</div>
                <div className="font-medium text-cream mb-1">Stone</div>
                <p className="text-xs text-cream/60 leading-relaxed">This was heavy. I need a break — Amen will check in soon.</p>
              </button>
            </div>
            <input 
              type="text"
              className="field-dark w-full mt-5"
              placeholder="Anything you want to share? (optional · never seen by other relatives)"
            />
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-brass/15">
            <button className="btn-ghost-dark">Previous · 1.3 Uncomfortable Truths</button>
            <button className="btn-primary">Mark complete · Continue 1.5 →</button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="scard-dark p-5 sticky top-24">
            <div className="eyebrow eyebrow-cream mb-3">Stage 1 progress</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-cream/80"><span className="text-brass mono text-xs">✓</span> 1.1 Welcome</div>
              <div className="flex items-center gap-2 text-cream/80"><span className="text-brass mono text-xs">✓</span> 1.2 Ghana is Not Wakanda</div>
              <div className="flex items-center gap-2 text-cream/80"><span className="text-brass mono text-xs">✓</span> 1.3 Uncomfortable Truths</div>
              <div className="flex items-center gap-2 text-brass-light"><span className="text-brass mono text-xs">▸</span> 1.4 Emotional Weight</div>
              <div className="flex items-center gap-2 text-cream/40"><span className="mono text-xs">○</span> 1.5 Reflection & Quiz</div>
            </div>
            <div className="mt-5 pt-5 border-t border-brass/10">
              <div className="eyebrow eyebrow-cream mb-2">Need support?</div>
              <button className="btn-ghost-dark w-full justify-center text-xs">
                Talk to Amen AI
              </button>
            </div>
          </div>
        </div>
      </div>

      <button className="amen-bubble fixed bottom-8 right-8 w-14 h-14 rounded-full bg-brass text-forest-deepest font-bold text-2xl hover:bg-brass-light transition shadow-lg">
        ?
      </button>

      <style jsx>{`
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
        .tag-rose {
          background: rgba(160, 72, 72, 0.15);
          border-color: rgba(160, 72, 72, 0.3);
          color: #f97316;
        }
        .field-dark {
          background: rgba(243, 237, 224, 0.08);
          border: 1px solid rgba(201, 161, 74, 0.2);
          border-radius: 3px;
          padding: 12px 16px;
          font-family: inherit;
          font-size: 14px;
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
        .btn-primary {
          background: var(--brass);
          color: var(--forest-deepest);
          border: none;
          padding: 8px 16px;
          border-radius: 3px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          background: var(--brass-light);
        }
        .btn-ghost-dark {
          background: transparent;
          border: 1px solid rgba(201, 161, 74, 0.2);
          padding: 8px 14px;
          border-radius: 3px;
          font-family: inherit;
          font-size: 12px;
          color: var(--cream);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost-dark:hover {
          border-color: var(--brass);
          background: rgba(201, 161, 74, 0.08);
        }
        .amen-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
