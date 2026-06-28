import { AlertTriangle, CheckCircle2, Clock, CookingPot, PackageCheck, ShieldCheck } from "lucide-react";
import SafetyWarning from "./SafetyWarning.jsx";

export default function RecipePreview({ recipe, language = "en" }) {
  const copy = previewCopy[language] || previewCopy.en;
  if (!recipe) return null;

  return (
    <article className="space-y-5">
      <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-forest-900">{recipe.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{recipe.usage_instructions}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:w-[420px]">
            <Metric icon={Clock} label={copy.time} value={recipe.estimated_time} />
            <Metric icon={CookingPot} label={copy.difficulty} value={recipe.difficulty} />
            <Metric icon={ShieldCheck} label={copy.safety} value={recipe.safety_level} />
          </div>
        </div>
      </section>

      <SafetyWarning>
        {copy.aiWarning}
      </SafetyWarning>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <Section icon={PackageCheck} title={copy.detectedLeftovers} items={recipe.detected_materials} fallback={copy.notSpecified} />
          <Section icon={CookingPot} title={copy.useAdd} items={recipe.additional_materials_needed} fallback={copy.notSpecified} />
          <Section icon={CheckCircle2} title={copy.tools} items={recipe.tools_needed} fallback={copy.notSpecified} />
        </aside>

        <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-bold text-forest-900">{copy.cookingSteps}</h3>
          <ol className="mt-4 grid gap-3">
            {recipe.steps?.map((step) => (
              <li key={step.step_number} className="grid gap-3 rounded-lg bg-earth-50 p-4 sm:grid-cols-[44px_1fr]">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-forest-900 text-sm font-black text-white">
                  {step.step_number}
                </span>
                <div>
                  <p className="font-bold text-forest-900">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/70">{step.instruction}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TextBlock title={copy.finalOutput} text={recipe.final_output} />
        <TextBlock title={copy.storage} text={recipe.storage_instructions} />
        <Section icon={AlertTriangle} title={copy.avoid} items={recipe.mistakes_to_avoid} fallback={copy.notSpecified} />
      </div>
    </article>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-earth-50 px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/50">
        <Icon size={14} />
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-forest-900">{value}</p>
    </div>
  );
}

function Section({ icon: Icon, title, items = [], fallback = "Not specified yet" }) {
  return (
    <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
      <h3 className="flex items-center gap-2 text-base font-bold text-forest-900">
        <Icon size={18} />
        {title}
      </h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {(items.length ? items : [fallback]).map((item) => (
          <li key={item} className="rounded-full border border-forest-900/10 bg-earth-50 px-3 py-1.5 text-sm text-ink/70">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

const previewCopy = {
  en: {
    time: "Time",
    difficulty: "Difficulty",
    safety: "Safety",
    aiWarning: "Double-check the recipe and ingredients before cooking. FoodLoop uses AI and local rules, so it can make mistakes. Verify freshness, storage history, contamination risk, allergies, and reheating before eating leftovers.",
    detectedLeftovers: "Detected Leftovers",
    useAdd: "Use / Add",
    tools: "Tools",
    cookingSteps: "Cooking Steps",
    finalOutput: "Final Output",
    storage: "Storage",
    avoid: "Avoid",
    notSpecified: "Not specified yet",
  },
  id: {
    time: "Waktu",
    difficulty: "Tingkat kesulitan",
    safety: "Keamanan",
    aiWarning: "Periksa ulang resep dan bahan sebelum memasak. FoodLoop memakai AI dan aturan lokal, jadi masih bisa keliru. Pastikan kesegaran, riwayat penyimpanan, risiko kontaminasi, alergi, dan pemanasan ulang sebelum makan leftover.",
    detectedLeftovers: "Leftover terdeteksi",
    useAdd: "Gunakan / Tambahkan",
    tools: "Alat",
    cookingSteps: "Langkah memasak",
    finalOutput: "Hasil akhir",
    storage: "Penyimpanan",
    avoid: "Hindari",
    notSpecified: "Belum ditentukan",
  },
};

function TextBlock({ title, text }) {
  return (
    <section className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
      <h3 className="font-bold text-forest-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/70">{text}</p>
    </section>
  );
}
