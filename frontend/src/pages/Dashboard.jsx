import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Check, Copy, MessageCircle, Send } from "lucide-react";
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
  const [copiedWebhook, setCopiedWebhook] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "https://foodrecycler.onrender.com").replace(/\/$/, "");
  const webhookLinks = [
    {
      id: "telegram",
      icon: Send,
      label: "Telegram webhook",
      value: `${apiBaseUrl}/api/bots/telegram/webhook`,
    },
    {
      id: "telegram-set",
      icon: Send,
      label: "Telegram set webhook",
      value: `${apiBaseUrl}/api/bots/telegram/set-webhook`,
    },
    {
      id: "whatsapp",
      icon: MessageCircle,
      label: "WhatsApp callback URL",
      value: `${apiBaseUrl}/api/bots/whatsapp/webhook`,
    },
  ];

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
          reminderReactivationRate: summaryResult.reminder_reactivation_rate,
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
      <section className="rounded-[2rem] border border-forest-900/10 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-forest-700">{copy.webhookEyebrow}</p>
            <h2 className="mt-1 text-2xl font-black text-forest-900">{copy.webhookTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{copy.webhookText}</p>
          </div>
          <span className="rounded-full bg-mint px-4 py-2 text-xs font-black text-forest-900">{copy.webhookBadge}</span>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {webhookLinks.map((item) => (
            <WebhookCard
              key={item.id}
              item={item}
              copied={copiedWebhook === item.id}
              copyLabel={copy.copyWebhook}
              copiedLabel={copy.copiedWebhook}
              onCopy={async () => {
                await navigator.clipboard.writeText(item.value);
                setCopiedWebhook(item.id);
                window.setTimeout(() => setCopiedWebhook(""), 1600);
              }}
            />
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold leading-5 text-ink/55">{copy.webhookSafety}</p>
      </section>
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
        <MiniInsight label={copy.reminderReactivationRate} value={`${summary.reminderReactivationRate}%`} />
      </div>
    </section>
  );
}

function WebhookCard({ item, copied, copyLabel, copiedLabel, onCopy }) {
  const Icon = item.icon;
  return (
    <article className="rounded-2xl border border-forest-900/10 bg-earth-50 p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-900 text-white">
          <Icon size={17} />
        </span>
        <h3 className="font-black text-forest-900">{item.label}</h3>
      </div>
      <p className="mt-3 break-all rounded-xl bg-white p-3 text-xs font-semibold leading-5 text-ink/70">
        {item.value}
      </p>
      <button
        type="button"
        onClick={onCopy}
        className="focus-ring mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-forest-900 px-4 text-sm font-black text-white"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? copiedLabel : copyLabel}
      </button>
    </article>
  );
}

const dashboardCopy = {
  en: {
    eyebrow: "Analytics",
    webhookEyebrow: "Bot setup",
    webhookTitle: "Webhook URLs for Telegram and WhatsApp",
    webhookText: "Use these public backend URLs when connecting the chat bots. They are shown here so the team can copy them quickly during setup or demo checks.",
    webhookBadge: "Developer info",
    webhookSafety: "Do not paste API tokens here. Keep Telegram tokens and WhatsApp access tokens only in Render environment variables.",
    copyWebhook: "Copy URL",
    copiedWebhook: "Copied",
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
    reminderReactivationRate: "Reminder reactivation",
  },
  id: {
    eyebrow: "Analitik",
    webhookEyebrow: "Setup bot",
    webhookTitle: "URL webhook Telegram dan WhatsApp",
    webhookText: "Gunakan URL backend publik ini saat menghubungkan bot chat. Ditampilkan di sini supaya tim mudah menyalin saat setup atau pengecekan demo.",
    webhookBadge: "Info developer",
    webhookSafety: "Jangan tempel token API di sini. Simpan token Telegram dan access token WhatsApp hanya di environment variables Render.",
    copyWebhook: "Salin URL",
    copiedWebhook: "Tersalin",
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
    reminderReactivationRate: "Reaktivasi pengingat",
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
