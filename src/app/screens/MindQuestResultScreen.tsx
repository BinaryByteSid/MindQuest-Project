import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router";
import {
  TrendingUp,
  Award,
  Heart,
  Phone,
  Sparkles,
  Target,
  Brain,
  Zap,
} from "lucide-react";
import { XPBadge } from "../components/design-system/XPBadge";
import { AchievementBadge } from "../components/design-system/AchievementBadge";
import { StreakCounter } from "../components/design-system/StreakCounter";
import { getMindQuestSession } from "../mindquest/session";

export function MindQuestResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getMindQuestSession();
  const level3State = location.state || {};
  const anxietyScore: number = level3State.anxietyScore ?? session.level3.anxietyScore;
  const anxietyBand: "low" | "moderate" | "high" =
    level3State.anxietyBand ?? session.level3.anxietyBand;

  const calculateAnxietyLevel = () => {
    if (anxietyBand === "low") return { level: "Low", color: "green", emoji: ":)" };
    if (anxietyBand === "moderate") return { level: "Moderate", color: "yellow", emoji: ":|" };
    return { level: "High", color: "red", emoji: ":(" };
  };

  const anxietyResult = calculateAnxietyLevel();
  const calmScore = 100 - anxietyScore;
  const totalXP =
    session.level1.focusHits * 5 +
    Math.max(0, 60 - session.level1.focusMisses * 3) +
    Math.max(0, 120 - session.level2.memoryMoves * 4) +
    session.level2.memoryPairs * 15 +
    Math.max(0, 90 - session.level3.pathMistakes * 8) +
    Math.max(0, 120 - Math.round(session.level3.rhythmAvgOffsetMs / 8));

  const personalizedPlan = (() => {
    const steps: string[] = [];

    if (anxietyScore >= 67) {
      steps.push("Run two short reset breaks today: 90 seconds each with slow exhale.");
    } else {
      steps.push("Do one preventive reset before your busiest hour.");
    }

    if (session.level2.memoryMoves > 12) {
      steps.push("Do one 5-minute focus block with notifications off and one clear goal.");
    } else {
      steps.push("Keep your focus strong: repeat one 5-minute attention block tomorrow.");
    }

    if (session.level3.pathMistakes >= 4) {
      steps.push("When pressure spikes, pause before acting and pick one next step only.");
    } else {
      steps.push("You handled pressure well. Reuse your focus strategy early in stressful tasks.");
    }

    return steps;
  })();

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return {
          bg: "from-green-400 to-teal-400",
          text: "text-green-600",
          bgLight: "bg-green-50",
          border: "border-green-200",
        };
      case "yellow":
        return {
          bg: "from-yellow-400 to-orange-400",
          text: "text-yellow-600",
          bgLight: "bg-yellow-50",
          border: "border-yellow-200",
        };
      case "red":
        return {
          bg: "from-red-400 to-orange-400",
          text: "text-red-600",
          bgLight: "bg-red-50",
          border: "border-red-200",
        };
      default:
        return {
          bg: "from-gray-400 to-gray-400",
          text: "text-gray-600",
          bgLight: "bg-gray-50",
          border: "border-gray-200",
        };
    }
  };

  const colors = getColorClasses(anxietyResult.color);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-6">
      {/* Confetti Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ["#14B8A6", "#3B82F6", "#A78BFA", "#FCD34D"][i % 4],
              left: `${Math.random() * 100}%`,
              top: -20,
            }}
            animate={{
              y: [0, window.innerHeight],
              x: [0, (Math.random() - 0.5) * 100],
              rotate: [0, 360],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-block mb-4"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-purple-400 flex items-center justify-center mx-auto shadow-lg">
            <Award className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-neutral-800 mb-2"
        >
          Quest Complete!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-neutral-600"
        >
          You've finished your mind journey
        </motion.p>
      </motion.div>

      {/* Anxiety Level Result */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className={`bg-white rounded-3xl p-6 mb-6 shadow-xl border-2 ${colors.border}`}
      >
        <div className="text-center mb-6">
          <p className="text-sm text-neutral-500 mb-2">Your Anxiety Level</p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 150 }}
            className="text-6xl mb-3"
          >
            {anxietyResult.emoji}
          </motion.div>
          <h2 className={`text-3xl font-bold ${colors.text} mb-2`}>
            {anxietyResult.level}
          </h2>
          <p className="text-neutral-600 text-sm">
            Based on gameplay consistency, mistakes, and reaction timing
          </p>
        </div>

        {/* Visual Meter */}
        <div className="relative">
          <div className="h-8 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full overflow-hidden">
            <motion.div
              className={`absolute top-0 left-0 h-full w-2 bg-white border-2 border-neutral-800 rounded-full shadow-lg`}
              initial={{ left: "0%" }}
              animate={{ left: `${calmScore}%` }}
              transition={{ delay: 1.2, duration: 1, type: "spring" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <span>High Anxiety</span>
            <span>Low Anxiety</span>
          </div>
        </div>

        {/* Explanation */}
        <div className={`mt-6 ${colors.bgLight} rounded-2xl p-4 border ${colors.border}`}>
          <div className="flex items-start gap-3">
            <Heart className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
            <div>
              <h4 className="font-medium text-neutral-800 mb-1">
                What this means:
              </h4>
              <p className="text-sm text-neutral-600">
                {anxietyResult.level === "Low" &&
                  "You showed stable performance under pressure. Keep building this pattern with short daily focus games."}
                {anxietyResult.level === "Moderate" &&
                  "You are reasonably stable with some fluctuation. Regular short resets and focus blocks can help."}
                {anxietyResult.level === "High" &&
                  "You showed elevated stress signals in game performance. Consider support from a mental health professional."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rewards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="bg-white rounded-3xl p-6 mb-6 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-neutral-800">
            Rewards Earned
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* XP Badge */}
          <div className="flex flex-col items-center">
            <XPBadge points={totalXP} size="large" />
            <p className="text-xs text-neutral-500 mt-2">Total XP</p>
          </div>

          {/* Streak Counter */}
          <div className="flex flex-col items-center">
            <StreakCounter days={1} />
            <p className="text-xs text-neutral-500 mt-2">Quest Streak</p>
          </div>

          {/* Achievement */}
          <div className="flex flex-col items-center">
            <AchievementBadge
              title="Mind Explorer"
              level="gold"
              icon={<Brain className="w-6 h-6 text-yellow-600" />}
            />
            <p className="text-xs text-neutral-500 mt-2">New Badge!</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-teal-500" />
              <p className="font-semibold text-neutral-800">{anxietyScore}/100</p>
            </div>
            <p className="text-xs text-neutral-500">Anxiety Index</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Brain className="w-4 h-4 text-blue-500" />
              <p className="font-semibold text-neutral-800">3</p>
            </div>
            <p className="text-xs text-neutral-500">Game Levels</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-purple-500" />
              <p className="font-semibold text-neutral-800">5</p>
            </div>
            <p className="text-xs text-neutral-500">Minutes</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="bg-white rounded-3xl p-6 mb-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Game Breakdown</h3>
        <div className="space-y-3">
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-3">
            <p className="text-sm font-medium text-teal-800">Level 1: Flash Recall</p>
            <p className="text-sm text-neutral-700">
              {session.level1.roundsCompleted} rounds, {session.level1.focusHits} hits, {session.level1.focusMisses} misses
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3">
            <p className="text-sm font-medium text-blue-800">Level 2: Memory Variant</p>
            <p className="text-sm text-neutral-700">
              {session.level2.memoryVariantName || "Memory mode"}, {session.level2.memoryPairs} pairs in {session.level2.memoryMoves} moves
            </p>
          </div>
          <div className="rounded-2xl bg-purple-50 border border-purple-100 p-3">
            <p className="text-sm font-medium text-purple-800">Level 3: Path + Color Sprint</p>
            <p className="text-sm text-neutral-700">
              Path mistakes {session.level3.pathMistakes}, sprint avg response {session.level3.rhythmAvgOffsetMs}ms, anxiety {session.level3.anxietyScore}/100
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.55 }}
        className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-teal-100"
      >
        <h3 className="text-lg font-semibold text-neutral-800 mb-3">Personalized 24-Hour Plan</h3>
        <p className="text-sm text-neutral-600 mb-4">
          Built from your memory, pathfinding, and Color Sprint gameplay data.
        </p>
        <div className="space-y-2">
          {personalizedPlan.map((step, index) => (
            <div key={index} className="rounded-xl bg-teal-50 border border-teal-100 p-3 text-sm text-neutral-700">
              {index + 1}. {step}
            </div>
          ))}
        </div>
      </motion.div>

      {anxietyResult.level === "High" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.57 }}
          className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-red-800 mb-3">Immediate Support Options</h3>
          <div className="space-y-2 text-sm text-red-900">
            <p>1. Deep breathing: inhale 4s, hold 2s, exhale 6s for 2 minutes.</p>
            <p>
              2. Tele-MANAS: <a className="underline" href="tel:14416">14416</a>
            </p>
            <p>
              3. Health helpline (KIRAN): <a className="underline" href="tel:18005990019">1800-599-0019</a>
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <a
              href="tel:14416"
              className="text-center rounded-full bg-red-600 text-white py-3 px-4 font-semibold"
            >
              Call Tele-MANAS
            </a>
            <button
              onClick={() => navigate("/emergency")}
              className="rounded-full border border-red-300 text-red-800 py-3 px-4 font-semibold bg-white"
            >
              Open Emergency Support
            </button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="space-y-3"
      >
        {anxietyResult.level === "High" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/emergency")}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full py-4 px-6 font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Talk to Support Now
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/dashboard")}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full py-4 px-6 font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          View Progress Dashboard
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/mindquest")}
          className="w-full bg-white text-neutral-700 border-2 border-neutral-200 rounded-full py-4 px-6 font-semibold shadow-sm hover:bg-neutral-50 transition-colors"
        >
          Retake Quest
        </motion.button>
      </motion.div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="mt-6 text-center"
      >
        <p className="text-xs text-neutral-500">
          This is a screening tool, not a diagnosis. For professional help,
          consult a mental health expert.
        </p>
      </motion.div>
    </div>
  );
}
