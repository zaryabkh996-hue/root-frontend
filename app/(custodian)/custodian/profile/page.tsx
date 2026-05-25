'use client';

export default function CustodianProfile() {
  return (
    <>
      <div className="cust-eyebrow mb-2">Public Profile</div>
      <h1 className="cust-page-title">My OurRoots Profile</h1>
      <p className="cust-page-sub">
        This is what clients see before they book you. Your profile URL:{' '}
        <strong style={{ color: '#2d6a3f' }}>ourroots.africa/custodians/akosua-o</strong>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        {/* Left: Photo + Quick Stats */}
        <div>
          {/* Photo card */}
          <div className="c-card c-card-pad" style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <div className="avatar avatar-photo" style={{ width: '80px', height: '80px', fontSize: '26px', border: '3px solid #e8e3d9' }}>
                A
              </div>
              <button
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#2d6a3f',
                  border: '2px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>Akosua O.</div>
            <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', marginBottom: '12px' }}>
              Accra · Ghana · 12 years experience
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span className="status-ok">✓ Afrofeast Certified</span>
              <span className="a-badge-gray">⭐ 4.9 rating</span>
            </div>
            <button className="c-btn-primary" style={{ width: '100%', marginBottom: '8px' }}>
              Save profile
            </button>
            <button className="c-btn-ghost" style={{ width: '100%' }}>
              Share profile
            </button>
          </div>

          {/* Share buttons card */}
          <div className="c-card c-card-pad" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Share my profile
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#14532d',
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.76.46 3.41 1.26 4.84L2 22l5.31-1.23A10 10 0 1012 2zm0 18.16a8.12 8.12 0 01-4.14-1.14l-.3-.18-3.13.82.84-3.04-.2-.31A8.13 8.13 0 013.84 12c0-4.51 3.67-8.18 8.16-8.18 4.51 0 8.18 3.67 8.18 8.18 0 4.51-3.67 8.16-8.16 8.16z" />
                </svg>
                Share via WhatsApp
              </button>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  background: '#eff6ff',
                  border: '1px solid #93c5fd',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#1e40af',
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                Share on LinkedIn
              </button>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  background: '#fdf4ff',
                  border: '1px solid #d8b4fe',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#7e22ce',
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="#a855f7" stroke="none" />
                </svg>
                Share on Instagram
              </button>
            </div>
          </div>
        </div>

        {/* Right: Editable Profile */}
        <div>
          {/* Profile information card */}
          <div className="c-card c-card-pad" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
              Profile information
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                Full name
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1.5px solid #e8e3d9',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontFamily: "'Instrument Sans', sans-serif",
                  boxSizing: 'border-box',
                }}
                defaultValue="Akosua O."
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                Location
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1.5px solid #e8e3d9',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontFamily: "'Instrument Sans', sans-serif",
                  boxSizing: 'border-box',
                }}
                defaultValue="Accra, Ghana"
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Bio (visible to clients before booking)
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="c-listen-btn">🔊 Listen</button>
                  <div className="c-mic-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2d6a3f" strokeWidth="2">
                      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                  </div>
                </div>
              </div>
              <textarea
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1.5px solid #e8e3d9',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontFamily: "'Instrument Sans', sans-serif",
                  resize: 'vertical',
                  minHeight: '90px',
                  boxSizing: 'border-box',
                }}
                defaultValue="Heritage educator from Cape Coast, Ghana. I have guided 200+ diaspora relatives through the Door of No Return. Trauma-informed. Twi and Fante speaker. 12 years experience."
              />
              <div style={{ fontSize: '11px', color: '#8a7f72', marginTop: '6px', display: 'none' }}>
                Transcribing with AfriqueLLM...
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                Specialties
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="a-badge-gray">Heritage sites</span>
                <span className="a-badge-gray">Twi</span>
                <span className="a-badge-gray">Fante</span>
                <span className="a-badge-gray">Grief facilitation</span>
                <button
                  style={{
                    padding: '3px 9px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    background: '#f5f3ee',
                    border: '1px dashed #d4cfc5',
                    color: '#8a7f72',
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  + Add
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                Session rate
              </label>
              <input
                style={{
                  width: '160px',
                  padding: '9px 12px',
                  border: '1.5px solid #e8e3d9',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontFamily: "'Instrument Sans', sans-serif",
                  boxSizing: 'border-box',
                }}
                defaultValue="$80"
              />
            </div>

            <button className="c-btn-primary">Save changes</button>
          </div>

          {/* Availability card */}
          <div className="c-card c-card-pad">
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '14px' }}>
              Availability
            </div>
            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '10px' }}>
              Current status: <span className="status-ok">Available for bookings</span>
            </div>
            <button className="c-btn-ghost">Mark as unavailable</button>
          </div>
        </div>
      </div>
    </>
  );
}
