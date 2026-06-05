'use client';

import React, { useState, useEffect } from 'react';
import { AuthService } from '@/app/lib/authService';
import { useNotification } from '@/app/lib/NotificationContext';

const COUNTRY_DATA: Record<string, string[]> = {
  'Ghana': ['Accra', 'Cape Coast', 'Kumasi', 'Elmina', 'Tamale', 'Takoradi'],
  'Nigeria': ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City'],
  'Senegal': ['Dakar', 'Saint-Louis', 'Touba', 'Thiès'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
  'Ethiopia': ['Addis Ababa', 'Gondar', 'Lalibela', 'Axum'],
  'Egypt': ['Cairo', 'Alexandria', 'Luxor', 'Aswan'],
  'Morocco': ['Casablanca', 'Marrakech', 'Fes', 'Rabat'],
  'Tanzania': ['Dar es Salaam', 'Zanzibar City', 'Arusha', 'Dodoma'],
  'Benin': ['Cotonou', 'Porto-Novo', 'Ouidah'],
  'Gambia': ['Banjul', 'Serekunda', 'Bakau'],
};

const COMMON_LANGUAGES = [
  'English', 'French', 'Portuguese', 'Arabic', 'Swahili', 'Yoruba', 'Igbo',
  'Hausa', 'Zulu', 'Xhosa', 'Shona', 'Amharic', 'Oromo', 'Somali',
  'Twi', 'Ga', 'Ewe', 'Fante', 'Wolof', 'Bambara', 'Lingala', 'Kinyarwanda'
];

export default function CustodianProfile() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    country: '',
    years_experience: 0,
    specialty: '',
    description: '',
    availability: 'Available',
    status: 'active',
    certification: '',
    coc_status: '',
    sessions_count: 0,
    about: '',
    short_bio: '',
    whatsapp: '',
    instagram: '',
    linkedin: '',
    languages: [] as string[],
    services: [] as any[],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) throw new Error('User not found in storage');

      const storedUser = JSON.parse(userDataStr);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

      const response = await fetch(`${backendUrl}/api/admin/custodians/${storedUser.id}`, {
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const result = await response.json();
      const data = result.data;

      setUser(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        location: data.location || '',
        country: data.country || '',
        years_experience: data.years_experience || 0,
        specialty: data.specialty || '',
        description: data.description || '',
        availability: data.availability || 'Available',
        status: data.status || 'active',
        certification: data.certification || '',
        coc_status: data.coc_status || '',
        sessions_count: data.sessions_count || 0,
        about: data.about || '',
        short_bio: data.short_bio || '',
        whatsapp: data.whatsapp || '',
        instagram: data.instagram || '',
        linkedin: data.linkedin || '',
        languages: Array.isArray(data.languages) ? data.languages : [],
        services: Array.isArray(data.services) ? data.services : [],
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

      const response = await fetch(`${backendUrl}/api/admin/custodians/${user.id}`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update profile');
      }

      const result = await response.json();
      const updatedUser = result.data;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      showNotification('Profile updated successfully');

      // Refresh to update sidebar etc
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="a-loader"></div>
      </div>
    );
  }

  return (
    <>
      <div className="cust-eyebrow mb-2">Public Profile</div>
      <h1 className="cust-page-title">My OurRoots Profile</h1>
      <p className="cust-page-sub">
        This is what clients see before they book you. Your profile URL:{' '}
        <strong style={{ color: '#2d6a3f' }}>ourroots.africa/custodians/{user?.id}</strong>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        {/* Left: Photo + Quick Stats */}
        <div>
          {/* Photo card */}
          <div className="c-card c-card-pad" style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <div className="avatar avatar-photo" style={{ width: '80px', height: '80px', fontSize: '26px', border: '3px solid #e8e3d9' }}>
                {formData.name.charAt(0) || 'C'}
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
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>{formData.name}</div>
            <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', marginBottom: '12px' }}>
              {formData.location} · {formData.country} · {formData.years_experience} years experience
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span className="status-ok">✓ {formData.certification || 'Certified'}</span>
              <span className="a-badge-gray">⭐ {user?.review_avg || '5.0'} rating</span>
            </div>

            <button
              onClick={() => {
                const url = `${window.location.origin}/custodians/${user?.id}`;
                navigator.clipboard.writeText(url);
                showNotification('Profile link copied to clipboard');
              }}
              className="c-btn-ghost"
              style={{ width: '100%' }}
            >
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
                onClick={() => {
                  const link = formData.whatsapp || `https://wa.me/?text=Check out my profile on OurRoots: ${window.location.origin}/custodians/${user?.id}`;
                  window.open(link.startsWith('http') ? link : `https://wa.me/${link}`, '_blank');
                }}
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
                onClick={() => {
                  const link = formData.linkedin || `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.origin}/custodians/${user?.id}`;
                  window.open(link.startsWith('http') ? link : `https://www.linkedin.com/in/${link}`, '_blank');
                }}
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
                onClick={() => {
                  const link = formData.instagram || `https://www.instagram.com/`;
                  window.open(link.startsWith('http') ? link : `https://www.instagram.com/${link}`, '_blank');
                }}
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
        <form onSubmit={handleSave}>
          {/* Profile information card */}
          <div className="c-card c-card-pad" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
              Profile information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                  Email
                </label>
                <input
                  disabled
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid #e8e3d9',
                    borderRadius: '5px',
                    fontSize: '14px',
                    color: '#8a7f72',
                    fontFamily: "'Instrument Sans', sans-serif",
                    boxSizing: 'border-box',
                    background: '#f9f8f6'
                  }}
                  value={formData.email}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                  Country
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid #e8e3d9',
                    borderRadius: '5px',
                    fontSize: '14px',
                    color: '#1a1a1a',
                    fontFamily: "'Instrument Sans', sans-serif",
                    boxSizing: 'border-box',
                    background: 'white'
                  }}
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value, location: '' })}
                >
                  <option value="">Select Country</option>
                  {Object.keys(COUNTRY_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                  Location (City)
                </label>
                <select
                  disabled={!formData.country}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid #e8e3d9',
                    borderRadius: '5px',
                    fontSize: '14px',
                    color: '#1a1a1a',
                    fontFamily: "'Instrument Sans', sans-serif",
                    boxSizing: 'border-box',
                    background: !formData.country ? '#f9f8f6' : 'white'
                  }}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  <option value="">Select City</option>
                  {formData.country && COUNTRY_DATA[formData.country]?.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                  Specialty
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid #e8e3d9',
                    borderRadius: '5px',
                    fontSize: '14px',
                    color: '#1a1a1a',
                    fontFamily: "'Instrument Sans', sans-serif",
                    boxSizing: 'border-box',
                    background: 'white'
                  }}
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                >
                  <option value="">Select Specialty</option>
                  <option value="Heritage sites">Heritage sites</option>
                  <option value="Naming ceremony">Naming ceremony</option>
                  <option value="Genealogy">Genealogy</option>
                  <option value="Language">Language</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                  Years Experience
                </label>
                <input
                  type="number"
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
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                Description (General Bio)
              </label>
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
                  minHeight: '60px',
                  boxSizing: 'border-box',
                }}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of your background..."
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                Short Bio (Featured Quote)
              </label>
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
                  minHeight: '50px',
                  boxSizing: 'border-box',
                }}
                value={formData.short_bio}
                onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
                placeholder="E.g., 'I have guided 200+ relatives through the Door of No Return...'"
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                About Section (Detailed)
              </label>
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
                  minHeight: '100px',
                  boxSizing: 'border-box',
                }}
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                placeholder="Detailed information about your training, philosophy, and expertise..."
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                Languages
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <select
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    border: '1.5px solid #e8e3d9',
                    borderRadius: '5px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !formData.languages.includes(val)) {
                      setFormData({ ...formData, languages: [...formData.languages, val] });
                    }
                  }}
                >
                  <option value="">Add a language...</option>
                  {COMMON_LANGUAGES.map(l => (
                    <option key={l} value={l} disabled={formData.languages.includes(l)}>{l}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {formData.languages.map((lang, idx) => (
                  <span key={idx} style={{ background: '#111827', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {lang}
                    <button type="button" onClick={() => setFormData({ ...formData, languages: formData.languages.filter((_, i) => i !== idx) })} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links Section */}
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: '24px 0 16px' }}>
              Social Media Links
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                WhatsApp (Phone or Link)
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1.5px solid #e8e3d9',
                  borderRadius: '5px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="E.g., +233241234567 or https://wa.me/..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                  Instagram (Username or Link)
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid #e8e3d9',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="E.g., @akosua_roots"
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>
                  LinkedIn (Username or Link)
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid #e8e3d9',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="E.g., akosua-obel"
                />
              </div>
            </div>

            {/* ─── SERVICES & PRICING ─── */}
            <div style={{ borderTop: '1px solid #e8e3d9', paddingTop: '20px', marginTop: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
                Services & Pricing
              </div>

              {formData.services.map((service, idx) => (
                <div key={idx} style={{ marginBottom: '16px', padding: '12px', background: '#f9f8f6', borderRadius: '6px', border: '1px solid #e8e3d9', position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.services.filter((_, i) => i !== idx);
                      setFormData({ ...formData, services: updated });
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: '#8a7f72', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                        Service Name
                      </label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => {
                          const updated = [...formData.services];
                          updated[idx].name = e.target.value;
                          setFormData({ ...formData, services: updated });
                        }}
                        placeholder="Service name"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #e8e3d9',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: '#8a7f72', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                        Price ($)
                      </label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => {
                          const updated = [...formData.services];
                          updated[idx].price = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, services: updated });
                        }}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #e8e3d9',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: '#8a7f72', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={service.description}
                      onChange={(e) => {
                        const updated = [...formData.services];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, services: updated });
                      }}
                      placeholder="Service description"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #e8e3d9',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    services: [...formData.services, { name: '', price: 0, description: '' }]
                  });
                }}
                className="c-btn-ghost"
                style={{ width: '100%', marginBottom: '20px', borderStyle: 'dashed' }}
              >
                + Add Another Service
              </button>
            </div>

            <button type="submit" disabled={submitting} className="c-btn-primary" style={{ minWidth: '140px', marginTop: '10px' }}>
              {submitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>

          {/* Availability card */}
          <div className="c-card c-card-pad">
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '14px' }}>
              Availability
            </div>
            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '10px' }}>
              Current status: <span className={formData.availability === 'Available' ? 'status-ok' : 'status-warn'}>
                {formData.availability === 'Available' ? 'Available for bookings' : 'Currently Booked/Busy'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, availability: formData.availability === 'Available' ? 'Booked' : 'Available' })}
              className="c-btn-ghost"
            >
              Mark as {formData.availability === 'Available' ? 'unavailable' : 'available'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
