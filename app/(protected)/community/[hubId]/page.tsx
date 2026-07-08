'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
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
  tagLabel?: string;
  isCustodian?: boolean;
  time_ago: string;
  excerpt: string;
  replies_count: number;
  last_reply_time: string;
}

const HUB_GUIDELINES: Record<string, string[]> = {
  'hub_love': [
    'Be authentic and vulnerable. Share your real feelings and experiences.',
    'Listen more than you speak. Other members\' stories matter.',
    'No comparison. Your journey is unique to you.',
    'Respect all tiers. Everyone belongs here.',
    'One love, one heart. Unity is our strength.',
  ],
  'hub_citizenship': [
    'Share verified information only. Legal processes matter.',
    'Timelines may vary by country and situation.',
    'Always verify current requirements with official sources.',
    'Respect privacy. Don\'t share personal details without consent.',
    'Support one another through bureaucracy.',
  ],
  'hub_business': [
    'Share knowledge freely. We rise together.',
    'Respect intellectual property and confidentiality.',
    'No spam or self-promotion without context.',
    'Ask thoughtful questions. Help others succeed.',
    'Celebrate wins, big and small.',
  ],
  'hub_foodie': [
    'Food is culture. Treat recipes with respect.',
    'Credit your sources and elders.',
    'Dietary restrictions are welcome and respected.',
    'Share your story, not just the recipe.',
    'Enjoy the feast together.',
  ],
  'hub_solo': [
    'Safety first. Always. No exceptions.',
    'Women\'s voices lead here.',
    'Share strategies that work for you.',
    'Lookout for one another.',
    'Empowerment through community.',
  ],
};

const getGuidelinesByHubName = (hubName: string): string[] => {
  const nameToKey: Record<string, string> = {
    'The Love Hub': 'hub_love',
    'The Citizenship Hub': 'hub_citizenship',
    'The Business Hub': 'hub_business',
    'The Foodie Hub': 'hub_foodie',
    'The Solo Hub': 'hub_solo',
  };

  const key = nameToKey[hubName];
  if (key && HUB_GUIDELINES[key]) {
    return HUB_GUIDELINES[key];
  }

  // Default guidelines if hub name doesn't match
  return [
    'Be respectful and kind to all community members.',
    'Stay on topic and keep conversations constructive.',
    'Respect privacy and confidentiality.',
    'No harassment, hate speech, or discrimination.',
    'Share knowledge and support one another.',
  ];
};

export default function HubDetailPage() {
  const router = useRouter();
  const params = useParams();
  const hubId = params.hubId as string;

  const [hub, setHub] = useState<Hub | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [joiningHub, setJoiningHub] = useState(false);
  const [showJoinMessage, setShowJoinMessage] = useState(false);
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  const [threadTitle, setThreadTitle] = useState('');
  const [threadContent, setThreadContent] = useState('');
  const [creatingThread, setCreatingThread] = useState(false);
  const [showJoinBeforeThread, setShowJoinBeforeThread] = useState(false);
  const [selectedThreadForJoin, setSelectedThreadForJoin] = useState<Thread | null>(null);
  const [joiningForThread, setJoiningForThread] = useState(false);

  const [isLockedByTier, setIsLockedByTier] = useState(false);
  const [requiredTier, setRequiredTier] = useState('');
  const [successNotification, setSuccessNotification] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [userRevisionThreads, setUserRevisionThreads] = useState<any[]>([]);

  const fetchHubThreads = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const threadsResponse = await fetch(
        `${backendUrl}/community/hubs/${hubId}/threads`,
        {
          method: 'GET',
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (threadsResponse.ok) {
        const threadsData = await threadsResponse.json();
        setThreads(threadsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching hub threads:', error);
    }
  };

  const fetchUserRevisionThreads = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const response = await fetch(
        `${backendUrl}/community/user/threads`,
        {
          method: 'GET',
          headers: AuthService.getAuthHeaders(),
        }
      );
      if (response.ok) {
        const result = await response.json();
        const revisionThreads = (result.data || []).filter(
          (t: any) => String(t.hub_id) === String(hubId) && t.status === 'revision'
        );
        setUserRevisionThreads(revisionThreads);
      }
    } catch (error) {
      console.error('Error fetching user revision threads:', error);
    }
  };

  useEffect(() => {
    const fetchHubData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

        // Fetch hub details
        const hubResponse = await fetch(
          `${backendUrl}/community/hubs/${hubId}`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        );

        if (!hubResponse.ok) {
          throw new Error('Hub not found');
        }

        const hubData = await hubResponse.json();
        const fetchedHub = hubData.data;

        // Perform access check
        const user = AuthService.getUser();
        const userTier = user?.subscription_tier || 'free';

        let isHubAllowed = false;
        if (fetchedHub.access_level === 'free') {
          isHubAllowed = true;
        } else if (fetchedHub.access_level === 'community') {
          isHubAllowed = (userTier === 'community' || userTier === 'preparation');
        } else if (fetchedHub.access_level === 'preparation') {
          isHubAllowed = (userTier === 'preparation');
        }

        if (!isHubAllowed) {
          setIsLockedByTier(true);
          setRequiredTier(fetchedHub.access_level === 'preparation' ? 'Preparation' : 'Community or Preparation');
        }

        setHub(fetchedHub);

        // Fetch approved threads
        await fetchHubThreads();

        // Fetch threads needing revision
        await fetchUserRevisionThreads();
      } catch (error) {
        console.error('Error fetching hub data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hubId) {
      fetchHubData();
    }
  }, [hubId]);

  const handleJoinHub = async () => {
    if (!hub) return;

    setJoiningHub(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

      const response = await fetch(
        `${backendUrl}/community/hubs/${hub.id}/join`,
        {
          method: 'POST',
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (response.ok) {
        // Update hub state to reflect membership
        setHub({
          ...hub,
          user_is_member: true,
        });
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

  const handleNewThread = () => {
    if (!hub?.user_is_member) {
      setShowJoinMessage(true);
      return;
    }
    setModalError(null);
    setShowCreateThreadModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateThreadModal(false);
    setThreadTitle('');
    setThreadContent('');
    setEditingThreadId(null);
    setModalError(null);
  };

  const handleCreateThread = async () => {
    if (!threadTitle.trim() || !threadContent.trim()) {
      setModalError('Please fill in both title and content');
      return;
    }

    setCreatingThread(true);
    setModalError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

      const response = await fetch(
        `${backendUrl}/community/threads`,
        {
          method: 'POST',
          headers: AuthService.getAuthHeaders(),
          body: JSON.stringify({
            hub_id: hub?.id,
            title: threadTitle,
            content: threadContent,
            location: '', // Optional - can be fetched from user profile
            user_stage: '', // Optional - can be fetched from user progress
            user_tier: '', // Optional - can be fetched from user profile
          }),
        }
      );

      if (response.ok) {
        const newThreadData = await response.json();
        
        // Show success notification banner at the top of the page
        setSuccessNotification('Your thread has been submitted and is waiting for approval from the admin. It will publish in the community once approved.');

        // Reset form and close modal
        closeCreateModal();

        // Smooth scroll to top to see notification
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Refresh threads
        await fetchHubThreads();
        await fetchUserRevisionThreads();
      } else {
        const errorData = await response.json();
        setModalError(errorData.message || 'Failed to create thread. Please try again.');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      setModalError('Error creating thread. Please check your network connection and try again.');
    } finally {
      setCreatingThread(false);
    }
  };

  const handleUpdateThread = async () => {
    if (!threadTitle.trim() || !threadContent.trim()) {
      setModalError('Please fill in both title and content');
      return;
    }

    setCreatingThread(true);
    setModalError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

      const response = await fetch(
        `${backendUrl}/community/threads/${editingThreadId}`,
        {
          method: 'PUT',
          headers: AuthService.getAuthHeaders(),
          body: JSON.stringify({
            title: threadTitle,
            content: threadContent,
          }),
        }
      );

      if (response.ok) {
        setSuccessNotification('Your thread has been resubmitted and is waiting for approval from the admin. It will publish in the community once approved.');

        // Close modal and reset
        closeCreateModal();

        // Smooth scroll to top to see notification
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Refresh threads
        await fetchHubThreads();
        await fetchUserRevisionThreads();
      } else {
        const errorData = await response.json();
        setModalError(errorData.message || 'Failed to update thread. Please try again.');
      }
    } catch (error) {
      console.error('Error updating thread:', error);
      setModalError('Error updating thread. Please check your network connection and try again.');
    } finally {
      setCreatingThread(false);
    }
  };

  const handleThreadClick = (thread: Thread) => {
    if (!hub?.user_is_member) {
      setSelectedThreadForJoin(thread);
      setShowJoinBeforeThread(true);
    } else {
      router.push(`/community/${hubId}/${thread.id}`);
    }
  };

  const handleJoinBeforeThread = async () => {
    if (!hub) return;

    setJoiningForThread(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

      const response = await fetch(
        `${backendUrl}/community/hubs/${hub.id}/join`,
        {
          method: 'POST',
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (response.ok) {
        // Update hub state to reflect membership
        setHub({
          ...hub,
          user_is_member: true,
        });

        // Close modal and navigate to thread
        setShowJoinBeforeThread(false);
        if (selectedThreadForJoin) {
          router.push(`/community/${hubId}/${selectedThreadForJoin.id}`);
        }
      } else {
        alert('Failed to join hub. Please try again.');
      }
    } catch (error) {
      console.error('Error joining hub:', error);
      alert('Error joining hub');
    } finally {
      setJoiningForThread(false);
    }
  };

  const getAvatarColor = (initial: string) => {
    const colors: Record<string, string> = {
      'D': 'bg-brass/20 text-brass',
      'S': 'bg-rose/20',
      'A': 'bg-green-900/30',
      'J': 'bg-amber-900/30',
      'R': 'bg-rose/20',
      'N': 'bg-orange-900/30',
      'Z': 'bg-brass/20 text-brass',
      'L': 'bg-green-900/30',
    };
    return colors[initial] || 'bg-brass/20 text-brass';
  };

  const getSColor = (initial: string) => {
    if (initial === 'S') return 'var(--rose)';
    if (initial === 'A') return 'var(--forest-light)';
    return undefined;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
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
        <p style={{ color: 'rgba(243,237,224,0.6)' }}>Loading hub...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="text-center py-16">
        <p className="text-cream/70 mb-4">Hub not found</p>
        <Link href="/community" className="btn-primary">
          Back to Community
        </Link>
      </div>
    );
  }

  if (isLockedByTier) {
    const user = AuthService.getUser();
    const userTier = user?.subscription_tier || 'free';

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-full text-left max-w-lg mb-8">
          <button
            onClick={() => router.push('/community')}
            className="text-cream/60 hover:text-cream text-sm flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m6 7-7-7 7-7"></path>
            </svg>
            All Hubs
          </button>
        </div>

        <div className="scard-dark p-10 max-w-lg w-full" style={{ border: '1px solid var(--brass)', background: 'var(--forest-deep)' }}>
          <div className="w-16 h-16 rounded-full bg-brass/10 border border-brass/30 flex items-center justify-center mx-auto mb-6 text-brass">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>

          <div className="eyebrow eyebrow-cream mb-2">{hub?.name || 'Community Hub'}</div>
          <h2 className="display text-3xl text-cream mb-4">Hub Locked</h2>
          <p className="text-sm text-cream/70 leading-relaxed mb-8">
            This hub requires the <span className="text-brass-light font-semibold">{requiredTier}</span> tier. You are currently on the <span className="text-brass-light font-semibold capitalize">{userTier}</span> tier.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/#pricing')}
              className="btn-primary w-full py-3 text-sm"
            >
              Upgrade Tier
            </button>
            <button
              onClick={() => router.push('/community')}
              className="btn-ghost-dark w-full py-3 text-sm"
            >
              Back to Community
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => router.push('/community')}
        className="text-cream/60 hover:text-cream text-sm mb-6 flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5m6 7-7-7 7-7"></path>
        </svg>
        All Hubs
      </button>

      {/* Success Notification */}
      {successNotification && (
        <div 
          className="p-5 mb-6 rounded-sm border flex items-start gap-4"
          style={{
            background: 'rgba(31, 90, 61, 0.18)',
            borderColor: 'rgba(31, 90, 61, 0.45)',
            color: 'var(--cream)',
          }}
        >
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
            style={{ 
              background: 'rgba(31, 90, 61, 0.3)',
              color: 'var(--brass-light)',
              border: '1px solid rgba(201, 161, 74, 0.4)' 
            }}
          >
            ✓
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--brass-light)' }}>
              Thread Submitted
            </h4>
            <p className="text-sm text-cream/80 leading-relaxed">
              {successNotification}
            </p>
          </div>
          <button 
            onClick={() => setSuccessNotification(null)}
            className="text-cream/40 hover:text-cream text-lg font-bold leading-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Hub Header */}
      <div className="mb-8">
        {/* Title and Badge inline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <h1 className="display text-4xl font-light leading-tight">{hub.name}</h1>
          <span style={{
            background: '#1a2e1a',
            color: '#c9a14a',
            fontSize: '10px',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(201,161,74,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {hub.access_label}
          </span>
        </div>

        {/* Description */}
        <p className="text-cream/60 mb-4">{hub.description}</p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleJoinHub}
            disabled={joiningHub || hub.user_is_member}
            className="btn-primary text-xs"
            style={{ opacity: joiningHub || hub.user_is_member ? 0.6 : 1 }}
          >
            {joiningHub ? 'Joining...' : hub.user_is_member ? '✓ Member' : 'Join this hub'}
          </button>
          <button
            onClick={() => setShowGuidelinesModal(true)}
            className="btn-ghost-dark text-xs"
          >
            Hub guidelines
          </button>
        </div>
      </div>

      {/* Recent Threads Section */}
      <div className="eyebrow eyebrow-cream mb-4" style={{ fontSize: '10px' }}>Recent threads</div>

      {/* Threads List */}
      {threads.length > 0 ? (
        <div className="space-y-3 mb-8">
          {threads.map(thread => (
            <div
              key={thread.id}
              className="scard-dark p-4 cursor-pointer hover:border-brass/40"
              onClick={() => handleThreadClick(thread)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getAvatarColor(thread.author_initials)}`}
                  style={getSColor(thread.author_initials) ? { color: getSColor(thread.author_initials) } : {}}
                >
                  {thread.author_initials}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">
                    {thread.author}
                    {thread.isCustodian && <span className="tag tag-brass" style={{ fontSize: '8px', padding: '1px 5px', marginLeft: '4px' }}>Custodian</span>}
                    <span className="text-cream/40 text-xs mono" style={{ marginLeft: '8px' }}>· {thread.time_ago}</span>
                  </div>
                  <div className="text-sm text-cream/70">{thread.excerpt}</div>
                  <div className="flex gap-3 mt-2 text-xs text-cream/40">
                    <span>{thread.replies_count} replies</span>
                    <span>·</span>
                    <span>Last reply {thread.last_reply_time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="scard-dark p-8 text-center mb-8">
          <p className="text-cream/70 mb-4">No threads yet in this hub</p>

        </div>
      )}

      {/* New Thread Button */}
      <button
        onClick={handleNewThread}
        className="btn-ghost-dark w-full justify-center"
      >
        + New thread
      </button>

      {/* User's Threads Needing Revision */}
      {userRevisionThreads.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="eyebrow eyebrow-cream" style={{ color: 'var(--terra)', fontSize: '10px' }}>
            ⚠ Action Required: Threads Needing Revision ({userRevisionThreads.length})
          </div>
          
          <div className="space-y-3">
            {userRevisionThreads.map((thread) => (
              <div 
                key={thread.id} 
                className="scard-dark p-5"
                style={{ 
                  borderLeft: '3px solid var(--terra)', 
                  background: 'rgba(212, 116, 73, 0.05)' 
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-semibold text-cream text-base">{thread.title}</h4>
                  <button
                    onClick={() => {
                      setThreadTitle(thread.title);
                      setThreadContent(thread.content);
                      setEditingThreadId(thread.id);
                      setModalError(null);
                      setShowCreateThreadModal(true);
                    }}
                    className="btn-primary text-xs py-1.5 px-4 flex-shrink-0"
                    style={{ background: 'var(--terra)', borderColor: 'var(--terra)', color: 'var(--cream)' }}
                  >
                    Edit & Resubmit
                  </button>
                </div>
                
                <p className="text-sm text-cream/70 mb-4 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                  {thread.content}
                </p>

                {/* Revision Note Box */}
                <div 
                  className="p-4 rounded-sm text-sm"
                  style={{
                    background: 'rgba(212, 116, 73, 0.12)',
                    border: '1px solid rgba(212, 116, 73, 0.25)',
                    color: 'var(--cream)'
                  }}
                >
                  <span className="font-semibold block text-xs mb-1 uppercase tracking-wider" style={{ color: 'var(--terra)' }}>
                    Custodian Revision Note:
                  </span>
                  <p className="text-cream/80 italic">
                    "{thread.revision_note}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines Modal */}
      {showGuidelinesModal && (
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
          onClick={() => setShowGuidelinesModal(false)}
        >
          <div
            className="scard-dark p-8 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="display text-2xl">{hub?.name} · Guidelines</h2>
              <button
                onClick={() => setShowGuidelinesModal(false)}
                className="text-cream/60 hover:text-cream text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {hub && getGuidelinesByHubName(hub.name).map((guideline, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="text-brass-light font-bold text-sm flex-shrink-0">✓</div>
                  <p className="text-sm text-cream/80 leading-relaxed">{guideline}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowGuidelinesModal(false)}
              className="btn-primary w-full text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Join Message Modal */}
      {showJoinMessage && (
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
          onClick={() => setShowJoinMessage(false)}
        >
          <div
            className="scard-dark p-8 max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="display text-lg mb-4">Join {hub?.name}?</h3>
            <p className="text-cream/70 mb-6 text-sm">
              You need to join this hub first before you can create a thread. Once you join, you'll be able to share your story and connect with others.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinMessage(false)}
                className="btn-ghost-dark text-xs flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowJoinMessage(false);
                  handleJoinHub();
                }}
                className="btn-primary text-xs flex-1"
              >
                Join hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Thread Modal */}
      {showCreateThreadModal && (
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
          onClick={closeCreateModal}
        >
          <div
            className="scard-dark p-8 w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '700px',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="display text-2xl">
                {editingThreadId ? 'Edit & Resubmit Thread' : 'Start a new thread'}
              </h2>
              <button
                onClick={closeCreateModal}
                className="text-cream/60 hover:text-cream text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Error Message inside modal */}
            {modalError && (
              <div 
                className="p-4 mb-6 rounded-sm border text-sm flex items-center justify-between animate-fade-in"
                style={{
                  background: 'rgba(160, 72, 72, 0.15)',
                  borderColor: 'rgba(160, 72, 72, 0.35)',
                  color: 'var(--cream)',
                }}
              >
                <span className="flex-1">{modalError}</span>
                <button 
                  onClick={() => setModalError(null)}
                  className="text-cream/40 hover:text-cream text-lg font-bold leading-none cursor-pointer ml-3"
                >
                  ×
                </button>
              </div>
            )}

            {/* Thread Title Input */}
            <div className="mb-6">
              <label className="text-xs text-cream/50 block mb-2">Thread title</label>
              <input
                type="text"
                value={threadTitle}
                onChange={(e) => setThreadTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 rounded-sm text-sm"
                style={{
                  background: 'rgba(243,237,224,0.05)',
                  border: '1px solid rgba(201,161,74,0.2)',
                  color: 'var(--cream)',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Thread Content Textarea */}
            <div className="mb-6">
              <label className="text-xs text-cream/50 block mb-2">Your story</label>
              <textarea
                data-thread-textarea
                value={threadContent}
                onChange={(e) => setThreadContent(e.target.value)}
                placeholder="Share your experience, ask a question, or start a conversation..."
                className="w-full p-4 rounded-sm text-sm"
                style={{
                  background: 'rgba(243,237,224,0.05)',
                  border: '1px solid rgba(201,161,74,0.2)',
                  color: 'var(--cream)',
                  minHeight: '200px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeCreateModal}
                className="btn-ghost-dark text-xs flex-1"
                disabled={creatingThread}
              >
                Cancel
              </button>
              <button
                onClick={editingThreadId ? handleUpdateThread : handleCreateThread}
                className="btn-primary text-xs flex-1"
                disabled={creatingThread || !threadTitle.trim() || !threadContent.trim()}
                style={{
                  opacity: creatingThread || !threadTitle.trim() || !threadContent.trim() ? 0.6 : 1,
                }}
              >
                {creatingThread ? (editingThreadId ? 'Saving...' : 'Creating...') : (editingThreadId ? 'Resubmit' : 'Create thread')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Before Thread Modal */}
      {showJoinBeforeThread && selectedThreadForJoin && hub && (
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
            <h3 className="display text-lg mb-4">Join {hub.name}?</h3>
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
                disabled={joiningForThread}
                className="btn-primary text-xs flex-1"
                style={{ opacity: joiningForThread ? 0.6 : 1 }}
              >
                {joiningForThread ? 'Joining...' : 'Join hub'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
