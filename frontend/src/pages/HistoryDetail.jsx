import { ArrowRight, Clock, CookingPot, FileText } from "lucide-react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SafetyWarning from "../components/SafetyWarning.jsx";
import { getWasteBatch } from "../api/wasteApi";
import { getCookingSession } from "../api/recipeApi";
import { useApp } from "../context/AppContext.jsx";

export default function HistoryDetail() {
  const { analysisId } = useParams();
  const { language } = useApp();
  const copy = detailCopy[language] || detailCopy.en;
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [analysis, setAnalysis] = useState(null);
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      setStatus("loading");
      setError("");
      try {
        const [analysisResult, sessionResult] = await Promise.all([
          getWasteBatch(analysisId),
          sessionId ? getCookingSession(sessionId) : Promise.resolve(null),
        ]);
        if (!isMounted) return;
        setAnalysis(analysisResult);
        setSession(sessionResult);
        setStatus("ready");
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.response?.data?.detail || requestError.message);
        setStatus("error");
      }
    }

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [analysisId, sessionId]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      {status === "loading" && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}
      {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
      {status === "ready" && (
        <>
          {session && (
            <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
              <h2 className="flex items-center gap-2 text-xl font-bold text-forest-900">
                <CookingPot size={20} />
                {session.recommendation_name}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Mini label={copy.status} value={copy.statusLabels[session.status] || session.status} fallback={copy.none} />
                <Mini label={copy.currentStep} value={session.status === "finished" ? copy.completed : session.current_step || 1} fallback={copy.none} />
                <Mini label={copy.started} value={new Date(session.started_at).toLocaleString()} fallback={copy.none} />
              </div>
              {session.problem_note && <SafetyWarning>{session.problem_note}</SafetyWarning>}
              {session.status === "started" && (
                <Button as={Link} to={`/recipes/${session.recommendation_id}/start?sessionId=${session.id}`} className="mt-5">
                  {copy.continueCooking} <ArrowRight size={17} />
                </Button>
              )}
            </section>
          )}

          <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-xl font-bold text-forest-900">
              <FileText size={20} />
              {copy.analysis} #{analysis.id}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Mini label={copy.inputType} value={analysis.input_type} fallback={copy.none} />
              <Mini label={copy.safety} value={analysis.safety_level?.replaceAll("_", " ")} fallback={copy.none} />
              <Mini label={copy.created} value={new Date(analysis.created_at).toLocaleString()} fallback={copy.none} />
            </div>
            <h3 className="mt-5 font-bold text-forest-900">{copy.detectedLeftovers}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.items?.map((item) => (
                <span key={item.id || item.label} className="rounded-full bg-earth-50 px-3 py-1.5 text-sm text-ink/70">
                  {item.display_name}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-xl font-bold text-forest-900">
              <Clock size={20} />
              {copy.recipeMatches}
            </h2>
            <div className="mt-4 grid gap-3">
              {analysis.recommendations?.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-lg bg-earth-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-forest-900">{item.recipe_name}</p>
                    <p className="mt-1 text-sm text-ink/60">{copy.recipeFit}</p>
                  </div>
                  <Button as={Link} to={`/recipes/${item.id}`} variant="secondary" className="min-h-9 px-3 py-1.5">
                    {copy.viewRecipe}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Mini({ label, value, fallback = "None" }) {
  return (
    <div className="rounded-lg bg-earth-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink/45">{label}</p>
      <p className="mt-1 font-bold text-forest-900">{value || fallback}</p>
    </div>
  );
}

const detailCopy = {
  en: {
    eyebrow: "History detail",
    title: "Saved leftover activity",
    description: "Review the analysis, recipe matches, and cooking progress connected to this history item.",
    loadingTitle: "Loading history detail",
    loadingMessage: "Fetching analysis and progress records.",
    errorTitle: "History detail error",
    status: "Status",
    currentStep: "Current step",
    started: "Started",
    completed: "Completed",
    continueCooking: "Continue Cooking",
    analysis: "Analysis",
    inputType: "Input type",
    safety: "Safety",
    created: "Created",
    detectedLeftovers: "Detected leftovers",
    recipeMatches: "Recipe matches",
    recipeFit: "Matches your leftovers",
    viewRecipe: "View recipe",
    none: "None",
    statusLabels: {
      finished: "Finished",
      stopped: "Stopped",
      started: "Started",
    },
  },
  id: {
    eyebrow: "Detail riwayat",
    title: "Aktivitas leftover tersimpan",
    description: "Tinjau analisis, kecocokan resep, dan progres memasak yang terhubung dengan riwayat ini.",
    loadingTitle: "Memuat detail riwayat",
    loadingMessage: "Mengambil catatan analisis dan progres.",
    errorTitle: "Error detail riwayat",
    status: "Status",
    currentStep: "Langkah saat ini",
    started: "Dimulai",
    completed: "Selesai",
    continueCooking: "Lanjutkan Memasak",
    analysis: "Analisis",
    inputType: "Tipe input",
    safety: "Keamanan",
    created: "Dibuat",
    detectedLeftovers: "Leftover terdeteksi",
    recipeMatches: "Kecocokan resep",
    recipeFit: "Cocok dengan sisa makanan Anda",
    viewRecipe: "Lihat resep",
    none: "Tidak ada",
    statusLabels: {
      finished: "Selesai",
      stopped: "Berhenti",
      started: "Dimulai",
    },
  },
};
