import { useEffect } from "react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router";
import { AlertTriangle, ArrowLeft, ClipboardCheck, ShieldCheck } from "lucide-react";

/** Guards against out-of-range scores arriving through router state. */
const clampScore = (value: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(0, Math.round(value))) : 0;

type Severity = "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";

const getPhqSeverity = (score: number): Severity => {
  if (score <= 4) return "minimal";
  if (score <= 9) return "mild";
  if (score <= 14) return "moderate";
  if (score <= 19) return "moderately-severe";
  return "severe";
};

const getGadSeverity = (score: number): Exclude<Severity, "moderately-severe"> => {
  if (score <= 4) return "minimal";
  if (score <= 9) return "mild";
  if (score <= 14) return "moderate";
  return "severe";
};

const normalizeLabel = (value: string) =>
  value
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

export function ManualAssessmentResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as
    | { phqScore?: number; gadScore?: number; phq9Item?: number }
    | null;

  // Landing here directly (refresh, bookmark, back button) used to render a
  // fabricated 0 / 0 "low risk" report. Send the user to the questionnaire instead.
  const hasResult = state != null && typeof state.phqScore === "number";

  useEffect(() => {
    if (!hasResult) navigate("/manual-assessment", { replace: true });
  }, [hasResult, navigate]);

  const phqScore = clampScore(Number(state?.phqScore ?? 0), 27);
  const gadScore = clampScore(Number(state?.gadScore ?? 0), 21);
  const phq9Item = clampScore(Number(state?.phq9Item ?? 0), 3);

  const phqSeverity = getPhqSeverity(phqScore);
  const gadSeverity = getGadSeverity(gadScore);

  // PHQ-9 item 9 asks about thoughts of being better off dead or of self-harm.
  // Standard scoring escalates on ANY non-zero answer, regardless of the total:
  // someone can answer "nearly every day" here and still total only 3 points.
  const selfHarmFlag = phq9Item > 0;

  const overallRisk =
    selfHarmFlag || phqScore >= 20 || gadScore >= 15
      ? "high"
      : phqScore >= 10 || gadScore >= 10
      ? "moderate"
      : "low";

  const recommendation = selfHarmFlag
    ? "You reported thoughts of self-harm or of being better off dead. Please talk to someone today — a helpline below, a doctor, or someone you trust. You do not have to handle this alone."
    : overallRisk === "high"
    ? "Please seek professional support soon. If you feel unsafe, contact emergency support immediately."
    : overallRisk === "moderate"
    ? "Consider speaking with a mental health professional for a full evaluation and support plan."
    : "Your scores are in a lower range. Continue self-care and monitor changes over time.";

  if (!hasResult) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-4">
        <button
          onClick={() => navigate("/manual-assessment")}
          className="mb-4 text-neutral-600 hover:text-neutral-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to questions
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            <p className="text-sm text-neutral-500">Manual Report</p>
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">PHQ-9 + GAD-7 Results</h1>
          <p className="text-neutral-600 mt-2">
            Based only on PHQ-9 and GAD-7 questionnaire scoring.
          </p>
        </motion.div>

        {/* Item-9 escalation: shown above the scores, because a positive answer
            here matters more than either total. */}
        {selfHarmFlag && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-3xl border-2 border-red-300 bg-red-50 p-6 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">
                  Please reach out today
                </h2>
                <p className="mt-2 text-sm text-red-900">
                  Your answer to question 9 mentions thoughts of self-harm or of being
                  better off dead. That matters more than any score on this page, and it
                  is worth talking to someone about right now.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <a
                    href="tel:14416"
                    className="rounded-full bg-red-600 px-4 py-3 text-center font-semibold text-white"
                  >
                    Call Tele-MANAS (14416)
                  </a>
                  <a
                    href="tel:18005990019"
                    className="rounded-full border border-red-300 bg-white px-4 py-3 text-center font-semibold text-red-800"
                  >
                    Call KIRAN (1800-599-0019)
                  </a>
                </div>
                <p className="mt-3 text-xs text-red-800">
                  Both lines are free, confidential, and open 24/7.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-neutral-100">
            <p className="text-xs text-neutral-500">PHQ-9 (0-27)</p>
            <p className="text-3xl font-bold text-indigo-700 mt-2">{phqScore}</p>
            <p className="text-sm text-neutral-700 mt-1">Depression: {normalizeLabel(phqSeverity)}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-neutral-100">
            <p className="text-xs text-neutral-500">GAD-7 (0-21)</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">{gadScore}</p>
            <p className="text-sm text-neutral-700 mt-1">Anxiety: {normalizeLabel(gadSeverity)}</p>
          </div>
        </div>

        <div className="mt-5 bg-white rounded-3xl p-6 shadow-lg border border-neutral-100">
          <div className="flex items-start gap-3">
            {overallRisk === "high" ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">Overall Screening Level: {overallRisk.toUpperCase()}</h2>
              <p className="text-neutral-600 mt-2">{recommendation}</p>
            </div>
          </div>
        </div>

        {overallRisk === "high" && (
          <div className="mt-5 bg-red-50 rounded-3xl p-6 shadow-lg border border-red-200">
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
          </div>
        )}

        <div className="mt-5 bg-white rounded-3xl p-6 shadow-lg border border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-800">Score Bands</h3>
          <div className="grid sm:grid-cols-2 gap-4 mt-3 text-sm text-neutral-700">
            <div>
              <p className="font-medium">PHQ-9</p>
              <p>0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-19 Moderately Severe, 20-27 Severe</p>
            </div>
            <div>
              <p className="font-medium">GAD-7</p>
              <p>0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-21 Severe</p>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-4">
            This tool is for screening only and does not replace clinical diagnosis.
          </p>
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-3 pb-8">
          <button
            onClick={() => navigate("/manual-assessment")}
            className="rounded-full border border-neutral-300 py-3 font-medium text-neutral-700"
          >
            Retake Questionnaire
          </button>
          <button
            onClick={() => navigate("/")}
            className="rounded-full bg-indigo-600 text-white py-3 font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
