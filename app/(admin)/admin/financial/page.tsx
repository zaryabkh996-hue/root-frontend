'use client';


export default function FinancialPage() {
  const stats = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
      iconBg: '#f0fdf4',
      num: '$56,749',
      label: 'Client subscriptions (MRR)',
      delta: '847 × $67/month',
      numColor: '#111111',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 10-16 0" />
        </svg>
      ),
      iconBg: '#eff6ff',
      num: '$5,400',
      label: 'Custodian commission',
      delta: '15% of $36,000 gross',
      numColor: '#111111',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
      iconBg: '#dcfce7',
      num: '$31,349',
      label: 'Net profit (May)',
      delta: 'after $30,800 costs',
      numColor: '#14532d',
      cardBg: '#f0fdf4',
      cardBorder: '#86efac',
    },
  ];

  const costs = [
    { label: 'Anthropic API (Amen AI)', amount: '~$4,200' },
    { label: 'Vonage (WhatsApp API)', amount: '~$1,800' },
    { label: 'AfriqueLLM (voice/translation)', amount: '~$2,100' },
    { label: 'Sanity CMS + hosting', amount: '~$900' },
    { label: 'Stripe / Paystack fees', amount: '~$1,800' },
    { label: 'Content + cultural advisors', amount: '~$8,000' },
    { label: 'Team + operations', amount: '~$12,000' },
  ];

  const projections = [
    { custodians: '75 Custodians', revenue: '+$8,100/mo' },
    { custodians: '100 Custodians', revenue: '+$10,800/mo' },
    { custodians: 'Custodian Pro ($29/mo)', revenue: '50 × $29 = +$1,450' },
  ];

  return (
   
     
      <main className="admin-main">
        <div className="admin-eyebrow">Financial Dashboard</div>
        <h1 className="admin-page-title">Revenue Model · May 2026</h1>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="a-stat"
              style={
                stat.cardBg
                  ? {
                      background: stat.cardBg,
                      borderColor: stat.cardBorder,
                    }
                  : {}
              }
            >
              <div
                style={{
                  background: stat.iconBg,
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                {stat.icon}
              </div>
              <div className="a-stat-num" style={{ color: stat.numColor }}>
                {stat.num}
              </div>
              <div className="a-stat-label">{stat.label}</div>
              <div className="a-stat-delta">{stat.delta}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Monthly Operating Costs */}
          <div className="a-card a-card-pad">
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '16px' }}>
              Monthly operating costs
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {costs.map((cost, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>{cost.label}</span>
                  <span style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: '#111', fontWeight: 600 }}>
                    {cost.amount}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>Total costs</span>
                <span style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#111' }}>
                  ~$30,800
                </span>
              </div>
            </div>
          </div>

          {/* Custodian Revenue Projections */}
          <div className="a-card a-card-pad">
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '14px' }}>
              Leg 2 — Custodian revenue projections
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', lineHeight: 1.5 }}>
              Currently: 38 certified Custodians · 15% commission · no Custodian Pro tier yet.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projections.map((proj, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: '5px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#374151' }}>{proj.custodians}</span>
                  <span style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: '#16a34a', fontWeight: 600 }}>
                    {proj.revenue}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: '16px',
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '6px',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#14532d', lineHeight: 1.5 }}>
                <strong>At 1,000 clients + 100 Custodians:</strong> projected MRR exceeds $80,000/month. Introduce Custodian Pro at month 9
                post-launch.
              </div>
            </div>
          </div>
        </div>
      </main>
  
  );
}
