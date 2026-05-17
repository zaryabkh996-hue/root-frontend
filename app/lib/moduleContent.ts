export interface ModuleContent {
  narrator: string;
  narratorMeta: string;
  audioProgress: number; // 0–100 (cosmetic)
  intro?: string;
  paragraphs: string[];
  reflectionPrompt?: string;
}

const CONTENT: Record<string, ModuleContent> = {
  '1.1': {
    narrator: 'Amen',
    narratorMeta: 'Heritage guide, OurRoots Africa',
    audioProgress: 0,
    intro: '"Welcome, relative. You are not a tourist. You are not a stranger. You are coming home."',
    paragraphs: [
      'This is not a travel course. It is a preparation framework for one of the most emotionally significant experiences of your life — returning to the continent your ancestors were taken from.',
      'Over the next six stages, you will unlearn, relearn, and encounter things that no guidebook has ever told you. You will be given tools, protocols, meditations, and companions for the journey.',
      'Stage 1 is free for everyone, always. These five modules are our gift — a foundation of emotional readiness that every diaspora traveller deserves before they land in Accra.',
      'Take your time. There is no pace to maintain. Come back whenever you need. The journey waits for you.',
    ],
    reflectionPrompt: 'Why are you making this journey? What do you hope to find — or leave behind?',
  },

  '1.2': {
    narrator: 'Ama',
    narratorMeta: 'Heritage educator, Accra',
    audioProgress: 15,
    intro: '"The Ghana in your imagination was built by Marvel and Instagram. The Ghana you will meet is far more complex — and far more beautiful."',
    paragraphs: [
      'Wakanda does not exist. But the longing that Wakanda satisfies — for a Black utopia untouched by colonialism, gleaming and sovereign — is real, and it matters. Many diaspora travellers arrive in Ghana carrying that longing, and the mismatch between expectation and reality can be quietly devastating.',
      'Ghana is a middle-income African country with extraordinary cultural depth, complex urban politics, genuine warmth toward diaspora visitors, and very real infrastructure challenges. Power cuts happen. Traffic in Accra is legendary. Hotels vary wildly.',
      'None of this diminishes the profound experience that awaits you. But it means your emotional preparation must include releasing the Hollywood version and arriving ready to meet the real country.',
      "The Ghanaians you'll encounter aren't waiting to complete your identity narrative. They have their own full lives, their own politics, their own relationship with the diaspora — complex, warm, sometimes transactional, often deeply generous.",
    ],
    reflectionPrompt: 'What specific images or stories shaped your idea of Ghana or Africa before this course? Where did they come from?',
  },

  '1.3': {
    narrator: 'Ama',
    narratorMeta: 'Heritage educator, Accra',
    audioProgress: 0,
    intro: '"The truths that hurt the most are the ones that free us."',
    paragraphs: [
      "There are things that happen to diaspora visitors in Ghana that the tourism boards don't mention. Locals calling you 'obruni' — foreigner — even though you feel African. Being charged the 'diaspora price' for taxis, crafts, and services. Feeling simultaneously welcomed and exoticised.",
      "There is also the grief that ambushes you in unexpected places — not at the Cape Coast Castle, where you expect it, but in a market, in a face that resembles your grandmother's, in a song you somehow already knew.",
      "Diaspora identity is not a simple homecoming narrative. It is a hyphenated, layered, contested space. You may arrive feeling Black and be perceived as American. You may arrive feeling African and find the category doesn't translate.",
      'These are not reasons not to go. They are reasons to go prepared — to hold the complexity without being broken by it, and to let it deepen your understanding rather than shatter your expectations.',
    ],
    reflectionPrompt: 'What "uncomfortable truth" about this journey are you most afraid to encounter? Name it here, in private.',
  },

  '1.4': {
    narrator: 'Ama',
    narratorMeta: 'Heritage educator, Accra',
    audioProgress: 34,
    intro: '"Find a comfortable place to sit or lie down. Close your eyes if you feel safe to do so. Take a deep breath in… and out."',
    paragraphs: [
      "You are preparing for a journey that will touch the deepest parts of your soul. When you visit Cape Coast Castle, when you walk through the Door of No Return, you will be standing where your ancestors stood in their final moments on African soil.",
      "This is not a tourist attraction. This is sacred ground. This is a place of immense suffering, and immense strength.",
      "It is okay to feel overwhelmed. It is okay to cry. It is okay to feel anger, grief, confusion, or numbness. There is no 'right' way to feel.",
      "What you can prepare for: the physical sensation of entering the dungeons, the darkness, the low ceilings, the marks on the stone. The smell. The sound of the ocean that was the last thing they heard. You can prepare your nervous system so that it does not shut down — so you can be fully present for what your ancestors deserve.",
    ],
    reflectionPrompt: 'Imagine your ancestors looking at you, their descendant, who has returned. What would they want you to know?',
  },

  '1.5': {
    narrator: 'Amen',
    narratorMeta: 'Heritage guide, OurRoots Africa',
    audioProgress: 0,
    intro: '"You have completed Stage 1. Take a moment. This is not small."',
    paragraphs: [
      "You have done the first and hardest thing — you've looked honestly at your emotional state, your expectations, and your fears. That is the foundation everything else is built on.",
      "In the quiz below, you will answer five questions about what you've learned. Pass four of five, and Stage 2 — Cultural Intelligence — unlocks immediately. There is no time pressure. You can retake it as many times as you need.",
      "Stage 2 is available with a Community membership. If you are not yet a member, completing this quiz unlocks a preview.",
    ],
    reflectionPrompt: 'What is one thing you learned in Stage 1 that surprised you?',
  },
};

const GENERIC: ModuleContent = {
  narrator: 'Amen',
  narratorMeta: 'Heritage guide, OurRoots Africa',
  audioProgress: 0,
  paragraphs: [
    'This module unlocks when you reach this stage of your journey.',
    'Complete the earlier modules to access the full content here.',
  ],
  reflectionPrompt: 'What questions do you carry into this stage?',
};

export function getModuleContent(moduleId: string): ModuleContent {
  return CONTENT[moduleId] ?? GENERIC;
}
