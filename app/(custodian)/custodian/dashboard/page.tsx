'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';

interface Booking {
  id: number;
  user_id: number;
  custodian_id: number;
  booking_date: string;
  booking_time: string;
  message?: string;
  status: string;
  session_type?: string;
  session_duration?: number;
  platform_link?: string;
  booking_reference?: string;
  amount_charged_usd?: string | number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    diaspora_group?: string;
    travel_location?: string;
    learning_preference?: string;
    progress?: {
      id: number;
      lifecycle_phase?: string;
      completed_stages?: any;
      unlocked_stages?: any;
      afro_score?: number;
    };
  };
}

export default function CustodianDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [custodianName, setCustodianName] = useState('Akosua');

  useEffect(() => {
    // Get logged-in custodian's name
    const user = AuthService.getUser();
    if (user && user.name) {
      const firstName = user.name.split(' ')[0];
      setCustodianName(firstName);
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const headers = AuthService.getAuthHeaders();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
        const response = await fetch(`${backendUrl}/bookings/custodian-calendar`, { headers });

        if (!response.ok) throw new Error('Failed to fetch bookings');

        const responseData = await response.json();
        const data: Booking[] = Array.isArray(responseData) ? responseData : (responseData.data || []);

        if (!Array.isArray(data)) {
          throw new Error('Invalid response format from server');
        }

        setBookings(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      setConfirmingId(bookingId);
      const headers = AuthService.getAuthHeaders();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const response = await fetch(`${backendUrl}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!response.ok) throw new Error('Failed to confirm booking');

      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'confirmed' }
            : booking
        )
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
    } finally {
      setConfirmingId(null);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'R';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatStagesCompleted = (completedStages: any) => {
    if (Array.isArray(completedStages)) {
      if (completedStages.length === 0) return 'None';
      return completedStages.map((num: any) => `✓ Stage ${num}`).join(' · ');
    }
    if (typeof completedStages === 'string') {
      return completedStages;
    }
    return '✓ Stage 1 · ✓ Stage 2 · ✓ Stage 3 · ✓ Stage 4'; // Fallback
  };

  // Calculations for stats
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booking_date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate >= now && b.status !== 'cancelled';
  });

  const sortedUpcoming = [...upcomingBookings].sort((a, b) => {
    const dateA = new Date(`${a.booking_date}T${a.booking_time || '00:00:00'}`);
    const dateB = new Date(`${b.booking_date}T${b.booking_time || '00:00:00'}`);
    return dateA.getTime() - dateB.getTime();
  });

  const nextBooking = sortedUpcoming[0] || null;

  let nextBookingDateText = 'none scheduled';
  if (nextBooking) {
    const dateObj = new Date(nextBooking.booking_date);
    nextBookingDateText = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  // Monthly earnings calculation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let lastMonth = currentMonth - 1;
  let lastMonthYear = currentYear;
  if (lastMonth < 0) {
    lastMonth = 11;
    lastMonthYear = currentYear - 1;
  }

  const thisMonthBookings = bookings.filter(b => {
    const d = new Date(b.booking_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && b.status !== 'cancelled';
  });
  const thisMonthEarnings = thisMonthBookings.reduce((sum, b) => sum + Number(b.amount_charged_usd || 0), 0);

  const lastMonthBookings = bookings.filter(b => {
    const d = new Date(b.booking_date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear && b.status !== 'cancelled';
  });
  const lastMonthEarnings = lastMonthBookings.reduce((sum, b) => sum + Number(b.amount_charged_usd || 0), 0);

  const earningsDifference = thisMonthEarnings - lastMonthEarnings;
  const deltaEarningsText = earningsDifference >= 0 
    ? `↑ $${earningsDifference.toLocaleString()} vs last month`
    : `↓ $${Math.abs(earningsDifference).toLocaleString()} vs last month`;

  const lifetimeBookings = bookings.filter(b => b.status === 'completed' || new Date(b.booking_date) < now);
  const totalCompletedCount = bookings.filter(b => b.status === 'completed').length;

  const stats = [
    { 
      label: 'Upcoming', 
      value: loading ? '...' : upcomingBookings.length.toString(), 
      sublabel: 'sessions booked', 
      delta: loading ? 'next: loading...' : `next: ${nextBookingDateText}` 
    },
    { 
      label: 'Reviews', 
      value: '4.9', 
      sublabel: 'Afrofeast average', 
      delta: '🌅 38 Transformative', 
      valueColor: 'var(--c-amber)' 
    },
    { 
      label: 'Earnings', 
      value: loading ? '...' : `$${thisMonthEarnings.toLocaleString()}`, 
      sublabel: 'this month', 
      delta: loading ? 'comparing...' : deltaEarningsText 
    },
    { 
      label: 'Lifetime', 
      value: loading ? '...' : lifetimeBookings.length.toString(), 
      sublabel: 'relatives guided', 
      delta: loading ? '...' : `${totalCompletedCount} completed` 
    },
  ];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nextSessionHeaderDate = nextBooking
    ? new Date(nextBooking.booking_date).toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : null;

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <div className="cust-eyebrow mb-2">{today}</div>
        <h1 className="cust-page-title">Akwaaba, {custodianName} 🌍</h1>
        <p className="cust-page-sub">
          {loading 
            ? 'Loading your custodian profile...' 
            : nextSessionHeaderDate 
              ? `Your next session is ${nextSessionHeaderDate}. Your Afrofeast Client Brief is ready to review.`
              : 'You have no upcoming sessions scheduled.'}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="c-card c-card-pad" style={{ background: '#fff5f5', border: '1px solid #fca5a5', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: '#7f1d1d' }}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

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

      {/* Next booking section heading */}
      <div className="cust-eyebrow" style={{ marginBottom: '12px' }}>
        {loading 
          ? 'Finding next booking...' 
          : nextBooking 
            ? `Next booking — ${new Date(nextBooking.booking_date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}, ${nextBooking.booking_time || 'Time TBA'}`
            : 'No upcoming bookings'}
      </div>

      {/* Next booking details */}
      {loading ? (
        <div className="c-card c-card-pad" style={{ marginBottom: '24px', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '14px', color: 'var(--c-slate-dim)' }}>Loading next session details...</div>
        </div>
      ) : nextBooking ? (
        <div className="c-card c-card-pad" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar avatar-photo-4" style={{ width: '46px', height: '46px', fontSize: '15px' }}>
                {getInitials(nextBooking.user?.name || '')}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--c-slate)' }}>
                  {nextBooking.user?.name || 'Relative'} · {nextBooking.user?.diaspora_group || 'US/Canada cohort'}
                </div>
                <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono',monospace", color: 'var(--c-slate-dim)', marginTop: '2px' }}>
                  {nextBooking.user?.learning_preference || 'Heritage Seeker'} · {nextBooking.user?.travel_location ? `Journey to ${nextBooking.user.travel_location}` : 'First journey'} · Stage {nextBooking.user?.progress?.completed_stages ? (Array.isArray(nextBooking.user.progress.completed_stages) ? Math.max(...nextBooking.user.progress.completed_stages, 0) : '4') : '4'} complete
                </div>
              </div>
            </div>
            <span className="a-badge-blue">
              {nextBooking.session_duration || 90}-min {nextBooking.session_type || 'heritage'} session
            </span>
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
              <span className="c-brief-val">{nextBooking.user?.progress?.lifecycle_phase || 'Immersive Preparation (score 60–84)'}</span>
            </div>
            <div className="c-brief-row">
              <span className="c-brief-key">Diaspora group</span>
              <span className="c-brief-val">{nextBooking.user?.diaspora_group || 'United States & Canada — 3rd generation'}</span>
            </div>
            <div className="c-brief-row">
              <span className="c-brief-key">Stages completed</span>
              <span className="c-brief-val">
                {formatStagesCompleted(nextBooking.user?.progress?.completed_stages)}
              </span>
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
              <span className="c-brief-val">{nextBooking.message || 'Cape Coast Castle — ancestral connection'}</span>
            </div>
            <div className="c-brief-row">
              <span className="c-brief-key">Direct contact</span>
              <span className="c-redacted">🔒 Hidden — platform only</span>
            </div>
            <div className="c-brief-row">
              <span className="c-brief-key">Afrofeast Score detail</span>
              <span className="c-redacted">🔒 Client privacy {nextBooking.user?.progress?.afro_score ? `(Score: ${nextBooking.user.progress.afro_score})` : ''}</span>
            </div>
            <div className="c-brief-row">
              <span className="c-brief-key">Reflection Lab journals</span>
              <span className="c-redacted">🔒 Encrypted — never visible</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {nextBooking.status === 'pending' ? (
              <button 
                className="c-btn-primary" 
                onClick={() => handleConfirmBooking(nextBooking.id)}
                disabled={confirmingId === nextBooking.id}
              >
                {confirmingId === nextBooking.id ? 'Confirming...' : 'Confirm session →'}
              </button>
            ) : (
              <span className="a-badge-blue" style={{ padding: '8px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}>
                ✓ Confirmed
              </span>
            )}
            <button className="c-btn-secondary" onClick={() => router.push('/custodian/clients')}>
              View All Sessions
            </button>
          </div>
        </div>
      ) : (
        <div className="c-card c-card-pad" style={{ marginBottom: '24px', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '14px', color: 'var(--c-slate-dim)' }}>
            No upcoming sessions booked. Once relatives schedule with you, their cultural briefs will appear here.
          </div>
        </div>
      )}

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
