import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import HistoryTable from "../components/HistoryTable.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useEffect, useState } from "react";
import { getWasteHistory } from "../api/wasteApi";
import { getUserCookingSessions } from "../api/recipeApi";
import { useApp } from "../context/AppContext.jsx";

export default function History() {
  const { t, user, language } = useApp();
  const copy = historyCopy[language] || historyCopy.en;
  const [rows, setRows] = useState([]);
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
            id: analysis.id,
            date: new Date(analysis.created_at).toLocaleString(),
            type: "analysis",
            typeLabel: copy.analysisType,
            title: analysis.recommendations?.[0]?.recipe_name || copy.safetyCheck,
            description: (analysis.items?.map((item) => item.display_name) || []).join(", ") || copy.noDetectedLeftovers,
            progress: `${analysis.recommendations?.length || 0} ${copy.recipeIdeas}`,
            status: analysis.safety_level?.replaceAll("_", " ") || "reviewed",
            actionHref: `/history/${analysis.id}`,
            actionLabel: copy.open,
          }));
        const sessionRows = sessions.map((session) => ({
          id: session.id,
          date: new Date(session.started_at).toLocaleString(),
          type: "session",
          typeLabel: copy.cookingType,
          title: session.recommendation_name,
          description: session.problem_note || `Recipe session #${session.id}`,
          progress: session.status === "finished" ? copy.completed : `${copy.step} ${session.current_step || 1}`,
          status: session.status,
          actionHref: session.status === "started"
            ? `/recipes/${session.recommendation_id}/start?sessionId=${session.id}`
            : `/history/${session.analysis_id}?sessionId=${session.id}`,
          actionLabel: session.status === "started" ? copy.continue : copy.view,
          actionVariant: session.status === "started" ? "primary" : "secondary",
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={t.historyTitle}
        description={t.historyDescription}
      />
      {status === "loading" && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}
      {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
      {status === "ready" && (rows.length ? <HistoryTable rows={rows} language={language} /> : <EmptyState title={copy.emptyTitle} message={copy.emptyMessage} />)}
    </div>
  );
}

const historyCopy = {
  en: {
    eyebrow: "Saved work",
    analysisType: "Analysis",
    cookingType: "Cooking",
    safetyCheck: "Leftover safety check",
    noDetectedLeftovers: "No detected leftovers",
    recipeIdeas: "recipe ideas",
    open: "Open",
    completed: "Completed",
    step: "Step",
    continue: "Continue",
    view: "View",
    loadingTitle: "Loading history",
    loadingMessage: "Fetching your previous leftover checks.",
    errorTitle: "History backend error",
    emptyTitle: "No analyses yet",
    emptyMessage: "Use chat, upload, or camera to start.",
  },
  id: {
    eyebrow: "Pekerjaan tersimpan",
    analysisType: "Analisis",
    cookingType: "Memasak",
    safetyCheck: "Cek keamanan leftover",
    noDetectedLeftovers: "Belum ada leftover terdeteksi",
    recipeIdeas: "ide resep",
    open: "Buka",
    completed: "Selesai",
    step: "Langkah",
    continue: "Lanjutkan",
    view: "Lihat",
    loadingTitle: "Memuat riwayat",
    loadingMessage: "Mengambil cek leftover sebelumnya.",
    errorTitle: "Error backend riwayat",
    emptyTitle: "Belum ada analisis",
    emptyMessage: "Mulai dengan chat, unggah foto, atau kamera.",
  },
};
