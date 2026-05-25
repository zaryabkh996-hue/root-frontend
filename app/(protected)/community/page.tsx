'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';

interface Hub {
  id: string;
  adinkra: string;
  emoji: string;
  name: string;
  description: string;
  members_count: number;
  active_threads_count: number;
  access_level: 'free' | 'community' | 'preparation' | 'locked';
  access_label: string;
  border_color?: string;
  user_is_member: boolean;
}

interface Thread {
  id: string;
  author: string;
  author_initials: string;
  tag: string;
  tagColor: 'brass' | 'emerald' | 'rose';
  time_ago: string;
  title: string;
  excerpt: string;
  replies_count: number;
  hearts: number;
  pinned?: boolean;
}

export default function CommunityPage() {
  const router = useRouter();
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingHubs, setLoadingHubs] = useState(true);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [activeHub] = useState<string>('hub_love');
  const [showJoinBeforeThread, setShowJoinBeforeThread] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [joiningHub, setJoiningHub] = useState(false);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
        
        // Fetch hubs
        const hubsResponse = await fetch(
          `${backendUrl}/api/community/hubs`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        );

        if (!hubsResponse.ok) throw new Error('Failed to fetch hubs');
        const hubsData = await hubsResponse.json();
        setHubs(hubsData.data || []);
        setLoadingHubs(false);

        // Fetch threads from first hub (The Love Hub)
        setLoadingThreads(true);
        const threadsResponse = await fetch(
          `${backendUrl}/api/community/hubs/${hubsData.data[0]?.id}/threads`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        );

        if (threadsResponse.ok) {
          const threadsData = await threadsResponse.json();
          const mappedThreads = threadsData.data.map((thread: any) => ({
            ...thread,
            author_initials: thread.author_initials || thread.author?.charAt(0),
            tagColor: 'brass',
            hearts: 0,
          }));
          setThreads(mappedThreads);
        }
        setLoadingThreads(false);
      } catch (error) {
        console.error('Error fetching community data:', error);
        setLoadingHubs(false);
        setLoadingThreads(false);
      }
    };

    fetchCommunityData();
  }, []);

  const handleHubClick = (hubId: string) => {
    router.push(`/community/${hubId}`);
  };

  const handleThreadClick = (thread: Thread, hub: Hub) => {
    if (!hub.user_is_member) {
      setSelectedThread(thread);
      setSelectedHub(hub);
      setShowJoinBeforeThread(true);
    } else {
      router.push(`/community/${hub.id}/${thread.id}`);
    }
  };

  const handleJoinBeforeThread = async () => {
    if (!selectedHub) return;
    
    setJoiningHub(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
      
      const response = await fetch(
        `${backendUrl}/api/community/hubs/${selectedHub.id}/join`,
        {
          method: 'POST',
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (response.ok) {
        // Update hub state to reflect membership
        const updatedHubs = hubs.map(h => 
          h.id === selectedHub.id ? { ...h, user_is_member: true } : h
        );
        setHubs(updatedHubs);
        
        // Close modal and navigate to thread
        setShowJoinBeforeThread(false);
        if (selectedThread) {
          router.push(`/community/${selectedHub.id}/${selectedThread.id}`);
        }
      } else {
        alert('Failed to join hub. Please try again.');
      }
    } catch (error) {
      console.error('Error joining hub:', error);
      alert('Error joining hub');
    } finally {
      setJoiningHub(false);
    }
  };

  const getTagColor = (tagColor: string) => {
    switch (tagColor) {
      case 'brass':
        return 'tag-brass';
      case 'emerald':
        return 'tag-emerald';
      case 'rose':
        return 'tag-rose';
      default:
        return 'tag-dark';
    }
  };

  const getAccessTagClass = (accessLevel: string) => {
    switch (accessLevel) {
      case 'free':
        return 'tag-rose';
      case 'locked':
        return 'tag-brass';
      default:
        return 'tag-dark';
    }
  };

  const getAvatarClass = (index: number) => {
    const avatarClasses = ['avatar-photo', 'avatar-photo-2', 'avatar-photo-3', 'avatar-photo-4'];
    return avatarClasses[index % avatarClasses.length];
  };

  const generateMemberInitials = (hubId: string, count: number) => {
    // Don't show avatars if there are no members
    if (count === 0 || typeof hubId !== 'string' || hubId.length === 0) {
      return [];
    }
    
    const seed = hubId.charCodeAt(0) + hubId.charCodeAt(hubId.length - 1);
    const names = ['Alex', 'Zara', 'David', 'Sophia', 'James', 'Maya', 'Chris', 'Nina', 'Marcus', 'Lucia','User'];
    const initials = [];
    
    // Generate avatars for up to 4 members
    for (let i = 0; i < Math.min(count, 4); i++) {
      const index = (seed + i) % names.length;
      const first = (names[index]?.[0] || 'U').toUpperCase();
      const second = (names[(index + 1) % names.length]?.[0] || 'S').toUpperCase();
      initials.push(first + second);
    }
    
    return initials;
  };



  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="eyebrow eyebrow-cream mb-3">Community Hubs · {hubs.length} active · moderated by Custodians</div>
        <h1 className="display text-5xl font-light leading-tight mb-3">Where relatives gather.</h1>
        <p className="text-cream/70 max-w-2xl">
          No likes, no metrics, no algorithm. Threaded conversations among people who understand what you carry. Each hub carries an Adinkra symbol and a purpose.
        </p>
      </div>

      {/* Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {loadingHubs ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px' }}>
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
            <p style={{ color: 'rgba(243,237,224,0.6)' }}>Loading hubs...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          hubs.map(hub => (
            <div
              key={hub.id}
              className="scard-dark p-5 cursor-pointer hover:border-brass/40 transition"
              style={hub.border_color ? { borderLeft: `3px solid ${hub.border_color}` } : {}}
              onClick={() => handleHubClick(hub.id)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="eyebrow eyebrow-cream">
                  {hub.adinkra} {hub.emoji}
                </div>
                <span className={`tag ${getAccessTagClass(hub.access_level)}`}>
                  {hub.access_label}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="display text-xl text-cream mb-2">{hub.name}</h3>
              <p className="text-xs text-cream/60 leading-relaxed mb-3">{hub.description}</p>

              {/* Members */}
              {hub.access_level !== 'locked' ? (
                <>
                  <div className="member-strip mb-3">
                    {hub.members_count > 0 && generateMemberInitials(hub.id, hub.members_count).map((initials, idx) => (
                      <div 
                        key={idx} 
                        className={`avatar ${getAvatarClass(idx)}`}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          flexShrink: 0,
                          color: 'var(--cream)',
                        }}
                      >
                        {initials}
                      </div>
                    ))}
                    {hub.members_count > 4 && (
                      <div className="member-count">
                        +{hub.members_count - 4}
                      </div>
                    )}
                    <div className="member-count" style={{ width: 'auto', background: 'transparent', border: 'none', padding: '0 8px', height: 'auto' }}>
                      <span style={{ color: 'var(--brass-light)', fontSize: '11px' }}>{hub.members_count} members {hub.user_is_member ? '· you\'re here' : ''}</span>
                    </div>
                  </div>
                  {hub.user_is_member && <span className="tag tag-brass">You're here</span>}
                </>
              ) : (
                <div className="member-strip mb-3">
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(201,161,74,0.08)',
                      border: '2px dashed rgba(201,161,74,0.2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,161,74,0.4)" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <div style={{ marginLeft: '8px', color: 'var(--brass-light)', fontSize: '11px' }}>
                    Unlocks after your return
                  </div>
                </div>
              )}
              {hub.access_level === 'locked' && <span className="tag tag-dark">Locked until return</span>}
            </div>
          ))
        )}
      </div>

      {/* Active Threads Section */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="eyebrow eyebrow-cream mb-1">{hubs.length > 0 ? hubs[0].name : 'Love Hub'} · active threads</div>
          <h2 className="display text-2xl">Sorted by quietness · longest unanswered first</h2>
        </div>
       
      </div>

      {/* Threads List */}
      <div className="space-y-3">
        {loadingThreads ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
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
            <p style={{ color: 'rgba(243,237,224,0.6)' }}>Loading threads...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          threads.map(thread => {
            const threadHub = hubs[0]; // First hub
            return (
              <div
                key={thread.id}
                className="scard-dark p-5 cursor-pointer hover:border-brass/40 transition"
                onClick={() => threadHub && handleThreadClick(thread, threadHub)}
              >
                <div className="flex items-start gap-4">
                  <div className={`avatar avatar-photo flex-shrink-0`}>{thread.author_initials}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="font-medium text-cream">{thread.author}</div>
                      <span className={`tag ${getTagColor(thread.tagColor)}`}>{thread.tag}</span>
                      <span className="text-xs text-cream/40 mono">· {thread.time_ago}</span>
                    </div>
                    <h3 className="font-medium text-cream mb-2">{thread.title}</h3>
                    <p className="text-sm text-cream/70 leading-relaxed mb-3">{thread.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-cream/50">
                      <span>{thread.replies_count} replies</span>
                      <span>· {thread.hearts} hearts</span>
                      {thread.pinned && <span className="text-brass-light">Pinned by Akosua</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Join Before Thread Modal */}
      {showJoinBeforeThread && selectedHub && selectedThread && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 24, 16, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={() => setShowJoinBeforeThread(false)}
        >
          <div
            className="scard-dark p-8 max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="display text-lg mb-4">Join {selectedHub.name}?</h3>
            <p className="text-cream/70 mb-6 text-sm">
              You need to join this hub first before you can view threads. Once you join, you'll be able to read and share your story.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinBeforeThread(false)}
                className="btn-ghost-dark text-xs flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinBeforeThread}
                disabled={joiningHub}
                className="btn-primary text-xs flex-1"
                style={{ opacity: joiningHub ? 0.6 : 1 }}
              >
                {joiningHub ? 'Joining...' : 'Join hub'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
