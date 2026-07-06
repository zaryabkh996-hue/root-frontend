'use client';

import React, { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'warn' | 'error';

export default function AdminStoriesPage() {
  const [pendingStories, setPendingStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [hubs, setHubs] = useState<any[]>([]);
  const [selectedHubForStory, setSelectedHubForStory] = useState<{ [storyId: string]: string }>({});
  const [storyRevisionNote, setStoryRevisionNote] = useState<{ [storyId: string]: string }>({});

  const [pendingThreads, setPendingThreads] = useState<any[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [threadRevisionNote, setThreadRevisionNote] = useState<{ [threadId: string]: string }>({});

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const addDebugLog = (msg: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const fetchPendingStories = async () => {
    try {
      setLoadingStories(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      addDebugLog(`fetchPendingStories started. token exists: ${!!token}`);
      const res = await fetch('/fe-api/admin/stories/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      addDebugLog(`fetchPendingStories HTTP status: ${res.status}`);
      const result = await res.json();
      addDebugLog(`fetchPendingStories result: ${JSON.stringify(result)}`);
      if (result.success) {
        setPendingStories(result.data || []);
      } else {
        showToast(result.error || 'Failed to fetch pending stories', 'error');
      }
    } catch (err) {
      console.error('[admin/stories/page] Failed to fetch pending stories:', err);
      addDebugLog(`fetchPendingStories exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoadingStories(false);
    }
  };

  const fetchHubs = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const res = await fetch(`${backendUrl}/community/hubs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const result = await res.json();
      if (result.success) {
        setHubs(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch hubs:', err);
    }
  };

  const fetchPendingThreads = async () => {
    try {
      setLoadingThreads(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      addDebugLog(`fetchPendingThreads started. token exists: ${!!token}`);
      const res = await fetch('/fe-api/admin/community/threads/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      addDebugLog(`fetchPendingThreads HTTP status: ${res.status}`);
      const result = await res.json();
      addDebugLog(`fetchPendingThreads result: ${JSON.stringify(result)}`);
      if (result.success) {
        setPendingThreads(result.data || []);
      } else {
        showToast(result.error || 'Failed to fetch pending threads', 'error');
      }
    } catch (err) {
      console.error('[admin/stories/page] Failed to fetch pending threads:', err);
      addDebugLog(`fetchPendingThreads exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    fetchPendingStories();
    fetchHubs();
    fetchPendingThreads();
  }, []);

  const handleApproveStory = async (storyId: string) => {
    const hubId = selectedHubForStory[storyId];
    if (!hubId) {
      showToast('Please select a destination Community Hub.', 'error');
      return;
    }
    const hubObj = hubs.find(h => String(h.id) === String(hubId));
    if (!hubObj) {
      showToast('Selected hub not found.', 'error');
      return;
    }

    setActionLoading(storyId);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const res = await fetch(`/fe-api/admin/stories/${storyId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ hubId: Number(hubId), hubSlug: hubObj.slug }),
      });
      const result = await res.json();
      if (result.success) {
        showToast('Story approved & published to library/community', 'success');
        fetchPendingStories();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Approval failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestStoryRevision = async (storyId: string) => {
    const note = storyRevisionNote[storyId]?.trim();
    if (!note) {
      showToast('Please provide a revision note/reason.', 'error');
      return;
    }

    setActionLoading(storyId);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const res = await fetch(`/fe-api/admin/stories/${storyId}/revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ revisionNote: note }),
      });
      const result = await res.json();
      if (result.success) {
        showToast('Revision requested, story returned to author.', 'warn');
        fetchPendingStories();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to request revision', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveThread = async (threadId: string) => {
    setActionLoading(String(threadId));
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const res = await fetch(`/fe-api/admin/community/threads/${threadId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      const result = await res.json();
      if (result.success) {
        showToast('Thread approved successfully.', 'success');
        fetchPendingThreads();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Approval failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestThreadRevision = async (threadId: string) => {
    const note = threadRevisionNote[threadId]?.trim();
    if (!note) {
      showToast('Please provide a revision note/reason.', 'error');
      return;
    }

    setActionLoading(String(threadId));
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const res = await fetch(`/fe-api/admin/community/threads/${threadId}/revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ revision_note: note }),
      });
      const result = await res.json();
      if (result.success) {
        showToast('Revision requested for thread.', 'warn');
        fetchPendingThreads();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to request revision', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="admin-main">
      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: toast.type === 'success' ? 'rgba(16,185,129,0.95)' : toast.type === 'warn' ? 'rgba(245,158,11,0.95)' : 'rgba(239,68,68,0.95)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            zIndex: 9999,
            fontFamily: 'sans-serif',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {toast.msg}
        </div>
      )}

      <div className="admin-eyebrow">Content Reviews</div>
      
      <div className="a-cc-top-bar" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="admin-page-title">Story &amp; Thread Approvals</h1>
          <p className="admin-page-sub">
            Review personal stories from Returned Travellers and approve community threads.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        
        {/* PENDING STORIES SECTION */}
        <section className="a-card a-card-pad" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111111', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', fontFamily: 'Fraunces, Georgia, serif' }}>
            Pending Stories &amp; Reflections
          </h2>
          {loadingStories ? (
            <div className="text-center py-8" style={{ color: '#6b7280', fontSize: '14px' }}>Loading pending stories...</div>
          ) : pendingStories.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#9ca3af', fontSize: '14px' }}>No stories awaiting review.</div>
          ) : (
            <div className="space-y-6">
              {pendingStories.map((story) => {
                const storyId = story.id || story._id;
                return (
                  <div key={storyId} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '20px', marginBottom: '16px' }}>
                    <div className="flex justify-between items-start gap-4 mb-3 flex-wrap">
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111111', fontFamily: 'Fraunces, Georgia, serif' }}>{story.title}</h4>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          By {story.author} (ID: {story.author_id || story.authorId}) · Created {new Date(story.created_at || story.createdAt || new Date()).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="a-badge-warn">Lived Experience</span>
                    </div>

                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '16px', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto', background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      {story.body}
                    </p>

                    <div className="flex flex-wrap gap-4 items-center justify-between pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                      <div className="flex items-center gap-3">
                        <select
                          className="a-cc-filter-select"
                          value={selectedHubForStory[storyId] || ''}
                          onChange={(e) => setSelectedHubForStory(prev => ({ ...prev, [storyId]: e.target.value }))}
                          style={{ height: '38px' }}
                        >
                          <option value="">Select Hub routing...</option>
                          {hubs.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))}
                        </select>

                        <button
                          className="a-cc-btn-primary"
                          style={{ height: '38px' }}
                          disabled={actionLoading === String(storyId)}
                          onClick={() => handleApproveStory(String(storyId))}
                        >
                          {actionLoading === String(storyId) ? 'Publishing...' : 'Approve & Route to Hub'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                        <input
                          type="text"
                          placeholder="Feedback note..."
                          className="a-cc-search-input flex-1 text-xs"
                          style={{ height: '38px' }}
                          value={storyRevisionNote[storyId] || ''}
                          onChange={(e) => setStoryRevisionNote(prev => ({ ...prev, [storyId]: e.target.value }))}
                        />
                        <button
                          className="a-cc-btn-ghost"
                          style={{ borderColor: '#fca5a5', color: '#dc2626', height: '38px' }}
                          disabled={actionLoading === String(storyId)}
                          onClick={() => handleRequestStoryRevision(String(storyId))}
                        >
                          Request Revision
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* PENDING THREADS SECTION */}
        <section className="a-card a-card-pad" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111111', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', fontFamily: 'Fraunces, Georgia, serif' }}>
            Pending Community Threads
          </h2>
          {loadingThreads ? (
            <div className="text-center py-8" style={{ color: '#6b7280', fontSize: '14px' }}>Loading pending threads...</div>
          ) : pendingThreads.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#9ca3af', fontSize: '14px' }}>No threads awaiting review.</div>
          ) : (
            <div className="space-y-6">
              {pendingThreads.map((thread) => (
                <div key={thread.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '20px', marginBottom: '16px' }}>
                  <div className="flex justify-between items-start gap-4 mb-3 flex-wrap">
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111111', fontFamily: 'Fraunces, Georgia, serif' }}>{thread.title}</h4>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        By {thread.author} · Hub: {thread.hub_name} · Created {new Date(thread.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '16px', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto', background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    {thread.content}
                  </p>

                  <div className="flex flex-wrap gap-4 items-center justify-between pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <button
                      className="a-cc-btn-primary"
                      style={{ height: '38px' }}
                      disabled={actionLoading === String(thread.id)}
                      onClick={() => handleApproveThread(thread.id)}
                    >
                      {actionLoading === String(thread.id) ? 'Approving...' : 'Approve & Publish'}
                    </button>

                    <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                      <input
                        type="text"
                        placeholder="Feedback note..."
                        className="a-cc-search-input flex-1 text-xs"
                        style={{ height: '38px' }}
                        value={threadRevisionNote[thread.id] || ''}
                        onChange={(e) => setThreadRevisionNote(prev => ({ ...prev, [thread.id]: e.target.value }))}
                      />
                      <button
                        className="a-cc-btn-ghost"
                        style={{ borderColor: '#fca5a5', color: '#dc2626', height: '38px' }}
                        disabled={actionLoading === String(thread.id)}
                        onClick={() => handleRequestThreadRevision(thread.id)}
                      >
                        Request Revision
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
