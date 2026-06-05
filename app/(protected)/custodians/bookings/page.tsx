'use client';

import { useEffect, useState } from 'react';
import { AuthService } from '@/app/lib/authService';
import Link from 'next/link';

interface Booking {
  id: number;
  user_id: number;
  custodian_id: number;
  booking_date: string;
  booking_time: string;
  message: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  session_type?: string;
  session_duration?: number;
  platform_link?: string;
  booking_reference?: string;
  amount_charged_usd?: string | number;
  user: {
    id: number;
    name: string;
    email: string;
    picture?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function CustodianBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const response = await fetch(`${backendUrl}/api/bookings/custodian-calendar`, {
        headers: AuthService.getAuthHeaders() as HeadersInit,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view bookings');
          return;
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const response = await fetch(`${backendUrl}/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders() as HeadersInit,
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking');
    }
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(201,161,74,0.2)', text: 'var(--brass)' };
      case 'confirmed':
        return { bg: 'rgba(31,90,61,0.2)', text: 'var(--forest-light)' };
      case 'completed':
        return { bg: 'rgba(31,90,61,0.15)', text: 'var(--forest-light)' };
      case 'cancelled':
        return { bg: 'rgba(160,72,72,0.2)', text: 'var(--rose)' };
      default:
        return { bg: 'rgba(0,0,0,0.1)', text: 'var(--ink)' };
    }
  };

  return (
    <main className="app-main">
      <div className="mb-8">
        <h1 className="display text-4xl font-light leading-tight mb-2">Your calendar</h1>
        <p className="text-cream/60">Manage your upcoming introductions and bookings.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 pb-4 border-b" style={{ borderColor: 'rgba(201,161,74,0.2)' }}>
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className="text-xs font-medium px-3 py-2 rounded-sm transition-all"
            style={{
              background: filterStatus === status ? 'rgba(201,161,74,0.2)' : 'transparent',
              color: filterStatus === status ? 'var(--brass)' : 'var(--cream)',
              borderBottom: filterStatus === status ? '2px solid var(--brass)' : 'none',
              textTransform: 'capitalize',
            }}
          >
            {status === 'all' ? 'All bookings' : status}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="scard-dark p-4 mb-6" style={{ background: 'rgba(160,72,72,0.1)', borderColor: 'rgba(160,72,72,0.3)' }}>
          <p className="text-sm" style={{ color: 'var(--rose)' }}>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="scard-dark p-8 text-center">
          <p className="text-cream/60">Loading bookings...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredBookings.length === 0 && (
        <div className="scard-dark p-8 text-center">
          <p className="text-cream/60 mb-3">No {filterStatus === 'all' ? 'bookings' : filterStatus + ' bookings'} yet.</p>
          <p className="text-xs text-cream/40">Your calendar will appear here once customers book intro sessions.</p>
        </div>
      )}

      {/* Bookings list */}
      <div className="space-y-3">
        {filteredBookings.map((booking) => {
          const statusColor = getStatusBadgeColor(booking.status);
          return (
            <div
              key={booking.id}
              className="scard-dark p-4 hover:border-brass/50 transition-all"
              style={{ borderLeft: '3px solid var(--brass)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-sm">{booking.user.name}</h3>
                    <span
                      className="text-xs px-2 py-1 rounded-sm font-medium"
                      style={{ background: statusColor.bg, color: statusColor.text }}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 text-xs">
                    <div>
                      <div className="text-cream/40 mb-1">Date &amp; Time</div>
                      <div className="font-medium" style={{ fontFamily: 'monospace' }}>
                        {formatDate(booking.booking_date)} · {booking.booking_time.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-cream/40 mb-1">Reference</div>
                      <div className="font-medium text-brass/80" style={{ fontFamily: 'monospace' }}>
                        {booking.booking_reference || 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div className="text-cream/40 mb-1">Session Info</div>
                      <div className="font-medium text-cream">
                        {booking.session_type || 'Introduction'} ({booking.session_duration || 15} min)
                      </div>
                    </div>
                    <div>
                      <div className="text-cream/40 mb-1">Amount Charged</div>
                      <div className="font-medium text-forest-light">
                        {booking.amount_charged_usd ? `$${booking.amount_charged_usd}` : 'Free'}
                      </div>
                    </div>
                    <div>
                      <div className="text-cream/40 mb-1">Platform Link</div>
                      <div className="font-medium">
                        {booking.platform_link ? (
                          <a
                            href={booking.platform_link.startsWith('http') ? booking.platform_link : `https://${booking.platform_link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brass hover:underline"
                          >
                            Join Session
                          </a>
                        ) : 'Not set'}
                      </div>
                    </div>
                    <div>
                      <div className="text-cream/40 mb-1">Client Email</div>
                      <div className="font-medium text-cream/70">{booking.user.email}</div>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="bg-cream/5 p-2 rounded-sm text-xs text-cream/70 mb-3 max-w-lg">
                      <span className="text-cream/40">Message: </span>
                      {booking.message}
                    </div>
                  )}
                </div>

                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="text-xs text-rose/70 hover:text-rose px-3 py-2 rounded-sm transition-all"
                    style={{ background: 'rgba(160,72,72,0.1)' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(201,161,74,0.2)' }}>
        <p className="text-xs text-cream/40">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>
    </main>
  );
}
