'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProgress } from '../../lib/progressContext';
import { getModuleById, getNextModuleId, getPrevModuleId } from '../../lib/progressStore';
import { getModuleContent } from '../../lib/moduleContent';

function ModuleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('id') || '1.1';

  const { progress, computed, completeModule, saveJournal, saveFeedback } = useProgress();

  const moduleInfo = getModuleById(moduleId);
  const content = getModuleContent(moduleId);

  const [journalText, setJournalText] = useState(progress.journalEntries[moduleId] ?? '');
  const [journalSaved, setJournalSaved] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(progress.feedbackEntries[moduleId] ?? '');

  const nextId = getNextModuleId(moduleId);
  const prevId = getPrevModuleId(moduleId);
  const isCompleted = progress.completedModules.includes(moduleId);

  if (!moduleInfo) {
    return <div className="text-cream/60 p-8">Module not found.</div>;
  }

  const { module, stage } = moduleInfo;

  const stageStatus = computed.stageStatuses.find(s => s.id === stage.id);

  const handleComplete = () => {
    completeModule(moduleId);
    if (nextId) {
      router.push(`/module?id=${nextId}`);
    } else {
      router.push(`/journey/${stage.id}`);
    }
  };

  const handleSaveJournal = () => {
    saveJournal(moduleId, journalText);
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2000);
  };

  const handleFeedback = (key: string) => {
    setSelectedFeedback(key);
    saveFeedback(moduleId, key);
  };

  const prevModule = prevId ? getModuleById(prevId) : null;

  return (
    <>
      <button
        onClick={() => router.push(`/journey/${stage.id}`)}
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

          <div className="scard-dark p-7 mb-8">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-16 h-16 rounded-full bg-brass flex items-center justify-center cursor-pointer hover:bg-brass-light transition flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--forest-deepest)">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm text-cream mb-2">
                  Narrated by {content.narrator} · {content.narratorMeta}
                </div>
                <div style={{ height: '6px', background: 'rgba(201,161,74,0.15)', borderRadius: '3px', overflow: 'hidden' }} className="mb-2">
                  <div style={{ height: '100%', background: 'var(--brass)', width: `${content.audioProgress}%`, borderRadius: '3px' }} />
                </div>
                <div className="flex justify-between text-xs text-cream/50 mono">
                  <span>{Math.round(content.audioProgress * 0.1 * 60 / 100)}:00</span>
                  <span>{module.duration}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="prose-invert max-w-none">
            {content.intro && (
              <p className="display text-xl leading-relaxed text-cream mb-5 italic">{content.intro}</p>
            )}
            {content.paragraphs.map((para, idx) => (
              <p key={idx} className="text-cream/80 leading-relaxed mb-4">{para}</p>
            ))}
          </div>

          {content.reflectionPrompt && (
            <div
              className="scard-warm p-7 mt-8"
              style={{ background: 'rgba(201,161,74,0.08)', borderLeft: '4px solid var(--brass)', color: 'var(--cream)' }}
            >
              <div className="eyebrow eyebrow-cream mb-3">Private reflection · only you see this</div>
              <p className="display text-lg mb-4 text-cream">&ldquo;{content.reflectionPrompt}&rdquo;</p>
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
              onClick={() => prevId && router.push(`/module?id=${prevId}`)}
              disabled={!prevId}
              style={{ opacity: prevId ? 1 : 0.4 }}
            >
              {prevModule ? `← ${prevModule.module.id} · ${prevModule.module.title.split(' ').slice(0, 3).join(' ')}` : '← Start'}
            </button>
            <button className="btn-primary" onClick={handleComplete}>
              {isCompleted
                ? nextId ? `Continue ${nextId} →` : 'Stage complete ✓'
                : nextId ? `Mark complete & Continue ${nextId} →` : 'Mark complete & Finish stage ✓'}
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
                  onClick={() => m.status !== 'locked' && router.push(`/module?id=${m.id}`)}
                  style={{
                    color: m.id === moduleId
                      ? 'var(--brass-light)'
                      : m.status === 'completed'
                      ? 'rgba(243,237,224,0.8)'
                      : m.status === 'locked'
                      ? 'rgba(243,237,224,0.3)'
                      : 'rgba(243,237,224,0.8)',
                  }}
                >
                  <span className="mono text-xs" style={{ color: m.status === 'completed' ? 'var(--brass)' : 'inherit' }}>
                    {m.status === 'completed' ? '✓' : m.id === moduleId ? '●' : '○'}
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

export default function ModulePage() {
  return (
    <Suspense fallback={<div className="text-cream/60 p-8">Loading module...</div>}>
      <ModuleContent />
    </Suspense>
  );
}