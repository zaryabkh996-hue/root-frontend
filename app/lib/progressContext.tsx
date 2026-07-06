'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  UserProgress,
  ComputedProgress,
  loadProgress,
  saveProgress,
  getModuleById,
  getNextModuleId,
  computeProgress,
  STAGES,
  ACTIVE_STAGES,
  setGlobalStages,
  Stage,
} from './progressStore';
import {
  fetchRemoteProgress,
  syncProgressToServer,
  remoteCompleteModule,
  remoteSetJournal,
  remoteSetFeedback,
  RemoteProgress,
} from './progressApi';

const TRACK_TO_STAGE_ID: Record<string, number> = {
  'Emotional Preparation': 1,
  'Cultural Intelligence': 2,
  'Practical Preparation': 3,
  'Arrival Orientation': 4,
  'Heritage Journey Experience': 5,
  'Post Journey Experience': 6,
};

function buildStagesFromModules(sanityModules: any[]): Stage[] {
  return STAGES.map(staticStage => {
    const stageModules = sanityModules
      .filter(m => {
        const stageId = TRACK_TO_STAGE_ID[m.track];
        return stageId === staticStage.id;
      })
      .sort((a, b) => (a.moduleNumber || 0) - (b.moduleNumber || 0))
      .map(m => {
        let duration = '10 min';
        if (m.subtitle) {
          const parts = m.subtitle.split(' · ');
          if (parts[0]) {
            duration = parts[0];
          }
        }

        let warning: string | undefined = undefined;
        if (m.sensitivity === 'high') {
          warning = 'High sensitivity';
        } else if (m.sensitivity === 'low' && (m.title.includes('Truths') || m.title.includes('Castle'))) {
          warning = 'Content warning';
        }

        let mappedType = m.contentType || 'Story Module';
        if (mappedType === 'Reading') {
          mappedType = 'Story Module';
        } else if (mappedType === 'Interactive') {
          mappedType = 'Reflection Lab';
        } else if (mappedType === 'Protocol Practice') {
          mappedType = 'Protocol Lab';
        }

        return {
          _id: m._id,
          id: `${staticStage.id}.${m.moduleNumber}`,
          title: m.title,
          duration: duration,
          type: mappedType as any,
          warning,
          meta: m.slug, // Store slug in meta
          slug: m.slug,
          body: m.body,
          takeaways: m.takeaways,
          resourceUrl: m.resourceUrl,
        };
      });

    const totalDuration = stageModules.reduce((sum, m) => {
      const minutes = parseInt(m.duration) || 0;
      return sum + minutes;
    }, 0);

    const tierDisplay = staticStage.tier;
    const durationDisplay = totalDuration > 0 ? `~${totalDuration} min` : '0 min';
    const modulesCountDisplay = `${stageModules.length} ${stageModules.length === 1 ? 'module' : 'modules'}`;
    const meta = `Stage 0${staticStage.id} · ${tierDisplay} · ${durationDisplay} · ${modulesCountDisplay}`;

    return {
      ...staticStage,
      meta,
      modules: stageModules,
    };
  });
}

interface ProgressContextValue {
  progress: UserProgress;
  computed: ComputedProgress;
  isSyncing: boolean;
  completeModule: (moduleId: string) => void;
  saveJournal: (moduleId: string, text: string) => void;
  saveFeedback: (moduleId: string, key: string) => void;
  isModuleAccessible: (moduleId: string) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

// ── Map remote (snake_case) → local (camelCase) ────────────────────────────
function mergeRemote(local: UserProgress, remote: RemoteProgress): UserProgress {
  // Remote DB is the source of truth for cross-device data.
  // For userName we keep local since backend doesn't store it separately.
  return {
    ...local,
    completedModules: remote.completed_modules ?? local.completedModules,
    currentModuleId:  remote.current_module_id  ?? local.currentModuleId,
    journalEntries:   remote.journal_entries     ?? local.journalEntries,
    feedbackEntries:  remote.feedback_entries    ?? local.feedbackEntries,
    unlockedStages:   remote.unlocked_stages     ?? local.unlockedStages,
    completedStages:  remote.completed_stages    ?? local.completedStages,
    afroScore:        remote.afro_score          ?? local.afroScore,
    userPersona:      remote.user_persona        ?? local.userPersona,
    lifecyclePhase:   remote.lifecycle_phase     ?? local.lifecyclePhase,
    startedAt:        remote.started_at          ?? local.startedAt,
    lastActiveAt:     remote.last_active_at      ?? local.lastActiveAt,
  };
}

// ── Map local → remote payload for full sync ────────────────────────────────
function toRemotePayload(p: UserProgress): Partial<RemoteProgress> {
  return {
    completed_modules: p.completedModules,
    current_module_id: p.currentModuleId,
    journal_entries:   p.journalEntries,
    feedback_entries:  p.feedbackEntries,
    unlocked_stages:   p.unlockedStages,
    completed_stages:  p.completedStages,
    afro_score:        p.afroScore,
    user_persona:      p.userPersona,
    lifecycle_phase:   p.lifecyclePhase,
    started_at:        p.startedAt,
    last_active_at:    p.lastActiveAt,
  };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [isSyncing, setIsSyncing] = useState(false);

  // Debounce timer ref for journal saves
  const journalDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── On mount: hydrate from DB if authenticated ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsSyncing(true);

    // Fetch published modules from API first, build dynamic stages, and update store
    fetch('/fe-api/content')
      .then(res => res.json())
      .then(result => {
        if (cancelled) return;
        if (result.success && Array.isArray(result.data)) {
          const dynamicStages = buildStagesFromModules(result.data);
          setGlobalStages(dynamicStages);
          // Trigger progress update/recompute
          setProgress(prev => ({ ...prev }));
        }
      })
      .catch(err => console.error('Failed to load Sanity modules:', err))
      .finally(() => {
        if (cancelled) return;
        fetchRemoteProgress().then(remote => {
          if (cancelled) return;
          setIsSyncing(false);

          if (remote) {
            setProgress(local => {
              const merged = mergeRemote(local, remote);
              saveProgress(merged); // keep localStorage in sync
              return merged;
            });
          }
        });
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist to localStorage on every change ─────────────────────────────
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // ── Complete a module ────────────────────────────────────────────────────
  const completeModule = useCallback((moduleId: string) => {
    // Resolve module ID to numeric format (e.g., '1.1')
    const found = getModuleById(moduleId);
    const resolvedId = found ? found.module.id : moduleId;

    setProgress(prev => {
      if (prev.completedModules.includes(resolvedId)) return prev;

      const newCompleted = [...prev.completedModules, resolvedId];
      const nextId = getNextModuleId(resolvedId);

      const newUnlocked = [...prev.unlockedStages];
      const newCompletedStages = [...prev.completedStages];

      for (const stage of ACTIVE_STAGES) {
        const allDone = stage.modules.every(m => newCompleted.includes(m.id));
        if (allDone && !newCompletedStages.includes(stage.id)) {
          newCompletedStages.push(stage.id);
          const nextStageId = stage.id + 1;
          if (nextStageId <= 6 && !newUnlocked.includes(nextStageId)) {
            newUnlocked.push(nextStageId);
          }
        }
      }

      const totalModulesCount = ACTIVE_STAGES.reduce((sum, s) => sum + s.modules.length, 0) || 37;
      const pointsPerModule = Math.floor(100 / totalModulesCount);
      const newScore = Math.min(100, prev.afroScore + pointsPerModule);

      const updated: UserProgress = {
        ...prev,
        completedModules: newCompleted,
        currentModuleId:  nextId ?? resolvedId,
        unlockedStages:   newUnlocked,
        completedStages:  newCompletedStages,
        lastActiveAt:     new Date().toISOString(),
        afroScore:        newScore,
      };

      // Fire-and-forget: granular DB update (fastest path)
      remoteCompleteModule({
        module_id:        resolvedId,
        next_module_id:   nextId,
        unlocked_stages:  newUnlocked,
        completed_stages: newCompletedStages,
        afro_score:       newScore,
      });

      return updated;
    });
  }, []);

  // ── Save journal entry ───────────────────────────────────────────────────
  const saveJournal = useCallback((moduleId: string, text: string) => {
    const found = getModuleById(moduleId);
    const resolvedId = found ? found.module.id : moduleId;

    setProgress(prev => ({
      ...prev,
      journalEntries: { ...prev.journalEntries, [resolvedId]: text },
    }));

    // Debounce API call — user may still be typing
    if (journalDebounceRef.current) clearTimeout(journalDebounceRef.current);
    journalDebounceRef.current = setTimeout(() => {
      remoteSetJournal(resolvedId, text);
    }, 1500);
  }, []);

  // ── Save feedback reaction ───────────────────────────────────────────────
  const saveFeedback = useCallback((moduleId: string, key: string) => {
    const found = getModuleById(moduleId);
    const resolvedId = found ? found.module.id : moduleId;

    setProgress(prev => ({
      ...prev,
      feedbackEntries: { ...prev.feedbackEntries, [resolvedId]: key },
    }));

    // Single tap action — send immediately
    remoteSetFeedback(resolvedId, key);
  }, []);

  // ── Full background sync after progress changes ──────────────────────────
  // Debounced so rapid changes are batched into one PUT
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(() => {
      syncProgressToServer(toRemotePayload(progress));
    }, 3000);

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
  }, [progress]);

  const isModuleAccessible = useCallback(
    (moduleId: string): boolean => {
      const found = getModuleById(moduleId);
      const resolvedId = found ? found.module.id : moduleId;

      const computed = computeProgress(progress);
      for (const stage of computed.stageStatuses) {
        const mod = stage.moduleStatuses.find(m => m.id === resolvedId);
        if (mod) return mod.status !== 'locked';
      }
      return false;
    },
    [progress],
  );

  const computed = computeProgress(progress);

  return (
    <ProgressContext.Provider
      value={{ progress, computed, isSyncing, completeModule, saveJournal, saveFeedback, isModuleAccessible }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
