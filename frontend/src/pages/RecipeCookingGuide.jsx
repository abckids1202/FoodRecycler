import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Flag, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SafetyWarning from "../components/SafetyWarning.jsx";
import { finishCookingSession, getCookingSession, getRecommendationDetail, startCookingSession, stopCookingSession, updateCookingSessionProgress } from "../api/recipeApi";
import { useApp } from "../context/AppContext.jsx";
import { buildCookingMaterials, localizeRecipeNote } from "../utils/recipeDisplay";

export default function RecipeCookingGuide() {
  const { recipeId } = useParams();
  const [searchParams] = useSearchParams();
  const resumeSessionId = searchParams.get("sessionId");
  const navigate = useNavigate();
  const { user, language } = useApp();
  const copy = cookingCopy[language] || cookingCopy.en;
  const [detail, setDetail] = useState(null);
  const [session, setSession] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState("materials");
  const [problemNote, setProblemNote] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      setStatus("loading");
      setError("");
      try {
        const [result, existingSession] = await Promise.all([
          getRecommendationDetail(recipeId),
          resumeSessionId ? getCookingSession(resumeSessionId) : Promise.resolve(null),
        ]);
        if (!isMounted) return;
        setDetail(result);
        if (existingSession?.status === "started") {
          setSession(existingSession);
          setStepIndex(Math.max((existingSession.current_step || 1) - 1, 0));
          setPhase("steps");
        }
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
  }, [recipeId, resumeSessionId]);

  const materials = useMemo(() => {
    return buildCookingMaterials(detail, language);
  }, [detail, language]);

  const steps = (detail?.recipe?.steps || []).map((step) => localizeRecipeNote(step, language));
  const requiredMaterials = materials.filter((item) => item.required);
  const requiredMaterialsReady = requiredMaterials.length === 0 || requiredMaterials.every((item) => checkedItems[item.label]);

  async function handleStart() {
    try {
      const result = await startCookingSession(recipeId, { user_id: user?.id || null });
      setSession(result);
      setStepIndex(0);
      setPhase("starting");
      window.setTimeout(() => setPhase("steps"), 900);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
    }
  }

  async function moveToStep(nextIndex) {
    const boundedIndex = Math.max(0, Math.min(nextIndex, steps.length - 1));
    setStepIndex(boundedIndex);
    if (!session?.id) return;
    try {
      const updated = await updateCookingSessionProgress(session.id, { current_step: boundedIndex + 1 });
      setSession(updated);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
    }
  }

  async function handleFinish() {
    if (!session?.id) return;
    try {
      await finishCookingSession(session.id, { current_step: steps.length });
      setPhase("finished");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
    }
  }

  async function handleStop() {
    if (!session?.id) return;
    try {
      await stopCookingSession(session.id, { current_step: stepIndex + 1, problem_note: problemNote || copy.noNote });
      setPhase("stopped");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-forest-900 p-6 text-white shadow-soft sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-food-yellow">{copy.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{detail?.recipe_name || copy.startMaking}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">{copy.description}</p>
      </section>

      {status === "loading" && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}
      {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
      {error && status !== "error" && <ErrorState title={copy.actionErrorTitle} message={error} />}

      {status === "ready" && phase === "materials" && (
        <section className="rounded-[2rem] border border-forest-900/10 bg-white p-5 shadow-soft sm:p-7">
          <h2 className="text-3xl font-black text-forest-900">{copy.confirmTitle}</h2>
          <p className="mt-2 text-lg leading-8 text-ink/65">
            {copy.confirmText}
          </p>

          <SafetyWarning>
            {copy.safetyWarning}
          </SafetyWarning>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {materials.map((item) => (
              <label key={`${item.source}-${item.label}`} className="flex min-h-14 items-center gap-3 rounded-2xl border border-forest-900/10 bg-earth-50 px-4 py-3 text-base font-bold text-forest-900">
                <input
                  type="checkbox"
                  checked={Boolean(checkedItems[item.label])}
                  onChange={(event) => setCheckedItems((current) => ({ ...current, [item.label]: event.target.checked }))}
                  className="h-5 w-5 accent-forest-700"
                />
                <span className="min-w-0">
                  {item.label}
                  {!item.required && <span className="ml-2 text-xs font-medium text-ink/45">{copy.optionalBadge}</span>}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-ink/60">{copy.requiredOnlyHint}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" className="min-h-14 rounded-2xl text-base" onClick={handleStart} disabled={!requiredMaterialsReady}>
              <CheckCircle2 size={18} />
              {copy.startCooking}
            </Button>
            <Button type="button" variant="secondary" className="min-h-14 rounded-2xl text-base" onClick={() => navigate(`/recipes/${recipeId}`)}>
              {copy.backToPreview}
            </Button>
          </div>
        </section>
      )}

      {status === "ready" && phase === "starting" && (
        <section className="rounded-[2rem] border border-forest-900/10 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-mint">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-forest-900/15 border-t-forest-900" />
          </div>
          <h2 className="mt-5 text-3xl font-black text-forest-900">{copy.startingTitle}</h2>
          <p className="mx-auto mt-2 max-w-xl text-base leading-7 text-ink/65">{copy.startingText}</p>
        </section>
      )}

      {status === "ready" && phase === "steps" && (
        <section className="rounded-[2rem] border border-forest-900/10 bg-white p-5 shadow-soft sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-black text-forest-700">{copy.step} {stepIndex + 1} {copy.of} {steps.length}</p>
              <h2 className="mt-1 text-4xl font-black text-forest-900">{stepIndex === 0 ? copy.safetyCheck : `${copy.step} ${stepIndex + 1}`}</h2>
            </div>
            <span className="rounded-full bg-mint px-4 py-2 text-sm font-black text-forest-900">
              {copy.session} #{session?.id}
            </span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-earth-100">
            <div className="h-full rounded-full bg-forest-900 transition-all" style={{ width: `${((stepIndex + 1) / Math.max(steps.length, 1)) * 100}%` }} />
          </div>

          <div className="mt-6 rounded-[2rem] bg-earth-50 p-6 text-2xl font-semibold leading-10 text-ink/85">
            {steps[stepIndex] || copy.noStep}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" variant="secondary" className="min-h-14 rounded-2xl text-base" onClick={() => moveToStep(stepIndex - 1)} disabled={stepIndex === 0}>
              <ChevronLeft size={18} />
              {copy.previous}
            </Button>
            {stepIndex < steps.length - 1 ? (
              <Button type="button" className="min-h-14 rounded-2xl text-base" onClick={() => moveToStep(stepIndex + 1)}>
                {copy.nextStep}
                <ChevronRight size={18} />
              </Button>
            ) : (
              <Button type="button" className="min-h-14 rounded-2xl text-base" onClick={handleFinish}>
                <Flag size={18} />
                {copy.finishRecipe}
              </Button>
            )}
          </div>

          <div className="mt-6 rounded-[2rem] border border-red-200 bg-red-50 p-5">
            <h3 className="flex items-center gap-2 font-bold text-red-800">
              <AlertTriangle size={18} />
              {copy.needStop}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {copy.stopReasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setProblemNote(reason)}
                  className="focus-ring rounded-full bg-white px-3 py-2 text-sm font-bold text-red-800"
                >
                  {reason}
                </button>
              ))}
            </div>
            <textarea
              value={problemNote}
              onChange={(event) => setProblemNote(event.target.value)}
              className="focus-ring mt-3 min-h-24 w-full resize-y rounded-2xl border border-red-200 bg-white px-4 py-3 text-base"
              placeholder={copy.stopPlaceholder}
            />
            <Button type="button" variant="warning" className="mt-3 min-h-14 rounded-2xl text-base" onClick={handleStop}>
              <XCircle size={18} />
              {copy.stopAndSave}
            </Button>
          </div>
        </section>
      )}

      {phase === "finished" && (
        <CompletionCard
          title={copy.finishedTitle}
          message={copy.finishedMessage}
          actionLabel={copy.backToDashboard}
          onAction={() => navigate("/dashboard")}
        />
      )}

      {phase === "stopped" && (
        <CompletionCard
          title={copy.stoppedTitle}
          message={copy.stoppedMessage}
          actionLabel={copy.backToRecipe}
          onAction={() => navigate(`/recipes/${recipeId}`)}
        />
      )}
    </div>
  );
}

const cookingCopy = {
  en: {
    startMaking: "Start Making",
    eyebrow: "Cooking guide",
    description: "Confirm your materials, then follow the recipe one step at a time.",
    loadingTitle: "Loading cooking guide",
    loadingMessage: "Preparing materials and steps.",
    errorTitle: "Cooking guide error",
    actionErrorTitle: "Action failed",
    confirmTitle: "Confirm materials are ready",
    confirmText: "Confirm the required ingredients first. Optional ingredients can be skipped if they are unavailable.",
    safetyWarning: "FoodLoop uses AI and can make mistakes. Double-check freshness, allergies, and food safety before cooking.",
    startCooking: "Start Cooking",
    startingTitle: "Preparing your cooking steps",
    startingText: "FoodLoop is opening a cooking session and arranging the recipe one step at a time.",
    optionalBadge: "optional",
    requiredOnlyHint: "Only required ingredients must be checked before starting. Optional ingredients are suggestions.",
    backToPreview: "Back to Preview",
    step: "Step",
    of: "of",
    safetyCheck: "Safety check",
    session: "Session",
    noStep: "No step available.",
    previous: "Previous",
    nextStep: "Next Step",
    finishRecipe: "Finish Recipe",
    needStop: "Need to stop?",
    stopPlaceholder: "What happened? Example: smell changed, missing ingredient, texture looked slimy, unsure about storage.",
    stopAndSave: "Stop and Save Problem",
    stopReasons: ["Missing ingredient", "Food seems spoiled", "No time", "Too difficult", "Other"],
    noNote: "No note provided.",
    finishedTitle: "Recipe finished",
    finishedMessage: "Nice. This completed recipe has been saved to your cooking history.",
    backToDashboard: "Back to Summary",
    stoppedTitle: "Cooking stopped",
    stoppedMessage: "The issue was saved. For leftover safety, stopping is the right move when something feels off.",
    backToRecipe: "Back to Recipe",
  },
  id: {
    startMaking: "Mulai Memasak",
    eyebrow: "Panduan memasak",
    description: "Konfirmasi bahan, lalu ikuti resep satu langkah demi satu langkah.",
    loadingTitle: "Memuat panduan memasak",
    loadingMessage: "Menyiapkan bahan dan langkah.",
    errorTitle: "Error panduan memasak",
    actionErrorTitle: "Aksi gagal",
    confirmTitle: "Konfirmasi bahan sudah siap",
    confirmText: "Konfirmasi bahan wajib terlebih dahulu. Bahan opsional boleh dilewati jika tidak tersedia.",
    safetyWarning: "FoodLoop memakai AI dan bisa keliru. Periksa ulang kesegaran, alergi, dan keamanan makanan sebelum memasak.",
    startCooking: "Mulai Memasak",
    startingTitle: "Menyiapkan langkah memasak",
    startingText: "FoodLoop sedang membuka sesi memasak dan menyusun resep satu langkah demi satu langkah.",
    optionalBadge: "opsional",
    requiredOnlyHint: "Hanya bahan wajib yang harus dicentang sebelum mulai. Bahan opsional bersifat saran.",
    backToPreview: "Kembali ke Pratinjau",
    step: "Langkah",
    of: "dari",
    safetyCheck: "Cek keamanan",
    session: "Sesi",
    noStep: "Tidak ada langkah tersedia.",
    previous: "Sebelumnya",
    nextStep: "Langkah Berikutnya",
    finishRecipe: "Selesaikan Resep",
    needStop: "Perlu berhenti?",
    stopPlaceholder: "Apa yang terjadi? Contoh: bau berubah, bahan kurang, tekstur berlendir, ragu soal penyimpanan.",
    stopAndSave: "Berhenti dan Simpan Masalah",
    stopReasons: ["Bahan kurang", "Bahan ternyata basi", "Tidak punya waktu", "Resep terlalu sulit", "Lainnya"],
    noNote: "Tidak ada catatan.",
    finishedTitle: "Resep selesai",
    finishedMessage: "Bagus. Resep yang selesai sudah disimpan ke riwayat memasak.",
    backToDashboard: "Kembali ke Ringkasan",
    stoppedTitle: "Memasak dihentikan",
    stoppedMessage: "Masalah sudah disimpan. Untuk keamanan leftover, berhenti adalah pilihan tepat saat ada yang terasa tidak aman.",
    backToRecipe: "Kembali ke Resep",
  },
};

function CompletionCard({ title, message, actionLabel, onAction }) {
  return (
    <section className="rounded-lg border border-forest-900/10 bg-white p-6 text-center shadow-soft">
      <h2 className="text-2xl font-bold text-forest-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink/65">{message}</p>
      <Button type="button" className="mt-5" onClick={onAction}>
        {actionLabel}
      </Button>
    </section>
  );
}
