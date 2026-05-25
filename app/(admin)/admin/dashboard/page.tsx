'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Stat {
  label: string;
  value: string | number;
  delta: string;
  icon: React.ReactNode;
  bg: string;
  color: string;
}

const stats: Stat[] = [
  {
    label: 'Paying clients',
    value: '847',
    delta: '↑ 94 this month',
    bg: '#f0fdf4',
    color: '#16a34a',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'MRR — subscriptions',
    value: '$56,749',
    delta: '↑ 12% month-on-month',
    bg: '#fefce8',
    color: '#ca8a04',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    label: 'Active Custodians',
    value: '47',
    delta: '38 Afrofeast Certified',
    bg: '#eff6ff',
    color: '#3b82f6',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
        <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 10-16 0" />
      </svg>
    ),
  },
  {
    label: 'Commission (month)',
    value: '$5,400',
    delta: '15% of $36,000 bookings',
    bg: '#fff7ed',
    color: '#ea580c',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

const completionRates = [
  { name: 'Stage 1 · Emotional Preparation', rate: 91 },
  { name: 'Stage 2 · Cultural Intelligence', rate: 74 },
  { name: 'Stage 3 · Practical Preparation', rate: 62 },
  { name: 'Stage 4 · Arrival Orientation', rate: 48 },
  { name: 'Stage 5 · Heritage Journey', rate: 31 },
  { name: 'Stage 6 · Post-Journey', rate: 18 },
];

const reviewDistribution = [
  { emoji: '🌅', name: 'Transformative', rate: 58, color: '#16a34a' },
  { emoji: '🌿', name: 'Growth', rate: 27, color: '#3b82f6' },
  { emoji: '🤝', name: 'Connection', rate: 10, color: '#06b6d4' },
  { emoji: '🪨', name: 'Heavy', rate: 4, color: '#dc2626' },
  { emoji: '🔄', name: 'Redirect (auto-flags)', rate: 1, color: '#dc2626' },
];

const recentActivity = [
  { id: 'ACT-001', type: 'New User Registration', user: 'Sarah K.', time: '2 hours ago', status: 'completed' },
  { id: 'ACT-002', type: 'Custodian Certification', user: 'Michael O.', time: '5 hours ago', status: 'completed' },
  { id: 'ACT-003', type: 'Payment Processed', amount: '$2,450', time: '8 hours ago', status: 'completed' },
  { id: 'ACT-004', type: 'New Booking Created', user: 'James T.', time: '12 hours ago', status: 'completed' },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="admin-main">
      {/* Header/Eyebrow */}
      <div className="admin-eyebrow">Platform Overview</div>
      
      <h1 className="admin-page-title">OurRoots.Africa — May 2026</h1>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="a-stat">
            <div className="a-stat-icon" style={{ background: stat.bg }}>
              {stat.icon}
            </div>
            <div className="a-stat-label">{stat.label}</div>
            <div className="a-stat-num">{stat.value}</div>
            <div className="a-stat-delta">{stat.delta}</div>
          </div>
        ))}
      </div>

      {/* Two Column Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Module Completion Rates */}
        <div className="a-card a-card-pad">
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111111', marginBottom: '18px' }}>
            Module completion rates
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completionRates.map((item) => (
              <div key={item.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>{item.name}</span>
                  <span style={{ fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', color: '#111', fontWeight: 600 }}>
                    {item.rate}%
                  </span>
                </div>
                <div className="a-bar-track">
                  <div className="a-bar-fill" style={{ width: `${item.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Distribution */}
        <div className="a-card a-card-pad">
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111111', marginBottom: '18px' }}>
            Afrofeast Review distribution
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviewDistribution.map((item) => (
              <div key={item.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>
                    {item.emoji} {item.name}
                  </span>
                  <span style={{ fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', color: item.color, fontWeight: 600 }}>
                    {item.rate}%
                  </span>
                </div>
                <div className="a-bar-track">
                  <div style={{ height: '100%', borderRadius: '3px', background: item.color, width: `${item.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Active flags requiring attention
          <span className="a-badge-red">2 high priority</span>
        </div>

        {/* Alert 1 */}
        <div className="a-alert a-alert-high" style={{ marginBottom: '10px' }}>
          <div className="a-alert-title">
            Off-platform payment attempt — Custodian #CU-019
          </div>
          <div className="a-alert-sub">
            Detected: platform message contained mobile number · 9 May 2026 14:32
          </div>
          <div className="a-alert-quote">
            "If easier, you can send me directly — my number is 0XX XXX XXXX. Platform takes too long."
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => router.push('/admin/conduct')}
              className="a-btn-primary"
            >
              Review in CoC panel →
            </button>
            <button className="a-btn-ghost">
              Suspend immediately
            </button>
          </div>
        </div>

        {/* Alert 2 */}
        <div className="a-alert a-alert-high">
          <div className="a-alert-title">
            🔄 Redirect review — Client #CL-234 · Custodian #CU-008 · Ama D.
          </div>
          <div className="a-alert-sub">
            Client submitted 🔄 Redirect after session · 8 May 2026 · auto-flagged
          </div>
          <button
            onClick={() => router.push('/admin/reviews')}
            className="a-btn-primary"
          >
            Review in Afrofeast Reviews →
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="a-card a-card-pad">
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111111', marginBottom: '16px' }}>
          Recent Activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#111111', marginBottom: '2px' }}>{activity.type}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {activity.user || activity.amount} · {activity.time}
                </div>
              </div>
              <span className="a-badge-ok">
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
