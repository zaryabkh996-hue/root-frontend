// ── All static course data + progress types + localStorage helpers ──────────

export type ModuleType =
  | 'Story Module'
  | 'Reflection Lab'
  | 'Knowledge Quest'
  | 'Protocol Lab'
  | 'Practical Guide'
  | 'Orientation Lab'
  | 'Integration Lab';

export interface Module {
  id: string;
  title: string;
  duration: string;
  type: ModuleType;
  warning?: string;
  meta?: string;
}

export interface Stage {
  id: number;
  title: string;
  meta: string;
  tier: 'Free' | 'Community+' | 'Preparation+';
  description: string;
  objectives: { title: string; desc: string }[];
  modules: Module[];
  badge: { emoji: string; title: string; desc: string };
}

export const STAGES: Stage[] = [
  {
    id: 1,
    title: 'Emotional Preparation',
    meta: 'Stage 01 · Free · 50 min total · 5 modules',
    tier: 'Free',
    description:
      'Understanding your return — mindset, expectations, and emotional readiness. By the end, you\'ll know that "returning home" is a journey, not a destination — and that Ghana is not Wakanda.',
    objectives: [
      { title: 'Learning objective 1', desc: 'Manage expectations about Ghana — the real country, not the romantic one.' },
      { title: 'Learning objective 2', desc: 'Recognise the emotional complexity of diaspora identity.' },
      { title: 'Learning objective 3', desc: 'Prepare your nervous system for the weight of heritage site visits.' },
    ],
    modules: [
      { id: '1.1', title: 'Welcome — Your Journey Begins', duration: '10 min', type: 'Story Module' },
      { id: '1.2', title: 'Ghana is Not Wakanda — Managing Expectations', duration: '15 min', type: 'Story Module' },
      { id: '1.3', title: 'The Uncomfortable Truths', duration: '10 min', type: 'Story Module', warning: 'Content warning' },
      { id: '1.4', title: 'Preparing for the Emotional Weight', duration: '10 min', type: 'Reflection Lab', warning: 'High sensitivity' },
      { id: '1.5', title: 'Reflection & Stage 1 Quiz', duration: '10 min', type: 'Knowledge Quest', meta: 'Pass 4/5 to unlock Stage 2' },
    ],
    badge: {
      emoji: '💕',
      title: 'Akoma — the Heart badge',
      desc: 'Akoma means patience, endurance, tolerance, love. Earned when you complete every Reflection Lab in this stage. The unlock arrives with a drum phrase, a proverb, and a quiet word from Amen.',
    },
  },
  {
    id: 2,
    title: 'Cultural Intelligence',
    meta: 'Stage 02 · Community+ · ~80 min · 8 modules',
    tier: 'Community+',
    description:
      'Greetings, protocols, elder etiquette, market language, the depth Western travel guides skip. Eight modules with spaced-repetition Pop Quiz Cards to lock the protocols in.',
    objectives: [
      { title: 'Learning objective 1', desc: 'Master the essential greetings and social protocols for daily life in Ghana.' },
      { title: 'Learning objective 2', desc: 'Understand elder etiquette and the importance of respect in Ghanaian culture.' },
      { title: 'Learning objective 3', desc: 'Navigate markets, transport, and public spaces with cultural confidence.' },
    ],
    modules: [
      { id: '2.1', title: 'Greetings & the Art of Acknowledgment', duration: '10 min', type: 'Story Module' },
      { id: '2.2', title: 'The Right-Hand Rule & Protocols', duration: '10 min', type: 'Protocol Lab' },
      { id: '2.3', title: 'Elder Etiquette', duration: '10 min', type: 'Story Module' },
      { id: '2.4', title: 'Market Language & Bargaining', duration: '10 min', type: 'Practical Guide' },
      { id: '2.5', title: 'Food, Taboos & Table Culture', duration: '10 min', type: 'Story Module' },
      { id: '2.6', title: 'Dress, Modesty & Sacred Spaces', duration: '10 min', type: 'Story Module' },
      { id: '2.7', title: 'Pop Quiz Cards — Cultural Protocols', duration: '10 min', type: 'Knowledge Quest', meta: 'Spaced repetition' },
      { id: '2.8', title: 'Stage 2 Quiz', duration: '10 min', type: 'Knowledge Quest', meta: 'Pass 4/5 to unlock Stage 3' },
    ],
    badge: {
      emoji: '🤝',
      title: 'Sankofa — the Protocol badge',
      desc: 'Earned when you pass all protocol quizzes and complete every module in Stage 2.',
    },
  },
  {
    id: 3,
    title: 'Practical Preparation',
    meta: 'Stage 03 · Preparation+ · ~80 min · 6 modules',
    tier: 'Preparation+',
    description:
      'Visa paperwork, health, packing, money, transport. The DIY budget travel guide and the "Ghana reality check" briefing — six modules with origin-country lookups.',
    objectives: [
      { title: 'Learning objective 1', desc: 'Complete your visa and documentation checklist for your origin country.' },
      { title: 'Learning objective 2', desc: "Pack correctly for Ghana's climate and cultural expectations." },
      { title: 'Learning objective 3', desc: 'Understand money, transport, and health preparations.' },
    ],
    modules: [
      { id: '3.1', title: 'Visa & Documentation', duration: '15 min', type: 'Practical Guide' },
      { id: '3.2', title: 'Health Preparation & Vaccinations', duration: '15 min', type: 'Practical Guide' },
      { id: '3.3', title: 'Packing for Ghana', duration: '10 min', type: 'Practical Guide' },
      { id: '3.4', title: 'Money & Budgeting', duration: '15 min', type: 'Practical Guide' },
      { id: '3.5', title: 'Transport & Getting Around', duration: '15 min', type: 'Practical Guide' },
      { id: '3.6', title: 'Stage 3 Quiz', duration: '10 min', type: 'Knowledge Quest', meta: 'Pass 4/5 to unlock Stage 4' },
    ],
    badge: { emoji: '🎒', title: 'The Prepared badge', desc: 'Earned when you complete all practical preparation modules.' },
  },
  {
    id: 4,
    title: 'Arrival Orientation',
    meta: 'Stage 04 · Preparation+ · ~80 min · 6 modules',
    tier: 'Preparation+',
    description:
      "First 72 hours. Airport handover, host family, jet-lag protocol, the chief's blessing if a Day Name awaits. Six modules to land softly in Ghana.",
    objectives: [
      { title: 'Learning objective 1', desc: 'Navigate Kotoka International Airport with confidence.' },
      { title: 'Learning objective 2', desc: 'Understand your first 72 hours — accommodation, food, safety.' },
      { title: 'Learning objective 3', desc: 'Connect with your host family or guide using the right protocols.' },
    ],
    modules: [
      { id: '4.1', title: 'The Airport & First Hours', duration: '15 min', type: 'Orientation Lab' },
      { id: '4.2', title: 'Your Host & First Night', duration: '15 min', type: 'Orientation Lab' },
      { id: '4.3', title: "Day Name & Chief's Blessing", duration: '10 min', type: 'Story Module' },
      { id: '4.4', title: 'Jet-Lag & Emotional Reset', duration: '10 min', type: 'Reflection Lab' },
      { id: '4.5', title: 'Safety, Health & Getting Your Bearings', duration: '15 min', type: 'Practical Guide' },
      { id: '4.6', title: 'Stage 4 Quiz', duration: '10 min', type: 'Knowledge Quest', meta: 'Pass 4/5 to unlock Stage 5' },
    ],
    badge: { emoji: '🏠', title: 'The Homecoming badge', desc: 'Earned when you complete all arrival orientation modules.' },
  },
  {
    id: 5,
    title: 'Heritage Journey Experience',
    meta: 'Stage 05 · Preparation+ · 7 modules · live support',
    tier: 'Preparation+',
    description:
      'The deepest part. Cape Coast Castle. The Door of No Return. Identity tension, sensory overload, holding space for grief. Real-time Amen AI on WhatsApp throughout.',
    objectives: [
      { title: 'Learning objective 1', desc: 'Understand the historical significance of Cape Coast Castle and the Door of No Return.' },
      { title: 'Learning objective 2', desc: 'Hold space for complex emotions — grief, anger, pride, and healing.' },
      { title: 'Learning objective 3', desc: 'Connect with your ancestral identity in a grounded, supported way.' },
    ],
    modules: [
      { id: '5.1', title: 'The Weight of Sacred Ground', duration: '10 min', type: 'Reflection Lab', warning: 'High sensitivity' },
      { id: '5.2', title: 'Cape Coast Castle — History & Meaning', duration: '15 min', type: 'Story Module', warning: 'Content warning' },
      { id: '5.3', title: 'The Door of No Return', duration: '10 min', type: 'Reflection Lab', warning: 'High sensitivity' },
      { id: '5.4', title: 'Identity Tension & the Hyphenated Self', duration: '10 min', type: 'Story Module' },
      { id: '5.5', title: 'Sensory Overload & Self-Care', duration: '10 min', type: 'Reflection Lab' },
      { id: '5.6', title: 'Connecting with Living Ancestors', duration: '15 min', type: 'Story Module' },
      { id: '5.7', title: 'Stage 5 Reflection', duration: '10 min', type: 'Knowledge Quest', meta: 'Pass 4/5 to unlock Stage 6' },
    ],
    badge: {
      emoji: '🕊️',
      title: 'The Crossing badge',
      desc: 'Earned when you walk through the emotional weight of Stage 5 and come out the other side.',
    },
  },
  {
    id: 6,
    title: 'Post-Journey Integration',
    meta: 'Stage 06 · Preparation+ · ~50 min · 5 modules',
    tier: 'Preparation+',
    description:
      'Reverse culture shock, from reflection to habit, reframing the narrative, eudaimonic well-being, commitment to action. Five modules unlocked across days 3 / 7 / 14 / 30 / 60 post-return.',
    objectives: [
      { title: 'Learning objective 1', desc: 'Understand and navigate reverse culture shock after returning home.' },
      { title: 'Learning objective 2', desc: 'Build lasting habits that honour your heritage and ancestral connections.' },
      { title: 'Learning objective 3', desc: 'Define your commitment to action — what changes because of this journey.' },
    ],
    modules: [
      { id: '6.1', title: 'Reverse Culture Shock', duration: '10 min', type: 'Integration Lab' },
      { id: '6.2', title: 'From Reflection to Habit', duration: '10 min', type: 'Reflection Lab' },
      { id: '6.3', title: 'Reframing the Narrative', duration: '10 min', type: 'Story Module' },
      { id: '6.4', title: 'Well-Being & Eudaimonic Growth', duration: '10 min', type: 'Reflection Lab' },
      { id: '6.5', title: 'Commitment to Action — Sankofa Pledge', duration: '10 min', type: 'Knowledge Quest', meta: 'Final integration' },
    ],
    badge: {
      emoji: '🦅',
      title: 'Sankofa — the Return badge',
      desc: '"Se wo were fi na wosankofa a yenkyi" — It is not wrong to go back for what you forgot. Earned when you complete the full six-stage journey.',
    },
  },
];

// ── Total modules across all stages ────────────────────────────────────────
export const TOTAL_MODULES = STAGES.reduce((sum, s) => sum + s.modules.length, 0);

// ── User progress shape ─────────────────────────────────────────────────────
export interface UserProgress {
  completedModules: string[];
  currentModuleId: string;
  journalEntries: Record<string, string>;   // moduleId → text
  feedbackEntries: Record<string, string>;  // moduleId → 'sprout'|'feather'|'stone'
  unlockedStages: number[];
  completedStages: number[];
  startedAt: string;
  lastActiveAt: string;
  userName: string;
  userPersona: string;
  afroScore: number;
  lifecyclePhase: string;
}

const PROGRESS_KEY = 'ourroots_progress';

function resolveUserName(): string {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.name) return user.name.split(' ')[0];
    const report = JSON.parse(sessionStorage.getItem('quizReport') || localStorage.getItem('quizReport') || '{}');
    if (report?.name) return report.name.split(' ')[0];
  } catch { /* ignore */ }
  return 'Friend';
}

function resolveAfroScore(): number {
  try {
    const report = JSON.parse(sessionStorage.getItem('quizReport') || localStorage.getItem('quizReport') || '{}');
    if (typeof report?.totalScore === 'number') return report.totalScore;
  } catch { /* ignore */ }
  return 0;
}

function resolvePersona(): string {
  try {
    const report = JSON.parse(sessionStorage.getItem('quizReport') || localStorage.getItem('quizReport') || '{}');
    if (report?.persona) return report.persona;
  } catch { /* ignore */ }
  return 'Heritage Seeker';
}

function resolveLifecycle(afroScore: number): string {
  if (afroScore >= 70) return 'Immersive Preparation';
  if (afroScore >= 40) return 'Active Exploration';
  return 'Foundation Building';
}

function buildDefaultProgress(): UserProgress {
  const afroScore = resolveAfroScore();
  return {
    completedModules: [],
    currentModuleId: '1.1',
    journalEntries: {},
    feedbackEntries: {},
    unlockedStages: [1],
    completedStages: [],
    startedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    userName: resolveUserName(),
    userPersona: resolvePersona(),
    afroScore,
    lifecyclePhase: resolveLifecycle(afroScore),
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return buildDefaultProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as UserProgress;
      // Refresh user name in case they logged in after first visit
      stored.userName = resolveUserName() || stored.userName;
      return stored;
    }
  } catch { /* ignore */ }
  return buildDefaultProgress();
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch { /* ignore */ }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getStageById(id: number): Stage | undefined {
  return STAGES.find(s => s.id === id);
}

export function getModuleById(moduleId: string): { module: Module; stage: Stage } | undefined {
  for (const stage of STAGES) {
    const module = stage.modules.find(m => m.id === moduleId);
    if (module) return { module, stage };
  }
  return undefined;
}

export function getNextModuleId(currentModuleId: string): string | null {
  for (let s = 0; s < STAGES.length; s++) {
    const stage = STAGES[s];
    for (let m = 0; m < stage.modules.length; m++) {
      if (stage.modules[m].id === currentModuleId) {
        if (m + 1 < stage.modules.length) return stage.modules[m + 1].id;
        if (s + 1 < STAGES.length) return STAGES[s + 1].modules[0].id;
        return null;
      }
    }
  }
  return null;
}

export function getPrevModuleId(currentModuleId: string): string | null {
  for (let s = 0; s < STAGES.length; s++) {
    const stage = STAGES[s];
    for (let m = 0; m < stage.modules.length; m++) {
      if (stage.modules[m].id === currentModuleId) {
        if (m - 1 >= 0) return stage.modules[m - 1].id;
        if (s - 1 >= 0) {
          const prevStage = STAGES[s - 1];
          return prevStage.modules[prevStage.modules.length - 1].id;
        }
        return null;
      }
    }
  }
  return null;
}

// ── Computed view of progress ────────────────────────────────────────────────

export interface StageStatus extends Stage {
  completedCount: number;
  totalModules: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  progressPercent: number;
  moduleStatuses: ModuleStatus[];
}

export interface ModuleStatus extends Module {
  status: 'completed' | 'in-progress' | 'locked';
}

export interface ComputedProgress {
  stageStatuses: StageStatus[];
  currentStage: StageStatus;
  currentModule: ModuleStatus | null;
  completedModulesCount: number;
  overallPercent: number;
}

export function computeProgress(progress: UserProgress): ComputedProgress {
  const completedSet = new Set(progress.completedModules);
  const currentModuleId = progress.currentModuleId;

  const stageStatuses: StageStatus[] = STAGES.map(stage => {
    const isUnlocked = progress.unlockedStages.includes(stage.id);
    const completedCount = stage.modules.filter(m => completedSet.has(m.id)).length;
    const isCompleted = completedCount === stage.modules.length;
    const isCurrent = isUnlocked && !isCompleted;

    const moduleStatuses: ModuleStatus[] = stage.modules.map(mod => {
      if (completedSet.has(mod.id)) return { ...mod, status: 'completed' as const };
      if (mod.id === currentModuleId && isUnlocked) return { ...mod, status: 'in-progress' as const };
      if (isUnlocked) {
        // Unlock sequentially: module unlocks when all previous ones are done
        const modIndex = stage.modules.findIndex(m => m.id === mod.id);
        const allPrevDone = stage.modules.slice(0, modIndex).every(m => completedSet.has(m.id));
        if (allPrevDone) return { ...mod, status: 'in-progress' as const };
      }
      return { ...mod, status: 'locked' as const };
    });

    return {
      ...stage,
      completedCount,
      totalModules: stage.modules.length,
      isUnlocked,
      isCompleted,
      isCurrent,
      progressPercent: Math.round((completedCount / stage.modules.length) * 100),
      moduleStatuses,
    };
  });

  const currentStage =
    stageStatuses.find(s => s.isCurrent) ||
    stageStatuses.find(s => s.isUnlocked) ||
    stageStatuses[0];

  const currentModuleInfo = currentStage.moduleStatuses.find(m => m.id === currentModuleId) ||
    currentStage.moduleStatuses.find(m => m.status === 'in-progress') ||
    null;

  const completedModulesCount = completedSet.size;
  const overallPercent = Math.round((completedModulesCount / TOTAL_MODULES) * 100);

  return { stageStatuses, currentStage, currentModule: currentModuleInfo, completedModulesCount, overallPercent };
}
