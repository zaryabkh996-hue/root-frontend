'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';

interface ThreadPost {
  id: string;
  author: string;
  author_initials: string;
  time_ago: string;
  location: string;
  user_stage: string;
  title: string;
  content: string | string[];
  replies_count: number;
  custodian_responses?: number;
}

interface Reply {
  id: string;
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

  useEffect(() => {
    const fetchThreadData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
        
        // Fetch thread details
        const threadResponse = await fetch(
          `${backendUrl}/api/community/threads/${threadId}`,
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
        
        // Parse content if it's a string
        const contentArray = typeof threadItem.content === 'string' 
          ? [threadItem.content] 
          : Array.isArray(threadItem.content) 
            ? threadItem.content 
            : [threadItem.content];

        setThread({
          ...threadItem,
          content: contentArray,
          replies_count: threadItem.replies_count || 0,
          custodian_responses: threadItem.custodian_responses || 0,
        });

        // Fetch replies for this thread
        const repliesResponse = await fetch(
          `${backendUrl}/api/community/threads/${threadId}/replies`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        );

        if (repliesResponse.ok) {
          const repliesData = await repliesResponse.json();
          const mappedReplies = repliesData.data.map((reply: any) => ({
            id: reply.id,
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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
      
      const response = await fetch(
        `${backendUrl}/api/community/replies`,
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
          `${backendUrl}/api/community/threads/${threadId}/replies`,
          {
            method: 'GET',
            headers: AuthService.getAuthHeaders(),
          }
        );

        if (repliesResponse.ok) {
          const repliesData = await repliesResponse.json();
          const mappedReplies = repliesData.data.map((reply: any) => ({
            id: reply.id,
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
        alert('Reply posted. The community appreciates your contribution.');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    } finally {
      setIsSubmitting(false);
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
        <div className="flex items-start gap-3 mb-4">
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
            <div className="flex items-start gap-3">
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
    </>
  );
}
