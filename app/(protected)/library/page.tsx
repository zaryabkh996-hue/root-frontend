'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '../../lib/progressContext';
import { getModuleById } from '../../lib/progressStore';

interface LibraryItem {
  id: string;
  moduleId: string;
  stage: number;
  type: 'audio' | 'video' | 'pdf' | 'image';
  title: string;
  duration: number;
  durationLabel: string;
  narrator?: string;
  pages?: number;
  locked: boolean;
  photoClass: string;
  tags: string[];
  resourceUrl?: string;
}

interface FilterPill {
  type: string;
  label: string;
  count: number;
}

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
  const { computed } = useProgress();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [stageDropOpen, setStageDropOpen] = useState(false);
  const [durationDropOpen, setDurationDropOpen] = useState(false);

  const [guidanceModalOpen, setGuidanceModalOpen] = useState(false);
  const [guidanceModalItem, setGuidanceModalItem] = useState<{ title: string; stage: number } | null>(null);

  // Map Sanity dynamic modules to LibraryItems format
  const LIBRARY_ITEMS = useMemo(() => {
    const items: LibraryItem[] = [];
    if (!computed || !computed.stageStatuses) return items;

    computed.stageStatuses.forEach(stage => {
      stage.moduleStatuses.forEach(mod => {
        const typeLower = (mod.type || '').toLowerCase();
        if (typeLower === 'audio' || typeLower === 'video' || typeLower === 'pdf' || typeLower === 'image') {
          // Parse duration
          let durationVal = 10;
          if (mod.duration) {
            const parsed = parseInt(mod.duration);
            if (!isNaN(parsed)) {
              durationVal = parsed;
            }
          }

          // Construct durationLabel
          let durationLabel = mod.duration || '';
          if (typeLower === 'audio') {
            durationLabel = `${durationLabel} · Audio Guide`;
          } else if (typeLower === 'video') {
            durationLabel = `${durationLabel} · Video Presentation`;
          } else if (typeLower === 'pdf') {
            durationLabel = `${durationLabel} · PDF Document`;
          } else if (typeLower === 'image') {
            durationLabel = `Image Resource`;
          }

          const isLocked = mod.status === 'locked';

          // Assign background classes consistent with the static designs
          let photoClass = 'hero-photo';
          if (mod.id.startsWith('2') || mod.id.startsWith('5')) {
            photoClass = 'photo-2';
          } else if (mod.id.startsWith('3') || mod.id.startsWith('6')) {
            photoClass = 'photo-3';
          }

          items.push({
            id: mod.id,
            moduleId: mod.id,
            stage: stage.id,
            type: typeLower as 'audio' | 'video' | 'pdf' | 'image',
            title: mod.title,
            duration: durationVal,
            durationLabel: durationLabel,
            locked: isLocked,
            photoClass: photoClass,
            tags: [`Stage ${stage.id}`, typeLower.toUpperCase(), ...(isLocked ? ['Locked'] : [])],
            resourceUrl: mod.resourceUrl,
          });
        }
      });
    });

    return items;
  }, [computed]);

  // Calculate type pills with counts
  const typePills = useMemo(() => {
    const all = LIBRARY_ITEMS.length;
    const audio = LIBRARY_ITEMS.filter(item => item.type === 'audio').length;
    const video = LIBRARY_ITEMS.filter(item => item.type === 'video').length;
    const pdf = LIBRARY_ITEMS.filter(item => item.type === 'pdf').length;
    const image = LIBRARY_ITEMS.filter(item => item.type === 'image').length;
    return [
      { type: 'all', label: 'All', count: all },
      { type: 'audio', label: 'Audio', count: audio },
      { type: 'video', label: 'Video', count: video },
      { type: 'pdf', label: 'PDF', count: pdf },
      { type: 'image', label: 'Images', count: image },
    ];
  }, [LIBRARY_ITEMS]);

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
  }, [searchTerm, filterType, filterStage, filterDuration, LIBRARY_ITEMS]);

  const handleItemClick = (item: LibraryItem) => {
    if (item.locked) {
      setGuidanceModalItem({
        title: item.title,
        stage: item.stage,
      });
      setGuidanceModalOpen(true);
    } else {
      const info = getModuleById(item.moduleId);
      const slug = info?.module.slug || item.moduleId;
      const stageId = info?.stage.id || item.stage;
      router.push(`/modules/${stageId}/${slug}`);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStage('all');
    setFilterDuration('all');
  };

  return (
    <>
   

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
              <button
                className="lib-type-opt"
                onClick={() => {
                  setFilterType('image');
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
                Image
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
              onClick={() => handleItemClick(item)}
            >
              <div className="aspect-video mb-4 rounded-sm overflow-hidden relative bg-forest-dark border border-brass/10 flex items-center justify-center w-full">
                {item.locked ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <span style={{ fontSize: '24px' }}>🔒</span>
                  </div>
                ) : null}

                {/* If it has an actual resource URL and is unlocked */}
                {!item.locked && item.resourceUrl ? (
                  item.type === 'video' ? (
                    <div className="relative w-full h-full group">
                      <video
                        src={item.resourceUrl}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-all">
                        <div className="w-10 h-10 rounded-full bg-brass/90 flex items-center justify-center text-forest-deepest text-sm shadow-md">
                          ▶
                        </div>
                      </div>
                    </div>
                  ) : item.type === 'pdf' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-950/40 to-forest-dark text-center">
                      <span className="text-3xl mb-1">📄</span>
                      <span className="text-[10px] text-cream/40 uppercase font-mono tracking-wider">PDF Resource</span>
                    </div>
                  ) : item.type === 'audio' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-brass/10 to-forest-dark text-center">
                      <span className="text-3xl mb-1 animate-pulse">🎵</span>
                      <span className="text-[10px] text-cream/40 uppercase font-mono tracking-wider">Audio Lecture</span>
                    </div>
                  ) : (
                    // Default image or other media
                    <img
                      src={item.resourceUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  /* Fallback gradient background */
                  <div className={`${item.photoClass} w-full h-full`} />
                )}
              </div>
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

     

      {/* Guidance Modal */}
      {guidanceModalOpen && guidanceModalItem && (
        <div className="modal-shroud" onClick={() => setGuidanceModalOpen(false)}>
          <div
            className="modal-card scard-dark p-9"
            style={{ maxWidth: '520px', background: 'var(--forest-deep)', border: '1px solid var(--brass)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-3xl mb-4">🔒</div>
            <h2 className="display text-2xl font-light mb-3">Module Locked</h2>
            <p className="text-cream/70 text-sm mb-6 leading-relaxed">
              &ldquo;{guidanceModalItem.title}&rdquo; is locked. Complete the previous modules in Stage {guidanceModalItem.stage} to unlock this.
            </p>
            <div className="flex gap-3 justify-center">
              <button className="btn-ghost-dark" onClick={() => setGuidanceModalOpen(false)}>
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setGuidanceModalOpen(false);
                  router.push('/modules');
                }}
              >
                Go to Journey Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
