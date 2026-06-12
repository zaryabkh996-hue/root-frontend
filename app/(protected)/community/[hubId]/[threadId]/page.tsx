'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';
import { useNotification } from '@/app/lib/NotificationContext';

interface ThreadPost {
  id: string;
  user_id?: number | string;
  author: string;
  author_initials: string;
  time_ago: string;
  location: string;
  user_stage: string;
  title: string;
  content: string | string[];
  replies_count: number;
  custodian_responses?: number;
  hub_name?: string;
  hub_access_level?: string;
}

interface Reply {
  id: string;
  user_id?: number | string;
  author: string;
  author_initials: string;
  is_custodian?: boolean;
  time_ago: string;
  content: string;
  avatarBg: string;
  avatarColor?: string;
}

export default function ThreadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const threadId = params.threadId as string;
  const hubId = params.hubId as string;
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [thread, setThread] = useState<ThreadPost | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = AuthService.getUser();
  const { showNotification } = useNotification();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'thread' | 'reply', id: string } | null>(null);

  const [isLockedByTier, setIsLockedByTier] = useState(false);
  const [requiredTier, setRequiredTier] = useState('');

  useEffect(() => {
    const fetchThreadData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

        // Fetch thread details
        const threadResponse = await fetch(
          `${backendUrl}/community/threads/${threadId}`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        );

        if (!threadResponse.ok) {
          throw new Error('Thread not found');
        }

        const threadData = await threadResponse.json();
        const threadItem = threadData.data;

        // Perform access check
        const user = AuthService.getUser();
        const userTier = user?.subscription_tier || 'free';

        let isHubAllowed = false;
        if (threadItem.hub_access_level === 'free') {
          isHubAllowed = true;
        } else if (threadItem.hub_access_level === 'community') {
          isHubAllowed = (userTier === 'community' || userTier === 'preparation');
        } else if (threadItem.hub_access_level === 'preparation') {
          isHubAllowed = (userTier === 'preparation');
        }

        if (!isHubAllowed) {
          setIsLockedByTier(true);
          setRequiredTier(threadItem.hub_access_level === 'preparation' ? 'Preparation' : 'Community or Preparation');
        }

        // Parse content if it's a string
        const contentArray = typeof threadItem.content === 'string'
          ? [threadItem.content]
          : Array.isArray(threadItem.content)
            ? threadItem.content
            : [threadItem.content];

        setThread({
          ...threadItem,
          user_id: threadItem.user_id,
          content: contentArray,
          replies_count: threadItem.replies_count || 0,
          custodian_responses: threadItem.custodian_responses || 0,
        });

        // Fetch replies for this thread
        const repliesResponse = await fetch(
          `${backendUrl}/community/threads/${threadId}/replies`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        );

        if (repliesResponse.ok) {
          const repliesData = await repliesResponse.json();
          const mappedReplies = repliesData.data.map((reply: any) => ({
            id: reply.id,
            user_id: reply.user_id,
            author: reply.author,
            author_initials: reply.author_initials,
            is_custodian: reply.is_custodian,
            time_ago: reply.time_ago,
            content: reply.content,
            avatarBg: reply.is_custodian ? 'rgba(31,90,61,0.3)' : 'bg-brass/10',
            avatarColor: reply.is_custodian ? 'var(--forest-light)' : undefined,
          }));
          setReplies(mappedReplies);
        }
      } catch (error) {
        console.error('Error fetching thread data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (threadId) {
      fetchThreadData();
    }
  }, [threadId]);

  const handlePostReply = async () => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

      const response = await fetch(
        `${backendUrl}/community/replies`,
        {
          method: 'POST',
          headers: AuthService.getAuthHeaders(),
          body: JSON.stringify({
            thread_id: threadId,
            content: replyText,
          }),
        }
      );

      if (response.ok) {
        setReplyText('');
        // Optionally refetch replies to show the new one
        const repliesResponse = await fetch(
          `${backendUrl}/community/threads/${threadId}/replies`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        );

        if (repliesResponse.ok) {
          const repliesData = await repliesResponse.json();
          const mappedReplies = repliesData.data.map((reply: any) => ({
            id: reply.id,
            user_id: reply.user_id,
            author: reply.author,
            author_initials: reply.author_initials,
            is_custodian: reply.is_custodian,
            time_ago: reply.time_ago,
            content: reply.content,
            avatarBg: reply.is_custodian ? 'rgba(31,90,61,0.3)' : 'bg-brass/10',
            avatarColor: reply.is_custodian ? 'var(--forest-light)' : undefined,
          }));
          setReplies(mappedReplies);
        }
        showNotification('Reply posted. The community appreciates your contribution.', 'success');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      showNotification('Failed to post reply', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerReportConfirm = (type: 'thread' | 'reply', id: string) => {
    setReportTarget({ type, id });
    setConfirmModalOpen(true);
  };

  const handleConfirmReport = async () => {
    if (!reportTarget) return;
    setConfirmModalOpen(false);
    const { type, id } = reportTarget;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';
      const response = await fetch(
        `${backendUrl}/community/reports`,
        {
          method: 'POST',
          headers: AuthService.getAuthHeaders(),
          body: JSON.stringify({
            item_type: type,
            item_id: id,
            reason: 'Reported via community flag icon.',
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        showNotification(result.message || 'Thank you for reporting. The administrators will review it.', 'success');
      } else {
        showNotification(result.error || 'Failed to submit report.', 'error');
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      showNotification('Failed to submit report. Please try again later.', 'error');
    } finally {
      setReportTarget(null);
    }
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
        <p style={{ color: 'rgba(243,237,224,0.6)' }}>Loading thread...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-16">
        <p className="text-cream/70 mb-4">Thread not found</p>
        <button
          onClick={() => router.back()}
          className="btn-primary"
        >
          Go Back
        </button>
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

          <div className="eyebrow eyebrow-cream mb-2">{thread?.hub_name || 'Community Hub'}</div>
          <h2 className="display text-3xl text-cream mb-4">Thread Locked</h2>
          <p className="text-sm text-cream/70 leading-relaxed mb-8">
            This conversation requires the <span className="text-brass-light font-semibold">{requiredTier}</span> tier. You are currently on the <span className="text-brass-light font-semibold capitalize">{userTier}</span> tier.
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

  const contentArray = Array.isArray(thread.content) ? thread.content : [thread.content];

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-cream/60 hover:text-cream text-sm mb-6 flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5m6 7-7-7 7-7"></path>
        </svg>
        Back to hub
      </button>

      {/* Original Post */}
      <div className="scard-dark p-5 mb-6" style={{ borderLeft: '3px solid var(--brass)' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-brass flex-shrink-0"
              style={{ background: 'rgba(201,161,74,0.2)' }}
            >
              {thread.author_initials}
            </div>
            <div>
              <div className="text-sm font-medium">
                {thread.author}
                <span className="text-cream/40 text-xs mono" style={{ marginLeft: '8px' }}>
                  · {thread.time_ago} · {thread.location}
                </span>
              </div>
              <div className="text-xs text-cream/40">{thread.user_stage}</div>
            </div>
          </div>
          {currentUser && String(currentUser.id) !== String(thread.user_id) && (
            <button
              onClick={() => triggerReportConfirm('thread', thread.id)}
              title="Report this post"
              className="text-cream/40 hover:text-red-500 transition-colors p-1"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"></path>
              </svg>
            </button>
          )}
        </div>

        {/* Title */}
        <h2 className="display text-xl mb-3">{thread.title}</h2>

        {/* Content */}
        {contentArray.map((paragraph, idx) => (
          <p key={idx} className="text-sm text-cream/70 leading-relaxed mb-3">
            {paragraph}
          </p>
        ))}

        {/* Meta */}
        <div className="flex gap-4 mt-4 text-xs text-cream/40">
          <span>{thread.replies_count} replies</span>
          <span>·</span>
          <span>{thread.custodian_responses || 0} Custodian responses</span>
        </div>
      </div>

      {/* Replies Header */}
      <div className="eyebrow eyebrow-cream mb-4" style={{ fontSize: '10px' }}>Replies</div>

      {/* Replies List */}
      <div className="space-y-4 mb-8">
        {replies.map(reply => (
          <div
            key={reply.id}
            className="scard-dark p-4"
            style={reply.is_custodian ? { borderLeft: '3px solid var(--forest-light)' } : {}}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{
                    background: reply.is_custodian ? 'rgba(31,90,61,0.3)' : reply.avatarBg,
                    color: reply.avatarColor || (reply.is_custodian ? 'var(--forest-light)' : 'inherit'),
                  }}
                >
                  {reply.author_initials}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">
                    {reply.author}
                    {reply.is_custodian && (
                      <span className="tag tag-brass" style={{ fontSize: '8px', padding: '1px 5px', marginLeft: '4px' }}>
                        Custodian
                      </span>
                    )}
                    <span className="text-cream/40 text-xs mono" style={{ marginLeft: '8px' }}>
                      · {reply.time_ago}
                    </span>
                  </div>
                  <p className="text-sm text-cream/70 leading-relaxed">{reply.content}</p>
                </div>
              </div>

              {currentUser && String(currentUser.id) !== String(reply.user_id) && (
                <button
                  onClick={() => triggerReportConfirm('reply', reply.id)}
                  title="Report this message"
                  className="text-cream/30 hover:text-red-500 transition-colors p-1"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="scard-dark p-4">
        <label className="text-xs text-cream/50 block mb-2">Write a reply</label>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="w-full p-3 rounded-sm text-sm"
          style={{
            background: 'rgba(243,237,224,0.05)',
            border: '1px solid rgba(201,161,74,0.2)',
            color: 'var(--cream)',
            minHeight: '60px',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          placeholder="Share your experience or ask a follow-up..."
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handlePostReply}
            disabled={isSubmitting || !replyText.trim()}
            className="btn-primary text-xs"
            style={{ opacity: isSubmitting || !replyText.trim() ? 0.6 : 1 }}
          >
            {isSubmitting ? 'Posting...' : 'Post reply'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div className="scard-dark" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid rgba(201,161,74,0.2)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            textAlign: 'center',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="2" style={{ marginBottom: '12px', marginLeft: 'auto', marginRight: 'auto' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cream)', marginBottom: '8px', fontFamily: 'inherit' }}>
              Report Message
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(243,237,224,0.7)', marginBottom: '20px', lineHeight: '1.5' }}>
              Are you sure you want to report this message for guidelines violations?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => { setConfirmModalOpen(false); setReportTarget(null); }}
                className="btn-ghost text-xs"
                style={{ padding: '8px 16px', background: 'rgba(243,237,224,0.05)', border: '1px solid rgba(243,237,224,0.1)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReport}
                className="btn-primary text-xs"
                style={{ padding: '8px 16px', background: '#b91c1c', border: '1px solid #b91c1c', color: '#fff' }}
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
