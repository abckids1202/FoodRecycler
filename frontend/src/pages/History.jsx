import { CalendarDays, ChefHat, Download, Eye, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { useEffect, useMemo, useState } from "react";
import { getWasteHistory } from "../api/wasteApi";
import { getUserCookingSessions } from "../api/recipeApi";
import { useApp } from "../context/AppContext.jsx";

export default function History() {
  const { user, language } = useApp();
  const copy = historyCopy[language] || historyCopy.id;
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      if (!user?.id) {
        setRows([]);
        setStatus("ready");
        return;
      }
      setStatus("loading");
      setError("");
      try {
        const [analyses, sessions] = await Promise.all([
          getWasteHistory(user.id),
          getUserCookingSessions(user.id),
        ]);
        if (!isMounted) return;
        const analysisRows = analyses.map((analysis) => ({
          id: `analysis-${analysis.id}`,
          rawId: analysis.id,
          date: analysis.created_at,
          kind: "analysis",
          status: "not_started",
          title: analysis.recommendations?.[0]?.recipe_name || copy.safetyCheck,
          leftovers: (analysis.items?.map((item) => item.display_name) || []).join(", ") || copy.noDetectedLeftovers,
          note: `${analysis.recommendations?.length || 0} ${copy.recipeIdeas}`,
          href: `/history/${analysis.id}`,
        }));
        const sessionRows = sessions.map((session) => ({
          id: `session-${session.id}`,
          rawId: session.id,
          date: session.started_at,
          kind: "session",
          status: session.status,
          title: session.recommendation_name,
          leftovers: session.problem_note || copy.cookingSession(session.id),
          note: session.status === "finished" ? copy.completed : session.status === "stopped" ? `${copy.stoppedBecause}: ${session.problem_note || copy.noNote}` : `${copy.step} ${session.current_step || 1}`,
          href: session.status === "started" ? `/recipes/${session.recommendation_id}/start?sessionId=${session.id}` : `/history/${session.analysis_id}?sessionId=${session.id}`,
          recommendationId: session.recommendation_id,
        }));
        setRows([...sessionRows, ...analysisRows].sort((a, b) => new Date(b.date) - new Date(a.date)));
        setStatus("ready");
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.response?.data?.detail || requestError.message);
        setStatus("error");
      }
    }

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const filteredRows = useMemo(() => {
    if (tab === "all") return rows;
    if (tab === "not_started") return rows.filter((row) => row.status === "not_started");
    return rows.filter((row) => row.status === tab);
  }, [rows, tab]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-forest-900 p-6 text-white shadow-soft sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-food-yellow">{copy.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">{copy.description}</p>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {copy.tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`focus-ring min-h-12 shrink-0 rounded-2xl px-4 text-sm font-black transition ${tab === item.value ? "bg-forest-900 text-white" : "bg-white text-forest-900 hover:bg-mint"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {status === "loading" && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}
      {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
      {status === "ready" && !filteredRows.length && <EmptyState title={copy.emptyTitle} message={copy.emptyMessage} />}
      {status === "ready" && Boolean(filteredRows.length) && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((row) => (
            <HistoryCard key={row.id} row={row} copy={copy} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ row, copy }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(row.status)}`}>
          {copy.statusLabels[row.status] || row.status}
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-ink/55">
          <CalendarDays size={14} />
          {new Date(row.date).toLocaleDateString()}
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-black leading-tight text-forest-900">{row.title}</h2>
      <p className="mt-2 line-clamp-2 text-base leading-7 text-ink/65">{row.leftovers}</p>
      <p className="mt-4 rounded-2xl bg-earth-50 p-3 text-sm font-bold leading-6 text-ink/70">{row.note}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button as={Link} to={row.href} className="min-h-11 rounded-2xl px-3">
          <Eye size={16} /> {row.status === "started" ? copy.continue : copy.view}
        </Button>
        {row.recommendationId && (
          <Button as={Link} to={`/recipes/${row.recommendationId}`} variant="secondary" className="min-h-11 rounded-2xl px-3">
            <RotateCcw size={16} /> {copy.cookAgain}
          </Button>
        )}
        <Button as={Link} to="/start" variant="secondary" className="min-h-11 rounded-2xl px-3">
          <ChefHat size={16} /> {copy.newRecipe}
        </Button>
      </div>
    </Card>
  );
}

function statusClass(status) {
  if (status === "finished") return "bg-mint text-forest-900";
  if (status === "stopped") return "bg-red-50 text-red-800";
  if (status === "started") return "bg-food-yellow/70 text-forest-900";
  return "bg-earth-100 text-ink/70";
}

const historyCopy = {
  en: {
    eyebrow: "Saved meals",
    title: "Cooking history",
    description: "See leftovers you checked, recipes you started, and meals you completed.",
    tabs: [
      { value: "all", label: "All" },
      { value: "finished", label: "Finished" },
      { value: "stopped", label: "Stopped" },
      { value: "not_started", label: "Not cooked" },
      { value: "started", label: "In progress" },
    ],
    safetyCheck: "Leftover safety check",
    noDetectedLeftovers: "No detected leftovers",
    recipeIdeas: "recipe ideas",
    completed: "Finished and saved",
    step: "Step",
    stoppedBecause: "Stopped because",
    noNote: "no note",
    cookingSession: (id) => `Cooking session #${id}`,
    continue: "Continue",
    view: "View",
    cookAgain: "Cook again",
    newRecipe: "New",
    loadingTitle: "Loading history",
    loadingMessage: "Fetching your previous leftover checks.",
    errorTitle: "History error",
    emptyTitle: "No history yet",
    emptyMessage: "Start from a photo or write the leftovers you have.",
    statusLabels: { finished: "Finished", stopped: "Stopped", started: "In progress", not_started: "Not cooked" },
  },
  id: {
    eyebrow: "Riwayat",
    title: "Riwayat masakan",
    description: "Lihat sisa makanan yang dicek, resep yang dimulai, dan masakan yang selesai.",
    tabs: [
      { value: "all", label: "Semua" },
      { value: "finished", label: "Selesai" },
      { value: "stopped", label: "Berhenti" },
      { value: "not_started", label: "Belum dimasak" },
      { value: "started", label: "Berjalan" },
    ],
    safetyCheck: "Cek keamanan sisa makanan",
    noDetectedLeftovers: "Belum ada bahan terdeteksi",
    recipeIdeas: "ide resep",
    completed: "Selesai dan tersimpan",
    step: "Langkah",
    stoppedBecause: "Berhenti karena",
    noNote: "tanpa catatan",
    cookingSession: (id) => `Sesi memasak #${id}`,
    continue: "Lanjutkan",
    view: "Lihat",
    cookAgain: "Masak lagi",
    newRecipe: "Baru",
    loadingTitle: "Memuat riwayat",
    loadingMessage: "Mengambil riwayat sisa makanan.",
    errorTitle: "Error riwayat",
    emptyTitle: "Belum ada riwayat",
    emptyMessage: "Mulai dari foto atau tulis sisa makanan Anda.",
    statusLabels: { finished: "Selesai", stopped: "Berhenti", started: "Berjalan", not_started: "Belum dimasak" },
  },
};
