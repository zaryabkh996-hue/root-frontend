'use client';

import React from 'react';

export default function DashboardPage() {
  return (
    <>
      <button className="crisis-btn">SOS · Talk to a human</button>

      {/* Welcome strip */}
      <div className="mb-10">
        <div className="eyebrow eyebrow-cream mb-3">Wednesday, 6 May 2026 · Atlanta, GA</div>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="display text-5xl font-light leading-tight mb-2">
              Welcome back, <em className="italic text-brass-light" id="dash-name">Amara</em>.
            </h1>
            <p className="text-cream/70">
              You are in <strong className="text-cream">Stage 1 · Emotional Preparation</strong>. Two modules remain.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="eyebrow eyebrow-cream" style={{fontSize: '9px'}}>Afrofeast Score</div>
              <div className="display text-3xl font-light text-brass-light">84</div>
            </div>
            <div className="w-px h-12 bg-brass/15"></div>
            <div className="text-right">
              <div className="eyebrow eyebrow-cream" style={{fontSize: '9px'}}>Persona</div>
              <div className="font-medium text-sm text-cream">Heritage Seeker</div>
            </div>
          </div>
        </div>
        {/* Lifecycle phase indicator */}
        <div className="mt-5 flex items-center gap-3 text-sm text-cream/60">
          <span className="inline-flex items-center gap-2 mono" style={{fontSize: '11px', letterSpacing: '.12em', color: 'var(--brass-dim)', textTransform: 'uppercase'}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            Lifecycle phase
          </span>
          <span className="text-cream/85">
            You are in <strong className="text-brass-light">Immersive Preparation</strong> — building cultural readiness before departure.
          </span>
          <button className="text-xs text-cream/40 hover:text-brass-light underline ml-1" title="What does this mean?">what's this?</button>
        </div>
      </div>

      {/* 6-stage progress: radial + horizontal flow side by side */}
      <div className="scard-dark p-7 mb-10" style={{background: 'rgba(20,48,37,0.5)'}}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="eyebrow eyebrow-cream mb-1">Your six-stage journey</div>
            <div className="display text-xl">Stage 1 of 6 · 60% complete</div>
          </div>
          <button className="btn-ghost-dark">View full journey →</button>
        </div>

        <div style={{display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap'}}>

          {/* Six-segment radial chart */}
          <div style={{flex: '0 0 160px', minWidth: '120px'}}>
            <div style={{position: 'relative', width: '100%', maxWidth: '160px', height: '160px', margin: '0 auto'}}>
              <svg viewBox="0 0 200 200" width="100%" height="160px" style={{transform: 'rotate(-90deg)'}}>
                {/* Segment 1: Emotional Preparation (current, 60%) */}
                <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(201,161,74,0.12)" strokeWidth="20" strokeDasharray="79.2 528" strokeDashoffset="0"></circle>
                <circle cx="100" cy="100" r="84" fill="none" stroke="var(--brass)" strokeWidth="20" strokeDasharray="47.5 528" strokeDashoffset="0"></circle>
                {/* Segment 2: Cultural Intelligence (locked) */}
                <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(201,161,74,0.12)" strokeWidth="20" strokeDasharray="84.5 528" strokeDashoffset="-89.5"></circle>
                {/* Segment 3: Practical Preparation (locked) */}
                <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(201,161,74,0.12)" strokeWidth="20" strokeDasharray="84.5 528" strokeDashoffset="-184.7"></circle>
                {/* Segment 4: Arrival Orientation (locked) */}
                <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(201,161,74,0.12)" strokeWidth="20" strokeDasharray="84.5 528" strokeDashoffset="-279.9"></circle>
                {/* Segment 5: Heritage Journey Experience (locked) */}
                <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(201,161,74,0.12)" strokeWidth="20" strokeDasharray="84.5 528" strokeDashoffset="-375.1"></circle>
                {/* Segment 6: Post-Journey Integration (locked) */}
                <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(201,161,74,0.12)" strokeWidth="20" strokeDasharray="84.5 528" strokeDashoffset="-470.3"></circle>
              </svg>
              <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                <div className="eyebrow eyebrow-cream" style={{fontSize: '9px', marginBottom: '2px'}}>Stage 1</div>
                <div className="display text-cream" style={{fontSize: '18px', lineHeight: 1, letterSpacing: '-0.01em'}}>Emotional</div>
                <div className="text-xs text-brass-light mono" style={{marginTop: '3px'}}>60%</div>
              </div>
            </div>
          </div>

          {/* Stage flow */}
          <div style={{flex: '1 1 300px', minWidth: 0, overflow: 'hidden'}}>
            <div style={{display: 'flex', alignItems: 'flex-start', gap: '4px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch'}} className="stage-steps-row">
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0}}>
                <div className="stage-dot current">1</div>
                <div className="text-xs text-brass-light text-center leading-tight" style={{width: '78px'}}>Emotional<br />Preparation</div>
              </div>
              <div style={{flex: '1 1 auto', height: '1px', background: 'rgba(201,161,74,0.2)', marginTop: '17px', minWidth: '14px'}}></div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0}}>
                <div className="stage-dot locked">2</div>
                <div className="text-xs text-cream/40 text-center leading-tight" style={{width: '78px'}}>Cultural<br />Intelligence</div>
              </div>
              <div style={{flex: '1 1 auto', height: '1px', background: 'rgba(201,161,74,0.2)', marginTop: '17px', minWidth: '14px'}}></div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0}}>
                <div className="stage-dot locked">3</div>
                <div className="text-xs text-cream/40 text-center leading-tight" style={{width: '78px'}}>Practical<br />Preparation</div>
              </div>
              <div style={{flex: '1 1 auto', height: '1px', background: 'rgba(201,161,74,0.2)', marginTop: '17px', minWidth: '14px'}}></div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0}}>
                <div className="stage-dot locked">4</div>
                <div className="text-xs text-cream/40 text-center leading-tight" style={{width: '78px'}}>Arrival<br />Orientation</div>
              </div>
              <div style={{flex: '1 1 auto', height: '1px', background: 'rgba(201,161,74,0.2)', marginTop: '17px', minWidth: '14px'}}></div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0}}>
                <div className="stage-dot locked">5</div>
                <div className="text-xs text-cream/40 text-center leading-tight" style={{width: '78px'}}>Heritage<br />Journey</div>
              </div>
              <div style={{flex: '1 1 auto', height: '1px', background: 'rgba(201,161,74,0.2)', marginTop: '17px', minWidth: '14px'}}></div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0}}>
                <div className="stage-dot locked">6</div>
                <div className="text-xs text-cream/40 text-center leading-tight" style={{width: '78px'}}>Post-Journey<br />Integration</div>
              </div>
            </div>
            <div className="text-xs text-cream/50 mt-4 leading-relaxed">No streaks. No daily goals. The journey unfolds at your pace — each segment fills as modules complete.</div>
          </div>

        </div>
      </div>

      {/* Remediation nudge */}
      <div className="scard-warm p-5 mb-10 flex items-start gap-4" style={{background: 'rgba(212,116,73,0.10)', borderLeft: '3px solid var(--terra)', color: 'var(--cream)'}}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{background: 'rgba(212,116,73,0.18)', color: 'var(--terra)'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4M12 16h.01"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>
        <div className="flex-1">
          <div className="eyebrow mb-1" style={{color: 'var(--terra)', fontSize: '10px'}}>Amen noticed · gentle nudge</div>
          <p className="text-cream text-sm leading-relaxed mb-2">
            The <strong>right-hand rule</strong> from <em>Module 2.2</em> could use a quick refresh. Most relatives find it useful to revisit before the trip — three minutes is enough.
          </p>
          <div className="flex items-center gap-3">
            <button className="text-sm text-brass-light hover:text-brass underline">Tap to revisit →</button>
            <button className="text-xs text-cream/40 hover:text-cream/70">Dismiss for 7 days</button>
          </div>
        </div>
      </div>

      {/* 3 quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="scard-dark p-6 cursor-pointer hover:border-brass/40 transition">
          <div className="eyebrow eyebrow-cream mb-3">Continue · Module 1.4</div>
          <h3 className="display text-xl text-cream mb-2">Preparing for the Emotional Weight</h3>
          <p className="text-sm text-cream/60 leading-relaxed mb-4">A 10-minute guided audio meditation. Where you left off — narrated by Mama Akua.</p>
          <div className="flex items-center gap-2 text-brass-light text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Continue
          </div>
        </div>
        <div className="scard-dark p-6 cursor-pointer hover:border-brass/40 transition">
          <div className="eyebrow eyebrow-cream mb-3">Companion</div>
          <h3 className="display text-xl text-cream mb-2">Chat with Amen AI</h3>
          <p className="text-sm text-cream/60 leading-relaxed mb-4">He's here. WhatsApp via Vonage or in-app — your conversation follows you.</p>
          <div className="flex items-center gap-2 text-brass-light text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
            </svg>
            Open chat
          </div>
        </div>
        <div className="scard-dark p-6 cursor-pointer hover:border-brass/40 transition" style={{borderLeft: '3px solid var(--rose)'}}>
          <div className="eyebrow eyebrow-cream mb-3 flex items-center gap-2">
            <span>Community</span>
            <span className="text-rose" style={{fontSize: '11px'}}>· Akoma 💕</span>
          </div>
          <h3 className="display text-xl text-cream mb-2">Visit The Love Hub</h3>
          <p className="text-sm text-cream/60 leading-relaxed mb-4">Free for everyone, always. Where heritage seekers process identity and grief together.</p>
          <div className="flex items-center gap-2 text-brass-light text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            Visit
          </div>
        </div>
      </div>

      {/* Today's nudge */}
      <div className="scard-warm p-6 mb-10 border-l-4" style={{borderLeftColor: 'var(--brass)', background: 'rgba(201,161,74,0.08)', color: 'var(--cream)'}}>
        <div className="eyebrow eyebrow-cream mb-2">Today's reflection · optional</div>
        <p className="display text-xl leading-snug mb-3 text-cream">"Write one sentence about what 'home' means to you, before you go."</p>
        <p className="text-cream/60 text-sm">No pace, no streak, no urgency. Saved privately to your journal.</p>
      </div>

      {/* Recent activity */}
      <div>
        <div className="eyebrow eyebrow-cream mb-4">Recent</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 scard-dark">
            <div className="w-9 h-9 rounded-full bg-brass/15 flex items-center justify-center flex-shrink-0 text-brass-light text-xs mono">1.3</div>
            <div className="flex-1">
              <div className="font-medium text-sm text-cream">Completed Module 1.3 · The Uncomfortable Truths</div>
              <div className="text-xs text-cream/50 mt-1">2 days ago · 10 min</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 scard-dark">
            <div className="w-9 h-9 rounded-full bg-brass/15 flex items-center justify-center flex-shrink-0 text-brass-light text-xs">A</div>
            <div className="flex-1">
              <div className="font-medium text-sm text-cream">Amen AI · 14 messages this week</div>
              <div className="text-xs text-cream/50 mt-1">last reply yesterday · 11:42 PM</div>
            </div>
          </div>
        </div>
      </div>

      <button className="amen-bubble">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
        Ask Amen AI
      </button>
    </>
  );
}
