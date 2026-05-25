'use client';

import { useRouter } from 'next/navigation';

export default function CustodianDashboard() {
  const router = useRouter();

  const stats = [
    { label: 'Upcoming', value: '3', sublabel: 'sessions booked', delta: 'next: Wed 14 May' },
    { label: 'Reviews', value: '4.9', sublabel: 'Afrofeast average', delta: '🌅 38 Transformative', valueColor: 'var(--c-amber)' },
    { label: 'Earnings', value: '$1,840', sublabel: 'this month', delta: '↑ $240 vs last month' },
    { label: 'Lifetime', value: '47', sublabel: 'relatives guided', delta: '200+ through No Return' },
  ];

  const recentBookings = [
    { id: 'BK-2201', client: 'Amara J.', type: 'Heritage Tour', date: 'May 23', status: 'pending' },
    { id: 'BK-2200', client: 'David O.', type: '1-on-1 Cultural Brief', date: 'May 22', status: 'confirmed' },
    { id: 'BK-2198', client: 'Keisha M.', type: 'Airport Welcome', date: 'May 20', status: 'confirmed' },
    { id: 'BK-2195', client: 'Terence B.', type: 'Naming Ceremony Guide', date: 'May 18', status: 'completed' },
  ];

  const upcomingSessions = [
    { time: 'Today 14:00', client: 'David O.', type: 'Cultural Brief', duration: '60 min' },
    { time: 'Fri May 23, 10:00', client: 'Amara J.', type: 'Heritage Tour', duration: '4 hrs' },
    { time: 'Sat May 24, 09:00', client: 'Keisha M.', type: 'Airport Welcome', duration: '2 hrs' },
  ];

  const statusBadge = (status: string) => {
    const badgeMap: Record<string, { bg: string; color: string }> = {
      pending: { bg: 'rgba(201,161,74,0.12)', color: '#c9a14a' },
      confirmed: { bg: 'rgba(77,212,188,0.12)', color: '#4dd4bc' },
      completed: { bg: 'rgba(93,220,154,0.12)', color: '#5ddc9a' },
    };
    const badge = badgeMap[status] || badgeMap.pending;
    return (
      <span style={{ display: 'inline-block', background: badge.bg, color: badge.color, padding: '3px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 500, textTransform: 'capitalize' }}>
        {status}
      </span>
    );
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <div className="cust-eyebrow mb-2">{today}</div>
        <h1 className="cust-page-title">Akwaaba, Akosua 🌍</h1>
        <p className="cust-page-sub">Your next session is Wednesday 14 May. Your Afrofeast Client Brief is ready to review.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="c-stat">
            <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--c-amber-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', fontWeight: 600 }}>
              {stat.label}
            </div>
            <div className="c-stat-num" style={{ color: stat.valueColor }}>
              {stat.value}
            </div>
            <div className="c-stat-label">{stat.sublabel}</div>
            <div className="c-stat-delta">{stat.delta}</div>
          </div>
        ))}
      </div>

      {/* Next booking section */}
      <div className="cust-eyebrow" style={{ marginBottom: '12px' }}>
        Next booking — Wednesday 14 May, 10:00 AM
      </div>

      <div className="c-card c-card-pad" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar avatar-photo-4" style={{ width: '46px', height: '46px', fontSize: '15px' }}>
              AJ
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--c-slate)' }}>Relative · US/Canada cohort</div>
              <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--c-slate-dim)', marginTop: '2px' }}>Heritage Seeker · First journey · Stage 4 complete</div>
            </div>
          </div>
          <span className="a-badge-blue">90-min heritage session</span>
        </div>

        <div className="c-brief" style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-slate-dim)', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
              Afrofeast Client Brief — read only
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="c-listen-btn">🔊 Listen in Twi</button>
              <button className="c-listen-btn">🔊 English</button>
            </div>
          </div>

          <div className="c-brief-row">
            <span className="c-brief-key">Lifecycle phase</span>
            <span className="c-brief-val">Immersive Preparation (score 60–84)</span>
          </div>
          <div className="c-brief-row">
            <span className="c-brief-key">Diaspora group</span>
            <span className="c-brief-val">United States &amp; Canada — 3rd generation</span>
          </div>
          <div className="c-brief-row">
            <span className="c-brief-key">Stages completed</span>
            <span className="c-brief-val">✓ Stage 1 · ✓ Stage 2 · ✓ Stage 3 · ✓ Stage 4</span>
          </div>
          <div className="c-brief-row">
            <span className="c-brief-key">Badges earned</span>
            <span className="c-brief-val">💕 Akoma — patience &amp; endurance</span>
          </div>
          <div className="c-brief-row">
            <span className="c-brief-key">Known sensitivities</span>
            <span className="c-brief-val">High emotional weight · grief module completed</span>
          </div>
          <div className="c-brief-row">
            <span className="c-brief-key">Session focus</span>
            <span className="c-brief-val">Cape Coast Castle — ancestral connection</span>
          </div>
          <div className="c-brief-row">
            <span className="c-brief-key">Direct contact</span>
            <span className="c-redacted">🔒 Hidden — platform only</span>
          </div>
          <div className="c-brief-row">
            <span className="c-brief-key">Afrofeast Score detail</span>
            <span className="c-redacted">🔒 Client privacy</span>
          </div>
          <div className="c-brief-row">
            <span className="c-brief-key">Reflection Lab journals</span>
            <span className="c-redacted">🔒 Encrypted — never visible</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="c-btn-primary">Confirm session →</button>
          <button className="c-btn-secondary">Request reschedule</button>
        </div>
      </div>

      {/* Recent reviews section */}
      <div className="cust-eyebrow" style={{ marginBottom: '12px' }}>
        Recent Afrofeast Reviews
      </div>

      <div className="c-card c-card-pad">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '26px' }}>🌅</span>
          <span style={{ fontSize: '26px' }}>🌅</span>
          <span style={{ fontSize: '26px' }}>🌿</span>
          <span style={{ fontSize: '26px' }}>🌅</span>
          <span style={{ fontSize: '26px' }}>🌿</span>
        </div>

        <div className="c-row" style={{ alignItems: 'flex-start' }}>
          <span className="a-badge-gray" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
            🌅 Transformative
          </span>
          <div style={{ fontSize: '13px', color: 'var(--c-slate)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "Walking through those doors with Akosua changed something in me that I cannot name yet." — Cape Coast · 8 May 2026
          </div>
        </div>

        <div className="c-row" style={{ alignItems: 'flex-start' }}>
          <span className="a-badge-gray" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
            🌅 Transformative
          </span>
          <div style={{ fontSize: '13px', color: 'var(--c-slate)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "She held space when I broke down. She didn't try to fix it." — Elmina · 3 May 2026
          </div>
        </div>
      </div>
    </>
  );
}
