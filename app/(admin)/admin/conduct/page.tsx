'use client';

import { useRouter } from 'next/navigation';

export default function AdminConduct() {
  const router = useRouter();

  return (
    <div className="admin-main">
      <div className="admin-eyebrow">Code of Conduct</div>
      <h1 className="admin-page-title">Enforcement Panel</h1>

      {/* Escalation Levels Description */}
      <p className="admin-page-sub" style={{ marginBottom: '20px' }}>
        Four escalation levels:{' '}
        <span className="a-badge-ok">✓ Good standing</span>
        {' → '}
        <span className="a-badge-warn" style={{ margin: '0 4px' }}>⚠ Warning</span>
        {' → '}
        <span className="a-badge-red" style={{ margin: '0 4px' }}>⏸ Suspended</span>
        {' → '}
        <span className="a-badge-red" style={{ margin: '0 4px', background: '#1f2937', color: '#f9fafb', borderColor: '#374151' }}>
          ✗ Banned
        </span>
        . All actions are logged and Custodian-notified.
      </p>

      {/* Alert 1 - High Priority */}
      <div className="a-alert a-alert-high" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div className="a-alert-title">Custodian #CU-019 · Kwesi A. · Accra · 3 yrs</div>
          </div>
          <span className="a-badge-warn">⚠ Investigation open · Case: 9 May 2026</span>
        </div>
        <div className="a-alert-quote">
          "If easier, you can send me directly — my number is 0XX XXX XXXX. Platform takes too long." — platform chat · 9 May 2026 14:32 · before session confirmed
        </div>
        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '14px' }}>
          First violation. Training Module 5 (Platform Rules) completed 2 May. Custodian was aware of the rule. Classification:{' '}
          <strong style={{ color: '#b91c1c' }}>Level 2 — Intentional breach.</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="a-btn-primary" onClick={() => console.log('Issue formal warning')}>
            Issue formal warning + retraining
          </button>
          <button className="a-btn-ghost" onClick={() => console.log('Suspend pending review')}>
            Suspend pending review
          </button>
          <button className="a-btn-danger" onClick={() => console.log('Permanent ban')}>
            Permanent ban
          </button>
          <button className="a-btn-ghost" onClick={() => console.log('Dismiss')}>
            Dismiss
          </button>
        </div>
      </div>

      {/* Alert 2 - Medium Priority */}
      <div className="a-alert a-alert-med" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div className="a-alert-title">Custodian #CU-008 · Ama D. · Cape Coast · 5 yrs</div>
          </div>
          <span className="a-badge-warn">⚠ 1 prior warning · Redirect review triggered</span>
        </div>
        <div className="a-alert-quote">
          "The Custodian made me feel like a tourist, not a relative." — Client · 1 May 2026
        </div>
        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '14px' }}>
          Client submitted 🔄 Redirect. Module 1 (Diaspora Psyche) training score was 🤝 Connection — lowest possible pass. This is a second escalation point.
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="a-btn-primary" onClick={() => console.log('Require Module 1 retrain')}>
            Require Module 1 retrain
          </button>
          <button className="a-btn-ghost" onClick={() => console.log('Second formal warning')}>
            Second formal warning
          </button>
          <button className="a-btn-ghost" onClick={() => console.log('Suspend — 30 days')}>
            Suspend — 30 days
          </button>
        </div>
      </div>

      {/* Reference Guide */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', marginBottom: '14px' }}>
        Violation Reference Guide
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Level 1 */}
        <div className="a-coc-level a-coc-1">
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#14532d', marginBottom: '5px' }}>
            Level 1 — Minor
          </div>
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
            Miscommunication, late arrival, misread client need. First offense. Response: warning logged, no immediate action.
          </div>
        </div>

        {/* Level 2 */}
        <div className="a-coc-level a-coc-2">
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#78350f', marginBottom: '5px' }}>
            Level 2 — Moderate
          </div>
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
            Off-platform payment request, repeated complaints, 🔄 Redirect with second complaint. Response: formal warning + mandatory retraining.
          </div>
        </div>

        {/* Level 3 */}
        <div className="a-coc-level a-coc-3">
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412', marginBottom: '5px' }}>
            Level 3 — Serious
          </div>
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
            Confirmed off-platform payment, inappropriate behaviour, client reports feeling unsafe. Response: suspension pending investigation.
          </div>
        </div>

        {/* Level 4 */}
        <div className="a-coc-level a-coc-4">
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#7f1d1d', marginBottom: '5px' }}>
            Level 4 — Critical
          </div>
          <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
            Fraud, abuse, harassment. Response: immediate permanent ban, Afrofeast Certification revoked, client notified.
          </div>
        </div>
      </div>
    </div>
  );
}
