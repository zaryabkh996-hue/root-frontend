'use client';

export default function CustodianEarnings() {
  const submissions = [
    { title: 'Adinkra Cloth · Akan Funeral Protocols', type: 'Video · 12 min', date: 'Submitted 3 Mar 2026', earnings: '$48.65', citations: 139 },
    { title: 'Kente Weaving — Sacred Patterns of Asante', type: 'Audio + transcript · 8 min', date: 'Submitted 14 Feb 2026', earnings: '$34.30', citations: 98 },
    { title: 'Akan Proverbs — "Onipa na ohia onipa"', type: 'Text · 5 proverbs', date: 'Submitted 28 Jan 2026', earnings: '$22.75', citations: 65 },
    { title: 'Homowo Festival — Preparing Kpokpoi', type: '⏳ Under community review — 3 of 5 validators approved', date: '', earnings: 'Pending', citations: null, pending: true },
  ];

  const monthlyRevenue = [
    { month: 'January', amount: '$960', percent: 38 },
    { month: 'February', amount: '$1,234', percent: 49 },
    { month: 'March', amount: '$1,480', percent: 59 },
    { month: 'April', amount: '$1,598', percent: 63 },
    { month: 'May (current)', amount: '$1,988', isCurrent: true, percent: 79 },
  ];

  return (
    <>
      <div className="cust-eyebrow mb-2">Financial</div>
      <h1 className="cust-page-title">Earnings · May 2026</h1>

      {/* Top-line stats: 4 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {/* Session Gross */}
        <div className="c-stat">
          <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Session Gross
          </div>
          <div className="c-stat-num">$1,840</div>
          <div className="c-stat-label">23 sessions × $80</div>
          <div className="c-stat-delta">↑ $240 vs April</div>
        </div>

        {/* Knowledge Bank */}
        <div className="c-stat" style={{ background: 'linear-gradient(135deg, #fdf8ee, #f5f0e0)', borderColor: 'rgba(201,161,74,0.19)' }}>
          <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#8a6a1a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Knowledge Bank
          </div>
          <div className="c-stat-num" style={{ color: '#8a6a1a' }}>$148</div>
          <div className="c-stat-label" style={{ color: '#a07820' }}>142 Amen AI uses · $0.35/cite</div>
          <div className="c-stat-delta" style={{ color: '#c9a14a' }}>↑ New this month</div>
        </div>

        {/* Platform Fee */}
        <div className="c-stat">
          <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Platform Fee
          </div>
          <div className="c-stat-num" style={{ fontSize: '26px', color: '#6b6560' }}>$297</div>
          <div className="c-stat-label">15% on sessions</div>
          <div className="c-stat-delta" style={{ color: '#8a7f72' }}>Knowledge citations fee-free</div>
        </div>

        {/* Your Payout */}
        <div className="c-stat" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
          <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Your Payout
          </div>
          <div className="c-stat-num" style={{ color: '#14532d' }}>$1,691</div>
          <div className="c-stat-label" style={{ color: '#16a34a' }}>Transfers 1 Jun · M-Pesa</div>
          <div className="c-stat-delta" style={{ color: '#16a34a' }}>↑ $387 vs April</div>
        </div>
      </div>

      {/* Knowledge Bank Card */}
      <div className="c-card c-card-pad" style={{ marginBottom: '20px', borderLeft: '3px solid #c9a14a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>Knowledge Bank · Active Submissions</div>
          <button style={{ fontSize: '11px', background: '#c9a14a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 600 }}>
            + Contribute More
          </button>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
          <div style={{ background: '#f9f6f0', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#c9a14a', fontFamily: "'JetBrains Mono', monospace" }}>7</div>
            <div style={{ fontSize: '11px', color: '#6b6560', marginTop: '4px' }}>Verified submissions</div>
          </div>
          <div style={{ background: '#f9f6f0', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#c9a14a', fontFamily: "'JetBrains Mono', monospace" }}>142</div>
            <div style={{ fontSize: '11px', color: '#6b6560', marginTop: '4px' }}>Amen AI citations · May</div>
          </div>
          <div style={{ background: '#f9f6f0', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a', fontFamily: "'JetBrains Mono', monospace" }}>97%</div>
            <div style={{ fontSize: '11px', color: '#6b6560', marginTop: '4px' }}>Accuracy score (Amen AI)</div>
          </div>
        </div>

        {/* Submissions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {submissions.map((sub, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: '#fff',
                border: '1px solid #ede8de',
                borderRadius: '6px',
                opacity: sub.pending ? 0.6 : 1,
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{sub.title}</div>
                <div style={{ fontSize: '11px', color: sub.pending ? '#e07b00' : '#8a7f72', marginTop: '2px' }}>
                  {sub.type} · {sub.date}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#c9a14a', fontFamily: "'JetBrains Mono', monospace" }}>
                  {sub.earnings}
                </div>
                {sub.citations !== null && <div style={{ fontSize: '10px', color: '#8a7f72' }}>{sub.citations} citations</div>}
                {sub.citations === null && <div style={{ fontSize: '10px', color: '#8a7f72' }}>Earns on approval</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combined Monthly Revenue */}
      <div className="c-card c-card-pad">
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '18px' }}>
          Combined monthly revenue
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {monthlyRevenue.map((item, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#374151' }}>{item.month}</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: item.isCurrent ? '#c9a14a' : '#1a1a1a',
                    fontWeight: 600,
                  }}
                >
                  {item.amount}
                </span>
              </div>
              <div className="c-progress-track">
                <div className="c-progress-fill" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
          {/* May current with special styling */}
          <div style={{ background: '#f5f3ee', padding: '10px', borderRadius: '5px', border: '1px solid #e8e3d9', marginTop: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: '#1a1a1a', fontWeight: 600 }}>May (current)</span>
              <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#c9a14a', fontWeight: 700 }}>
                $1,988 <span style={{ fontSize: '10px', color: '#c9a14a' }}>sessions + KB</span>
              </span>
            </div>
            <div className="c-progress-track">
              <div className="c-progress-fill" style={{ width: '79%' }} />
            </div>
          </div>
        </div>

        {/* Knowledge Bank tip */}
        <div style={{ marginTop: '14px', padding: '10px 14px', background: '#fdf8ee', borderRadius: '6px', border: '1px solid #e8d8a0', fontSize: '12px', color: '#8a6a1a' }}>
          💡 <strong>Knowledge Bank tip:</strong> Your 7 submissions are generating passive citations. Each new verified submission typically adds $15–$60/month in citation income.{' '}
          <button style={{ background: 'none', border: 'none', color: '#c9a14a', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: 0, marginLeft: '4px' }}>
            Add another →
          </button>
        </div>
      </div>
    </>
  );
}
