'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';

interface Library {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  type: string;
  duration: string;
  image_url: string;
  file_url: string;
  created_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

const LibraryDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLibrary();
    }
  }, [id]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ success: boolean; data: Library }>(
        `${process.env.NEXT_PUBLIC_API_URL}/libraries/${id}`
      );
      const data = response.data as { success: boolean; data: Library };
      if (data.success) {
        setLibrary(data.data);
      }
    } catch (err) {
      setError('Failed to load library item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-forest-deepest">
        <div className="animate-spin inline-block w-12 h-12 border-4 border-brass border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="min-h-screen text-cream">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="display text-3xl font-light text-cream mb-4">Item Not Found</h1>
            <p className="text-cream/60 mb-6">{error || 'The library item you are looking for does not exist.'}</p>
            <Link
              href="/library"
              className="inline-block bg-brass hover:bg-brass-light text-forest-deepest font-bold py-2 px-6 rounded transition"
            >
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-cream">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <button className="text-cream/60 hover:text-cream text-sm mb-6 flex items-center gap-2" onClick={() => router.back()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5m6 7-7-7 7-7"></path>
          </svg>
          <span>Back to Library</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <div className="eyebrow eyebrow-cream">Library Item · {library.type.charAt(0).toUpperCase() + library.type.slice(1)} · {library.duration}</div>
              {library.type === 'audio' && <span className="tag tag-rose">Guided content</span>}
            </div>
            <h1 className="display text-4xl font-light leading-tight mb-3">{library.title}</h1>

            {/* Diaspora variant indicator - static */}
            <div className="mb-6 inline-flex items-center gap-2 text-xs text-cream/50" style={{border:'1px solid rgba(201,161,74,0.18)', padding:'6px 12px', borderRadius:'2px', background:'rgba(201,161,74,0.05)'}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"></path>
              </svg>
              <span>This content is designed for <strong className="text-cream/85">Global Diaspora</strong> — connecting African heritage worldwide.</span>
            </div>

            {/* Audio player - only for audio type */}
            {library.type === 'audio' && library.file_url && (
              <div className="scard-dark p-7 mb-8">
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-16 h-16 rounded-full bg-brass flex items-center justify-center cursor-pointer hover:bg-brass-light transition flex-shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--forest-deepest)">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-cream mb-2">Narrated by {library.author || 'OurRoots Team'}</div>
                    <div className="audio-bar mb-2" style={{height:'4px', background:'rgba(201,161,74,0.2)', borderRadius:'2px'}}>
                      <div className="audio-bar-fill" style={{height:'100%', background:'var(--brass)', borderRadius:'2px', width:'0%', transition:'width 0.3s'}}></div>
                    </div>
                    <div className="flex justify-between text-xs text-cream/50 mono">
                      <span>0:00</span>
                      <span>{library.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-cream/50">
                    <a href={library.file_url} download className="hover:text-cream">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14m-7-7 7 7 7-7"></path>
                      </svg>
                    </a>
                    <span className="text-xs mono">DL</span>
                  </div>
                </div>
              </div>
            )}

            {/* Body content */}
            <div className="prose prose-invert max-w-none">
              {library.description && (
                <p className="text-cream/80 leading-relaxed mb-4 whitespace-pre-wrap">
                  {library.description}
                </p>
              )}
            </div>

            {/* Reflection prompt */}
            <div className="scard-warm p-7 mt-8" style={{background:'rgba(201,161,74,0.08)', color:'var(--cream)', borderLeft:'4px solid var(--brass)'}}>
              <div className="eyebrow eyebrow-cream mb-3">Private reflection · only you see this</div>
              <p className="display text-lg mb-4 text-cream">"What does this content mean to you personally?"</p>
              <textarea className="field-dark min-h-[140px] resize-y" placeholder="Take your time. Your reflections help deepen your connection."></textarea>
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-cream/50 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>Private · stored securely</span>
                </div>
                <button className="btn-primary">Save reflection</button>
              </div>
            </div>

            {/* Three-emoji feedback widget */}
            <div className="scard-dark mt-8 p-6">
              <div className="eyebrow eyebrow-cream mb-3">How did that land?</div>
              <p className="text-cream/70 text-sm mb-5">One tap. No pressure. This helps us improve the experience.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="emoji-fb scard-dark p-5 text-left transition hover:border-brass/40" style={{cursor:'pointer', border:'1px solid rgba(201,161,74,0.15)', background:'rgba(20,48,37,0.4)'}}>
                  <div className="text-3xl mb-2 leading-none">🌱</div>
                  <div className="font-medium text-cream mb-1">Sprout</div>
                  <p className="text-xs text-cream/60 leading-relaxed">This planted something meaningful for me.</p>
                </button>
                <button className="emoji-fb scard-dark p-5 text-left transition hover:border-brass/40" style={{cursor:'pointer', border:'1px solid rgba(201,161,74,0.15)', background:'rgba(20,48,37,0.4)'}}>
                  <div className="text-3xl mb-2 leading-none">🪶</div>
                  <div className="font-medium text-cream mb-1">Feather</div>
                  <p className="text-xs text-cream/60 leading-relaxed">Light and informative. Good balance.</p>
                </button>
                <button className="emoji-fb scard-dark p-5 text-left transition hover:border-brass/40" style={{cursor:'pointer', border:'1px solid rgba(201,161,74,0.15)', background:'rgba(20,48,37,0.4)'}}>
                  <div className="text-3xl mb-2 leading-none">🪨</div>
                  <div className="font-medium text-cream mb-1">Stone</div>
                  <p className="text-xs text-cream/60 leading-relaxed">This was heavy. Need time to process.</p>
                </button>
              </div>
              <input type="text" className="field-dark mt-5" placeholder="Anything you want to share? (optional)" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-brass/15">
              <button className="btn-ghost-dark" onClick={() => router.back()}>← Back to Library</button>
              {library.file_url && (
                <a href={library.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  {library.type === 'audio' ? 'Listen Again' : library.type === 'video' ? 'Watch Again' : 'Download'}
                </a>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="scard-dark p-5 mb-5 sticky top-24">
              <div className="eyebrow eyebrow-cream mb-3">Library Info</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-cream/80">
                  <span className="text-brass mono text-xs">📚</span> {library.category || 'Cultural Content'}
                </div>
                <div className="flex items-center gap-2 text-cream/80">
                  <span className="text-brass mono text-xs">⏱️</span> {library.duration}
                </div>
                <div className="flex items-center gap-2 text-cream/80">
                  <span className="text-brass mono text-xs">👤</span> {library.author || 'OurRoots Team'}
                </div>
                <div className="flex items-center gap-2 text-cream/40">
                  <span className="mono text-xs">📅</span> {new Date(library.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-brass/10">
                <div className="eyebrow eyebrow-cream mb-2">Need support?</div>
                <button className="btn-ghost-dark w-full justify-center text-xs">Talk to Amen AI</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryDetailPage;
