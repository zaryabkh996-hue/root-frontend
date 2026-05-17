'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface LibraryItem {
  id: string;
  moduleId: string;
  stage: number;
  type: 'audio' | 'video' | 'pdf' | 'text';
  title: string;
  duration: number;
  durationLabel: string;
  narrator?: string;
  pages?: number;
  locked: boolean;
  photoClass: string;
  tags: string[];
}

interface FilterPill {
  type: string;
  label: string;
  count: number;
}

const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: '1',
    moduleId: '1.4',
    stage: 1,
    type: 'audio',
    title: 'Preparing for the Emotional Weight',
    duration: 10,
    durationLabel: '10 min · narrated by Ama',
    narrator: 'Ama',
    photoClass: 'hero-photo',
    locked: false,
    tags: ['Stage 1', 'Audio'],
  },
  {
    id: '2',
    moduleId: '2.1',
    stage: 2,
    type: 'video',
    title: 'Greeting Elders — A Twi protocol guide',
    duration: 22,
    durationLabel: '22 min',
    photoClass: 'photo-2',
    locked: true,
    tags: ['Stage 2', 'Video', 'Locked'],
  },
  {
    id: '3',
    moduleId: '1.3',
    stage: 1,
    type: 'video',
    title: 'The Uncomfortable Truths',
    duration: 10,
    durationLabel: '10 min · documentary',
    photoClass: 'photo-3',
    locked: false,
    tags: ['Stage 1', 'Video'],
  },
  {
    id: '4',
    moduleId: '5.1',
    stage: 5,
    type: 'audio',
    title: 'At the Door of No Return — A real-time companion',
    duration: 15,
    durationLabel: '15 min · narrated by Nana Kweku',
    narrator: 'Nana Kweku',
    photoClass: 'hero-photo',
    locked: true,
    tags: ['Stage 5', 'Audio', 'Locked'],
  },
  {
    id: '5',
    moduleId: '3.1',
    stage: 3,
    type: 'pdf',
    title: 'DIY Budget Travel Guide · Ghana',
    duration: 42,
    durationLabel: '42 pages',
    pages: 42,
    photoClass: 'photo-2',
    locked: true,
    tags: ['Stage 3', 'PDF', 'Locked'],
  },
  {
    id: '6',
    moduleId: '4.3',
    stage: 4,
    type: 'video',
    title: 'Day Name Ceremony — what to expect',
    duration: 12,
    durationLabel: '12 min · documentary',
    photoClass: 'hero-photo',
    locked: true,
    tags: ['Stage 4', 'Video', 'Locked'],
  },
  {
    id: '7',
    moduleId: '6.1',
    stage: 6,
    type: 'audio',
    title: 'Re-entry · The Atlanta-shaped grief',
    duration: 18,
    durationLabel: '18 min',
    photoClass: 'photo-3',
    locked: true,
    tags: ['Stage 6', 'Audio', 'Locked'],
  },
];

const STAGE_NAMES: Record<number, string> = {
  1: 'Stage 1 — Emotional Preparation',
  2: 'Stage 2 — Cultural Intelligence',
  3: 'Stage 3 — Practical Preparation',
  4: 'Stage 4 — Arrival Orientation',
  5: 'Stage 5 — Heritage Journey',
  6: 'Stage 6 — Post-Journey',
};

export default function LibraryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [stageDropOpen, setStageDropOpen] = useState(false);
  const [durationDropOpen, setDurationDropOpen] = useState(false);

  // Calculate type pills with counts
  const typePills = useMemo(() => {
    const all = LIBRARY_ITEMS.length;
    const audio = LIBRARY_ITEMS.filter(item => item.type === 'audio').length;
    const video = LIBRARY_ITEMS.filter(item => item.type === 'video').length;
    const pdf = LIBRARY_ITEMS.filter(item => item.type === 'pdf').length;
    return [
      { type: 'all', label: 'All', count: all },
      { type: 'audio', label: 'Audio', count: audio },
      { type: 'video', label: 'Video', count: video },
      { type: 'pdf', label: 'PDF', count: pdf },
    ];
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return LIBRARY_ITEMS.filter(item => {
      // Search
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!item.title.toLowerCase().includes(search) && !item.durationLabel.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }

      // Stage filter
      if (filterStage !== 'all' && item.stage !== parseInt(filterStage)) {
        return false;
      }

      // Duration filter
      if (filterDuration !== 'all') {
        if (filterDuration === 'short' && item.duration >= 12) return false;
        if (filterDuration === 'medium' && (item.duration < 12 || item.duration > 20)) return false;
        if (filterDuration === 'long' && item.duration <= 20) return false;
      }

      return true;
    });
  }, [searchTerm, filterType, filterStage, filterDuration]);

  const handleModuleClick = (moduleId: string) => {
    router.push(`/module/${moduleId}`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStage('all');
    setFilterDuration('all');
  };

  return (
    <>
      {/* SOS Button */}
      <button className="crisis-btn" onClick={() => alert('SOS modal')}>
        SOS
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="eyebrow eyebrow-cream mb-3">
          Library · {LIBRARY_ITEMS.length} items · {LIBRARY_ITEMS.filter(item => item.type === 'audio').length} audio guides
        </div>
        <h1 className="display text-5xl font-light leading-tight mb-3">All your content, one place.</h1>
        <p className="text-cream/70 max-w-2xl">
          Audio meditations, video modules, blog essays, downloadable PDFs, language phrasebooks. Filter by stage, type, or duration.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search Input */}
        <input
          id="lib-search"
          className="field-dark flex-1 min-w-[280px]"
          placeholder="Search the library…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* Type Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            id="lib-type-btn"
            className="btn-ghost-dark"
            onClick={() => setTypeDropOpen(!typeDropOpen)}
          >
            {filterType === 'all' ? 'All types' : filterType.charAt(0).toUpperCase() + filterType.slice(1)} ▾
          </button>
          {typeDropOpen && (
            <div
              id="lib-type-drop"
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                background: 'rgba(10,24,16,0.98)',
                border: '1px solid rgba(201,161,74,0.25)',
                borderRadius: '4px',
                zIndex: 200,
                minWidth: '140px',
                padding: '4px',
              }}
            >
              <button
                className="lib-type-opt"
                onClick={() => {
                  setFilterType('all');
                  setTypeDropOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cream)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                All types
              </button>
              <button
                className="lib-type-opt"
                onClick={() => {
                  setFilterType('audio');
                  setTypeDropOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cream)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Audio
              </button>
              <button
                className="lib-type-opt"
                onClick={() => {
                  setFilterType('video');
                  setTypeDropOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cream)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Video
              </button>
              <button
                className="lib-type-opt"
                onClick={() => {
                  setFilterType('pdf');
                  setTypeDropOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cream)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                PDF
              </button>
            </div>
          )}
        </div>

        {/* Stage Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            id="lib-stage-btn"
            className="btn-ghost-dark"
            onClick={() => setStageDropOpen(!stageDropOpen)}
          >
            {filterStage === 'all' ? 'All stages' : `Stage ${filterStage}`} ▾
          </button>
          {stageDropOpen && (
            <div
              id="lib-stage-drop"
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                background: 'rgba(10,24,16,0.98)',
                border: '1px solid rgba(201,161,74,0.25)',
                borderRadius: '4px',
                zIndex: 200,
                minWidth: '200px',
                padding: '4px',
              }}
            >
              <button
                onClick={() => {
                  setFilterStage('all');
                  setStageDropOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cream)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                All stages
              </button>
              {Object.entries(STAGE_NAMES).map(([stage, label]) => (
                <button
                  key={stage}
                  onClick={() => {
                    setFilterStage(stage);
                    setStageDropOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--cream)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Duration Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            id="lib-dur-btn"
            className="btn-ghost-dark"
            onClick={() => setDurationDropOpen(!durationDropOpen)}
          >
            Duration ▾
          </button>
          {durationDropOpen && (
            <div
              id="lib-dur-drop"
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: 'rgba(10,24,16,0.98)',
                border: '1px solid rgba(201,161,74,0.25)',
                borderRadius: '4px',
                zIndex: 200,
                minWidth: '150px',
                padding: '4px',
              }}
            >
              <button
                onClick={() => {
                  setFilterDuration('all');
                  setDurationDropOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cream)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Any length
              </button>
              <button
                onClick={() => {
                  setFilterDuration('short');
                  setDurationDropOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cream)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Under 12 min
              </button>
              <button
                onClick={() => {
                  setFilterDuration('medium');
                  setDurationDropOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cream)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                12–20 min
              </button>
              <button
                onClick={() => {
                  setFilterDuration('long');
                  setDurationDropOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cream)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                20+ min
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Type Quick-Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8" id="lib-pills">
        {typePills.map(pill => (
          <span
            key={pill.type}
            className={`tag ${filterType === pill.type ? 'tag-brass' : 'tag-dark'} cursor-pointer lib-pill ${filterType === pill.type ? 'active-pill' : ''}`}
            onClick={() => setFilterType(pill.type)}
          >
            {pill.label} · {pill.count}
          </span>
        ))}
      </div>

      {/* Library Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="lib-grid">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="lib-card scard-dark p-5 cursor-pointer hover:border-brass/40 transition"
              onClick={() => handleModuleClick(item.moduleId)}
            >
              <div className={`${item.photoClass} aspect-video mb-4 rounded-sm`}></div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="tag tag-brass">Stage {item.stage}</span>
                <span className="tag tag-dark">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                {item.locked && <span className="tag tag-rose">Locked</span>}
              </div>
              <h3 className="font-medium text-cream mb-1">{item.title}</h3>
              <div className="text-xs text-cream/50 mono">{item.durationLabel}</div>
            </div>
          ))}
        </div>
      ) : (
        <div id="lib-empty" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="display text-3xl text-cream/30 mb-3">No results</div>
          <p className="text-cream/50 text-sm mb-4">Try a different filter or clear the search.</p>
          <button className="btn-ghost-dark" onClick={handleClearFilters}>
            Clear all filters
          </button>
        </div>
      )}

      {/* Amen Bubble */}
      <button className="amen-bubble" onClick={() => router.push('/amen')}>
        Ask Amen AI
      </button>
    </>
  );
}
