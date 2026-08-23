import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { updateMindQuestSession } from "../mindquest/session";

type MemoryVariant = {
  id: string;
  name: string;
  icons: string[];
  columns: number;
};

type MemoryCard = {
  uid: string;
  icon: string;
  matched: boolean;
};

const LAST_VARIANT_KEY = "mindquest-last-memory-variant-v1";

const MEMORY_VARIANTS: MemoryVariant[] = [
  { id: "nature", name: "Nature Echo", icons: ["🌿", "🌊", "🌙", "⭐"], columns: 4 },
  { id: "fruits", name: "Fruit Grid", icons: ["🍎", "🍋", "🍇", "🍓", "🍊"], columns: 5 },
  { id: "space", name: "Space Orbit", icons: ["🛰️", "🌎", "☄️", "🌙", "⭐"], columns: 5 },
  { id: "energy", name: "Energy Pulse", icons: ["⚡", "🔥", "💧", "🍀"], columns: 4 },
  { id: "mind", name: "Mind Lab", icons: ["🧠", "🎯", "🧩", "🕹️", "📌", "⏱️"], columns: 4 },
];

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const createCards = (icons: string[]): MemoryCard[] => {
  const duplicated = icons.flatMap((icon, index) => [
    { uid: `${icon}-${index}-a`, icon, matched: false },
    { uid: `${icon}-${index}-b`, icon, matched: false },
  ]);
  return shuffle(duplicated);
};

const pickVariant = (): MemoryVariant => {
  if (typeof window === "undefined") return MEMORY_VARIANTS[0];

  const lastVariantId = window.localStorage.getItem(LAST_VARIANT_KEY);
  const candidatePool = MEMORY_VARIANTS.filter((variant) => variant.id !== lastVariantId);
  const source = candidatePool.length > 0 ? candidatePool : MEMORY_VARIANTS;
  const selected = source[Math.floor(Math.random() * source.length)];
  window.localStorage.setItem(LAST_VARIANT_KEY, selected.id);
  return selected;
};

export function Level2ChallengeMode() {
  const navigate = useNavigate();
  const [variant, setVariant] = useState<MemoryVariant | null>(null);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isCheckingPair, setIsCheckingPair] = useState(false);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const nextVariant = pickVariant();
    setVariant(nextVariant);
    setCards(createCards(nextVariant.icons));
    setStartedAt(Date.now());
  }, []);

  const totalPairs = useMemo(() => variant?.icons.length ?? 0, [variant]);
  const progress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;

  const handleCardFlip = (index: number) => {
    if (!variant) return;
    if (isCheckingPair) return;
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(index)) return;
    if (cards[index]?.matched) return;

    const nextFlipped = [...flippedCards, index];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length !== 2) return;

    setIsCheckingPair(true);
    setMemoryMoves((prev) => prev + 1);

    const [first, second] = nextFlipped;
    const isMatch = cards[first]?.icon === cards[second]?.icon;

    if (isMatch) {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((card, idx) =>
            idx === first || idx === second ? { ...card, matched: true } : card
          )
        );
        setMatchedPairs((prev) => prev + 1);
        setFlippedCards([]);
        setIsCheckingPair(false);
      }, 420);
      return;
    }

    setTimeout(() => {
      setFlippedCards([]);
      setIsCheckingPair(false);
    }, 820);
  };

  useEffect(() => {
    if (!variant || totalPairs === 0 || matchedPairs !== totalPairs || completed) return;

    const memoryDurationMs = Math.max(0, Date.now() - startedAt);

    updateMindQuestSession({
      level2: {
        memoryVariantId: variant.id,
        memoryVariantName: variant.name,
        memoryMoves,
        memoryPairs: matchedPairs,
        memoryDurationMs,
        completed: true,
      },
    });

    setCompleted(true);
  }, [variant, totalPairs, matchedPairs, memoryMoves, startedAt, completed]);

  useEffect(() => {
    if (!completed) return;

    const timer = setTimeout(() => {
      navigate("/mindquest/level3");
    }, 1800);

    return () => clearTimeout(timer);
  }, [completed, navigate]);

  if (!variant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <p className="text-center text-neutral-600">Loading memory variant...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-neutral-500">Level 2 • Memory Variants</p>
          <h2 className="text-2xl font-semibold text-neutral-800">{variant.name}</h2>
          <p className="text-sm text-neutral-600 mt-2">
            Each play picks a different memory game from 5 variants.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-xs text-neutral-500">Pairs</p>
            <p className="text-lg font-semibold text-indigo-700">{matchedPairs}/{totalPairs}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-xs text-neutral-500">Moves</p>
            <p className="text-lg font-semibold text-purple-700">{memoryMoves}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-xs text-neutral-500">Type</p>
            <p className="text-sm font-semibold text-pink-700">{variant.id}</p>
          </div>
        </div>

        <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div
          className="mt-6 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${variant.columns}, minmax(0, 1fr))` }}
        >
          {cards.map((card, index) => {
            const isFlipped = flippedCards.includes(index) || card.matched;

            return (
              <motion.button
                key={card.uid}
                onClick={() => handleCardFlip(index)}
                disabled={card.matched}
                whileHover={{ scale: card.matched ? 1 : 1.04 }}
                whileTap={{ scale: card.matched ? 1 : 0.96 }}
                className="aspect-square"
              >
                <motion.div
                  className="relative w-full h-full"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md flex items-center justify-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className={`absolute inset-0 rounded-2xl shadow-md flex items-center justify-center text-3xl ${
                      card.matched ? "bg-emerald-100" : "bg-white"
                    }`}
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    {card.icon}
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {completed && (
            <motion.div
              className="fixed inset-0 bg-white/85 backdrop-blur-sm flex items-center justify-center z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl p-8 text-center shadow-xl"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <Sparkles className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
                <h3 className="text-2xl font-semibold text-neutral-800">Memory Variant Clear</h3>
                <p className="text-neutral-600 mt-2">Next: Path finder and anxiety analysis.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
