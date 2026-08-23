export type Level1Stats = {
  roundsCompleted: number;
  focusHits: number;
  focusMisses: number;
  completed: boolean;
};

export type Level2Stats = {
  memoryVariantId: string;
  memoryVariantName: string;
  memoryMoves: number;
  memoryPairs: number;
  memoryDurationMs: number;
  completed: boolean;
};

export type Level3Stats = {
  pathSteps: number;
  pathMistakes: number;
  rhythmAvgOffsetMs: number;
  rhythmVarianceMs: number;
  anxietyScore: number;
  anxietyBand: "low" | "moderate" | "high";
  completed: boolean;
};

export type MindQuestSession = {
  startedAt: number;
  level1: Level1Stats;
  level2: Level2Stats;
  level3: Level3Stats;
};

const SESSION_KEY = "mindquest-session-v1";

const defaultSession = (): MindQuestSession => ({
  startedAt: Date.now(),
  level1: {
    roundsCompleted: 0,
    focusHits: 0,
    focusMisses: 0,
    completed: false,
  },
  level2: {
    memoryVariantId: "",
    memoryVariantName: "",
    memoryMoves: 0,
    memoryPairs: 0,
    memoryDurationMs: 0,
    completed: false,
  },
  level3: {
    pathSteps: 0,
    pathMistakes: 0,
    rhythmAvgOffsetMs: 0,
    rhythmVarianceMs: 0,
    anxietyScore: 50,
    anxietyBand: "moderate",
    completed: false,
  },
});

export function getMindQuestSession(): MindQuestSession {
  if (typeof window === "undefined") {
    return defaultSession();
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return defaultSession();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MindQuestSession>;
    return {
      ...defaultSession(),
      ...parsed,
      level1: { ...defaultSession().level1, ...(parsed.level1 ?? {}) },
      level2: { ...defaultSession().level2, ...(parsed.level2 ?? {}) },
      level3: { ...defaultSession().level3, ...(parsed.level3 ?? {}) },
    };
  } catch {
    return defaultSession();
  }
}

export function startMindQuestSession() {
  const next = defaultSession();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  }
  return next;
}

export function updateMindQuestSession(patch: Partial<MindQuestSession>) {
  const current = getMindQuestSession();
  const next: MindQuestSession = {
    ...current,
    ...patch,
    level1: { ...current.level1, ...(patch.level1 ?? {}) },
    level2: { ...current.level2, ...(patch.level2 ?? {}) },
    level3: { ...current.level3, ...(patch.level3 ?? {}) },
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  }

  return next;
}
