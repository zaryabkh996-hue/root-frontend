'use client';

export default function AdminReviews() {
  const reviewTypes = [
    { emoji: '🌅', label: 'Transformative', desc: 'Opened something in me', bg: '#f0fdf4', border: '#86efac', labelColor: '#14532d', descColor: '#16a34a' },
    { emoji: '🌿', label: 'Growth', desc: 'Learned and felt held', bg: '#f0fdf4', border: '#86efac', labelColor: '#14532d', descColor: '#16a34a' },
    { emoji: '🤝', label: 'Connection', desc: 'Professional and warm', bg: '#f9fafb', border: '#e5e7eb', labelColor: '#374151', descColor: '#6b7280' },
    { emoji: '🪨', label: 'Heavy', desc: 'Needed more space', bg: '#fffbeb', border: '#fcd34d', labelColor: '#78350f', descColor: '#92400e' },
    { emoji: '🔄', label: 'Redirect', desc: 'Not the right match', bg: '#fff5f5', border: '#fca5a5', labelColor: '#7f1d1d', descColor: '#b91c1c' },
  ];

  const recentReviews = [
    {
      id: 1,
      emoji: '🌅',
      custodian: 'Akosua O. · Cape Coast',
      date: '8 May 2026',
      quote: '"Walking through those doors with her changed something I cannot name yet."',
      flagged: false,
    },
    {
      id: 2,
      emoji: '🌅',
      custodian: 'Akosua O. · Elmina',
      date: '3 May 2026',
      quote: '"She held space when I broke down. She didn\'t try to fix it."',
      flagged: false,
    },
    {
      id: 3,
      emoji: '🌿',
      custodian: 'Kwame B. · Kumasi',
      date: '2 May 2026',
      quote: '"Taught me more about Akwasidae in one session than I learned in years."',
      flagged: false,
    },
    {
      id: 4,
      emoji: '🔄',
      custodian: 'Ama D. · Accra',
      date: '1 May 2026',
      quote: '"Made me feel like a tourist, not a relative."',
      flagged: true,
    },
  ];

  return (
    <div className="admin-main">
      <div className="admin-eyebrow">Afrofeast Review System</div>
      <h1 className="admin-page-title">Post-session feedback</h1>
      <p className="admin-page-sub">
        Five culturally grounded emojis. No star ratings. 🔄 Redirect auto-flags for admin review. No punitive language.
      </p>

      {/* Review Scale Card */}
      <div className="a-card a-card-pad" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '16px' }}>
          Review scale
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {reviewTypes.map((type) => (
            <div
              key={type.label}
              style={{
                background: type.bg,
                border: `1px solid ${type.border}`,
                borderRadius: '8px',
                padding: '14px 18px',
                textAlign: 'center',
                minWidth: '100px',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{type.emoji}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: type.labelColor }}>
                {type.label}
              </div>
              <div style={{ fontSize: '11px', color: type.descColor, marginTop: '3px' }}>
                {type.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flagged Reviews */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', marginBottom: '12px' }}>
        Flagged reviews
      </div>
      <div className="a-alert a-alert-high" style={{ marginBottom: '16px' }}>
        <div className="a-alert-title">🔄 Redirect · Client #CL-234 · Custodian #CU-008 · Ama D.</div>
        <div className="a-alert-sub">8 May 2026 · auto-flagged</div>
        <div className="a-alert-quote">
          "The Custodian made me feel like a tourist, not a relative. She kept asking if I was enjoying my holiday."
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="a-btn-primary" onClick={() => console.log('Require Module 1 retrain')}>
            Require Module 1 retrain
          </button>
          <button className="a-btn-ghost" onClick={() => console.log('Dismiss review')}>
            Dismiss review
          </button>
          <button className="a-btn-ghost" onClick={() => console.log('Contact client')}>
            Contact client
          </button>
        </div>
      </div>

      {/* Recent Reviews */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', marginBottom: '12px' }}>
        Recent reviews — all Custodians
      </div>
      <div className="a-table">
        {recentReviews.map((review) => (
          <div
            key={review.id}
            className="a-table-row"
            style={{
              gridTemplateColumns: '50px 2fr 3fr',
              alignItems: 'start',
              ...(review.flagged && { background: '#fff5f5' }),
            }}
          >
            <div style={{ fontSize: '24px' }}>{review.emoji}</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>
                {review.custodian}
                {review.flagged && (
                  <span className="a-badge-red" style={{ marginLeft: '6px', fontSize: '9px' }}>
                    ⚠ Flagged
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: '#9ca3af' }}>
                {review.date}
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic' }}>
              {review.quote}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
