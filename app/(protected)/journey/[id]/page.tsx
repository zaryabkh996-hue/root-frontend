'use client';

import { useRouter, useParams } from 'next/navigation';

export default function ViewJourneyPage() {
  const router = useRouter();
  const params = useParams();
  const stageId = params?.id;

  const stageDetails: Record<number, any> = {
    1: {
      number: 1,
      title: 'Emotional Preparation',
      meta: 'Stage 01 · Free · 50 min total · 5 modules',
      description: 'Understanding your return — mindset, expectations, and emotional readiness. By the end, you\'ll know that "returning home" is a journey, not a destination — and that Ghana is not Wakanda.',
      objectives: [
        { title: 'Learning objective 1', desc: 'Manage expectations about Ghana — the real country, not the romantic one.' },
        { title: 'Learning objective 2', desc: 'Recognise the emotional complexity of diaspora identity.' },
        { title: 'Learning objective 3', desc: 'Prepare your nervous system for the weight of heritage site visits.' }
      ],
      modules: [
        { id: '1.1', title: 'Welcome — Your Journey Begins', duration: '10 min', type: 'Story Module', status: 'completed' },
        { id: '1.2', title: 'Ghana is Not Wakanda — Managing Expectations', duration: '15 min', type: 'Story Module', status: 'completed' },
        { id: '1.3', title: 'The Uncomfortable Truths', duration: '10 min', type: 'Story Module', status: 'completed', warning: 'Content warning' },
        { id: '1.4', title: 'Preparing for the Emotional Weight', duration: '10 min', type: 'Reflection Lab', status: 'in-progress', warning: 'High sensitivity' },
        { id: '1.5', title: 'Reflection & Stage 1 Quiz', duration: '10 min', type: 'Knowledge Quest', status: 'locked', meta: 'Pass 4/5 to unlock Stage 2' }
      ],
      badge: { emoji: '💕', title: 'Akoma — the Heart badge', desc: 'Akoma means patience, endurance, tolerance, love. Earned when you complete every Reflection Lab in this stage. The unlock arrives with a drum phrase, a proverb, and a quiet word from Amen.' }
    }
  };

  const stage = stageDetails[Number(stageId)] || stageDetails[1];

  const getStatusBadge = (status: string, warning?: string, meta?: string) => {
    if (status === 'completed') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      );
    }
    if (status === 'in-progress') {
      return <span className="text-brass-light text-xs mono">Resume</span>;
    }
    return <span className="text-cream/40 text-xs mono">Locked</span>;
  };

  return (
    <div className="p-12">
      <button className="crisis-btn mb-8 px-4 py-2 rounded bg-rose/10 text-rose border border-rose/30 text-sm font-semibold hover:bg-rose/20 transition">
        SOS
      </button>

      <button 
        onClick={() => router.push('/journey')}
        className="text-cream/60 hover:text-cream text-sm mb-6 flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5m6 7-7-7 7-7"></path>
        </svg>
        Six-Stage Journey
      </button>

      <div className="mb-10">
        <div className="eyebrow eyebrow-cream mb-3">{stage.meta}</div>
        <h1 className="display text-5xl font-light leading-tight mb-4">{stage.title}.</h1>
        <p className="text-cream/70 max-w-2xl text-lg leading-relaxed">{stage.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
          {stage.objectives.map((obj: any, idx: number) => (
            <div key={idx} className="scard-dark p-4">
              <div className="eyebrow eyebrow-cream mb-2" style={{ fontSize: '9px' }}>{obj.title}</div>
              <p className="text-sm text-cream/85">{obj.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modules List */}
      <div className="scard-dark p-2">
        {stage.modules.map((module: any, idx: number) => (
          <div
            key={idx}
            onClick={() => {
              if (module.status !== 'locked') {
                router.push(`/module?id=${module.id}`);
              }
            }}
            className={`module-row ${module.status === 'in-progress' ? 'in-progress' : ''} ${
              module.status !== 'locked' ? 'cursor-pointer' : 'opacity-70'
            }`}
            style={{
              background: module.status === 'in-progress' ? 'rgba(201,161,74,0.06)' : 'transparent',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto auto',
              gap: '1rem',
              alignItems: 'center',
              padding: '1rem',
              borderBottom: '1px solid rgba(201,161,74,0.1)'
            }}
          >
            <div className="num" style={{ 
              color: module.status === 'in-progress' ? 'var(--brass-light)' : 'var(--cream)',
              fontWeight: 'bold'
            }}>
              {module.id}
            </div>
            <div>
              <div className="font-medium text-cream mb-1">{module.title}</div>
              <div className="flex items-center gap-3 text-xs text-cream/50">
                <span className="mono">{module.duration}</span>
                <span>·</span>
                <span className="tag">{module.type}</span>
                {module.warning && <span className="tag tag-rose">{module.warning}</span>}
                {module.status === 'completed' && <span className="tag tag-emerald">Completed</span>}
                {module.status === 'in-progress' && <span className="tag tag-brass">In progress</span>}
                {module.meta && <span className="tag tag-brass">{module.meta}</span>}
              </div>
            </div>
            <div>
              {getStatusBadge(module.status, module.warning, module.meta)}
            </div>
            <div className="text-cream/40">
              {module.status !== 'locked' && <span>→</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Badge Preview */}
      <div className="scard-dark mt-8 p-6 flex items-center gap-5" style={{ background: 'rgba(201,161,74,0.06)', borderLeft: '3px solid var(--brass)' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,161,74,0.15)', fontSize: '28px' }}>
          {stage.badge.emoji}
        </div>
        <div className="flex-1">
          <div className="eyebrow eyebrow-cream mb-1">Awaits at completion</div>
          <h3 className="display text-xl text-cream mb-1">{stage.badge.title}</h3>
          <p className="text-sm text-cream/65 leading-relaxed"><em>{stage.badge.desc}</em></p>
        </div>
      </div>

      {/* Amen Bubble */}
      <button className="amen-bubble fixed bottom-8 right-8 w-14 h-14 rounded-full bg-brass text-forest-deepest font-bold text-2xl hover:bg-brass-light transition shadow-lg">
        ?
      </button>

      <style jsx>{`
        .eyebrow-cream {
          color: rgba(201, 161, 74, 0.7);
        }

        .mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .scard-dark {
          border: 1px solid rgba(201, 161, 74, 0.15);
          border-radius: 4px;
          background: rgba(10, 24, 16, 0.4);
        }

        .tag {
          display: inline-flex;
          align-items: center;
          background: rgba(201, 161, 74, 0.12);
          border: 1px solid rgba(201, 161, 74, 0.2);
          border-radius: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 4px 12px;
          color: var(--cream);
        }

        .tag-emerald {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .tag-rose {
          background: rgba(160, 72, 72, 0.15);
          border-color: rgba(160, 72, 72, 0.3);
          color: #f97316;
        }

        .tag-brass {
          background: rgba(201, 161, 74, 0.15);
          border-color: rgba(201, 161, 74, 0.3);
          color: var(--brass-light);
        }

        .crisis-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .crisis-btn:hover {
          background: rgba(249, 115, 115, 0.15);
        }

        .amen-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
