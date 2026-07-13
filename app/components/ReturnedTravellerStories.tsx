'use client';

import React, { useState, useEffect } from 'react';
import { AuthService } from '@/app/lib/authService';

interface Story {
  id?: number;
  _id: string;
  title: string;
  slug?: string;
  body: string;
  author: string;
  status: 'pending' | 'approved' | 'revision';
  revisionNote?: string;
  revision_note?: string;
  createdAt?: string;
  created_at?: string;
}

export default function ReturnedTravellerStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editor states
  const [isEditing, setIsEditing] = useState(false);
  const [editStoryId, setEditStoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      console.log("[ReturnedTravellerStories] fetchStories triggered. Token exists:", !!token);
      const res = await fetch('/fe-api/stories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log("[ReturnedTravellerStories] fetchStories response status:", res.status);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access denied: Returned Traveller role required.');
        }
        throw new Error('Failed to load stories.');
      }

      const result = await res.json();
      console.log("[ReturnedTravellerStories] fetchStories response data:", result);
      if (result.success) {
        setStories(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load stories.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setIsEditing(true);
    setEditStoryId(null);
    setTitle('');
    setBody('');
    const newKey = typeof window !== 'undefined' && window.crypto?.randomUUID 
      ? window.crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    setIdempotencyKey(newKey);
  };

  const handleOpenEdit = (story: Story) => {
    setIsEditing(true);
    setEditStoryId(story.id ? String(story.id) : story._id);
    setTitle(story.title);
    setBody(story.body);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditStoryId(null);
    setTitle('');
    setBody('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const method = editStoryId ? 'PUT' : 'POST';
      const url = editStoryId ? `/fe-api/stories/${editStoryId}` : '/fe-api/stories';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          body,
          ...(!editStoryId && { idempotencyKey })
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit story.');
      }

      setSuccess(editStoryId ? 'Story updated and resubmitted successfully!' : 'Story draft submitted successfully!');
      setIsEditing(false);
      setEditStoryId(null);
      setTitle('');
      setBody('');
      fetchStories();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-brass/10">
        <div>
          <h2 className="display text-3xl font-light">My Stories & Reflections</h2>
          <p className="text-sm text-cream/60 mt-1">
            Contribute your personal lived experiences and reflections from your journey.
          </p>
        </div>
        {!isEditing && (
          <button className="btn-primary flex items-center gap-2" onClick={handleOpenNew}>
            <span>+</span> Write Story
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 rounded-sm text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 rounded-sm text-sm">
          {success}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="scard-dark p-6 space-y-4">
          <h3 className="display text-xl font-light mb-2">
            {editStoryId ? 'Edit Story Draft' : 'Write New Story Draft'}
          </h3>
          
          <div>
            <label className="text-xs text-cream/50 block mb-2 font-mono uppercase tracking-wider">Title</label>
            <input
              type="text"
              className="w-full"
              placeholder="e.g. A Culinary Homecoming in Accra"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label className="text-xs text-cream/50 block mb-2 font-mono uppercase tracking-wider">Classification</label>
            <div className="text-xs text-brass-light border border-brass/20 bg-brass/5 px-3 py-2 rounded-sm inline-block">
              ✨ Lived Experience (Personal Story)
            </div>
            <span className="text-[10px] text-cream/40 block mt-1">
              Personal lived experiences are marked as Lived Experiences and skip RAG indexing.
            </span>
          </div>

          <div>
            <label className="text-xs text-cream/50 block mb-2 font-mono uppercase tracking-wider">Content / Story Body</label>
            <textarea
              className="field-dark w-full resize-y min-h-[300px]"
              placeholder="Share your personal story, emotional connection, and reflections here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-brass/10">
            <button
              type="button"
              className="btn-ghost-dark text-sm"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-sm"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Draft for Review'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="text-cream/50 text-center py-12">Loading stories...</div>
          ) : stories.length === 0 ? (
            <div className="scard-dark p-12 text-center">
              <span className="text-4xl block mb-3">✍️</span>
              <h3 className="text-lg text-cream font-serif">No stories submitted yet</h3>
              <p className="text-sm text-cream/50 mt-1 mb-6 max-w-md mx-auto">
                Share your personal reflections, arrival feelings, or lived experiences to connect with the community.
              </p>
              <button className="btn-primary" onClick={handleOpenNew}>
                Write your first story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {stories.map((story) => (
                <div key={story.id || story._id} className="scard-dark p-5 border border-brass/10 hover:border-brass/25 transition">
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div>
                      <h4 className="text-lg font-medium text-cream mb-1">{story.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-cream/50">
                        <span>By {story.author}</span>
                        <span>•</span>
                        <span>{new Date(story.created_at || story.createdAt || new Date()).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="tag tag-dark">Lived Experience</span>
                      </div>
                    </div>
                    <div>
                      {story.status === 'approved' && (
                        <span className="text-xs px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-full font-mono uppercase">
                          Approved
                        </span>
                      )}
                      {story.status === 'pending' && (
                        <span className="text-xs px-2.5 py-1 bg-amber-950/40 border border-amber-500/30 text-amber-300 rounded-full font-mono uppercase">
                          Pending Review
                        </span>
                      )}
                      {story.status === 'revision' && (
                        <span className="text-xs px-2.5 py-1 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-full font-mono uppercase">
                          Revision Requested
                        </span>
                      )}
                    </div>
                  </div>

                  {(story.status === 'revision') && (story.revision_note || story.revisionNote) && (
                    <div className="mb-4 p-3.5 bg-rose-950/20 border-l-4 border-rose-500 text-rose-200 rounded-sm text-xs leading-relaxed">
                      <strong>Founder Feedback:</strong> {story.revision_note || story.revisionNote}
                    </div>
                  )}

                  <p className="text-sm text-cream/70 line-clamp-3 mb-4 whitespace-pre-wrap">
                    {story.body}
                  </p>

                  <div className="flex justify-end gap-3 pt-3 border-t border-brass/5">
                    {story.status !== 'approved' && (
                      <button
                        className="btn-ghost-dark text-xs py-1.5 px-3"
                        onClick={() => handleOpenEdit(story)}
                      >
                        Edit / Correct
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
