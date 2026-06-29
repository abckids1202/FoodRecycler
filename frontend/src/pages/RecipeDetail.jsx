import { CheckCircle2, Clock, Download, Flame, Play, ShieldCheck, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PrimaryActionBar from "../components/PrimaryActionBar.jsx";
import SafetyBadge from "../components/SafetyBadge.jsx";
import SafetyNotice from "../components/SafetyNotice.jsx";
import { getPdfDownloadUrl } from "../api/pdfApi";
import { getRecommendationDetail } from "../api/recipeApi";
import { useApp } from "../context/AppContext.jsx";
import { localizeIngredient, localizeRecipeNote, localizeRecipeValue, normalizeIngredientKey } from "../utils/recipeDisplay";

export default function RecipeDetail() {
  const { recipeId } = useParams();
  const { language } = useApp();
  const copy = detailCopy[language] || detailCopy.id;
  const [detail, setDetail] = useState(null);
  const [checked, setChecked] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadRecipe() {
      setStatus("loading");
      setError("");
      try {
        const result = await getRecommendationDetail(recipeId);
        if (!isMounted) return;
        setDetail(result);
        setStatus("ready");
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.response?.data?.detail || requestError.message);
        setStatus("error");
      }
    }

    loadRecipe();
    return () => {
      isMounted = false;
    };
  }, [recipeId]);

  if (status === "loading") return <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />;
  if (status === "error") return <ErrorState title={copy.errorTitle} message={error} />;

  const recipe = detail.recipe || {};
  const ingredients = uniqueLocalizedItems(recipe.ingredients || [], language);
  const steps = (recipe.steps || []).map((step) => localizeRecipeNote(step, language));
  const difficulty = localizeRecipeValue(recipe.difficulty || copy.defaultDifficulty, language);
  const safety = localizeRecipeValue(detail.safety_level, language);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-forest-900 p-6 text-white shadow-soft sm:p-8">
        <SafetyBadge level="review">{copy.recipeBadge}</SafetyBadge>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">{detail.recipe_name}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">{copy.headerText}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <HeroMetric icon={Clock} label={copy.time} value={recipe.estimated_time || copy.defaultTime} />
          <HeroMetric icon={Flame} label={copy.difficulty} value={difficulty} />
          <HeroMetric icon={Users} label={copy.servings} value={copy.servingFallback} />
          <HeroMetric icon={ShieldCheck} label={copy.safety} value={safety || copy.checked} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SafetyNotice title={copy.aiNoticeTitle}>{copy.aiNotice}</SafetyNotice>

          <Card className="p-5">
            <h2 className="text-2xl font-black text-forest-900">{copy.whyTitle}</h2>
            <p className="mt-3 text-lg leading-8 text-ink/70">{localizeReason(detail, copy, language)}</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-2xl font-black text-forest-900">{copy.ingredientsTitle}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {ingredients.map((ingredient) => (
                <label key={ingredient} className="flex min-h-14 items-center gap-3 rounded-2xl bg-earth-50 px-4 py-3 text-base font-bold text-forest-900">
                  <input
                    type="checkbox"
                    checked={Boolean(checked[ingredient])}
                    onChange={(event) => setChecked((current) => ({ ...current, [ingredient]: event.target.checked }))}
                    className="h-5 w-5 accent-forest-700"
                  />
                  {ingredient}
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-2xl font-black text-forest-900">{copy.stepsTitle}</h2>
            <div className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <div key={`${step}-${index}`} className="flex gap-4 rounded-3xl bg-earth-50 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-forest-900 text-sm font-black text-white">{index + 1}</span>
                  <p className="text-base font-semibold leading-7 text-ink/75">{step}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-xl font-black text-forest-900">{copy.beforeTitle}</h2>
            <div className="mt-4 space-y-3">
              {copy.beforeItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-mint p-3 text-sm font-black text-forest-900">
                  <CheckCircle2 size={18} /> {item}
                </div>
              ))}
            </div>
          </Card>
          <PrimaryActionBar>
            <Button as={Link} to={`/recipes/${recipeId}/start`} className="min-h-14 flex-1 rounded-2xl text-base">
              <Play size={18} /> {copy.startMaking}
            </Button>
            <Button as="a" href={getPdfDownloadUrl(recipeId)} variant="secondary" className="min-h-14 rounded-2xl text-base">
              <Download size={18} /> PDF
            </Button>
          </PrimaryActionBar>
        </aside>
      </div>
    </div>
  );
}

function HeroMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-white/65"><Icon size={16} /> {label}</p>
      <p className="mt-1 truncate text-base font-black text-white">{value}</p>
    </div>
  );
}

function uniqueLocalizedItems(items, language) {
  const keys = new Set();
  const localizedItems = [];
  items.forEach((item) => {
    const key = normalizeIngredientKey(item);
    if (!key || keys.has(key)) return;
    keys.add(key);
    localizedItems.push(localizeIngredient(item, language));
  });
  return localizedItems;
}

function localizeReason(detail, copy, language) {
  const reason = detail.reason || "";
  if (language === "id" && (reason.startsWith("Matched ") || reason.includes("Confirm freshness"))) {
    return `Cocok karena memakai bahan yang Anda punya untuk ${detail.recipe_name}. Tetap cek bau, tekstur, warna, dan penyimpanan sebelum memasak.`;
  }
  return reason || copy.reasonFallback(detail.recipe_name);
}

const detailCopy = {
  en: {
    recipeBadge: "Recipe detail",
    headerText: "Review ingredients, safety, and steps before cooking.",
    time: "Time",
    difficulty: "Difficulty",
    servings: "Serving",
    safety: "Safety",
    defaultDifficulty: "Easy",
    defaultTime: "10-35 min",
    servingFallback: "Flexible",
    checked: "Check first",
    loadingTitle: "Preparing recipe",
    loadingMessage: "Loading ingredients and cooking steps.",
    errorTitle: "Recipe detail error",
    aiNoticeTitle: "AI can make mistakes",
    aiNotice: "Always check smell, texture, color, allergies, and storage time before eating leftovers.",
    whyTitle: "Why this recipe",
    reasonFallback: (name) => `${name} matches the leftovers you provided.`,
    ingredientsTitle: "Ingredients checklist",
    stepsTitle: "Steps preview",
    beforeTitle: "Before cooking",
    beforeItems: ["No rotten smell", "No slime or mold", "Stored safely", "Heat until steaming hot"],
    startMaking: "Start Cooking",
  },
  id: {
    recipeBadge: "Detail resep",
    headerText: "Cek bahan, keamanan, dan langkah sebelum mulai memasak.",
    time: "Waktu",
    difficulty: "Tingkat",
    servings: "Porsi",
    safety: "Keamanan",
    defaultDifficulty: "Mudah",
    defaultTime: "10-35 menit",
    servingFallback: "Fleksibel",
    checked: "Cek dulu",
    loadingTitle: "Menyiapkan resep",
    loadingMessage: "Memuat bahan dan langkah memasak.",
    errorTitle: "Error detail resep",
    aiNoticeTitle: "AI bisa salah",
    aiNotice: "Selalu cek bau, tekstur, warna, alergi, dan waktu penyimpanan sebelum memakan leftover.",
    whyTitle: "Mengapa resep ini cocok",
    reasonFallback: (name) => `${name} cocok dengan leftover yang Anda masukkan.`,
    ingredientsTitle: "Checklist bahan",
    stepsTitle: "Pratinjau langkah",
    beforeTitle: "Sebelum memasak",
    beforeItems: ["Tidak bau busuk", "Tidak berlendir atau berjamur", "Disimpan dengan aman", "Panaskan sampai beruap panas"],
    startMaking: "Mulai Masak",
  },
};
