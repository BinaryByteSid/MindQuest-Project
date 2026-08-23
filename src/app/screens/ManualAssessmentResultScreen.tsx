import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router";
import { AlertTriangle, ArrowLeft, ClipboardCheck, ShieldCheck } from "lucide-react";

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

  const phqScore = Number(location.state?.phqScore ?? 0);
  const gadScore = Number(location.state?.gadScore ?? 0);

  const phqSeverity = getPhqSeverity(phqScore);
  const gadSeverity = getGadSeverity(gadScore);

  const overallRisk =
    phqScore >= 20 || gadScore >= 15
      ? "high"
      : phqScore >= 10 || gadScore >= 10
      ? "moderate"
      : "low";

  const recommendation =
    overallRisk === "high"
      ? "Please seek professional support soon. If you feel unsafe, contact emergency support immediately."
      : overallRisk === "moderate"
      ? "Consider speaking with a mental health professional for a full evaluation and support plan."
      : "Your scores are in a lower range. Continue self-care and monitor changes over time.";

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
