'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../lib/authService';

interface SearchResultItem {
  id: string | number;
  title?: string;
  name?: string;
  slug?: string;
  stage?: number;
  type?: string;
  specialty?: string;
  short_bio?: string;
  location?: string;
  hub_id?: number;
  excerpt?: string;
  author?: string;
}

interface SearchResults {
  modules: SearchResultItem[];
  library: SearchResultItem[];
  custodians: SearchResultItem[];
  community: SearchResultItem[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ' ';

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    modules: [],
    library: [],
    custodians: [],
    community: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ modules: [], library: [], custodians: [], community: [] });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Debounced API Search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ modules: [], library: [], custodians: [], community: [] });
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: AuthService.getAuthHeaders(),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Search failed');
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            setResults(data.data);
          }
        })
        .catch((err) => {
          console.error('CommandPalette search error:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResultClick = (type: keyof SearchResults, item: SearchResultItem) => {
    onClose();
    if (type === 'modules' || type === 'library') {
      router.push(`/modules/${item.stage}/${item.slug || item.id}`);
    } else if (type === 'custodians') {
      router.push(`/custodians/${item.id}`);
    } else if (type === 'community') {
      router.push(`/community/${item.hub_id}/${item.id}`);
    }
  };

  const hasAnyResults =
    results.modules.length > 0 ||
    results.library.length > 0 ||
    results.custodians.length > 0 ||
    results.community.length > 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center p-0 md:p-12 bg-forest-deepest/80 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full h-full md:h-auto md:max-h-[80vh] md:max-w-2xl bg-forest-deep border-none md:border md:border-brass/35 md:rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Search Input Area */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-brass/15 bg-forest-deepest/40">
          <span className="text-xl">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-cream placeholder-cream/40 border-none outline-none text-base md:text-sm font-sans"
            placeholder="Search stages, library guides, custodians, and hubs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-brass border-t-transparent rounded-full animate-spin"></div>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono px-2 py-1 bg-forest-deepest text-cream/40 border border-brass/10 rounded hover:text-cream transition"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {query.trim().length < 2 && (
            <div className="text-center py-12 text-cream/50">
              <p className="text-sm">Type at least 2 characters to search the sanctuary...</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
                <span className="text-cream/30">Suggestions:</span>
                {['Ghana', 'Visa', 'Greetings', 'Chief', 'Accra'].map((word) => (
                  <button
                    key={word}
                    onClick={() => setQuery(word)}
                    className="text-brass-light hover:underline font-mono"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim().length >= 2 && !loading && !hasAnyResults && (
            <div className="text-center py-12">
              <div className="text-3xl text-cream/30 mb-2">🔍</div>
              <p className="text-cream/50 text-sm">No results — try a different word</p>
            </div>
          )}

          {query.trim().length >= 2 && hasAnyResults && (
            <div className="space-y-6">
              {/* Modules Group */}
              {results.modules.length > 0 && (
                <div>
                  <div className="eyebrow eyebrow-cream text-xs text-brass-light/80 mb-2 px-2 border-l border-brass/30">
                    Modules ({results.modules.length})
                  </div>
                  <div className="space-y-1">
                    {results.modules.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick('modules', item)}
                        className="group flex items-center justify-between p-2.5 rounded hover:bg-brass/10 transition cursor-pointer text-left"
                      >
                        <div>
                          <div className="text-sm font-medium text-cream group-hover:text-brass-light transition">
                            {item.title}
                          </div>
                          <div className="text-xs text-cream/50 font-mono mt-0.5">
                            Stage {item.stage} · {item.type}
                          </div>
                        </div>
                        <span className="text-xs text-brass opacity-0 group-hover:opacity-100 transition">
                          Go →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Library Group */}
              {results.library.length > 0 && (
                <div>
                  <div className="eyebrow eyebrow-cream text-xs text-brass-light/80 mb-2 px-2 border-l border-brass/30">
                    Library Items ({results.library.length})
                  </div>
                  <div className="space-y-1">
                    {results.library.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick('library', item)}
                        className="group flex items-center justify-between p-2.5 rounded hover:bg-brass/10 transition cursor-pointer text-left"
                      >
                        <div>
                          <div className="text-sm font-medium text-cream group-hover:text-brass-light transition">
                            {item.title}
                          </div>
                          <div className="text-xs text-cream/50 font-mono mt-0.5">
                            Stage {item.stage} · {item.type} Guide
                          </div>
                        </div>
                        <span className="text-xs text-brass opacity-0 group-hover:opacity-100 transition">
                          Open →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custodians Group */}
              {results.custodians.length > 0 && (
                <div>
                  <div className="eyebrow eyebrow-cream text-xs text-brass-light/80 mb-2 px-2 border-l border-brass/30">
                    Cultural Custodians ({results.custodians.length})
                  </div>
                  <div className="space-y-1">
                    {results.custodians.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick('custodians', item)}
                        className="group flex items-center justify-between p-2.5 rounded hover:bg-brass/10 transition cursor-pointer text-left"
                      >
                        <div>
                          <div className="text-sm font-medium text-cream group-hover:text-brass-light transition">
                            {item.name}
                          </div>
                          <div className="text-xs text-cream/50 mt-0.5">
                            {item.specialty} · {item.location}
                          </div>
                          {item.short_bio && (
                            <div className="text-xs text-cream/40 mt-1 italic line-clamp-1">
                              &ldquo;{item.short_bio}&rdquo;
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-brass opacity-0 group-hover:opacity-100 transition">
                          View Profile →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Group */}
              {results.community.length > 0 && (
                <div>
                  <div className="eyebrow eyebrow-cream text-xs text-brass-light/80 mb-2 px-2 border-l border-brass/30">
                    Community Threads ({results.community.length})
                  </div>
                  <div className="space-y-1">
                    {results.community.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick('community', item)}
                        className="group flex items-center justify-between p-2.5 rounded hover:bg-brass/10 transition cursor-pointer text-left"
                      >
                        <div className="flex-1 mr-4">
                          <div className="text-sm font-medium text-cream group-hover:text-brass-light transition line-clamp-1">
                            {item.title}
                          </div>
                          {item.excerpt && (
                            <div className="text-xs text-cream/50 mt-0.5 line-clamp-1">
                              {item.excerpt}
                            </div>
                          )}
                          <div className="text-[10px] text-cream/35 mt-1 font-mono">
                            Posted by {item.author || 'Relative'}
                          </div>
                        </div>
                        <span className="text-xs text-brass opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                          Join Thread →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
