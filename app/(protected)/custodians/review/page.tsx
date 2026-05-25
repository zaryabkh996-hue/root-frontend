
'use client'; 

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthService } from '@/app/lib/authService';

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const custodianId = searchParams.get('id');
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const selectedDay = searchParams.get('day') || new Date().getDate().toString();
  const selectedTime = searchParams.get('time') || '12:00pm';
  const custodianName = searchParams.get('custodianName') || 'Custodian';
  const location = searchParams.get('location') || 'Ghana';
  
  const [message, setMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChangeTime = () => {
    router.back();
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (!token) {
        alert('Please log in to make a booking');
        router.push('/login');
        return;
      }

      const bookingData = {
        custodian_id: custodianId,
        booking_date: selectedDate, // Already in YYYY-MM-DD format
        booking_time: selectedTime,
        message: message,
      };

      const response = await fetch(`${backendUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Booking created:', result);
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert(`Failed to confirm booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app-main">
      <h1 className="display text-4xl font-light leading-tight mb-2">Looks right?</h1>
      <p className="text-cream/60 mb-8">Review your booking details before confirming.</p>

      <div className="scard-dark p-6 mb-6" style={{ borderLeft: '3px solid var(--brass)' }}>
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          <div><div className="text-xs text-cream/40 mb-1">Custodian</div><div className="text-sm font-medium">{custodianName}</div><div className="text-xs text-cream/50">{location}</div></div>
          <div><div className="text-xs text-cream/40 mb-1">Date</div><div className="text-sm font-medium" style={{ fontFamily: 'monospace' }}>
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div></div>
          <div><div className="text-xs text-cream/40 mb-1">Your time (EDT)</div><div className="text-sm font-medium" style={{ fontFamily: 'monospace' }}>{selectedTime.toUpperCase()}</div></div>
          <div><div className="text-xs text-cream/40 mb-1">Duration</div><div className="text-sm font-medium">15 minutes</div></div>
          <div><div className="text-xs text-cream/40 mb-1">Cost</div><div className="text-sm font-medium" style={{ color: 'var(--forest-light)' }}>Free intro — no payment</div></div>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs text-cream/50 block mb-2">Add a message for {custodianName?.split(' ')[0] || 'them'} (optional)</label>
        <textarea 
          className="w-full p-3 rounded-sm text-sm" 
          style={{
            background: 'rgba(243,237,224,0.05)',
            border: '1px solid rgba(201,161,74,0.2)',
            color: 'var(--cream)',
            minHeight: '80px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }} 
          placeholder="E.g. I'm particularly interested in Cape Coast Castle history..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="scard-dark p-4 mb-8" style={{ background: 'rgba(31,90,61,0.15)', borderColor: 'rgba(31,90,61,0.3)' }}>
        <div className="eyebrow eyebrow-cream mb-2" style={{ fontSize: '9px' }}>What to expect</div>
        <ul className="text-xs text-cream/60 space-y-1" style={{ listStyle: 'none', padding: 0 }}>
          <li>✓ Calendar invite sent to your email immediately</li>
          <li>✓ WhatsApp confirmation from {custodianName?.split(' ')[0]} within 2 hours</li>
          <li>✓ Video call link provided 30 minutes before session</li>
          <li>✓ No payment taken — this is a free introduction</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button className="btn-ghost" onClick={handleChangeTime}>← Change time</button>
        <button 
          className="btn-primary" 
          onClick={handleConfirmBooking}
          disabled={submitting}
          style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
        >
          {submitting ? 'Confirming...' : 'Confirm booking →'}
        </button>
      </div>

      {/* Booking confirmation modal */}
      {showConfirmModal && (
        <div className="modal-shroud" onClick={() => router.push('/custodians')}>
          <div className="modal-card text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-brass/15 border border-brass/40 flex items-center justify-center mb-5">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="eyebrow mb-2">Confirmed</div>
            <h2 className="display text-3xl mb-3 leading-tight">Your introduction is booked.</h2>
            <p className="text-ink-dim mb-6 leading-relaxed">
              {custodianName} will see you on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime.toUpperCase()} EDT. Calendar invite + WhatsApp confirmation sent automatically.
            </p>
            <div className="scard-warm p-5 mb-6 text-left" style={{background:'rgba(201,161,74,0.08)'}}>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="text-ink-dim">Custodian</div>
                <div className="font-medium">{custodianName} · {location}</div>
                <div className="text-ink-dim">Date</div>
                <div className="font-medium mono">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className="text-ink-dim">Your time</div>
                <div className="font-medium mono">{selectedTime.toUpperCase()} EDT</div>
                <div className="text-ink-dim">Duration</div>
                <div className="font-medium">15 minutes</div>
                <div className="text-ink-dim">Cost</div>
                <div className="font-medium" style={{color:'var(--forest-light)'}}>Free intro</div>
              </div>
            </div>
            <button 
              className="btn-primary w-full justify-center" 
              onClick={() => router.push('/custodians')}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
  
