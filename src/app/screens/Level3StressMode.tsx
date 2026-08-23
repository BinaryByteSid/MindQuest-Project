import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Brain, Flag, Timer, Activity, Footprints, Gauge, Palette } from "lucide-react";
import { useNavigate } from "react-router";
import { updateMindQuestSession } from "../mindquest/session";

type Phase = "path" | "sprint";
type Cell = { row: number; col: number };
type AnxietyBand = "low" | "moderate" | "high";
type SprintColor = {
  key: string;
  label: string;
  buttonClass: string;
};

const GRID_SIZE = 5;
const PATH_TIME_LIMIT = 45;
const SPRINT_ROUNDS = 12;
const SPRINT_WINDOW_MS = 5000;

const START_CELL: Cell = { row: 0, col: 0 };
const GOAL_CELL: Cell = { row: 4, col: 4 };

const PATH_LAYOUTS: string[][] = [
  ["0-2", "1-3", "2-1", "2-3", "3-0", "4-2"],
  ["0-1", "1-1", "1-4", "2-2", "3-2", "3-4", "4-1"],
  ["0-3", "1-0", "1-2", "2-0", "2-4", "3-1", "3-3"],
  ["0-2", "1-0", "1-4", "2-2", "3-0", "3-2", "4-3"],
];

const SPRINT_COLORS: SprintColor[] = [
  { key: "red", label: "Red", buttonClass: "bg-red-500" },
  { key: "blue", label: "Blue", buttonClass: "bg-blue-500" },
  { key: "green", label: "Green", buttonClass: "bg-emerald-500" },
  { key: "yellow", label: "Yellow", buttonClass: "bg-amber-500" },
];

const keyOf = (cell: Cell) => `${cell.row}-${cell.col}`;
const isAdjacent = (a: Cell, b: Cell) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseKey = (key: string): Cell => {
  const [row, col] = key.split("-").map(Number);
  return { row, col };
};

const neighborsOf = (cell: Cell): Cell[] => {
  const deltas = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
  ];

  return deltas
    .map((delta) => ({ row: cell.row + delta.row, col: cell.col + delta.col }))
    .filter((next) => next.row >= 0 && next.row < GRID_SIZE && next.col >= 0 && next.col < GRID_SIZE);
};

const findPath = (blocked: Set<string>, start: Cell, goal: Cell): Cell[] => {
  const startKey = keyOf(start);
  const goalKey = keyOf(goal);
  if (blocked.has(startKey) || blocked.has(goalKey)) return [];

  const queue: Cell[] = [start];
  const visited = new Set<string>([startKey]);
  const parent = new Map<string, string | null>([[startKey, null]]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    const currentKey = keyOf(current);
    if (currentKey === goalKey) {
      const path: Cell[] = [];
      let cursor: string | null = currentKey;
      while (cursor) {
        path.push(parseKey(cursor));
        cursor = parent.get(cursor) ?? null;
      }
      return path.reverse();
    }

    for (const neighbor of neighborsOf(current)) {
      const neighborKey = keyOf(neighbor);
      if (visited.has(neighborKey) || blocked.has(neighborKey)) continue;
      visited.add(neighborKey);
      parent.set(neighborKey, currentKey);
      queue.push(neighbor);
    }
  }

  return [];
};

const variance = (values: number[]) => {
  if (values.length === 0) return 0;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
};

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export function Level3StressMode() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("path");
  const [blockedCells, setBlockedCells] = useState<Set<string>>(new Set());
  const [showAnswerPath, setShowAnswerPath] = useState(false);
  // Sticky: toggling the hint back off does not un-see the solution.
  const [hintUsed, setHintUsed] = useState(false);

  const [position, setPosition] = useState<Cell>(START_CELL);
  const [visited, setVisited] = useState<Set<string>>(new Set([keyOf(START_CELL)]));
  const [pathSteps, setPathSteps] = useState(0);
  const [pathMistakes, setPathMistakes] = useState(0);
  const [pathTimeLeft, setPathTimeLeft] = useState(PATH_TIME_LIMIT);
  const [pathTimeoutPenalty, setPathTimeoutPenalty] = useState(0);

  const [sprintRound, setSprintRound] = useState(0);
  const [sprintTarget, setSprintTarget] = useState<SprintColor | null>(null);
  const [sprintOptions, setSprintOptions] = useState<SprintColor[]>([]);
  const [sprintHits, setSprintHits] = useState(0);
  const [sprintMisses, setSprintMisses] = useState(0);
  const [sprintPromptStartedAt, setSprintPromptStartedAt] = useState<number | null>(null);
  const [reactionMs, setReactionMs] = useState<number[]>([]);
  const [sprintLocked, setSprintLocked] = useState(false);

  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const shuffledLayouts = [...PATH_LAYOUTS].sort(() => Math.random() - 0.5);
    const selectedLayout =
      shuffledLayouts.find((layout) => findPath(new Set(layout), START_CELL, GOAL_CELL).length > 0) ??
      PATH_LAYOUTS[0];
    setBlockedCells(new Set(selectedLayout));
  }, []);

  const answerPath = useMemo(() => findPath(blockedCells, position, GOAL_CELL), [blockedCells, position]);
  const answerPathKeys = useMemo(() => new Set(answerPath.map((cell) => keyOf(cell))), [answerPath]);

  useEffect(() => {
    if (phase !== "path") return;
    if (pathTimeLeft <= 0) return;

    const timer = window.setTimeout(() => {
      setPathTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [phase, pathTimeLeft]);

  useEffect(() => {
    if (phase !== "path") return;
    if (pathTimeLeft > 0) return;

    setPathTimeoutPenalty(10);
    setPathMistakes((prev) => prev + 2);
    setPhase("sprint");
  }, [phase, pathTimeLeft]);

  const moveToCell = (target: Cell) => {
    if (phase !== "path") return;

    const targetKey = keyOf(target);
    if (blockedCells.has(targetKey) || !isAdjacent(position, target)) {
      setPathMistakes((prev) => prev + 1);
      return;
    }

    setPathSteps((prev) => prev + 1);
    setPosition(target);
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(targetKey);
      return next;
    });

    if (target.row === GOAL_CELL.row && target.col === GOAL_CELL.col) {
      setPhase("sprint");
    }
  };

  const spawnSprintRound = () => {
    const target = SPRINT_COLORS[Math.floor(Math.random() * SPRINT_COLORS.length)];
    setSprintTarget(target);
    setSprintOptions(shuffle(SPRINT_COLORS));
    setSprintPromptStartedAt(Date.now());
    setSprintLocked(false);
  };

  useEffect(() => {
    if (phase !== "sprint") return;
    if (sprintRound >= SPRINT_ROUNDS) return;
    if (sprintTarget) return;

    spawnSprintRound();
  }, [phase, sprintRound, sprintTarget]);

  useEffect(() => {
    if (phase !== "sprint") return;
    if (!sprintTarget || sprintLocked) return;

    const timeout = window.setTimeout(() => {
      setSprintMisses((prev) => prev + 1);
      setReactionMs((prev) => [...prev, SPRINT_WINDOW_MS]);
      setSprintLocked(true);
      setSprintTarget(null);
      setSprintRound((prev) => prev + 1);
    }, SPRINT_WINDOW_MS);

    return () => window.clearTimeout(timeout);
  }, [phase, sprintTarget, sprintLocked]);

  const handleSprintPick = (picked: SprintColor) => {
    if (phase !== "sprint") return;
    if (!sprintTarget || sprintLocked) return;

    const elapsed = sprintPromptStartedAt ? Date.now() - sprintPromptStartedAt : SPRINT_WINDOW_MS;
    setReactionMs((prev) => [...prev, elapsed]);

    if (picked.key === sprintTarget.key) {
      setSprintHits((prev) => prev + 1);
    } else {
      setSprintMisses((prev) => prev + 1);
    }

    setSprintLocked(true);
    setSprintTarget(null);
    setSprintRound((prev) => prev + 1);
  };

  const rhythmAvgOffsetMs = useMemo(() => {
    if (reactionMs.length === 0) return SPRINT_WINDOW_MS;
    return Math.round(reactionMs.reduce((sum, value) => sum + value, 0) / reactionMs.length);
  }, [reactionMs]);

  const rhythmVarianceMs = useMemo(() => Math.round(variance(reactionMs)), [reactionMs]);

  const computedAnxiety = useMemo(() => {
    const pathPenalty = Math.min(40, pathMistakes * 6 + Math.max(0, pathSteps - 12) * 1.5);

    // Reaction penalty is measured from a 300ms floor (nobody beats simple
    // choice-reaction time by much) rather than from zero, so being fast is
    // actually rewarded instead of merely being less slow.
    const reactionPenalty = clamp((rhythmAvgOffsetMs - 300) / 45, 0, 22);

    // Consistency uses the standard deviation, not the variance. The variance is
    // in ms-squared: an ordinary 80ms spread is 6400, and the old
    // `rhythmVarianceMs / 20` term alone contributed 320 points. That pinned the
    // sprint half of the score to its 45-point cap for every player, which in
    // turn made the "low" band (<= 33) impossible to reach — flawless play still
    // scored 45 / moderate.
    const rhythmSd = Math.sqrt(Math.max(0, rhythmVarianceMs));
    const consistencyPenalty = clamp(rhythmSd / 70, 0, 11);

    const missPenalty = Math.min(14, sprintMisses * 4);

    const sprintPenalty = Math.min(
      45,
      reactionPenalty + consistencyPenalty + missPenalty
    );

    const raw = Math.round(pathPenalty + sprintPenalty + pathTimeoutPenalty);
    const anxietyScore = clamp(raw, 0, 100);

    let anxietyBand: AnxietyBand = "moderate";
    if (anxietyScore <= 33) anxietyBand = "low";
    if (anxietyScore >= 67) anxietyBand = "high";

    return { anxietyScore, anxietyBand };
  }, [pathMistakes, pathSteps, rhythmAvgOffsetMs, rhythmVarianceMs, sprintMisses, pathTimeoutPenalty]);

  useEffect(() => {
    if (phase !== "sprint") return;
    if (sprintRound < SPRINT_ROUNDS) return;
    if (isCompleting) return;

    setIsCompleting(true);

    updateMindQuestSession({
      level3: {
        pathSteps,
        pathMistakes,
        rhythmAvgOffsetMs,
        rhythmVarianceMs,
        anxietyScore: computedAnxiety.anxietyScore,
        anxietyBand: computedAnxiety.anxietyBand,
        hintUsed,
        completed: true,
      },
    });

    navigate("/mindquest/result", {
      state: {
        anxietyScore: computedAnxiety.anxietyScore,
        anxietyBand: computedAnxiety.anxietyBand,
      },
    });
  }, [
    phase,
    sprintRound,
    isCompleting,
    pathSteps,
    pathMistakes,
    rhythmAvgOffsetMs,
    rhythmVarianceMs,
    computedAnxiety,
    hintUsed,
    navigate,
  ]);

  if (phase === "path") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6">
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm text-neutral-500">Level 3 • Anxiety Detection Game</p>
            <h2 className="text-2xl font-semibold text-neutral-800">Path Finder</h2>
            <p className="text-sm text-neutral-600 mt-2">
              Move from Start to Goal. Adjacent moves only.
            </p>
            <p className="text-sm text-neutral-700 mt-2 font-medium">
              Purpose: test planning under pressure. Fewer mistakes and direct routes lower anxiety score.
            </p>
          </motion.div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() =>
                setShowAnswerPath((prev) => {
                  if (!prev) setHintUsed(true);
                  return !prev;
                })
              }
              className="px-3 py-2 text-sm rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            >
              {showAnswerPath ? "Hide Answer Path" : "Show Answer Path"}
            </button>
            <p className="text-xs text-neutral-500">
              {answerPath.length > 0
                ? `Path length from current cell: ${answerPath.length - 1} steps`
                : "No path from current position"}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-5">
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <Timer className="w-4 h-4 text-orange-600 mx-auto mb-1" />
              <p className="text-xs text-neutral-500">Time</p>
              <p className="text-lg font-semibold text-orange-700">{pathTimeLeft}s</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <Footprints className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-neutral-500">Steps</p>
              <p className="text-lg font-semibold text-blue-700">{pathSteps}</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <Activity className="w-4 h-4 text-rose-600 mx-auto mb-1" />
              <p className="text-xs text-neutral-500">Mistakes</p>
              <p className="text-lg font-semibold text-rose-700">{pathMistakes}</p>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <Flag className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-neutral-500">Goal</p>
              <p className="text-sm font-semibold text-emerald-700">4,4</p>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-3xl p-4 shadow-lg">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: GRID_SIZE }).map((_, row) =>
                Array.from({ length: GRID_SIZE }).map((_, col) => {
                  const cell: Cell = { row, col };
                  const cellKey = keyOf(cell);
                  const isBlocked = blockedCells.has(cellKey);
                  const isPlayer = position.row === row && position.col === col;
                  const isGoal = GOAL_CELL.row === row && GOAL_CELL.col === col;
                  const isStart = START_CELL.row === row && START_CELL.col === col;
                  const isVisited = visited.has(cellKey);
                  const isAnswerHint = showAnswerPath && answerPathKeys.has(cellKey) && !isPlayer && !isGoal;

                  return (
                    <motion.button
                      key={cellKey}
                      onClick={() => moveToCell(cell)}
                      whileTap={{ scale: 0.95 }}
                      className={`aspect-square rounded-xl border text-xs font-semibold ${
                        isBlocked
                          ? "bg-neutral-300 border-neutral-300 text-neutral-500"
                          : isGoal
                          ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                          : isPlayer
                          ? "bg-blue-500 border-blue-600 text-white"
                          : isAnswerHint
                          ? "bg-amber-100 border-amber-300 text-amber-700"
                          : isVisited
                          ? "bg-sky-100 border-sky-200 text-sky-700"
                          : "bg-white border-neutral-200 text-neutral-500"
                      }`}
                    >
                      {isPlayer ? "You" : isGoal ? "Goal" : isStart ? "Start" : isBlocked ? "X" : ""}
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sprintProgress = Math.min((sprintRound / SPRINT_ROUNDS) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-neutral-500">Level 3 • Anxiety Detection Game</p>
          <h2 className="text-2xl font-semibold text-neutral-800">Color Sprint</h2>
          <p className="text-sm text-neutral-600 mt-2">
            Tap the shown color quickly. It is a fun focus game and replaces rhythm beats.
          </p>
          <p className="text-sm text-neutral-700 mt-2 font-medium">
            Goal: accuracy + quick responses under pressure.
          </p>
        </motion.div>

        <div className="mt-5 h-2 bg-white rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
            animate={{ width: `${sprintProgress}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-3 mt-5">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-xs text-neutral-500">Round</p>
            <p className="text-lg font-semibold text-cyan-700">{Math.min(sprintRound, SPRINT_ROUNDS)}/{SPRINT_ROUNDS}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-xs text-neutral-500">Hits</p>
            <p className="text-lg font-semibold text-emerald-700">{sprintHits}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-xs text-neutral-500">Misses</p>
            <p className="text-lg font-semibold text-rose-700">{sprintMisses}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <Gauge className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <p className="text-xs text-neutral-500">Avg ms</p>
            <p className="text-lg font-semibold text-indigo-700">{rhythmAvgOffsetMs}</p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-3xl p-8 shadow-lg text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 mx-auto mb-4 flex items-center justify-center">
            <Palette className="w-9 h-9 text-white" />
          </div>

          <p className="text-sm text-neutral-500 mb-2">Pick This Color</p>
          <h3 className="text-3xl font-bold text-neutral-800 mb-5">{sprintTarget?.label ?? "Next..."}</h3>

          <div className="grid grid-cols-2 gap-3">
            {sprintOptions.map((option) => (
              <motion.button
                key={option.key}
                onClick={() => handleSprintPick(option)}
                whileHover={{ scale: sprintTarget ? 1.03 : 1 }}
                whileTap={{ scale: sprintTarget ? 0.97 : 1 }}
                disabled={!sprintTarget}
                className={`rounded-2xl px-4 py-4 text-white font-semibold shadow-md disabled:opacity-50 ${option.buttonClass}`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>

          <p className="text-sm text-neutral-600 mt-4">
            Response window per round: {Math.round(SPRINT_WINDOW_MS / 1000)}s
          </p>
        </div>
      </div>
    </div>
  );
}
