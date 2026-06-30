import { ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import DetectionCard from "../components/DetectionCard.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import SafetyNotice from "../components/SafetyNotice.jsx";
import { useApp } from "../context/AppContext.jsx";
import { clarifyWasteBatch, getWasteBatch } from "../api/wasteApi";
import { localizeRecipeNote } from "../utils/recipeDisplay";

export default function AnalysisResult() {
  const { batchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useApp();
  const assistantReply = location.state?.assistantReply;
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [clarification, setClarification] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const copy = analysisCopy[language] || analysisCopy.en;

  useEffect(() => {
    let isMounted = true;
    async function loadAnalysis() {
      setStatus("loading");
      setError("");
      try {
        const result = await getWasteBatch(batchId);
        if (!isMounted) return;
        setAnalysis(result);
        setStatus("ready");
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.response?.data?.detail || requestError.message);
        setStatus("error");
      }
    }

    loadAnalysis();
    return () => {
      isMounted = false;
    };
  }, [batchId]);

  const detections =
    analysis?.items?.map((item) => ({
      id: item.id,
      label: item.display_name || item.label,
      confidence: item.confidence,
      estimated_area_percent: Math.round((item.confidence || 0.5) * 100),
      is_contaminant: item.is_safety_flag,
      source: item.source || analysis?.input_type || "text",
    })) || [];
  const safetyText = analysis?.safety_notes?.length
    ? analysis.safety_notes.map((note) => localizeRecipeNote(note, language)).join(" ")
    : copy.defaultSafety;

  async function handleConfirm() {
    setIsConfirming(true);
    setError("");
    try {
      if (clarification.trim()) {
        await clarifyWasteBatch(batchId, clarification.trim());
      }
      navigate(`/recommendations/${batchId}`, {
        state: { clarification: clarification.trim() },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-forest-900 p-6 text-white shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-food-yellow">{copy.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">{copy.description}</p>
          </div>
          <Button type="button" onClick={handleConfirm} disabled={status !== "ready" || isConfirming} className="min-h-12 rounded-2xl">
            {isConfirming ? copy.processing : copy.primaryAction} <ArrowRight size={17} />
          </Button>
        </div>
      </section>

      {status === "loading" && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}
      {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
      {status === "ready" && error && <ErrorState title={copy.errorTitle} message={error} />}
      {status === "ready" && (
        <div className="space-y-5">
          <SafetyNotice title={copy.safetyTitle}>
            {safetyText}
          </SafetyNotice>

          {assistantReply && (
            <section className="rounded-[2rem] border border-forest-900/10 bg-white p-5 shadow-soft">
              <h2 className="font-black text-forest-900">{copy.summaryTitle}</h2>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-ink/70 md:grid-cols-2">
                {stripMarkdown(assistantReply).split("\n").filter(Boolean).slice(0, 6).map((line, index) => (
                  <p key={`${line}-${index}`} className="rounded-2xl bg-earth-50 p-3">{line}</p>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            {detections.map((item) => (
              <DetectionCard key={item.id} item={item} />
            ))}
          </div>

          <section className="rounded-[2rem] border border-forest-900/10 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
                <MessageSquare size={19} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-forest-900">{copy.confirmTitle}</h2>
                <p className="mt-1 text-sm leading-6 text-ink/60">{copy.confirmDescription}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-forest-900/10 bg-earth-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-700">{copy.detectedLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {detections.length ? (
                  detections.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-2 rounded-full border border-forest-900/10 bg-white px-3 py-1.5 text-sm font-semibold text-forest-900"
                    >
                      <CheckCircle2 size={15} className="text-forest-700" />
                      {item.label}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-ink/60">{copy.noDetections}</span>
                )}
              </div>
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-bold text-forest-900">{copy.textareaLabel}</span>
              <textarea
                value={clarification}
                onChange={(event) => setClarification(event.target.value)}
                rows={5}
                className="focus-ring mt-2 w-full resize-none rounded-2xl border border-forest-900/10 bg-white p-4 text-sm leading-6 text-ink placeholder:text-ink/35"
                placeholder={copy.placeholder}
              />
            </label>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              {copy.helper}
            </p>
            <Button type="button" className="mt-5 min-h-12 rounded-2xl" onClick={handleConfirm} disabled={isConfirming}>
              {isConfirming ? copy.processing : copy.primaryAction}
              <ArrowRight size={17} />
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}

function stripMarkdown(text = "") {
  return text.replace(/\*\*/g, "").replace(/\*/g, "");
}

const analysisCopy = {
  en: {
    eyebrow: "Step 2 of 4",
    title: "Food that FoodLoop noticed",
    description: "Check whether the ingredients look right. Add anything missing before recipe ideas appear.",
    primaryAction: "Confirm and get recipe ideas",
    processing: "Updating analysis...",
    loadingTitle: "Loading analysis",
    loadingMessage: "Reading detection results from the backend.",
    errorTitle: "Analysis backend error",
    safetyTitle: "Safety reminder",
    summaryTitle: "AI safety summary",
    defaultSafety: "Only reuse leftovers as food when they are fresh, clean, stored safely, and free from contamination.",
    confirmTitle: "Are these ingredients correct?",
    confirmDescription: "Are these materials correct? If the AI missed an ingredient, sauce, topping, or important condition, write it here.",
    detectedLabel: "Found ingredients",
    noDetections: "No materials were detected yet.",
    textareaLabel: "Anything missing?",
    placeholder: "Example: There is also fried tempeh, sambal, and the rice has been in the fridge since last night.",
    helper: "Your note will update the analysis and refresh the recipe matches before the recommendation page opens.",
  },
  id: {
    eyebrow: "Langkah 2 dari 4",
    title: "Makanan yang terlihat",
    description: "Cek apakah bahan yang ditemukan sudah benar. Tambahkan yang terlewat sebelum ide resep muncul.",
    primaryAction: "Konfirmasi dan lihat ide resep",
    processing: "Memperbarui analisis...",
    loadingTitle: "Memuat analisis",
    loadingMessage: "Mengambil hasil deteksi dari backend.",
    errorTitle: "Error backend analisis",
    safetyTitle: "Pengingat keamanan",
    summaryTitle: "Ringkasan keamanan AI",
    defaultSafety: "Gunakan leftover sebagai makanan hanya jika masih segar, bersih, tersimpan aman, dan tidak ada tanda kontaminasi.",
    confirmTitle: "Apakah bahan ini benar?",
    confirmDescription: "Apakah bahan ini sudah benar? Kalau AI melewatkan bahan, saus, topping, atau kondisi penting, tulis di sini.",
    detectedLabel: "Bahan yang ditemukan",
    noDetections: "Belum ada bahan yang terdeteksi.",
    textareaLabel: "Ada yang terlewat?",
    placeholder: "Contoh: Ada juga tempe goreng, sambal, dan nasi disimpan di kulkas sejak tadi malam.",
    helper: "Catatanmu akan memperbarui analisis dan menyegarkan rekomendasi sebelum halaman resep dibuka.",
  },
};
