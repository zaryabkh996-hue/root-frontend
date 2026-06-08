'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProgress } from '../../../../lib/progressContext';
import { getModuleById, getNextModuleId, getPrevModuleId } from '../../../../lib/progressStore';
import { getModuleContent } from '../../../../lib/moduleContent';

function AudioPlayerCard({ url, duration, title }: { url: string; duration: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error(e));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setTotalDuration(audioRef.current.duration);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    audioRef.current.currentTime = percentage * totalDuration;
  };

  const progressPercent = totalDuration ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="scard-dark p-7 mb-8 border border-brass/10 hover:border-brass/35 transition-all">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="flex items-center gap-5">
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-brass flex items-center justify-center cursor-pointer hover:bg-brass-light transition flex-shrink-0 text-forest-deepest active:scale-95"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--forest-deepest)">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--forest-deepest)" style={{ marginLeft: '4px' }}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="text-sm font-semibold text-cream mb-1">
            {title}
          </div>
          <div className="text-xs text-cream/60 mb-2">
            Audio Lecture · {duration}
          </div>
          <div
            onClick={handleProgressClick}
            className="h-2 bg-brass/15 hover:bg-brass/25 rounded-full cursor-pointer relative overflow-hidden mb-2 transition"
          >
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-brass rounded-full transition-all duration-100"
            />
          </div>
          <div className="flex justify-between text-xs text-cream/50 mono">
            <span>{formatTime(currentTime)}</span>
            <span>{totalDuration ? formatTime(totalDuration) : duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoPlayerCard({ url, title }: { url: string; title: string }) {
  return (
    <div className="scard-dark p-4 mb-8 border border-brass/10 rounded-xl overflow-hidden hover:border-brass/35 transition-all">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
        <video
          src={url}
          controls
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-2 pb-1">
        <div className="text-sm font-semibold text-cream mb-1">{title}</div>
        <div className="text-xs text-cream/50">Video Presentation</div>
      </div>
    </div>
  );
}

function PdfResourceCard({ url, title }: { url: string; title: string }) {
  return (
    <div className="scard-dark p-6 mb-8 border border-brass/10 hover:border-brass/35 transition-all flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 text-2xl flex-shrink-0">
          📄
        </div>
        <div>
          <h3 className="text-sm font-semibold text-cream mb-1">{title}</h3>
          <p className="text-xs text-cream/50">PDF Document Resource</p>
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary flex items-center gap-2 text-xs py-2 px-4 whitespace-nowrap"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        Download PDF
      </a>
    </div>
  );
}

function ModuleContent({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const { progress, computed, completeModule, saveJournal, saveFeedback } = useProgress();

  const moduleInfo = getModuleById(moduleId);
  const resolvedId = moduleInfo?.module.id || '';
  const fallbackContent = getModuleContent(resolvedId);

  const [journalText, setJournalText] = useState(progress.journalEntries[resolvedId] ?? '');
  const [journalSaved, setJournalSaved] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(progress.feedbackEntries[resolvedId] ?? '');

  // Sync state when module loads or progress updates
  useEffect(() => {
    if (resolvedId) {
      setJournalText(progress.journalEntries[resolvedId] ?? '');
      setSelectedFeedback(progress.feedbackEntries[resolvedId] ?? '');
    }
  }, [resolvedId, progress.journalEntries, progress.feedbackEntries]);

  if (!moduleInfo) {
    return <div className="text-cream/60 p-8">Loading module...</div>;
  }

  const { module, stage } = moduleInfo;
  const nextId = getNextModuleId(resolvedId);
  const prevId = getPrevModuleId(resolvedId);
  const isCompleted = progress.completedModules.includes(resolvedId);

  const stageStatus = computed.stageStatuses.find(s => s.id === stage.id);

  const handleComplete = () => {
    completeModule(resolvedId);
    if (nextId) {
      const nextInfo = getModuleById(nextId);
      const nextSlug = nextInfo?.module.slug || nextId;
      const nextStageId = nextInfo?.stage.id || stage.id;
      router.push(`/modules/${nextStageId}/${nextSlug}`);
    } else {
      router.push(`/modules/${stage.id}`);
    }
  };

  const handleSaveJournal = () => {
    saveJournal(resolvedId, journalText);
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2000);
  };

  const handleFeedback = (key: string) => {
    setSelectedFeedback(key);
    saveFeedback(resolvedId, key);
  };

  // Split content body into paragraphs or fallback to static paragraphs
  const paragraphs = module.body
    ? module.body.split(/\n\n+/)
    : fallbackContent.paragraphs;

  const reflectionPrompt = fallbackContent.reflectionPrompt || (module.type === 'Reflection Lab' ? `Reflect on how ${module.title.toLowerCase()} makes you feel as you prepare for your return to Africa.` : undefined);

  const renderMediaPlayer = () => {
    const typeLower = module.type ? module.type.toLowerCase() : '';
    const url = module.resourceUrl || '';

    if (typeLower === 'audio' && url) {
      return <AudioPlayerCard url={url} duration={module.duration} title={module.title} />;
    }
    if (typeLower === 'video' && url) {
      return <VideoPlayerCard url={url} title={module.title} />;
    }
    if (typeLower === 'pdf' && url) {
      return <PdfResourceCard url={url} title={module.title} />;
    }

    return null;
  };

  return (
    <>
      <button
        onClick={() => router.push(`/modules/${stage.id}`)}
        className="text-cream/60 hover:text-cream text-sm mb-6 flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5m6 7-7-7 7-7" />
        </svg>
        <span>Stage {stage.id} · {stage.title}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="eyebrow eyebrow-cream">
              Module {module.id} · {module.type} · {module.duration}
            </div>
            {module.warning && <span className="tag tag-rose">{module.warning}</span>}
            {isCompleted && <span className="tag tag-emerald">Completed ✓</span>}
          </div>
          <h1 className="display text-4xl font-light leading-tight mb-3">{module.title}.</h1>

          {module.warning && (
            <div className="scard-warm p-4 mb-6 border-l-4" style={{ borderLeftColor: 'var(--rose)', background: 'rgba(160,72,72,0.08)' }}>
              <div className="text-xs eyebrow mb-2" style={{ color: 'var(--rose)' }}>Content warning</div>
              <p className="text-sm text-cream/85">
                {module.warning === 'High sensitivity'
                  ? 'This module contains emotionally intense materials, historical trauma, or discussions of violence. Engage when you are in a safe, quiet space to process.'
                  : 'This module contains discussions of land disputes, economic hardship, and historical violence. Engage when you can give it your full attention.'}
              </p>
            </div>
          )}

          {renderMediaPlayer()}

          {module.takeaways && (
            <div className="display text-xl leading-relaxed text-cream mb-5 italic">
              {module.takeaways
                .split('\n')
                .filter(t => t.trim())
                .map((t, idx) => (
                  <p key={idx}>"
                    {t.trim().replace(/^[-*]\s*/, '')}"
                  </p>
                ))}
            </div>
          )}

          <div className="prose-invert max-w-none">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="text-cream/80 leading-relaxed mb-4">{para}</p>
            ))}
          </div>

          {reflectionPrompt && (
            <div
              className="scard-warm p-7 mt-8"
              style={{ background: 'rgba(201,161,74,0.08)', borderLeft: '4px solid var(--brass)', color: 'var(--cream)' }}
            >
              <div className="eyebrow eyebrow-cream mb-3">Private reflection · only you see this</div>
              <p className="display text-lg mb-4 text-cream">&ldquo;{reflectionPrompt}&rdquo;</p>
              <textarea
                className="field-dark w-full min-h-[140px] resize-y"
                placeholder="Take your time. There's no right way to answer this."
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-cream/50 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Encrypted · admin cannot read this</span>
                </div>
                <button className="btn-primary" onClick={handleSaveJournal}>
                  {journalSaved ? 'Saved ✓' : 'Save to journal'}
                </button>
              </div>
            </div>
          )}

          <div className="scard-dark mt-8 p-6">
            <div className="eyebrow eyebrow-cream mb-3">How did that land?</div>
            <p className="text-cream/70 text-sm mb-5">
              One tap. No pressure. This shapes what comes next — never compared, never scored.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key: 'sprout', emoji: '🌱', label: 'Sprout', desc: 'This planted something. I want to sit with a Reflection Lab next.' },
                { key: 'feather', emoji: '🪶', label: 'Feather', desc: "Light enough. I'm ready for the next module." },
                { key: 'stone', emoji: '🪨', label: 'Stone', desc: 'This was heavy. I need a break — Amen will check in soon.' },
              ].map(fb => (
                <button
                  key={fb.key}
                  onClick={() => handleFeedback(fb.key)}
                  className="scard-dark p-5 text-left transition hover:border-brass/40 cursor-pointer"
                  style={{
                    border: selectedFeedback === fb.key ? '1px solid var(--brass)' : '1px solid rgba(201,161,74,0.15)',
                    background: selectedFeedback === fb.key ? 'rgba(201,161,74,0.12)' : 'rgba(20,48,37,0.4)',
                  }}
                >
                  <div className="text-3xl mb-2 leading-none">{fb.emoji}</div>
                  <div className="font-medium text-cream mb-1">{fb.label}</div>
                  <p className="text-xs text-cream/60 leading-relaxed">{fb.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-brass/15">
            <button
              className="btn-ghost-dark"
              onClick={() => router.push(`/modules/${stage.id}`)}
            >
              ← Back to Stage {stage.id}
            </button>
            <button className="btn-primary" onClick={handleComplete}>
              {isCompleted
                ? nextId ? 'Continue →' : 'Finish Stage ✓'
                : nextId ? 'Mark Complete & Continue →' : 'Mark Complete & Finish Stage ✓'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="scard-dark p-5 sticky top-24">
            <div className="eyebrow eyebrow-cream mb-3">Stage {stage.id} progress</div>
            <div className="space-y-2 text-sm">
              {stageStatus?.moduleStatuses.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 cursor-pointer hover:text-brass-light transition"
                  onClick={() => m.status !== 'locked' && router.push(`/modules/${stage.id}/${m.slug || m.meta || m.id}`)}
                  style={{
                    color: m.id === resolvedId
                      ? 'var(--brass-light)'
                      : m.status === 'completed'
                      ? 'rgba(243,237,224,0.8)'
                      : m.status === 'locked'
                      ? 'rgba(243,237,224,0.3)'
                      : 'rgba(243,237,224,0.8)',
                  }}
                >
                  <span className="mono text-xs" style={{ color: m.status === 'completed' ? 'var(--brass)' : 'inherit' }}>
                    {m.status === 'completed' ? '✓' : m.id === resolvedId ? '●' : '○'}
                  </span>
                  <span>{m.id} {m.title.split(' ').slice(0, 4).join(' ')}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-brass/10">
              <div className="eyebrow eyebrow-cream mb-2">Need support?</div>
              <button onClick={() => router.push('/amen')} className="btn-ghost-dark w-full justify-center text-xs">Talk to Amen AI</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ModuleContentWrapper() {
  const params = useParams();
  const moduleId = (params?.slug as string) || '1.1';
  return <ModuleContent key={moduleId} moduleId={moduleId} />;
}

export default function ModulePage() {
  return (
    <Suspense fallback={<div className="text-cream/60 p-8">Loading module...</div>}>
      <ModuleContentWrapper />
    </Suspense>
  );
}
