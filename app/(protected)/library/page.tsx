'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Library {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  type: string;
  duration: string;
  image_url: string;
  created_at: string;
}

const LibraryPage = () => {
  const router = useRouter();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);

  useEffect(() => {
    // Check user role and redirect admin to admin panel
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
          router.push('/admin/library');
          return;
        }
      } catch (e) {
        console.log('Could not parse user data');
      }
    }
    fetchLibraries();
  }, [router]);

  const fetchLibraries = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ success: boolean; data: Library[] }>(
        `${process.env.NEXT_PUBLIC_API_URL}/libraries`
      );
      const data = response.data as { success: boolean; data: Library[] };
      if (data.success) {
        setLibraries(data.data);
      }
    } catch (err) {
      setError('Failed to load library items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLibraries = libraries.filter(lib => {
    const matchesSearch = lib.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lib.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lib.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || lib.type === selectedType;
    const matchesStage = selectedStage === 'all' || lib.category === selectedStage;
    const matchesDuration = selectedDuration === 'all' ||
                           (selectedDuration === 'short' && parseInt(lib.duration) < 12) ||
                           (selectedDuration === 'medium' && parseInt(lib.duration) >= 12 && parseInt(lib.duration) <= 20) ||
                           (selectedDuration === 'long' && parseInt(lib.duration) > 20);

    return matchesSearch && matchesType && matchesStage && matchesDuration;
  });

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      audio: '🎵',
      video: '🎬',
      pdf: '📄',
      text: '📝',
    };
    return icons[type] || '📚';
  };

  const typeCounts = {
    all: libraries.length,
    audio: libraries.filter(l => l.type === 'audio').length,
    video: libraries.filter(l => l.type === 'video').length,
    pdf: libraries.filter(l => l.type === 'pdf').length,
    text: libraries.filter(l => l.type === 'text').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-forest-deepest">
        <div className="animate-spin inline-block w-12 h-12 border-4 border-brass border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-cream p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="eyebrow eyebrow-cream mb-3">Library · {libraries.length} items · {typeCounts.audio} audio guides</div>
          <h1 className="display text-5xl font-light leading-tight mb-3">All your content, one place.</h1>
          <p className="text-cream/70 max-w-2xl">Audio meditations, video modules, blog essays, downloadable PDFs, language phrasebooks. Filter by stage, type, or duration.</p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            id="lib-search"
            className="field-dark flex-1 min-w-[280px]"
            placeholder="Search the library…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* All Types dropdown */}
          <div style={{position:'relative'}}>
            <button id="lib-type-btn" className="btn-ghost-dark" onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}>
              {selectedType === 'all' ? 'All types ▾' : `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} ▾`}
            </button>
            {typeDropdownOpen && (
              <div id="lib-type-drop" style={{position:'absolute',top:'110%',left:0,background:'rgba(10,24,16,0.98)',border:'1px solid rgba(201,161,74,0.25)',borderRadius:'4px',zIndex:200,minWidth:'140px',padding:'4px'}}>
                <button className="lib-type-opt" onClick={() => {setSelectedType('all'); setTypeDropdownOpen(false);}}>All types</button>
                <button className="lib-type-opt" onClick={() => {setSelectedType('audio'); setTypeDropdownOpen(false);}}>Audio</button>
                <button className="lib-type-opt" onClick={() => {setSelectedType('video'); setTypeDropdownOpen(false);}}>Video</button>
                <button className="lib-type-opt" onClick={() => {setSelectedType('pdf'); setTypeDropdownOpen(false);}}>PDF</button>
                <button className="lib-type-opt" onClick={() => {setSelectedType('text'); setTypeDropdownOpen(false);}}>Text</button>
              </div>
            )}
          </div>
          {/* All Stages dropdown */}
          <div style={{position:'relative'}}>
            <button id="lib-stage-btn" className="btn-ghost-dark" onClick={() => setStageDropdownOpen(!stageDropdownOpen)}>
              {selectedStage === 'all' ? 'All stages ▾' : `Stage ${selectedStage} ▾`}
            </button>
            {stageDropdownOpen && (
              <div id="lib-stage-drop" style={{position:'absolute',top:'110%',left:0,background:'rgba(10,24,16,0.98)',border:'1px solid rgba(201,161,74,0.25)',borderRadius:'4px',zIndex:200,minWidth:'200px',padding:'4px'}}>
                <button className="lib-type-opt" onClick={() => {setSelectedStage('all'); setStageDropdownOpen(false);}}>All stages</button>
                <button className="lib-type-opt" onClick={() => {setSelectedStage('1'); setStageDropdownOpen(false);}}>Stage 1 — Emotional Preparation</button>
                <button className="lib-type-opt" onClick={() => {setSelectedStage('2'); setStageDropdownOpen(false);}}>Stage 2 — Cultural Intelligence</button>
                <button className="lib-type-opt" onClick={() => {setSelectedStage('3'); setStageDropdownOpen(false);}}>Stage 3 — Practical Preparation</button>
                <button className="lib-type-opt" onClick={() => {setSelectedStage('4'); setStageDropdownOpen(false);}}>Stage 4 — Arrival Orientation</button>
                <button className="lib-type-opt" onClick={() => {setSelectedStage('5'); setStageDropdownOpen(false);}}>Stage 5 — Heritage Journey</button>
                <button className="lib-type-opt" onClick={() => {setSelectedStage('6'); setStageDropdownOpen(false);}}>Stage 6 — Post-Journey</button>
              </div>
            )}
          </div>
          {/* Duration dropdown */}
          <div style={{position:'relative'}}>
            <button id="lib-dur-btn" className="btn-ghost-dark" onClick={() => setDurationDropdownOpen(!durationDropdownOpen)}>
              {selectedDuration === 'all' ? 'Duration ▾' : selectedDuration === 'short' ? 'Under 12 min ▾' : selectedDuration === 'medium' ? '12–20 min ▾' : '20+ min ▾'}
            </button>
            {durationDropdownOpen && (
              <div id="lib-dur-drop" style={{position:'absolute',top:'110%',right:0,background:'rgba(10,24,16,0.98)',border:'1px solid rgba(201,161,74,0.25)',borderRadius:'4px',zIndex:200,minWidth:'150px',padding:'4px'}}>
                <button className="lib-type-opt" onClick={() => {setSelectedDuration('all'); setDurationDropdownOpen(false);}}>Any length</button>
                <button className="lib-type-opt" onClick={() => {setSelectedDuration('short'); setDurationDropdownOpen(false);}}>Under 12 min</button>
                <button className="lib-type-opt" onClick={() => {setSelectedDuration('medium'); setDurationDropdownOpen(false);}}>12–20 min</button>
                <button className="lib-type-opt" onClick={() => {setSelectedDuration('long'); setDurationDropdownOpen(false);}}>20+ min</button>
              </div>
            )}
          </div>
        </div>

        {/* Type quick-filter pills */}
        <div className="flex flex-wrap gap-2 mb-8" id="lib-pills">
          <span className={`tag tag-brass cursor-pointer lib-pill ${selectedType === 'all' ? 'active-pill' : ''}`} onClick={() => setSelectedType('all')}>All · {typeCounts.all}</span>
          <span className={`tag tag-dark cursor-pointer lib-pill ${selectedType === 'audio' ? 'active-pill' : ''}`} onClick={() => setSelectedType('audio')}>Audio · {typeCounts.audio}</span>
          <span className={`tag tag-dark cursor-pointer lib-pill ${selectedType === 'video' ? 'active-pill' : ''}`} onClick={() => setSelectedType('video')}>Video · {typeCounts.video}</span>
          <span className={`tag tag-dark cursor-pointer lib-pill ${selectedType === 'pdf' ? 'active-pill' : ''}`} onClick={() => setSelectedType('pdf')}>PDF · {typeCounts.pdf}</span>
          <span className={`tag tag-dark cursor-pointer lib-pill ${selectedType === 'text' ? 'active-pill' : ''}`} onClick={() => setSelectedType('text')}>Text · {typeCounts.text}</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="scard-warm p-5 mb-8 border-l-4" style={{borderLeftColor: 'var(--terra)', background: 'rgba(212,116,73,0.10)', color: 'var(--cream)'}}>
            <div className="eyebrow mb-1" style={{color: 'var(--terra)', fontSize: '10px'}}>Error</div>
            <p className="text-cream text-sm">{error}</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="lib-grid">
          {filteredLibraries.map((library) => (
            <div key={library.id} className="lib-card scard-dark p-5 cursor-pointer hover:border-brass/40 transition" onClick={() => router.push(`/library/${library.id}`)}>
              <div className="hero-photo aspect-video mb-4 rounded-sm" style={{background: 'linear-gradient(to bottom right, rgba(201,161,74,0.2), rgba(212,116,73,0.2))', position: 'relative'}}>
                {library.image_url && (
                  <Image
                    src={library.image_url}
                    alt={library.title}
                    fill
                    className="object-cover rounded-sm"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="tag tag-brass">Stage {library.category || '1'}</span>
                <span className="tag tag-dark">{library.type.charAt(0).toUpperCase() + library.type.slice(1)}</span>
              </div>
              <h3 className="font-medium text-cream mb-1">{library.title}</h3>
              <div className="text-xs text-cream/50 mono">{library.duration} · {library.author || 'Narrator'}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredLibraries.length === 0 && (
          <div id="lib-empty" style={{textAlign:'center',padding:'48px 24px'}}>
            <div className="display text-3xl text-cream/30 mb-3">No results</div>
            <p className="text-cream/50 text-sm">Try a different filter or clear the search.</p>
            <button className="btn-ghost-dark mt-4" onClick={() => {setSearchTerm(''); setSelectedType('all'); setSelectedStage('all'); setSelectedDuration('all');}}>Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
