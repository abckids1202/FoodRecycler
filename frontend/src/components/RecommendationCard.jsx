import { ArrowRight, Clock, Download, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import Button from "./Button.jsx";
import SafetyWarning from "./SafetyWarning.jsx";
import { titleCase } from "../utils/formatters";

export default function RecommendationCard({ recommendation, rank = 0, language = "en", onPreview, onGeneratePdf }) {
  const copy = cardCopy[language] || cardCopy.en;
  const badges = getBadges(recommendation, rank, copy);
  const reason = localizeReason(recommendation, copy, language);

  return (
    <article className="rounded-lg border border-forest-900/10 bg-white p-4 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[1fr_170px_220px] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 rounded-full border border-forest-900/10 bg-forest-50 px-2.5 py-1 text-xs font-bold text-forest-700">
                <Sparkles size={12} />
                {badge}
              </span>
            ))}
          </div>
          <h2 className="mt-3 text-lg font-bold text-forest-900">
            {recommendation.recipe_name || titleCase(recommendation.recipe_type)}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink/65">{reason}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm lg:grid-cols-1">
          <Metric icon={Gauge} label={copy.score} value={recommendation.score} />
          <Metric icon={Clock} label={copy.time} value={recommendation.estimated_time || copy.defaultTime} />
          <Metric icon={ShieldCheck} label={copy.safety} value={recommendation.safety_level || copy.checked} />
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button type="button" onClick={onPreview} className="min-h-10 px-3 py-2 text-sm">
            {copy.preview} <ArrowRight size={16} />
          </Button>
          <Button type="button" variant="secondary" onClick={onGeneratePdf} className="min-h-10 px-3 py-2 text-sm">
            <Download size={16} />
            PDF
          </Button>
        </div>
      </div>

      {(recommendation.warning || recommendation.warnings?.[0]) && (
        <div className="mt-3">
          <SafetyWarning>{recommendation.warning || recommendation.warnings?.[0]}</SafetyWarning>
        </div>
      )}
    </article>
  );
}

function localizeReason(recommendation, copy, language) {
  if (language !== "id") return recommendation.reason;
  const reason = recommendation.reason || "";
  if (reason.startsWith("Matched ") || reason.includes("Confirm freshness")) {
    return copy.reasonFallback(recommendation.recipe_name || titleCase(recommendation.recipe_type));
  }
  return reason;
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-earth-50 px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/50">
        <Icon size={13} />
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold text-forest-900">{value}</p>
    </div>
  );
}

function getBadges(recommendation, rank, copy) {
  const badges = [];
  if (rank === 0) badges.push(copy.best);
  if ((recommendation.score || 0) >= 75) badges.push(copy.practical);
  if (String(recommendation.estimated_time || "").includes("10")) badges.push(copy.fastest);
  badges.push(copy.safetyChecked);
  return badges.slice(0, 3);
}

const cardCopy = {
  en: {
    score: "Score",
    time: "Time",
    safety: "Safety",
    preview: "Preview",
    defaultTime: "10-35 min",
    checked: "checked",
    best: "Best recommendation",
    practical: "Practical",
    fastest: "Fastest recipe",
    safetyChecked: "Safety checked",
    reasonFallback: (name) => `Matched leftovers with ${name}. Confirm freshness and storage before cooking.`,
  },
  id: {
    score: "Skor",
    time: "Waktu",
    safety: "Keamanan",
    preview: "Lihat resep",
    defaultTime: "10-35 menit",
    checked: "sudah dicek",
    best: "Rekomendasi terbaik",
    practical: "Praktis",
    fastest: "Resep tercepat",
    safetyChecked: "Keamanan dicek",
    reasonFallback: (name) => `Leftover cocok untuk ${name}. Pastikan kesegaran dan penyimpanan aman sebelum memasak.`,
  },
};
