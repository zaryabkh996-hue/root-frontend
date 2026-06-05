'use client';

import { useState, useEffect } from 'react';
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
  };
}

interface UpcomingSession {
  bookingId: number;
  relative: string;
  date: string;
  details: string;
  status: string;
  bookingReference?: string;
  sessionType?: string;
  platformLink?: string;
  amountChargedUsd?: string | number;
}

interface PastSession {
  relative: string;
  location: string;
  review: string;
  earned: string;
}

export default function CustodianClients() {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const headers = AuthService.getAuthHeaders();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
        const response = await fetch(`${backendUrl}/api/bookings/custodian-calendar`, { headers });

        if (!response.ok) throw new Error('Failed to fetch bookings');

        const responseData = await response.json();
        console.log('Raw bookings data:', responseData);
        // Handle both array and wrapped responses
        const data: Booking[] = Array.isArray(responseData) ? responseData : (responseData.data || []);

        if (!Array.isArray(data)) {
          throw new Error('Invalid response format from server');
        }

        // Separate upcoming and past bookings
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Set to start of today for accurate comparison
        const upcoming: UpcomingSession[] = [];
        const past: PastSession[] = [];

        data.forEach(booking => {
          const bookingDateTime = new Date(booking.booking_date);
          bookingDateTime.setHours(0, 0, 0, 0); // Set to start of day
          const clientName = booking.user?.name || 'Anonymous Client';

          if (bookingDateTime >= now && booking.status !== 'cancelled') {
            // Upcoming sessions (today or later, not cancelled)
            const dayOfWeek = new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short' });
            const monthDate = new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

            upcoming.push({
              bookingId: booking.id,
              relative: `${clientName} · Ref: ${booking.booking_reference || 'TBA'}`,
              date: `${dayOfWeek} ${monthDate} · ${booking.booking_time || 'Time TBA'}`,
              details: `${booking.message || 'Cultural experience'} · ${booking.session_type || 'Intro'} · ${booking.session_duration || 15} min · USD ${booking.amount_charged_usd || '0.00'}`,
              status: booking.status,
              bookingReference: booking.booking_reference,
              sessionType: booking.session_type,
              platformLink: booking.platform_link,
              amountChargedUsd: booking.amount_charged_usd
            });
          } else if (bookingDateTime < now) {
            // Past sessions (before today, regardless of status)
            const location = booking.message || 'Heritage Site';
            const date = new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

            past.push({
              relative: clientName,
              location: `${location} · ${date} May`,
              review: '🌅',
              earned: booking.amount_charged_usd ? `$${booking.amount_charged_usd}` : '$0'
            });
          }
        });

        setUpcomingSessions(upcoming);
        setPastSessions(past);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
        setUpcomingSessions([]);
        setPastSessions([]);
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
      const response = await fetch(` /bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!response.ok) throw new Error('Failed to confirm booking');

      // Update the booking status in the upcoming sessions
      setUpcomingSessions(prev =>
        prev.map(session =>
          session.bookingId === bookingId
            ? { ...session, status: 'confirmed' }
            : session
        )
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <>
      <div className="cust-eyebrow mb-2">Client Sessions</div>
      <h1 className="cust-page-title">My Clients</h1>
      <p className="cust-page-sub">Names are anonymised until 24 hours before each session. All communication goes through the OurRoots platform — never directly.</p>

      {/* Loading State */}
      {loading && (
        <div className="c-card c-card-pad" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '14px', color: '#6b6560' }}>Loading your client sessions...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="c-card c-card-pad" style={{ background: '#fff5f5', border: '1px solid #fca5a5', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: '#7f1d1d' }}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && upcomingSessions.length === 0 && pastSessions.length === 0 && (
        <div className="c-card c-card-pad" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '14px', color: '#6b6560' }}>No client sessions yet. Once clients book with you, they will appear here.</div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {!loading && !error && upcomingSessions.length > 0 && (
        <>
          {upcomingSessions.map((session, idx) => (
            <div
              key={idx}
              className="c-card c-card-pad"
              style={{
                marginBottom: '10px',
                borderLeft: `3px solid ${session.status === 'confirmed' ? '#4dd4bc' : '#c9a14a'}`,
                opacity: session.status === 'confirmed' ? 0.85 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>{session.relative}</div>
                <span className="a-badge-blue">{session.date}</span>
              </div>
              <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', marginBottom: '14px' }}>
                {session.details}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="c-listen-btn">🔊 Brief in Twi</button>
                {session.status === 'pending' ? (
                  <button
                    className="c-btn-primary"
                    style={{ fontSize: '12px', padding: '7px 14px' }}
                    onClick={() => handleConfirmBooking(session.bookingId)}
                    disabled={confirmingId === session.bookingId}
                  >
                    {confirmingId === session.bookingId ? 'Confirming...' : 'Confirm →'}
                  </button>
                ) : (
                  <span className="a-badge-blue" style={{ padding: '7px 14px', fontSize: '12px' }}>
                    ✓ Confirmed
                  </span>
                )}
                {session.platformLink && (
                  <a
                    href={session.platformLink.startsWith('http') ? session.platformLink : `https://${session.platformLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="c-btn-primary"
                    style={{
                      fontSize: '12px',
                      padding: '7px 14px',
                      background: '#1f5a3d',
                      color: '#ffffff',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: '2px'
                    }}
                  >
                    💻 Join Meeting
                  </a>
                )}
                <button className="c-btn-ghost">Message via platform</button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Past Sessions Table */}
      {!loading && !error && pastSessions.length > 0 && (
        <div style={{ marginTop: '28px' }}>
          <div className="cust-eyebrow" style={{ marginBottom: '12px' }}>
            Past sessions
          </div>
          <div className="a-table">
            <div className="a-table-head" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr' }}>
              <span>Relative</span>
              <span>Location &amp; date</span>
              <span>Review</span>
              <span>Earned</span>
            </div>
            {pastSessions.map((row, idx) => (
              <div key={idx} className="a-table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr' }}>
                <div style={{ fontSize: '13px', color: '#1a1a1a' }}>{row.relative}</div>
                <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#6b7280' }}>
                  {row.location}
                </div>
                <div>{row.review}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{row.earned}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
