'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';

interface Custodian {
  id: number;
  name: string;
  location: string;
  country: string;
  years_experience: number;
  specialty: string;
  avatar_initials: string;
  avatar_class: string;
  gradient_bg: string;
  availability: 'Available' | 'Booked';
  availability_text: string;
  description: string;
  tags: string[] | { label: string; color: string }[];
  verified: boolean;
  top_custodian?: boolean;
  price_from: number;
  certification?: string;
  coc_status?: string;
  review_avg?: number;
  sessions_count?: number;
  // New dynamic fields
  about?: string;
  short_bio?: string;
  languages?: string[];
  services?: { name: string; price: number; description: string }[];
  testimonials?: { quote: string; author: string; location: string; date: string }[];
}

type BookingStep = 'idle' | 'form' | 'submitted';

export default function CustodianProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [custodian, setCustodian] = useState<Custodian | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Booking form state
  const [bookingStep, setBookingStep] = useState<BookingStep>('idle');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [calendarOffset, setCalendarOffset] = useState(0); // Number of weeks to offset from today
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<{ date: Date; dayOfMonth: number } | null>(null);
  const [selectedTime, setSelectedTime] = useState('12:00pm');

  const defaultServices = [
    { name: 'Free 15-min introduction', price: 0, duration: 15, description: 'Video call · meet, ask anything, no commitment' },
    { name: 'Pre-trip preparation call', price: 80, duration: 60, description: '60 min · video · personalised plan for your visit' },
    { name: 'Cape Coast accompaniment', price: 280, duration: 480, description: 'Full day in-person · castle visit + integration walk' },
    { name: 'Post-trip integration', price: 60, duration: 45, description: '45 min · video · once you\'re home in the diaspora' }
  ];

  const [selectedService, setSelectedService] = useState({
    name: 'Free 15-min introduction',
    price: 0,
    duration: 15,
    description: 'Video call · meet, ask anything, no commitment'
  });

  // Generate 15-minute time slots from 9 AM to 5 PM
  const generateTimeSlots = () => {
    const slots = [];
    let hour = 9;
    let minute = 0;

    while (hour < 17 || (hour === 17 && minute === 0)) {
      const period = hour < 12 ? 'am' : 'pm';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const timeString = `${displayHour}:${minute.toString().padStart(2, '0')}${period}`;
      slots.push(timeString);

      minute += 15;
      if (minute === 60) {
        minute = 0;
        hour += 1;
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Generate next 14 days dynamically
  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today.getTime() + calendarOffset * 7 * 24 * 60 * 60 * 1000); // Add weeks offset

    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      const isDisabled = dayOfWeek === 0; // Sunday is disabled (0 = Sunday)

      days.push({
        date,
        dayOfMonth: date.getDate(),
        dayOfWeek,
        isDisabled,
        monthYear: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      });
    }
    return days;
  };

  const calendarDays = getNext14Days();

  // Auto-select first available day if none selected
  useEffect(() => {
    if (!selectedCalendarDay && calendarDays.length > 0) {
      const firstAvailable = calendarDays.find(d => !d.isDisabled);
      if (firstAvailable) {
        setSelectedCalendarDay({ date: firstAvailable.date, dayOfMonth: firstAvailable.dayOfMonth });
      }
    }
  }, [calendarOffset]);

  useEffect(() => {
    if (!id) return;
    const fetchCustodian = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
        const response = await fetch(`${backendUrl}/custodians/${id}`, {
          method: 'GET',
          headers: AuthService.getAuthHeaders(),
        });
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch custodian');
        const data = await response.json();
        setCustodian(data.custodian);
        if (data.custodian) {
          const servicesList = data.custodian.services && data.custodian.services.length > 0 ? data.custodian.services : defaultServices;
          const first = servicesList[0];
          setSelectedService({
            name: first.name,
            price: first.price,
            duration: (first as any).duration || (first.name.includes('15') ? 15 : (first.name.includes('45') ? 45 : (first.name.includes('60') ? 60 : 60))),
            description: first.description
          });
        }
      } catch (err) {
        console.error('Error fetching custodian:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCustodian();
  }, [id]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate a short delay (replace with real API call when booking endpoint exists)
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setBookingStep('submitted');
  };

  const handleShare = () => {
    if (!custodian) return;
    const text = `Check out ${custodian.name} on OurRoots.Africa — ${custodian.specialty}`;
    if (navigator.share) {
      navigator.share({ title: 'OurRoots.Africa', text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(201,161,74,0.2)',
            borderTop: '3px solid #c9a14a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }}
        />
        <p style={{ color: 'rgba(243,237,224,0.6)' }}>Loading custodian…</p>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (notFound || !custodian) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: 'rgba(243,237,224,0.6)', marginBottom: '16px' }}>Custodian not found.</p>
        <button className="btn-ghost-dark" onClick={() => router.push('/custodians')}>
          ← Back to Custodians
        </button>
      </div>
    );
  }

  const isAvailable = custodian.availability === 'Available';

  return (
    <>
      {/* Back nav */}
      <button
        className="btn-ghost-dark text-xs mb-6"
        onClick={() => router.push('/custodians')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All Custodians
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ── Left column: profile details ── */}
        <div className="lg:col-span-2">
          {/* Profile header with avatar and name */}
          <div className="flex items-start gap-6 mb-8">
            <div
              className={`avatar avatar-xl ${custodian?.avatar_class || 'avatar-photo'}`}
              style={{ flexShrink: 0 }}
            >
              {custodian?.avatar_initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="tag tag-emerald">Vetted · 2024</span>
                <span className="tag tag-brass">{custodian?.years_experience} years guiding</span>
              </div>
              <h1 className="display text-4xl font-light text-cream mb-1">
                {custodian?.name || 'Akosua Owusu'}
              </h1>
              <div className="eyebrow eyebrow-cream mb-3">
                {custodian?.location || 'Accra'} · {custodian?.country || 'Ghana'} · GMT
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="tag tag-brass">{custodian?.specialty || 'Heritage sites'}</span>
                {custodian?.languages && custodian.languages.length > 0 && (
                  <span className="tag tag-emerald">{custodian.languages.join(' · ')}</span>
                )}
                <span className="tag tag-dark">{custodian?.specialty || 'Specialist'}</span>
              </div>
            </div>
          </div>

          {/* About section */}
          <div className="mb-8">
            <div className="eyebrow eyebrow-cream mb-3">About {custodian?.name?.split(' ')[0] || 'Custodian'}</div>
            {custodian?.short_bio && (
              <p className="display text-lg leading-relaxed text-cream mb-4 italic">
                "{custodian.short_bio}"
              </p>
            )}
            {custodian?.about ? (
              <p className="text-cream/75 leading-relaxed mb-3">{custodian.about}</p>
            ) : (
              <>
                <p className="text-cream/75 leading-relaxed mb-3">
                  {custodian?.description ||
                    "Professional cultural custodian with extensive experience in heritage and cultural guidance."}
                </p>
                <p className="text-cream/75 leading-relaxed">
                  Specialising in cultural preparation, real-time support, and post-visit integration.
                </p>
              </>
            )}
          </div>

          {/* What you can book */}
          <div className="mb-8">
            <div className="eyebrow eyebrow-cream mb-3">What you can book</div>
            <div className="space-y-3">
              {(custodian?.services && custodian.services.length > 0 ? custodian.services : defaultServices).map((service, idx) => {
                const serviceDuration = (service as any).duration || (service.name.includes('15') ? 15 : (service.name.includes('45') ? 45 : (service.name.includes('60') ? 60 : 60)));
                const isSelected = selectedService.name === service.name;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedService({
                      name: service.name,
                      price: service.price,
                      duration: serviceDuration,
                      description: service.description
                    })}
                    className="scard-dark p-4 flex items-center justify-between cursor-pointer transition-all hover:border-brass/50"
                    style={{
                      borderLeft: isSelected ? '3px solid var(--brass)' : '1px solid rgba(201,161,74,0.2)',
                      background: isSelected ? 'rgba(201,161,74,0.08)' : 'rgba(243,237,224,0.02)',
                    }}
                  >
                    <div>
                      <div className="font-medium text-cream">{service.name}</div>
                      <div className="text-xs text-cream/60 mono mt-1">{service.description}</div>
                    </div>
                    <div className="display text-xl text-cream">{service.price === 0 ? 'Free' : `$${service.price}`}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Testimonials */}
          <div>
            <div className="eyebrow eyebrow-cream mb-3">
              From relatives {custodian?.name?.split(' ')[0] || 'this custodian'} has guided
            </div>
            <div className="space-y-3">
              {custodian?.testimonials && custodian.testimonials.length > 0 ? (
                custodian.testimonials.map((testimonial, idx) => (
                  testimonial.quote && (
                    <div key={idx} className="scard-dark p-5">
                      <p className="text-cream/85 italic leading-relaxed mb-3">
                        "{testimonial.quote}"
                      </p>
                      <div className="text-xs text-cream/50 mono">
                        — {testimonial.author} · {testimonial.location} · {testimonial.date}
                      </div>
                    </div>
                  )
                ))
              ) : (
                <>
                  <div className="scard-dark p-5">
                    <p className="text-cream/85 italic leading-relaxed mb-3">
                      "When I broke down in the female dungeon she just stood beside me. Did not speak. Did not rush. I
                      will never forget the dignity she gave that moment."
                    </p>
                    <div className="text-xs text-cream/50 mono">— J.M. · Atlanta · April 2026</div>
                  </div>
                  <div className="scard-dark p-5">
                    <p className="text-cream/85 italic leading-relaxed mb-3">
                      "She did not treat me like a tourist. She treated me like a daughter who had been gone too long."
                    </p>
                    <div className="text-xs text-cream/50 mono">— K.D. · Toronto · February 2026</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: booking widget with calendar ── */}
        <div className="lg:col-span-1">
          <div
            className="scard-dark p-6 sticky top-20"
            style={{ background: 'rgba(243,237,224,0.97)', color: 'var(--ink)' }}
          >
            <div className="eyebrow" style={{ color: 'var(--ink)' }}>
              Book your session
            </div>
            <h3 className="display text-2xl mb-4 leading-tight" style={{ color: 'var(--ink)' }}>
              {selectedService.name} ({selectedService.price === 0 ? 'Free' : `$${selectedService.price}`})
            </h3>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs eyebrow" style={{ color: 'var(--ink)' }}>
                  Pick a day
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 1))}
                    disabled={calendarOffset === 0}
                    className="text-xs px-2 py-1 rounded-sm transition-all"
                    style={{
                      background: calendarOffset === 0 ? 'rgba(0,0,0,0.1)' : 'rgba(201,161,74,0.2)',
                      color: calendarOffset === 0 ? 'rgba(0,0,0,0.3)' : 'var(--brass)',
                      cursor: calendarOffset === 0 ? 'not-allowed' : 'pointer',
                      border: '1px solid transparent',
                    }}
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setCalendarOffset(calendarOffset + 1)}
                    className="text-xs px-2 py-1 rounded-sm transition-all"
                    style={{
                      background: 'rgba(201,161,74,0.2)',
                      color: 'var(--brass)',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 mb-3">
                {calendarDays.map((dayObj, idx) => {
                  const isSelectedDay = selectedCalendarDay?.dayOfMonth === dayObj.dayOfMonth && selectedCalendarDay?.date.getMonth() === dayObj.date.getMonth();
                  const isSunday = dayObj.isDisabled;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="text-xs mono text-cream/40 mb-1 h-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayObj.dayOfWeek]}
                      </div>
                      <button
                        onClick={() => !isSunday && setSelectedCalendarDay({ date: dayObj.date, dayOfMonth: dayObj.dayOfMonth })}
                        style={{
                          padding: '10px 0',
                          borderRadius: '2px',
                          fontSize: '13px',
                          fontFamily: 'Instrument Sans, sans-serif',
                          fontWeight: isSelectedDay ? '600' : '400',
                          border: isSelectedDay ? '1px solid var(--brass)' : '1px solid var(--line)',
                          cursor: isSunday ? 'not-allowed' : 'pointer',
                          background: isSelectedDay
                            ? 'var(--brass)'
                            : isSunday
                              ? 'var(--cream-light)'
                              : 'rgba(201,161,74,0.06)',
                          color: isSelectedDay ? 'var(--forest-deepest)' : 'inherit',
                          opacity: isSunday ? '0.3' : '1',
                          transition: 'all 0.15s',
                          width: '100%',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSunday && !isSelectedDay) {
                            (e.target as HTMLButtonElement).style.borderColor = 'var(--brass)';
                            (e.target as HTMLButtonElement).style.background = '#fbf6e8';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSunday && !isSelectedDay) {
                            (e.target as HTMLButtonElement).style.borderColor = 'var(--line)';
                            (e.target as HTMLButtonElement).style.background = 'rgba(201,161,74,0.06)';
                          }
                        }}
                        disabled={isSunday}
                      >
                        {dayObj.dayOfMonth}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs mono" style={{ color: 'rgba(0,0,0,0.5)' }}>
                {calendarDays[0]?.monthYear} · times shown in your local zone (EST)
              </div>
            </div>

            <div className="mb-5">
              <div className="text-xs eyebrow mb-2" style={{ color: 'var(--ink)' }}>
                Pick a time · <span id="cal-day-label">{selectedCalendarDay?.dayOfMonth} {selectedCalendarDay?.date.toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 max-h-64 overflow-y-auto p-2 rounded-sm" style={{ background: 'rgba(201,161,74,0.05)' }}>
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      border: selectedTime === time ? '1px solid var(--brass)' : '1px solid var(--line)',
                      background: selectedTime === time ? 'var(--brass)' : 'var(--cream-light)',
                      padding: '8px 6px',
                      textAlign: 'center',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      fontWeight: selectedTime === time ? '600' : '400',
                      color: selectedTime === time ? 'var(--forest-deepest)' : 'inherit',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTime !== time) {
                        (e.target as HTMLButtonElement).style.borderColor = 'var(--brass)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTime !== time) {
                        (e.target as HTMLButtonElement).style.borderColor = 'var(--line)';
                      }
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="mb-5 p-3 rounded-sm text-xs"
              style={{ background: 'rgba(201,161,74,0.1)', border: '1px solid rgba(201,161,74,0.3)' }}
            >
              <div className="flex items-start gap-2 mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brass-dim)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <div>
                  <strong style={{ color: 'var(--ink)' }}>
                    {selectedCalendarDay?.date.toLocaleString('default', { weekday: 'short' })} {selectedCalendarDay?.dayOfMonth} {selectedCalendarDay?.date.toLocaleString('default', { month: 'short' })} · {selectedTime.toUpperCase()} EST
                  </strong>
                  <br />
                  <span style={{ color: 'rgba(0,0,0,0.6)' }}>
                    {selectedService.duration} mins · {selectedService.price === 0 ? 'Free intro' : `$${selectedService.price}`}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col gap-3">
                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    if (!selectedCalendarDay) return;
                    const formattedDate = selectedCalendarDay.date.toISOString().split('T')[0]; // YYYY-MM-DD format
                    router.push(`/custodians/review?id=${id}&date=${formattedDate}&day=${selectedCalendarDay.dayOfMonth}&time=${encodeURIComponent(selectedTime)}&custodianName=${encodeURIComponent(custodian?.name || '')}&location=${encodeURIComponent(custodian?.location || '')}&session_type=${encodeURIComponent(selectedService.name)}&duration=${selectedService.duration}&price=${selectedService.price}`);
                  }}
                >
                  {selectedService.price === 0 ? 'Book free intro →' : `Book session for $${selectedService.price} →`}
                </button>
                <p className="text-xs text-center" style={{ color: 'rgba(0,0,0,0.4)' }}>
                  {selectedService.price === 0 ? 'No payment required for the intro' : 'Processed via platform'}
                </p>
              </div>
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <div className="text-sm" style={{ color: 'var(--ink)', fontWeight: '500', marginBottom: '8px' }}>
                Allow relatives to find me
              </div>
              <div className="text-xs" style={{ color: 'rgba(0,0,0,0.6)' }}>
                Appear in member search within hubs you've joined
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
