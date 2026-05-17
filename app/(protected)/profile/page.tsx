'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '../../lib/progressContext';

interface UserProfile {
  id?: number;
  name?: string;
  email?: string;
  whatsapp?: string;
  picture?: string;
  bio?: string;
  bioPrivacy?: string;
  travelDate?: string;
  travelLocation?: string;
  diasporaGroup?: string;
  learningPreference?: string;
  memberSince?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Amara Johnson',
  email: 'amara.johnson@gmail.com',
  whatsapp: '+1 404 555 0123',
  bio: 'Third-generation Igbo diaspora from Atlanta, GA. Making my first return home to Ghana in September 2026. I am a Heritage Seeker — learning what was never taught, remembering what was never forgotten.',
  bioPrivacy: 'public',
  travelDate: 'Sept 14 — Sept 28, 2026',
  travelLocation: 'Accra',
  diasporaGroup: 'United States & Canada',
  learningPreference: 'Listening · audio-first',
  memberSince: '12 March 2026',
};

export default function ProfilePage() {
  const router = useRouter();
  const { progress } = useProgress();

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [bio, setBio] = useState(DEFAULT_PROFILE.bio || '');
  const [bioEdit, setBioEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  // Visibility state
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [photosDefault, setPhotosDefault] = useState('community');

  // Notifications state
  const [notifications, setNotifications] = useState({
    stageTransitions: true,
    preTripCheckIns: true,
    communityDigest: true,
    newCustodians: false,
  });

  // ── Load user profile from localStorage and API on mount ──
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);

        // Step 1: Get user data from localStorage (already logged in)
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserProfile(prev => ({
            ...prev,
            name: parsedUser.name || prev.name,
            email: parsedUser.email || prev.email,
            picture: parsedUser.picture || prev.picture,
          }));
        }

        // Step 2: Fetch full profile from API if authenticated
        if (token) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const response = await fetch(`${apiUrl}/user/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const profileData = await response.json();
            if (profileData.data) {
              const data = profileData.data;
              setUserProfile(prev => ({
                ...prev,
                id: data.id || prev.id,
                name: data.name || prev.name,
                email: data.email || prev.email,
                whatsapp: data.whatsapp || prev.whatsapp,
                picture: data.picture || prev.picture,
                bio: data.bio || prev.bio,
                bioPrivacy: data.bioPrivacy || prev.bioPrivacy,
                travelDate: data.travelDate || prev.travelDate,
                travelLocation: data.travelLocation || prev.travelLocation,
                diasporaGroup: data.diasporaGroup || prev.diasporaGroup,
                learningPreference: data.learningPreference || prev.learningPreference,
                memberSince: data.memberSince || prev.memberSince,
              }));
              setBio(data.bio || DEFAULT_PROFILE.bio || '');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // ── Sync bio state when userProfile.bio changes ──
  useEffect(() => {
    if (!bioEdit && userProfile.bio) {
      setBio(userProfile.bio);
    }
  }, [userProfile.bio, bioEdit]);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBioEdit = () => {
    if (bioEdit) {
      setBioEdit(false);
    } else {
      setBioEdit(true);
    }
  };

  const saveBio = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio, bioPrivacy: userProfile.bioPrivacy }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserProfile(prev => ({
          ...prev,
          bio: bio,
          bioPrivacy: userProfile.bioPrivacy,
        }));
        setBioEdit(false);
        console.log('Bio saved successfully');
      } else {
        console.error('Failed to save bio:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving bio:', error);
    }
  };

  const cycleBioPrivacy = () => {
    const cycle = ['public', 'community', 'private'];
    const currentIndex = cycle.indexOf(userProfile.bioPrivacy || 'public');
    const nextPrivacy = cycle[(currentIndex + 1) % cycle.length];
    setUserProfile(prev => ({ ...prev, bioPrivacy: nextPrivacy }));
  };

  const getUserName = () => {
    return userProfile.name || 'Amara Johnson';
  };

  const getAfroScore = () => {
    return progress?.afroScore || 84;
  };

  return (
    <>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          {/* Profile Photo */}
          <div className="text-center mb-8">
            <div
              className="profile-photo-wrap mx-auto mb-4"
              onClick={() => alert('Photo picker modal')}
              style={{ width: '96px', cursor: 'pointer' }}
              title="Click to change your photo"
            >
              <div
                className="avatar avatar-xl"
                id="profile-avatar-initials"
                style={{ background: 'linear-gradient(135deg,#d47449,#7a2e10)' }}
              >
                {progress?.userName?.split(' ').map(n => n[0]).join('') || 'AJ'}
              </div>
              <div className="photo-cam-overlay">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
            <h2 className="display text-3xl mb-1">{getUserName()}</h2>
            <div className="eyebrow eyebrow-cream mb-3">{progress?.userPersona || 'Heritage Seeker'} · {userProfile.travelLocation || 'Atlanta, GA'}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="tag tag-brass">Preparation tier</span>
              <span className="tag tag-emerald">Active</span>
            </div>
            <div className="text-xs text-cream/50 mono mt-3">Member since {userProfile.memberSince || '12 March 2026'}</div>
          </div>

          {/* Bio */}
          <div className="scard-dark p-5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="eyebrow eyebrow-cream">Your story</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  id="bio-privacy-label"
                  className="text-xs mono text-cream/50"
                  style={{ cursor: 'pointer' }}
                  onClick={cycleBioPrivacy}
                >
                  {userProfile.bioPrivacy === 'public' && '🌐 Public'}
                  {userProfile.bioPrivacy === 'community' && '🤝 Members'}
                  {userProfile.bioPrivacy === 'private' && '🔒 Private'}
                </div>
                <button
                  id="bio-edit-btn"
                  className="text-xs text-brass-light/80 hover:text-brass-light underline"
                  onClick={handleBioEdit}
                >
                  {bioEdit ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>
            {!bioEdit ? (
              <p id="bio-display" className="text-sm text-cream/80 leading-relaxed">
                {userProfile.bio || bio}
              </p>
            ) : (
              <>
                <textarea
                  id="bio-textarea"
                  className="field-dark resize-y w-full mt-2"
                  rows={4}
                  maxLength={280}
                  defaultValue={bio}
                  onChange={e => setBio(e.target.value)}
                />
                <div className="flex items-center justify-between mt-3">
                  <div id="bio-char-count" className="text-xs text-cream/40 mono">
                    {bio.length} / 280
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-ghost-dark text-xs" onClick={handleBioEdit}>
                      Cancel
                    </button>
                    <button className="btn-primary text-xs" onClick={saveBio}>
                      Save
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Readiness Score */}
          <div className="scard-dark p-5">
            <div className="eyebrow eyebrow-cream mb-3">Readiness</div>
            <div className="display text-5xl font-light text-brass-light mb-1">{getAfroScore()}</div>
            <div className="text-xs text-cream/60 mono mb-5">retaken 4 days ago</div>
            <button
              className="btn-ghost-dark w-full justify-center text-xs"
              onClick={() => alert('Quiz retake not yet available')}
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
              title="Quiz retake available 90 days after your last attempt, or post-journey"
            >
              Retake not yet available
            </button>
            <div className="text-xs text-cream/40 mono mt-2 text-center leading-relaxed">
              Next eligible: 4 Aug 2026 · or after your return from Ghana
            </div>
          </div>

          {/* Heritage Identity */}
          <div className="scard-dark p-5 mt-4">
            <div className="eyebrow eyebrow-cream mb-3">Heritage Identity</div>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs text-cream/50 mono mb-1">Lifecycle phase</div>
                <div className="text-cream font-medium">{progress?.lifecyclePhase || 'Immersive Preparation'}</div>
                <div className="text-xs text-cream/55 leading-relaxed mt-0.5">Score 60–84 · the default committed-user path</div>
              </div>
              <div className="border-t border-brass/10 pt-4">
                <div className="text-xs text-cream/50 mono mb-1">Diaspora group</div>
                <div className="text-cream font-medium">{userProfile.diasporaGroup || 'United States & Canada'}</div>
                <div className="text-xs text-cream/55 leading-relaxed mt-0.5">Shapes the framing of Stage 1, 5, and 6 modules</div>
                <button className="text-xs text-brass-light/80 hover:text-brass-light underline mt-2">Change</button>
              </div>
              <div className="border-t border-brass/10 pt-4">
                <div className="text-xs text-cream/50 mono mb-1">Learning preference</div>
                <div className="text-cream font-medium">{userProfile.learningPreference || 'Listening · audio-first'}</div>
                <div className="text-xs text-cream/55 leading-relaxed mt-0.5">Audio modules surface first; transcripts always available</div>
                <button className="text-xs text-brass-light/80 hover:text-brass-light underline mt-2">Change</button>
              </div>
            </div>
          </div>

          {/* Adinkra Badges */}
          <div className="scard-dark p-5 mt-4">
            <div className="eyebrow eyebrow-cream mb-3">Adinkra badges · 1 of 7</div>
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="text-center">
                <div
                  className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1"
                  style={{ background: 'rgba(201,161,74,0.18)', fontSize: '18px' }}
                >
                  💕
                </div>
                <div className="text-xs text-cream/85 leading-tight">Akoma</div>
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center" style={{ opacity: 0.35 }}>
                  <div
                    className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1"
                    style={{ background: 'rgba(243,237,224,0.06)', fontSize: '18px' }}
                  >
                    {i === 1 && '💼'}
                    {i === 2 && '🎒'}
                    {i === 3 && '🌟'}
                  </div>
                  <div className="text-xs text-cream/40 leading-tight">
                    {i === 1 && 'Dwennimmen'}
                    {i === 2 && 'Nkyinkyim'}
                    {i === 3 && 'Sankofa'}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-cream/55 leading-relaxed">Akoma earned 18 April · "patience, endurance, tolerance, love." Three more await this stage.</div>
          </div>

          {/* Journey Photos */}
          <div className="scard-dark p-5 mt-4">
            <div className="flex items-center justify-between mb-1">
              <div className="eyebrow eyebrow-cream">Journey Photos</div>
              <button className="text-xs text-brass-light/80 hover:text-brass-light underline" onClick={() => alert('Add photo modal')}>
                + Add photo
              </button>
            </div>
            <p className="text-xs text-cream/50 leading-relaxed mb-3">Share moments from your preparation and your time in Ghana. Visible to your hubs — choose which ones.</p>
            <div className="journey-photo-grid">
              {[
                { caption: 'Kotoka Airport · landing day', hub: 'Love Hub', gradient: 'linear-gradient(135deg,#5c3a1e 0%,#2a1a0a 50%,#3d2810 100%)' },
                { caption: 'Cape Coast Castle', hub: 'Private', gradient: 'linear-gradient(160deg,#1a2a1e 0%,#0a1810 60%,#2a3820 100%)' },
                { caption: 'Kejetia Market, Kumasi', hub: 'Love Hub', gradient: 'linear-gradient(145deg,#7d4f1a 0%,#3a2a0a 50%,#5a3a10 100%)' },
              ].map((photo, idx) => (
                <div
                  key={idx}
                  className="journey-photo-slot has-photo"
                  style={{ background: photo.gradient }}
                  onClick={() => alert(`View: ${photo.caption}`)}
                >
                  <div className="photo-caption">{photo.caption}</div>
                  <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '9px', background: 'rgba(10,24,16,0.7)', color: 'rgba(243,237,224,0.7)', padding: '2px 5px', borderRadius: '2px' }}>
                    {photo.hub}
                  </div>
                </div>
              ))}
              {[1, 2, 3].map(idx => (
                <div
                  key={`empty-${idx}`}
                  className="journey-photo-slot"
                  onClick={() => alert('Add photo modal')}
                  style={{ flexDirection: 'column', gap: '6px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(201,161,74,0.4)" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <div style={{ fontSize: '10px', color: 'rgba(201,161,74,0.5)' }}>Add photo</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account */}
          <div>
            <div className="eyebrow eyebrow-cream mb-3">Account</div>
            <div className="scard-dark p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-cream font-medium">Email</div>
                  <div className="text-xs text-cream/50 mt-1">{userProfile.email || 'amara.johnson@gmail.com'}</div>
                </div>
                <button className="btn-ghost-dark text-xs">Change</button>
              </div>
              <div className="border-t border-brass/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-cream font-medium">WhatsApp</div>
                  <div className="text-xs text-cream/50 mt-1">{userProfile.whatsapp || '+1 404 555 0123'} · verified</div>
                </div>
                <button className="btn-ghost-dark text-xs">Change</button>
              </div>
              <div className="border-t border-brass/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-cream font-medium">Travel date</div>
                  <div className="text-xs text-cream/50 mt-1">{userProfile.travelDate || 'Sept 14 — Sept 28, 2026'} · {userProfile.travelLocation || 'Accra'}</div>
                </div>
                <button className="btn-ghost-dark text-xs">Edit</button>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div>
            <div className="eyebrow eyebrow-cream mb-3">Subscription</div>
            <div className="scard-dark p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-brass/10">
                <div>
                  <div className="display text-xl text-cream">Preparation · $67/mo</div>
                  <div className="text-xs text-cream/50 mt-1">Renews 12 June 2026 · cancel any time</div>
                </div>
                <button className="btn-ghost-dark text-xs">Manage</button>
              </div>
              <div className="text-xs text-cream/60 leading-relaxed">
                Most relatives stay subscribed for 3–6 months. Your trip is in 4 months. The 6-month $347 package saves $55.
              </div>
              <button className="btn-primary mt-4 text-xs">Switch to 6-month · save $55</button>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <div className="eyebrow eyebrow-cream mb-3">Notifications</div>
            <div className="scard-dark p-6 space-y-4">
              {[
                { key: 'stageTransitions', label: 'Stage transitions', desc: 'When new stages unlock' },
                { key: 'preTripCheckIns', label: 'Pre-trip check-ins', desc: '7 days before, day-of, 3 days after arrival' },
                { key: 'communityDigest', label: 'Community digest', desc: 'Weekly summary' },
                { key: 'newCustodians', label: 'New custodians', desc: 'When a Custodian joins your countries of interest' },
              ].map((notif, idx) => (
                <div key={notif.key} className={idx > 0 ? 'border-t border-brass/10 pt-4' : ''}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-cream font-medium">{notif.label}</div>
                      <div className="text-xs text-cream/50 mt-1">{notif.desc}</div>
                    </div>
                    <div className="check" style={{ background: notifications[notif.key as keyof typeof notifications] ? 'var(--brass)' : 'transparent', border: '1px solid rgba(201,161,74,0.3)' }} onClick={() => toggleNotification(notif.key as keyof typeof notifications)}>
                      {notifications[notif.key as keyof typeof notifications] && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility & Privacy */}
          <div>
            <div className="eyebrow eyebrow-cream mb-3">Visibility & Privacy</div>
            <div className="scard-dark p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm text-cream font-medium mb-0.5">Profile visibility</div>
                  <div className="text-xs text-cream/50 leading-relaxed">Who can see your name, photo, bio, and Afrofeast Score.</div>
                </div>
                <div style={{ display: 'flex', border: '1px solid rgba(201,161,74,0.2)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  {['public', 'community', 'private'].map((opt, idx) => (
                    <button
                      key={opt}
                      onClick={() => setProfileVisibility(opt)}
                      style={{
                        padding: '5px 10px',
                        fontSize: '10px',
                        fontFamily: "'JetBrains Mono',monospace",
                        cursor: 'pointer',
                        background: profileVisibility === opt ? 'rgba(201,161,74,0.18)' : 'transparent',
                        color: profileVisibility === opt ? 'var(--brass-light)' : 'rgba(243,237,224,0.5)',
                        border: 'none',
                        borderRight: idx < 2 ? '1px solid rgba(201,161,74,0.2)' : 'none',
                      }}
                    >
                      {opt === 'public' && '🌐 Public'}
                      {opt === 'community' && '🤝 Members'}
                      {opt === 'private' && '🔒 Private'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-brass/10 pt-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm text-cream font-medium mb-0.5">Journey photos default</div>
                  <div className="text-xs text-cream/50 leading-relaxed">Default for new photos. You can override each photo individually.</div>
                </div>
                <div style={{ display: 'flex', border: '1px solid rgba(201,161,74,0.2)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  {['public', 'community', 'private'].map((opt, idx) => (
                    <button
                      key={opt}
                      onClick={() => setPhotosDefault(opt)}
                      style={{
                        padding: '5px 10px',
                        fontSize: '10px',
                        fontFamily: "'JetBrains Mono',monospace",
                        cursor: 'pointer',
                        background: photosDefault === opt ? 'rgba(201,161,74,0.18)' : 'transparent',
                        color: photosDefault === opt ? 'var(--brass-light)' : 'rgba(243,237,224,0.5)',
                        border: 'none',
                        borderRight: idx < 2 ? '1px solid rgba(201,161,74,0.2)' : 'none',
                      }}
                    >
                      {opt === 'public' && '🌐 Public'}
                      {opt === 'community' && '🤝 Members'}
                      {opt === 'private' && '🔒 Private'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-brass/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-cream font-medium">Show Afrofeast Score publicly</div>
                  <div className="text-xs text-cream/50 mt-0.5">Visitors see your 84 score and Heritage Seeker persona</div>
                </div>
                <div className="check" style={{ background: 'var(--brass)', border: '1px solid rgba(201,161,74,0.3)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>

              <div className="border-t border-brass/10 pt-4">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(201,161,74,0.06)', border: '1px solid rgba(201,161,74,0.15)', borderRadius: '3px', padding: '12px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="text-xs text-cream/65 leading-relaxed">
                    <strong className="text-cream">Reflection Lab entries are always private.</strong> What you write in journal prompts is encrypted. No admin, Custodian, or hub member can ever read it — only you.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div>
            <div className="eyebrow eyebrow-cream mb-3">Privacy & data</div>
            <div className="scard-dark p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-cream font-medium">Download my data</div>
                  <div className="text-xs text-cream/50 mt-1">Full JSON export · GDPR Article 15</div>
                </div>
                <button className="btn-ghost-dark text-xs">Request</button>
              </div>
              <div className="border-t border-brass/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-cream font-medium">Edit consents</div>
                  <div className="text-xs text-cream/50 mt-1">Per-purpose toggle</div>
                </div>
                <button className="btn-ghost-dark text-xs">Open</button>
              </div>
              <div className="border-t border-brass/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--rose)' }}>
                    Delete my account
                  </div>
                  <div className="text-xs text-cream/50 mt-1">Irreversible · 7-day grace period</div>
                </div>
                <button className="text-xs underline" style={{ color: 'var(--rose)' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Certificates */}
          <div>
            <div className="eyebrow eyebrow-cream mb-3">Your certificates</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="scard-dark p-5 text-center">
                <div className="display text-2xl text-brass-light mb-2">{getAfroScore()}</div>
                <div className="text-sm text-cream font-medium mb-1">Heritage Readiness</div>
                <div className="text-xs text-cream/50 mono mb-3">issued 22 Apr 2026</div>
                <button className="btn-ghost-dark w-full justify-center text-xs">Download PDF</button>
              </div>
              <div className="scard-dark p-5 text-center" style={{ opacity: 0.5 }}>
                <div className="display text-2xl text-cream mb-2">—</div>
                <div className="text-sm text-cream font-medium mb-1">Day Name</div>
                <div className="text-xs text-cream/50 mono mb-3">awaits naming ceremony</div>
                <button className="btn-ghost-dark w-full justify-center text-xs" disabled>
                  Locked
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    
    </>
  );
}
