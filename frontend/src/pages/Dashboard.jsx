import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import DashboardStats from "../components/DashboardStats.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { getDashboardSummary, getMaterialStats, getRecipeStats, getStopReasonStats } from "../api/dashboardApi";
import { useApp } from "../context/AppContext.jsx";

export default function Dashboard() {
  const { t, user, language } = useApp();
  const copy = dashboardCopy[language] || dashboardCopy.en;
  const [summary, setSummary] = useState(null);
  const [materialData, setMaterialData] = useState([]);
  const [recipeData, setRecipeData] = useState([]);
  const [stopReasonData, setStopReasonData] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      setStatus("loading");
      setError("");
      try {
        const [summaryResult, leftoversResult, recipesResult, stopReasonsResult] = await Promise.all([
          getDashboardSummary(user?.id),
          getMaterialStats(user?.id),
          getRecipeStats(user?.id),
          getStopReasonStats(user?.id),
        ]);
        if (!isMounted) return;
        setSummary({
          totalAnalyses: summaryResult.total_analyses,
          foodIdeas: summaryResult.total_food_ideas,
          topMaterial: summaryResult.top_leftover || copy.noneYet,
          recipesStarted: summaryResult.recipes_started,
          recipesFinished: summaryResult.recipes_finished,
          recipesStopped: summaryResult.recipes_stopped,
          completionRate: summaryResult.completion_rate,
          mostCompletedRecipe: summaryResult.most_completed_recipe || copy.noneYet,
          mostStoppedRecipe: summaryResult.most_stopped_recipe || copy.noneYet,
        });
        setMaterialData(leftoversResult);
        setRecipeData(recipesResult);
        setStopReasonData(stopReasonsResult);
        setStatus("ready");
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.response?.data?.detail || requestError.message);
        setStatus("error");
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={t.dashboardTitle}
        description={t.dashboardDescription}
      />
      {status === "loading" && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}
      {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
      {status === "ready" && summary && (
        <>
          <DashboardStats summary={summary} language={language} />
          {summary.totalAnalyses === 0 ? (
            <EmptyState title={copy.emptyTitle} message={copy.emptyMessage} />
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard title={copy.commonLeftovers} data={materialData} />
              <ChartCard title={copy.foodReplacements} data={recipeData} />
              <InsightCard summary={summary} copy={copy} />
              <ChartCard title={copy.stopReasons} data={stopReasonData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InsightCard({ summary, copy }) {
  return (
    <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
      <h2 className="text-lg font-bold text-forest-900">{copy.followThroughTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        {copy.followThroughText}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MiniInsight label={copy.mostCompletedRecipe} value={summary.mostCompletedRecipe} />
        <MiniInsight label={copy.mostStoppedRecipe} value={summary.mostStoppedRecipe} />
        <MiniInsight label={copy.startedSessions} value={summary.recipesStarted} />
        <MiniInsight label={copy.finishedSessions} value={summary.recipesFinished} />
      </div>
    </section>
  );
}

const dashboardCopy = {
  en: {
    eyebrow: "Analytics",
    noneYet: "None yet",
    loadingTitle: "Loading dashboard",
    loadingMessage: "Reading your saved analyses and recommendations.",
    errorTitle: "Dashboard backend error",
    emptyTitle: "No statistics yet",
    emptyMessage: "Send one chat or photo analysis to start building your dashboard.",
    commonLeftovers: "Most common leftovers",
    foodReplacements: "Food replacements suggested",
    stopReasons: "Common stop reasons",
    followThroughTitle: "Cooking follow-through",
    followThroughText: "The dashboard does not just count AI recommendations. It tracks whether users actually cooked the recipe.",
    mostCompletedRecipe: "Most completed recipe",
    mostStoppedRecipe: "Most stopped recipe",
    startedSessions: "Started sessions",
    finishedSessions: "Finished sessions",
  },
  id: {
    eyebrow: "Analitik",
    noneYet: "Belum ada",
    loadingTitle: "Memuat dashboard",
    loadingMessage: "Mengambil analisis dan rekomendasi tersimpan.",
    errorTitle: "Error backend dashboard",
    emptyTitle: "Belum ada statistik",
    emptyMessage: "Kirim satu chat atau analisis foto untuk mulai membangun dashboard.",
    commonLeftovers: "Leftover paling sering",
    foodReplacements: "Pengganti makanan yang disarankan",
    stopReasons: "Alasan berhenti paling umum",
    followThroughTitle: "Tindak lanjut memasak",
    followThroughText: "Dashboard tidak hanya menghitung rekomendasi AI. Dashboard juga melacak apakah pengguna benar-benar memasak resepnya.",
    mostCompletedRecipe: "Resep paling sering selesai",
    mostStoppedRecipe: "Resep paling sering berhenti",
    startedSessions: "Sesi dimulai",
    finishedSessions: "Sesi selesai",
  },
};

function MiniInsight({ label, value }) {
  return (
    <div className="rounded-lg bg-earth-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink/45">{label}</p>
      <p className="mt-1 text-lg font-bold text-forest-900">{value}</p>
    </div>
  );
}

function ChartCard({ title, data }) {
  return (
    <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
      <h2 className="text-lg font-bold text-forest-900">{title}</h2>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dcefe1" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#28774d" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
