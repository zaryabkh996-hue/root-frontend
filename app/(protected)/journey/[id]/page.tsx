'use client';

import { useRouter, useParams } from 'next/navigation';
import { useProgress } from '../../../lib/progressContext';
import { getStageById } from '../../../lib/progressStore';

export default function ViewJourneyPage() {
  const router = useRouter();
  const params = useParams();
  const stageId = Number(params?.id ?? 1);

  const { progress, computed } = useProgress();
  const stage = getStageById(stageId);
  const stageStatus = computed.stageStatuses.find(s => s.id === stageId);

  if (!stage || !stageStatus) {
    return (
      <div className="text-cream/60 p-8">Stage not found.</div>
    );
  }

  const renderStatusBadge = (status: 'completed' | 'in-progress' | 'locked') => {
    if (status === 'completed') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#4ade80' }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }
    if (status === 'in-progress') {
      return <span className="text-brass-light text-xs mono">Resume</span>;
    }
    return <span className="text-cream/40 text-xs mono">Locked</span>;
  };

  return (
    <>
      <button
        onClick={() => router.push('/journey')}
        className="text-cream/60 hover:text-cream text-sm mb-6 flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5m6 7-7-7 7-7" />
        </svg>
        Six-Stage Journey
      </button>

      <div className="mb-10">
        <div className="eyebrow eyebrow-cream mb-3">{stage.meta}</div>
        <h1 className="display text-5xl font-light leading-tight mb-4">{stage.title}.</h1>
        <p className="text-cream/70 max-w-2xl text-lg leading-relaxed">{stage.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
          {stage.objectives.map((obj, idx) => (
            <div key={idx} className="scard-dark p-4">
              <div className="eyebrow eyebrow-cream mb-2" style={{ fontSize: '9px' }}>{obj.title}</div>
              <p className="text-sm text-cream/85">{obj.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Module list */}
      <div className="scard-dark p-2">
        {stageStatus.moduleStatuses.map(module => (
          <div
            key={module.id}
            onClick={() => {
              if (module.status !== 'locked') {
                router.push(`/module?id=${module.id}`);
              }
            }}
            className={`module-row ${module.status !== 'locked' ? 'cursor-pointer' : 'opacity-70'}`}
            style={{ background: module.status === 'in-progress' ? 'rgba(201,161,74,0.06)' : 'transparent' }}
          >
            <div className="num" style={{ color: module.status === 'in-progress' ? 'var(--brass-light)' : 'var(--brass-dim)' }}>
              {module.id}
            </div>
            <div>
              <div className="font-medium text-cream mb-1">{module.title}</div>
              <div className="flex items-center gap-3 text-xs text-cream/50 flex-wrap">
                <span className="mono">{module.duration}</span>
                <span>Â·</span>
                <span className="tag tag-dark">{module.type}</span>
                {module.warning && <span className="tag tag-rose">{module.warning}</span>}
                {module.status === 'completed' && <span className="tag tag-emerald">Completed</span>}
                {module.status === 'in-progress' && <span className="tag tag-brass">In progress</span>}
                {module.meta && <span className="tag tag-brass">{module.meta}</span>}
              </div>
            </div>
            <div>{renderStatusBadge(module.status)}</div>
            <div className="text-cream/40">{module.status !== 'locked' && <span>â†’</span>}</div>
          </div>
        ))}
      </div>

      {/* Badge preview */}
      <div
        className="scard-dark mt-8 p-6 flex items-center gap-5"
        style={{ background: 'rgba(201,161,74,0.06)', borderLeft: '3px solid var(--brass)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(201,161,74,0.15)', fontSize: '28px' }}
        >
          {stage.badge.emoji}
        </div>
        <div className="flex-1">
          <div className="eyebrow eyebrow-cream mb-1">
            {stageStatus.isCompleted ? 'Badge earned' : 'Awaits at completion'}
          </div>
          <h3 className="display text-xl text-cream mb-1">{stage.badge.title}</h3>
          <p className="text-sm text-cream/65 leading-relaxed">
            <em>{stage.badge.desc}</em>
          </p>
        </div>
      </div>
    </>
  );
}
