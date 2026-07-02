export interface ModuleContent {
  narrator: string;
  narratorMeta: string;
  audioProgress: number; // 0–100 (cosmetic)
  intro?: string;
  paragraphs: string[];
  reflectionPrompt?: string;
}

const CONTENT: Record<string, ModuleContent> = {};

const GENERIC: ModuleContent = {
  narrator: 'Amen',
  narratorMeta: 'Heritage guide, OurRoots Africa',
  audioProgress: 0,
  paragraphs: [],
  reflectionPrompt: '',
};

export function getModuleContent(moduleId: string): ModuleContent {
  return CONTENT[moduleId] ?? GENERIC;
}
