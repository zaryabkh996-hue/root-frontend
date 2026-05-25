'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '../../lib/progressContext';
import { AuthService } from '@/app/lib/authService';

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
  profileVisibility?: string;
  journeyPhotosDefault?: string;
  showScorePublicly?: boolean;
  afroScore?: number;
  userPersona?: string;
  lifecyclePhase?: string;
  completedStages?: string[];
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Loading...',
  email: '',
  whatsapp: '',
  picture: '',
  bio: '',
  bioPrivacy: 'public',
  travelDate: '',
  travelLocation: '',
  diasporaGroup: '',
  learningPreference: '',
  memberSince: '',
  profileVisibility: 'public',
  journeyPhotosDefault: 'community',
  showScorePublicly: true,
  completedStages: [],
};

export default function ProfilePage() {
  const router = useRouter();
  const { progress } = useProgress();

  // Main profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for each editable field
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

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

  // Certificate state
  const [certificateInfo, setCertificateInfo] = useState<any>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);

  // Journey photos state
  const [journeyPhotos, setJourneyPhotos] = useState<any[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  // Profile picture upload state
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // ── Load user profile on mount ──
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
        console.log('[Profile Load] Fetching from:', `${apiUrl}/user/profile`);
        
        const response = await fetch(`${apiUrl}/user/profile`, {
          headers: AuthService.getAuthHeaders(),
        });

        console.log('[Profile Load] Response status:', response.status);

        if (response.ok) {
          const profileData = await response.json();
          console.log('[Profile Load] Full response:', profileData);
          
          if (profileData.data) {
            const data = profileData.data;
            console.log('[Profile Load] Profile data:', data);
            console.log('[Profile Load] Picture URL:', data.picture);
            
            setUserProfile(data);
            setFormValues({
              name: data.name,
              email: data.email,
              whatsapp: data.whatsapp,
              bio: data.bio,
              travelDate: data.travelDate,
              travelLocation: data.travelLocation,
              diasporaGroup: data.diasporaGroup,
              learningPreference: data.learningPreference,
            });
            setProfileVisibility(data.profileVisibility || 'public');
            setPhotosDefault(data.journeyPhotosDefault || 'community');
          }
        } else {
          console.error('[Profile Load] Response not OK:', response.status);
          setError('Failed to load profile');
        }
      } catch (error) {
        console.error('[Profile Load] Exception:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
    loadCertificateInfo();
    loadJourneyPhotos();
  }, []);

  // ── Load journey photos ──
  const loadJourneyPhotos = async () => {
    try {
      setPhotosLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
      console.log('[Journey Photos Load] Fetching from:', `${apiUrl}/user/journey-photos`);
      
      const response = await fetch(`${apiUrl}/user/journey-photos`, {
        headers: AuthService.getAuthHeaders(),
      });

      console.log('[Journey Photos Load] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[Journey Photos Load] Full response:', data);
        console.log('[Journey Photos Load] Photos array:', data.data);
        
        setJourneyPhotos(data.data || []);
      } else {
        console.log('[Journey Photos Load] Response not OK - using empty array');
        setJourneyPhotos([]);
      }
    } catch (error) {
      console.error('[Journey Photos Load] Exception:', error);
      setJourneyPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  };

  // ── Load certificate info ──
  const loadCertificateInfo = async () => {
    try {
      setCertificateLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
      const response = await fetch(`${apiUrl}/certificates/info`, {
        headers: AuthService.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setCertificateInfo(data.data);
      }
    } catch (error) {
      console.error('Failed to load certificate info:', error);
    } finally {
      setCertificateLoading(false);
    }
  };

  // ── Handle field edit ──
  const startEdit = (fieldName: string) => {
    setEditingField(fieldName);
    setSuccess(null);
  };

  // ── Handle save field ──
  const saveField = async (fieldName: string, apiFieldName: string) => {
    try {
      setSaving(true);
      setError(null);

      const updateData: { [key: string]: any } = {
        [apiFieldName]: formValues[fieldName],
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
      const response = await fetch(`${apiUrl}/user/profile`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        setUserProfile(prev => ({
          ...prev,
          [apiFieldName]: updateData[apiFieldName],
        }));
        setEditingField(null);
        setSuccess(`${fieldName} updated successfully`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving field:', error);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ── Handle bio save (special case with privacy) ──
  const saveBio = async () => {
    try {
      setSaving(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
      const response = await fetch(`${apiUrl}/user/profile`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          bio: formValues.bio,
          bioPrivacy: userProfile.bioPrivacy,
        }),
      });

      if (response.ok) {
        setUserProfile(prev => ({
          ...prev,
          bio: formValues.bio,
        }));
        setEditingField(null);
        setSuccess('Bio updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving bio:', error);
      setError('Failed to save bio');
    } finally {
      setSaving(false);
    }
  };

  // ── Handle privacy cycle ──
  const cycleBioPrivacy = async () => {
    try {
      const cycle = ['public', 'community', 'private'];
      const currentIndex = cycle.indexOf(userProfile.bioPrivacy || 'public');
      const nextPrivacy = cycle[(currentIndex + 1) % cycle.length];

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
      const response = await fetch(`${apiUrl}/user/profile`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          bioPrivacy: nextPrivacy,
        }),
      });

      if (response.ok) {
        setUserProfile(prev => ({ ...prev, bioPrivacy: nextPrivacy }));
      }
    } catch (error) {
      console.error('Error updating privacy:', error);
    }
  };

  // ── Handle visibility change ──
  const updateVisibility = async (newVisibility: string) => {
    try {
      setProfileVisibility(newVisibility);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
      await fetch(`${apiUrl}/user/profile`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          profileVisibility: newVisibility,
        }),
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // ── Handle photos default change ──
  const updatePhotosDefault = async (newDefault: string) => {
    try {
      setPhotosDefault(newDefault);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
      await fetch(`${apiUrl}/user/profile`, {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          journeyPhotosDefault: newDefault,
        }),
      });
    } catch (error) {
      console.error('Error updating photos default:', error);
    }
  };

  // ── Handle profile picture upload ──
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPicture(true);
      setError(null);

      console.log('[Profile Picture] 1. Upload started');
      console.log('[Profile Picture] - File name:', file.name);
      console.log('[Profile Picture] - File size:', file.size, 'bytes');
      console.log('[Profile Picture] - File type:', file.type);

      const formData = new FormData();
      formData.append('picture', file);

      const token = localStorage.getItem('authToken');
      const headers: any = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('[Profile Picture] 2. Headers:', headers);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
      console.log('[Profile Picture] 3. API URL:', apiUrl);

      const response = await fetch(`${apiUrl}/user/profile/picture`, {
        method: 'POST',
        headers,
        body: formData,
      });

      console.log('[Profile Picture] 4. Response status:', response.status);
      const result = await response.json();
      console.log('[Profile Picture] 5. Response data:', result);

      if (response.ok) {
        const pictureUrl = result.data?.picture || file.name;
        console.log('[Profile Picture] 6. Picture URL received:', pictureUrl);
        
        setUserProfile(prev => {
          console.log('[Profile Picture] 7. Setting user profile with picture:', pictureUrl);
          return {
            ...prev,
            picture: pictureUrl,
          };
        });
        
        setSuccess('Profile picture updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.error('[Profile Picture] ERROR Response:', result);
        setError(result.message || 'Failed to upload picture');
      }
    } catch (error) {
      console.error('[Profile Picture] Exception:', error);
      setError('Failed to upload picture');
    } finally {
      setUploadingPicture(false);
      // Reset input
      event.target.value = '';
    }
  };

  // ── Download certificate ──
  const downloadCertificate = async () => {
    try {
      setError(null);
      // Refresh certificate info to get latest data
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
      const infoResponse = await fetch(`${apiUrl}/certificates/info`, {
        headers: AuthService.getAuthHeaders(),
      });

      console.log('Certificate info response:', infoResponse);
      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        setCertificateInfo(infoData.data);

        if (!infoData.data?.eligible) {
          setError('No completed stages yet. Complete at least one stage to earn a certificate.');
          return;
        }
      }

      const response = await fetch(`${apiUrl}/certificates/download`, {
        headers: AuthService.getAuthHeaders(),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Heritage-Readiness-Certificate-${userProfile.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setSuccess('Certificate downloaded successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to download certificate');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setError('Failed to download certificate');
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getUserName = () => userProfile.name || 'Loading...';
  const getAfroScore = () => userProfile.afroScore || progress?.afroScore || 84;
  const getCompletedStagesCount = () => userProfile.completedStages?.length || 0;

  // ── Editable field component ──
  const EditableField = ({ 
    label, 
    fieldName, 
    apiFieldName,
    value, 
    type = 'text',
    multiline = false,
    maxLength = 255 
  }: any) => {
    const isEditing = editingField === fieldName;

    return (
      <div className={isEditing ? 'border-t border-brass/10 pt-4' : 'flex items-center justify-between'}>
        <div className={isEditing ? 'w-full' : 'flex-1'}>
          <div className="text-sm text-cream font-medium">{label}</div>
          {!isEditing ? (
            <div className="text-xs text-cream/50 mt-1">{value || 'Not set'}</div>
          ) : (
            <>
              {multiline ? (
                <textarea
                  className="field-dark resize-y w-full mt-2"
                  rows={3}
                  maxLength={maxLength}
                  value={formValues[fieldName] || ''}
                  onChange={e => setFormValues(prev => ({ ...prev, [fieldName]: e.target.value }))}
                />
              ) : (
                <input
                  type={type}
                  className="field-dark w-full mt-2"
                  value={formValues[fieldName] || ''}
                  onChange={e => setFormValues(prev => ({ ...prev, [fieldName]: e.target.value }))}
                  maxLength={maxLength}
                />
              )}
              {multiline && (
                <div className="text-xs text-cream/40 mono mt-1">
                  {(formValues[fieldName] || '').length} / {maxLength}
                </div>
              )}
            </>
          )}
        </div>
        {!isEditing ? (
          <button className="btn-ghost-dark text-xs" onClick={() => startEdit(fieldName)}>
            Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button 
              className="btn-ghost-dark text-xs" 
              onClick={() => {
                setEditingField(null);
                setFormValues(prev => ({ 
                  ...prev, 
                  [fieldName]: (userProfile as any)[apiFieldName] 
                }));
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              className="btn-primary text-xs" 
              onClick={() => saveField(fieldName, apiFieldName)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cream/50">Loading profile...</div>
      </div>
    );
  }

  return (
    <>
      {/* Alerts */}
      {error && (
        <div style={{ background: 'rgba(200, 50, 50, 0.15)', border: '1px solid rgba(200, 50, 50, 0.3)', borderRadius: '4px', padding: '12px', marginBottom: '20px', color: '#ff9999' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(100, 200, 100, 0.15)', border: '1px solid rgba(100, 200, 100, 0.3)', borderRadius: '4px', padding: '12px', marginBottom: '20px', color: '#99ff99' }}>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          {/* Profile Photo */}
          <div className="text-center mb-8">
            <div
              className="profile-photo-wrap mx-auto mb-4 relative inline-block"
              style={{ width: '96px', cursor: 'pointer' }}
              title="Click to change your photo"
            >
              {userProfile.picture ? (
                <img
                  src={userProfile.picture}
                  alt={userProfile.name}
                  className="rounded-full object-cover"
                  style={{ 
                    width: '96px', 
                    height: '96px',
                    display: 'block',
                  }}
                  onLoad={() => {
                    console.log('[Profile Picture Display] Image loaded successfully:', userProfile.picture);
                  }}
                  onError={(e) => {
                    console.error('[Profile Picture Display] Image failed to load:', userProfile.picture);
                    console.error('[Profile Picture Display] Error event:', e);
                    // Hide broken image and show fallback
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              {!userProfile.picture || !userProfile.picture.includes('storage') ? (
                <div
                  className="avatar avatar-xl"
                  id="profile-avatar-initials"
                  style={{ 
                    background: 'linear-gradient(135deg,#d47449,#7a2e10)', 
                    width: '96px', 
                    height: '96px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontSize: '36px',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {getUserName().split(' ').map((n: string) => n[0]).join('') || 'AJ'}
                </div>
              ) : null}
              <div 
                className="photo-cam-overlay"
                onClick={() => document.getElementById('profile-picture-input')?.click()}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              {uploadingPicture && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  Uploading...
                </div>
              )}
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: 'none' }}
                disabled={uploadingPicture}
              />
            </div>
            <h2 className="display text-3xl mb-1">{getUserName()}</h2>
            <div className="eyebrow eyebrow-cream mb-3">{userProfile.userPersona || 'Heritage Seeker'} · {userProfile.travelLocation || 'Global'}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="tag tag-brass">Preparation tier</span>
              <span className="tag tag-emerald">Active</span>
            </div>
            <div className="text-xs text-cream/50 mono mt-3">Member since {userProfile.memberSince || 'N/A'}</div>
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
                  onClick={() => startEdit('bio')}
                >
                  {editingField === 'bio' ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>
            {editingField !== 'bio' ? (
              <p id="bio-display" className="text-sm text-cream/80 leading-relaxed">
                {userProfile.bio || 'No bio yet. Click Edit to add your story.'}
              </p>
            ) : (
              <>
                <textarea
                  id="bio-textarea"
                  className="field-dark resize-y w-full mt-2"
                  rows={4}
                  maxLength={280}
                  value={formValues.bio || ''}
                  onChange={e => setFormValues(prev => ({ ...prev, bio: e.target.value }))}
                />
                <div className="flex items-center justify-between mt-3">
                  <div id="bio-char-count" className="text-xs text-cream/40 mono">
                    {(formValues.bio || '').length} / 280
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-ghost-dark text-xs" 
                      onClick={() => {
                        setEditingField(null);
                        setFormValues(prev => ({ ...prev, bio: userProfile.bio }));
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn-primary text-xs" 
                      onClick={saveBio}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
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
                <div className="text-cream font-medium">{userProfile.lifecyclePhase || 'Immersive Preparation'}</div>
                <div className="text-xs text-cream/55 leading-relaxed mt-0.5">Score 60–84 · the default committed-user path</div>
              </div>
              <div className="border-t border-brass/10 pt-4">
                <div className="text-xs text-cream/50 mono mb-1">Diaspora group</div>
                <div className="text-cream font-medium">{userProfile.diasporaGroup || 'Not set'}</div>
                <div className="text-xs text-cream/55 leading-relaxed mt-0.5">Shapes the framing of Stage 1, 5, and 6 modules</div>
                <button 
                  className="text-xs text-brass-light/80 hover:text-brass-light underline mt-2"
                  onClick={() => startEdit('diasporaGroup')}
                >
                  {editingField === 'diasporaGroup' ? 'Editing...' : 'Change'}
                </button>
                {editingField === 'diasporaGroup' && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="field-dark text-xs flex-1"
                      value={formValues.diasporaGroup || ''}
                      onChange={e => setFormValues(prev => ({ ...prev, diasporaGroup: e.target.value }))}
                    />
                    <button 
                      className="btn-primary text-xs"
                      onClick={() => saveField('diasporaGroup', 'diasporaGroup')}
                      disabled={saving}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
              <div className="border-t border-brass/10 pt-4">
                <div className="text-xs text-cream/50 mono mb-1">Learning preference</div>
                <div className="text-cream font-medium">{userProfile.learningPreference || 'Not set'}</div>
                <div className="text-xs text-cream/55 leading-relaxed mt-0.5">Audio modules surface first; transcripts always available</div>
                <button 
                  className="text-xs text-brass-light/80 hover:text-brass-light underline mt-2"
                  onClick={() => startEdit('learningPreference')}
                >
                  {editingField === 'learningPreference' ? 'Editing...' : 'Change'}
                </button>
                {editingField === 'learningPreference' && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="field-dark text-xs flex-1"
                      value={formValues.learningPreference || ''}
                      onChange={e => setFormValues(prev => ({ ...prev, learningPreference: e.target.value }))}
                    />
                    <button 
                      className="btn-primary text-xs"
                      onClick={() => saveField('learningPreference', 'learningPreference')}
                      disabled={saving}
                    >
                      Save
                    </button>
                  </div>
                )}
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
              <button 
                className="text-xs text-brass-light/80 hover:text-brass-light underline" 
                onClick={() => document.getElementById('journey-photo-input')?.click()}
              >
                + Add photo
              </button>
              <input
                id="journey-photo-input"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  try {
                    setError(null);
                    console.log('[Journey Photo Upload] 1. Upload started');
                    console.log('[Journey Photo Upload] - File name:', file.name);
                    console.log('[Journey Photo Upload] - File size:', file.size);
                    console.log('[Journey Photo Upload] - File type:', file.type);
                    
                    const formData = new FormData();
                    formData.append('photo', file);
                    formData.append('hub', 'Love Hub');
                    formData.append('visibility', photosDefault);

                    const token = localStorage.getItem('authToken');
                    const headers: any = {
                      'Accept': 'application/json',
                    };
                    if (token) {
                      headers['Authorization'] = `Bearer ${token}`;
                    }

                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app/api';
                    console.log('[Journey Photo Upload] 2. API URL:', apiUrl);
                    console.log('[Journey Photo Upload] 3. Headers:', headers);
                    console.log('[Journey Photo Upload] 4. FormData entries:', {
                      hub: 'Love Hub',
                      visibility: photosDefault,
                    });
                    
                    const response = await fetch(`${apiUrl}/user/journey-photos`, {
                      method: 'POST',
                      headers,
                      body: formData,
                    });

                    console.log('[Journey Photo Upload] 5. Response status:', response.status);
                    const result = await response.json();
                    console.log('[Journey Photo Upload] 6. Response data:', result);

                    if (response.ok) {
                      console.log('[Journey Photo Upload] 7. Upload successful');
                      console.log('[Journey Photo Upload] 8. Uploaded photo URL:', result.data?.url);
                      
                      setJourneyPhotos([...journeyPhotos, result.data]);
                      setSuccess('Photo uploaded successfully!');
                      setTimeout(() => setSuccess(null), 3000);
                    } else {
                      console.error('[Journey Photo Upload] ERROR Response:', result);
                      setError('Failed to upload photo');
                    }
                  } catch (error) {
                    console.error('[Journey Photo Upload] Exception:', error);
                    setError('Failed to upload photo');
                  }
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
            </div>
            <p className="text-xs text-cream/50 leading-relaxed mb-3">Share moments from your preparation and your time in Ghana. Visible to your hubs — choose which ones.</p>
            <div className="journey-photo-grid">
              {journeyPhotos && journeyPhotos.length > 0 ? (
                journeyPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="journey-photo-slot has-photo relative overflow-hidden"
                    onClick={() => alert(`View: ${photo.caption}`)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Journey photo'}
                      className="w-full h-full object-cover"
                      onLoad={() => {
                        console.log('[Journey Photo Display] Image loaded successfully:', photo.url);
                      }}
                      onError={(e) => {
                        console.error('[Journey Photo Display] Image failed to load:', photo.url);
                        console.error('[Journey Photo Display] Error event:', e);
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="photo-caption">{photo.caption}</div>
                    <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '9px', background: 'rgba(10,24,16,0.7)', color: 'rgba(243,237,224,0.7)', padding: '2px 5px', borderRadius: '2px' }}>
                      {photo.hub}
                    </div>
                  </div>
                ))
              ) : (
                [
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
                ))
              )}
              {(!journeyPhotos || journeyPhotos.length < 6) && (
                [...Array(Math.max(0, 6 - (journeyPhotos?.length || 0)))].map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="journey-photo-slot"
                    onClick={() => document.getElementById('journey-photo-input')?.click()}
                    style={{ flexDirection: 'column', gap: '6px' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(201,161,74,0.4)" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <div style={{ fontSize: '10px', color: 'rgba(201,161,74,0.5)' }}>Add photo</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account */}
          <div>
            <div className="eyebrow eyebrow-cream mb-3">Account</div>
            <div className="scard-dark p-6 space-y-4">
              <EditableField
                label="Name"
                fieldName="name"
                apiFieldName="name"
                value={userProfile.name}
              />
              <div className="border-t border-brass/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-cream font-medium">Email</div>
                  <div className="text-xs text-cream/50 mt-1">{userProfile.email || 'Not set'}</div>
                </div>
                <button className="btn-ghost-dark text-xs" onClick={() => startEdit('email')}>
                  Edit
                </button>
              </div>
              {editingField === 'email' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="email"
                    className="field-dark flex-1"
                    value={formValues.email || ''}
                    onChange={e => setFormValues(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <button 
                    className="btn-primary text-xs"
                    onClick={() => saveField('email', 'email')}
                    disabled={saving}
                  >
                    Save
                  </button>
                </div>
              )}
              <div className="border-t border-brass/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-cream font-medium">WhatsApp</div>
                  <div className="text-xs text-cream/50 mt-1">{userProfile.whatsapp || 'Not set'}</div>
                </div>
                <button className="btn-ghost-dark text-xs" onClick={() => startEdit('whatsapp')}>
                  Edit
                </button>
              </div>
              {editingField === 'whatsapp' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="tel"
                    className="field-dark flex-1"
                    value={formValues.whatsapp || ''}
                    onChange={e => setFormValues(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+1 234 567 8900"
                  />
                  <button 
                    className="btn-primary text-xs"
                    onClick={() => saveField('whatsapp', 'whatsapp')}
                    disabled={saving}
                  >
                    Save
                  </button>
                </div>
              )}
              <div className="border-t border-brass/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-cream font-medium">Travel date</div>
                  <div className="text-xs text-cream/50 mt-1">{userProfile.travelDate || 'Not set'}</div>
                </div>
                <button className="btn-ghost-dark text-xs" onClick={() => startEdit('travelDate')}>
                  Edit
                </button>
              </div>
              {editingField === 'travelDate' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="field-dark flex-1"
                    value={formValues.travelDate || ''}
                    onChange={e => setFormValues(prev => ({ ...prev, travelDate: e.target.value }))}
                    placeholder="Sept 14 — Sept 28, 2026"
                  />
                  <button 
                    className="btn-primary text-xs"
                    onClick={() => saveField('travelDate', 'travelDate')}
                    disabled={saving}
                  >
                    Save
                  </button>
                </div>
              )}
              <div className="border-t border-brass/10 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-cream font-medium">Travel location</div>
                  <div className="text-xs text-cream/50 mt-1">{userProfile.travelLocation || 'Not set'}</div>
                </div>
                <button className="btn-ghost-dark text-xs" onClick={() => startEdit('travelLocation')}>
                  Edit
                </button>
              </div>
              {editingField === 'travelLocation' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="field-dark flex-1"
                    value={formValues.travelLocation || ''}
                    onChange={e => setFormValues(prev => ({ ...prev, travelLocation: e.target.value }))}
                    placeholder="e.g., Accra, Ghana"
                  />
                  <button 
                    className="btn-primary text-xs"
                    onClick={() => saveField('travelLocation', 'travelLocation')}
                    disabled={saving}
                  >
                    Save
                  </button>
                </div>
              )}
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
                  <div className="text-xs text-cream/50 leading-relaxed">Who can see your name, photo, bio, and Readiness Score.</div>
                </div>
                <div style={{ display: 'flex', border: '1px solid rgba(201,161,74,0.2)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  {['public', 'community', 'private'].map((opt, idx) => (
                    <button
                      key={opt}
                      onClick={() => updateVisibility(opt)}
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
                      onClick={() => updatePhotosDefault(opt)}
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
                  <div className="text-sm text-cream font-medium">Show Readiness Score publicly</div>
                  <div className="text-xs text-cream/50 mt-0.5">Visitors see your {getAfroScore()} score and {userProfile.userPersona || 'Heritage Seeker'} persona</div>
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
            {certificateLoading ? (
              <div className="text-cream/50 text-xs">Loading certificates...</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="scard-dark p-5 text-center">
                  <div className="display text-2xl text-brass-light mb-2">{getAfroScore()}</div>
                  <div className="text-sm text-cream font-medium mb-1">Heritage Readiness</div>
                  <div className="text-xs text-cream/50 mono mb-3">
                    {certificateInfo?.completedStages || 0} of 6 stages · issued {userProfile.memberSince}
                  </div>
                  <button 
                    className={`btn-${certificateInfo?.eligible ? 'primary' : 'ghost-dark'} w-full justify-center text-xs`}
                    onClick={downloadCertificate}
                    disabled={!certificateInfo?.eligible}
                  >
                    {certificateInfo?.eligible ? 'Download PDF' : 'No stages yet'}
                  </button>
                  {!certificateInfo?.eligible && (
                    <div className="text-xs text-cream/40 mt-2">Complete your first stage to earn a certificate</div>
                  )}
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
            )}
          </div>
        </div>
      </div>

    
    </>
  );
}
