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
  getNextModuleId,
  computeProgress,
  STAGES,
} from './progressStore';
import {
  fetchRemoteProgress,
  syncProgressToServer,
  remoteCompleteModule,
  remoteSetJournal,
  remoteSetFeedback,
  RemoteProgress,
} from './progressApi';

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

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist to localStorage on every change ─────────────────────────────
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // ── Complete a module ────────────────────────────────────────────────────
  const completeModule = useCallback((moduleId: string) => {
    setProgress(prev => {
      if (prev.completedModules.includes(moduleId)) return prev;

      const newCompleted = [...prev.completedModules, moduleId];
      const nextId = getNextModuleId(moduleId);

      const newUnlocked = [...prev.unlockedStages];
      const newCompletedStages = [...prev.completedStages];

      for (const stage of STAGES) {
        const allDone = stage.modules.every(m => newCompleted.includes(m.id));
        if (allDone && !newCompletedStages.includes(stage.id)) {
          newCompletedStages.push(stage.id);
          const nextStageId = stage.id + 1;
          if (nextStageId <= 6 && !newUnlocked.includes(nextStageId)) {
            newUnlocked.push(nextStageId);
          }
        }
      }

      const pointsPerModule = Math.floor(100 / 37);
      const newScore = Math.min(100, prev.afroScore + pointsPerModule);

      const updated: UserProgress = {
        ...prev,
        completedModules: newCompleted,
        currentModuleId:  nextId ?? moduleId,
        unlockedStages:   newUnlocked,
        completedStages:  newCompletedStages,
        lastActiveAt:     new Date().toISOString(),
        afroScore:        newScore,
      };

      // Fire-and-forget: granular DB update (fastest path)
      remoteCompleteModule({
        module_id:        moduleId,
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
    setProgress(prev => ({
      ...prev,
      journalEntries: { ...prev.journalEntries, [moduleId]: text },
    }));

    // Debounce API call — user may still be typing
    if (journalDebounceRef.current) clearTimeout(journalDebounceRef.current);
    journalDebounceRef.current = setTimeout(() => {
      remoteSetJournal(moduleId, text);
    }, 1500);
  }, []);

  // ── Save feedback reaction ───────────────────────────────────────────────
  const saveFeedback = useCallback((moduleId: string, key: string) => {
    setProgress(prev => ({
      ...prev,
      feedbackEntries: { ...prev.feedbackEntries, [moduleId]: key },
    }));

    // Single tap action — send immediately
    remoteSetFeedback(moduleId, key);
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
      const computed = computeProgress(progress);
      for (const stage of computed.stageStatuses) {
        const mod = stage.moduleStatuses.find(m => m.id === moduleId);
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
