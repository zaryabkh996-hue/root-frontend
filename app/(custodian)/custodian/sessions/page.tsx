'use client';

import { useState } from 'react';

type View = 'week' | 'list';

const sessions = [
  { id: 'S-041', date: 'Wed, May 21', time: '14:00', client: 'David Osei',     type: '1-on-1 Cultural Brief',  duration: '60 min', location: 'Video Call',    status: 'today',    fee: '$80' },
  { id: 'S-042', date: 'Fri, May 23', time: '10:00', client: 'Amara Johnson',  type: 'Heritage Tour',           duration: '4 hrs',  location: 'Cape Coast',    status: 'upcoming', fee: '$240' },
  { id: 'S-043', date: 'Sat, May 24', time: '09:00', client: 'Keisha Mensah',  type: 'Airport Welcome',         duration: '2 hrs',  location: 'KIA Airport',   status: 'upcoming', fee: '$120' },
  { id: 'S-044', date: 'Sun, May 25', time: '11:00', client: 'Marcus Brown',   type: 'Cape Coast Castle Tour',  duration: '6 hrs',  location: 'Elmina',        status: 'upcoming', fee: '$320' },
  { id: 'S-040', date: 'Mon, May 19', time: '15:00', client: 'Layla Williams', type: 'Naming Ceremony Guide',   duration: '3 hrs',  location: 'Kumasi',        status: 'completed', fee: '$180' },
  { id: 'S-039', date: 'Fri, May 16', time: '10:00', client: 'Nadia Abara',    type: 'Cultural Brief',          duration: '1 hr',   location: 'Video Call',    status: 'completed', fee: '$80' },
  { id: 'S-038', date: 'Sat, May 17', time: '14:00', client: 'Terence Brown',  type: 'Naming Ceremony Guide',   duration: '3 hrs',  location: 'Accra',         status: 'completed', fee: '$180' },
];

const statusBadge = (s: string) => {
  if (s === 'today')     return <span className="c-badge c-badge-amber">Today</span>;
  if (s === 'upcoming')  return <span className="c-badge c-badge-teal">Upcoming</span>;
  if (s === 'completed') return <span className="c-badge c-badge-green">Completed</span>;
  return <span className="c-badge c-badge-slate">{s}</span>;
};

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekDates = ['19', '20', '21', '22', '23', '24', '25'];
const todayIdx = 2; // Wednesday

export default function CustodianSessions() {
  const [view, setView] = useState<View>('list');

  return (
    <>
      <div className="mb-8">
        <div className="c-eyebrow mb-2">Schedule</div>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '2.2rem', fontWeight: 300, color: 'var(--c-slate)', letterSpacing: '-0.01em' }}>
            Sessions
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['list', 'week'] as View[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={view === v ? 'btn-c-primary' : 'btn-c-ghost'}
                style={{ fontSize: '12px', padding: '8px 16px', textTransform: 'capitalize' }}
              >
                {v} View
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Week strip */}
      <div className="c-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '6px', overflowX: 'auto' }}>
        {weekDays.map((d, i) => {
          const hasSessions = sessions.some(s => s.date.includes(`May ${weekDates[i]}`));
          const isToday = i === todayIdx;
          return (
            <div
              key={d}
              style={{
                flex: '1', minWidth: '60px', padding: '10px 6px', textAlign: 'center', borderRadius: '4px', cursor: 'pointer',
                background: isToday ? 'var(--c-amber)' : hasSessions ? 'rgba(232,168,50,0.1)' : 'transparent',
                border: isToday ? '1px solid var(--c-amber)' : hasSessions ? '1px solid rgba(232,168,50,0.2)' : '1px solid transparent',
              }}
            >
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-jetbrains-mono), monospace', letterSpacing: '0.1em', color: isToday ? 'var(--c-navy-deep)' : 'var(--c-slate-dim)', textTransform: 'uppercase' }}>{d}</div>
              <div style={{ fontSize: '18px', fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 300, color: isToday ? 'var(--c-navy-deep)' : 'var(--c-slate)', margin: '4px 0' }}>{weekDates[i]}</div>
              {hasSessions && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: isToday ? 'var(--c-navy-deep)' : 'var(--c-amber)', margin: '0 auto' }} />}
            </div>
          );
        })}
      </div>

      {/* Sessions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sessions.map(s => (
          <div key={s.id} className="c-card" style={{ padding: '18px 22px', display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Time block */}
            <div style={{ width: '80px', flexShrink: 0, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '1.5rem', fontWeight: 300, color: s.status === 'today' ? 'var(--c-amber-light)' : 'var(--c-slate)' }}>
                {s.time}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--c-slate-dim)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{s.date.split(',')[0]}</div>
              <div style={{ fontSize: '9.5px', color: 'var(--c-slate-faint)', marginTop: '2px' }}>{s.date.split(', ')[1]}</div>
            </div>

            <div style={{ width: '1px', height: '48px', background: 'var(--c-line)', flexShrink: 0 }} />

            {/* Client + service */}
            <div style={{ flex: '1', minWidth: '180px' }}>
              <div style={{ fontWeight: 600, fontSize: '14.5px', color: 'var(--c-slate)' }}>{s.client}</div>
              <div style={{ fontSize: '13px', color: 'var(--c-slate-dim)', marginTop: '2px' }}>{s.type}</div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <span className="c-badge c-badge-slate" style={{ fontSize: '9px' }}>{s.duration}</span>
                <span className="c-badge c-badge-slate" style={{ fontSize: '9px' }}>{s.location}</span>
              </div>
            </div>

            {/* Fee + status */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '1.2rem', fontWeight: 300, color: 'var(--c-amber-light)', marginBottom: '6px' }}>{s.fee}</div>
              {statusBadge(s.status)}
            </div>

            {/* Actions */}
            <div style={{ flexShrink: 0, display: 'flex', gap: '6px' }}>
              {s.status === 'today' && (
                <button className="btn-c-primary" style={{ fontSize: '12px', padding: '8px 14px' }}>
                  Join Call
                </button>
              )}
              {s.status === 'upcoming' && (
                <button className="btn-c-ghost" style={{ fontSize: '12px', padding: '8px 14px' }}>
                  Details
                </button>
              )}
              {s.status === 'completed' && (
                <button className="btn-c-ghost" style={{ fontSize: '12px', padding: '8px 14px' }}>
                  Notes
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
