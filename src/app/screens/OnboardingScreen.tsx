import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Heart, Sparkles, Brain } from "lucide-react";
import { PrimaryButton } from "../components/design-system/PrimaryButton";
import { useEffect, useState } from "react";

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [floatingHearts, setFloatingHearts] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingHearts((prev) => [...prev, Date.now()]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.slice(1));
      }, 3000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5EEAD4] via-[#3B82F6] to-[#A78BFA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Hearts Animation */}
      {floatingHearts.map((id, index) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 100, x: Math.random() * 100 - 50 }}
          animate={{ opacity: [0, 1, 0], y: -100 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute bottom-0"
          style={{ left: `${20 + index * 20}%` }}
        >
          <Heart className="w-6 h-6 text-white/40" fill="white" />
        </motion.div>
      ))}

      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo Area */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-8 flex justify-center"
          >
            <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
              <Heart className="w-12 h-12 text-[#14B8A6]" fill="#14B8A6" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white mb-4"
          >
            PsychTriage
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 text-lg mb-2"
          >
            Game-Based Wellness Companion
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mb-12"
          >
            <Sparkles className="w-5 h-5 text-[#FCD34D]" />
            <span className="text-white/80">Games only • No Q&amp;A • Private</span>
          </motion.div>

          {/* Illustration Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-2xl"
          >
            <div className="flex justify-center gap-4 mb-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                className="text-5xl"
              >
                🧘‍♀️
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className="text-5xl"
              >
                💙
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                className="text-5xl"
              >
                🌟
              </motion.div>
            </div>
            <p className="text-[#4B5563] text-center">
              Play focused mini-games to estimate your stress profile.
              <br />
              Each session gives a fresh memory challenge.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <PrimaryButton
              onClick={() => navigate("/mindquest")}
              size="lg"
              fullWidth
            >
              Start Game Quest ✨
            </PrimaryButton>

            <motion.button
              onClick={() => navigate("/manual-assessment")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white rounded-full py-3 px-6 font-semibold shadow-lg hover:bg-white/30 transition-all flex items-center justify-center gap-2"
            >
              <Brain className="w-5 h-5" />
                Measure Manually
            </motion.button>
            <motion.button
              onClick={() => navigate("/ai-buddy")}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg hover:opacity-90 transition"
            >
              💬 Talk to AI Buddy
            </motion.button>
          </motion.div>

          {/* Privacy Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white/70 text-sm mt-6"
          >
            Your privacy is protected. Gameplay data stays local.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}