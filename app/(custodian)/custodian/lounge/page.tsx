'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/app/lib/authService';
import { useNotification } from '@/app/lib/NotificationContext';

interface Post {
  id: number;
  content: string;
  category: 'question' | 'tip' | 'discussion';
  likes_count: number;
  replies_count: number;
  isLiked: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    location: string;
    country: string;
    certification: string;
  };
  replies: any[];
}

interface LoungeStats {
  totalMembers: number;
  activeToday: number;
  userStats: {
    posts: number;
    replies: number;
    likes_received: number;
  };
}

export default function CustodianLounge() {
  const { showNotification } = useNotification();
  const [composeText, setComposeText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'question' | 'tip' | 'discussion'>('question');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<LoungeStats | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchPosts = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
      const response = await fetch(`${backendUrl}/api/lounge/posts?page=${page}`, {
        headers: AuthService.getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch posts');

      const data = await response.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching posts:', error);
      showNotification('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchStats = useCallback(async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
      const response = await fetch(`${backendUrl}/api/lounge/stats`, {
        headers: AuthService.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchPosts(1);
    fetchStats();
  }, [fetchPosts, fetchStats]);

  const toggleLike = async (postId: number) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
      const response = await fetch(`${backendUrl}/api/lounge/posts/${postId}/like`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: data.likes_count,
              isLiked: data.isLiked
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleReply = async (postId: number) => {
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
      const response = await fetch(`${backendUrl}/api/lounge/posts/${postId}/replies`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({ content: replyText }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              replies_count: post.replies_count + 1,
              replies: [...(post.replies || []), data.reply]
            };
          }
          return post;
        }));
        setReplyText('');
        setReplyingTo(null);
        showNotification('Reply posted successfully');
        fetchStats();
      } else {
        throw new Error('Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      showNotification('Failed to post reply', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handlePost = async () => {
    if (!composeText.trim()) return;

    try {
      setSubmitting(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spectacular-wisdom-production-dfac.up.railway.app';
      const response = await fetch(`${backendUrl}/api/lounge/posts`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          content: composeText,
          category: selectedCategory
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => [data.post, ...prev]);
        setComposeText('');
        showNotification('Post shared successfully');
        fetchStats(); // Update user stats
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      showNotification('Failed to share post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="cust-eyebrow">Private Community</div>
      <h1 className="cust-page-title">Custodian Lounge</h1>

      {/* Security Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1a2e1a', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a14a" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#c9a14a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Custodians Only · Walled Space
          </div>
          <div style={{ fontSize: '11px', color: '#a0a890', marginTop: '2px' }}>
            This forum is invisible to clients and the public. All posts are peer-to-peer among verified OurRoots Custodians.
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px' }}>
        <div>
          {/* Compose */}
          <div className="c-card c-card-pad" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div className="avatar avatar-photo" style={{ width: '36px', height: '36px', fontSize: '13px', border: '2px solid rgba(201,161,74,0.5)', flexShrink: 0 }}>
                {currentUser?.name?.charAt(0) || 'C'}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  className="c-field"
                  rows={3}
                  placeholder="Share a question, insight, or experience with fellow Custodians…"
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  style={{ resize: 'none', fontSize: '13px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { id: 'question', label: 'Question', bg: '#dbeafe', color: '#1d4ed8' },
                      { id: 'tip', label: 'Tip', bg: '#dcfce7', color: '#16a34a' },
                      { id: 'discussion', label: 'Discussion', bg: '#fef9c3', color: '#b45309' }
                    ].map(cat => (
                      <span
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        style={{
                          fontSize: '10px',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          background: selectedCategory === cat.id ? cat.bg : 'transparent',
                          color: selectedCategory === cat.id ? cat.color : '#8a7f72',
                          fontWeight: 600,
                          border: selectedCategory === cat.id ? `1px solid ${cat.color}` : '1px solid #e8e3d9',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {cat.label}
                      </span>
                    ))}
                  </div>
                  <button
                    disabled={submitting || !composeText.trim()}
                    onClick={handlePost}
                    style={{
                      background: '#c9a14a',
                      color: '#fff',
                      border: 'none',
                      padding: '7px 18px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: submitting || !composeText.trim() ? 0.6 : 1
                    }}
                  >
                    {submitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="a-loader"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="c-card c-card-pad" style={{ textAlign: 'center', color: '#8a7f72', fontSize: '13px' }}>
              No posts found. Start the conversation!
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <div key={post.id} className="c-card c-card-pad" style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '50%', 
                      background: post.user?.id % 3 === 0 ? '#2d6a4f' : post.user?.id % 3 === 1 ? '#8a4f2d' : '#4a2d8a', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#f0ebe0', flexShrink: 0 
                    }}>
                      {post.user?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{post.user?.name}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', padding: '2px 8px', borderRadius: '20px', background: 'rgba(22,163,74,0.1)' }}>
                          ✓ {post.user?.certification || 'Certified Custodian'}
                        </span>
                        <span style={{ 
                          fontSize: '10px', padding: '2px 8px', borderRadius: '20px', 
                          background: post.category === 'question' ? '#dbeafe' : post.category === 'tip' ? '#dcfce7' : '#fef9c3',
                          color: post.category === 'question' ? '#1d4ed8' : post.category === 'tip' ? '#16a34a' : '#b45309',
                          fontWeight: 600 
                        }}>
                          {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#8a7f72' }}>
                        {post.user?.location}, {post.user?.country} · {getTimeAgo(post.created_at)}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {post.content}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                    <button
                      onClick={() => toggleLike(post.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: post.isLiked ? '#c9a14a' : '#8a7f72',
                        padding: 0,
                        fontWeight: post.isLiked ? 600 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={post.isLiked ? '#c9a14a' : 'none'} stroke={post.isLiked ? '#c9a14a' : '#8a7f72'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      {post.likes_count}
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: replyingTo === post.id ? '#c9a14a' : '#8a7f72',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={replyingTo === post.id ? '#c9a14a' : '#8a7f72'} strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                      Reply ({post.replies_count})
                    </button>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#8a7f72',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a7f72" strokeWidth="2">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Save
                    </button>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === post.id && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', paddingLeft: '20px' }}>
                      <div className="avatar avatar-photo" style={{ width: '32px', height: '32px', fontSize: '12px', border: '2px solid rgba(201,161,74,0.5)', flexShrink: 0 }}>
                        {currentUser?.name?.charAt(0) || 'C'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <textarea
                          className="c-field"
                          rows={2}
                          placeholder="Write your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          style={{ resize: 'none', fontSize: '12px' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                            style={{
                              background: 'transparent',
                              border: '1px solid #d8d0c3',
                              color: '#8a7f72',
                              padding: '5px 12px',
                              borderRadius: '16px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReply(post.id)}
                            disabled={submittingReply || !replyText.trim()}
                            style={{
                              background: '#c9a14a',
                              border: 'none',
                              color: '#fff',
                              padding: '5px 12px',
                              borderRadius: '16px',
                              fontSize: '11px',
                              cursor: submittingReply || !replyText.trim() ? 'not-allowed' : 'pointer',
                              opacity: submittingReply || !replyText.trim() ? 0.6 : 1
                            }}
                          >
                            {submittingReply ? 'Posting...' : 'Post Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display Replies */}
                  {post.replies && post.replies.length > 0 && (
                    <div style={{ marginLeft: '20px', paddingLeft: '15px',borderTop: '1px solid #e8e3d9',paddingTop: '10px' }}>
                      {post.replies.map((reply: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: '10px', padding: '10px', background: '#f9f6f0', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#1a1a1a' }}>{reply.user?.name || 'Anonymous'}</span>
                            <span style={{ fontSize: '10px', color: '#8a7f72' }}>· {getTimeAgo(reply.created_at)}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#374151', margin: 0, lineHeight: '1.5' }}>{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchPosts(currentPage - 1)}
                    className="a-btn-ghost"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '13px', color: '#8a7f72', alignSelf: 'center' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchPosts(currentPage + 1)}
                    className="a-btn-ghost"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Members Card */}
          <div className="c-card c-card-pad" style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Lounge Members
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#c9a14a', fontFamily: "'JetBrains Mono', monospace" }}>
              {stats?.totalMembers || '...'}
            </div>
            <div style={{ fontSize: '11px', color: '#8a7f72', marginTop: '2px' }}>
              Verified Custodians · {stats?.activeToday || '0'} active today
            </div>
          </div>

          {/* Hot Topics Card */}
          <div className="c-card c-card-pad" style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Hot Topics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                '🔥 Managing emotional breakthroughs',
                '📚 Best Knowledge Bank formats',
                '📅 Diaspora visits & festival timing',
                '💰 Earnings optimisation'
              ].map((topic, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '12px',
                    color: '#374151',
                    padding: '8px',
                    background: '#f9f6f0',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>

          {/* Your Status Card */}
          <div className="c-card c-card-pad">
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              {[
                { label: 'Posts', value: stats?.userStats?.posts || '0', color: '#1a1a1a' },
                { label: 'Replies', value: stats?.userStats?.replies || '0', color: '#1a1a1a' },
                { label: 'Likes received', value: stats?.userStats?.likes_received || '0', color: '#c9a14a' },
                { label: 'Standing', value: '✓ Good', color: '#2d6a4f' }
              ].map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8a7f72' }}>{stat.label}</span>
                  <span style={{ fontWeight: 600, color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
