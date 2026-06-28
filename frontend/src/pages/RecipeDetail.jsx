import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import PdfDownloadButton from "../components/PdfDownloadButton.jsx";
import RecipePreview from "../components/RecipePreview.jsx";
import Button from "../components/Button.jsx";
import { getPdfDownloadUrl } from "../api/pdfApi";
import { getRecommendationDetail } from "../api/recipeApi";
import { useApp } from "../context/AppContext.jsx";
import { localizeIngredient, localizeRecipeNote, localizeRecipeValue, normalizeIngredientKey } from "../utils/recipeDisplay";

export default function RecipeDetail() {
  const { recipeId } = useParams();
  const { language } = useApp();
  const copy = detailCopy[language] || detailCopy.en;
  const [recipe, setRecipe] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadRecipe() {
      setStatus("loading");
      setError("");
      try {
        const detail = await getRecommendationDetail(recipeId);
        if (!isMounted) return;
        setRecipe(toPreviewRecipe(detail, copy));
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
  }, [recipeId, copy]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button as={Link} to={`/recipes/${recipeId}/start`}>
              {copy.startMaking}
            </Button>
            <PdfDownloadButton href={getPdfDownloadUrl(recipeId)} />
          </div>
        }
      />
      {status === "loading" && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}
      {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
      {status === "ready" && <RecipePreview recipe={recipe} language={language} />}
    </div>
  );
}

function toPreviewRecipe(detail, copy) {
  const recipe = detail.recipe || {};
  const detectedMaterials = uniqueLocalizedItems(detail.detected_leftovers || [], copy.language);
  const additionalMaterials = uniqueLocalizedItems(recipe.ingredients || [], copy.language, detectedMaterials.keys);
  return {
    title: detail.recipe_name,
    recipe_type: detail.recipe_key,
    difficulty: localizeRecipeValue(recipe.difficulty || copy.defaultDifficulty, copy.language),
    estimated_time: recipe.estimated_time || copy.defaultTime,
    safety_level: localizeRecipeValue(detail.safety_level, copy.language),
    detected_materials: detectedMaterials.items,
    additional_materials_needed: additionalMaterials.items,
    tools_needed: copy.toolsNeeded,
    steps: (recipe.steps || []).map((step, index) => ({
      step_number: index + 1,
      title: index === 0 ? copy.safetyCheck : `${copy.step} ${index + 1}`,
      instruction: localizeRecipeNote(step, copy.language),
    })),
    final_output: copy.finalOutput(detail.recipe_name),
    storage_instructions: copy.storageInstructions,
    usage_instructions: copy.reason(detail),
    mistakes_to_avoid: [...(detail.warnings || []), ...(detail.safety_notes || [])].map((item) => localizeRecipeNote(item, copy.language)),
  };
}

function uniqueLocalizedItems(items, language, existingKeys = new Set()) {
  const keys = new Set(existingKeys);
  const localizedItems = [];
  items.forEach((item) => {
    const key = normalizeIngredientKey(item);
    if (!key || keys.has(key)) return;
    keys.add(key);
    localizedItems.push(localizeIngredient(item, language));
  });
  return { items: localizedItems, keys };
}

const detailCopy = {
  en: {
    language: "en",
    title: "Recipe preview",
    description: "A structured recipe preview generated from the selected leftover recommendation.",
    startMaking: "Start Making",
    loadingTitle: "Loading recipe detail",
    loadingMessage: "Preparing recipe steps and safety notes.",
    errorTitle: "Recipe detail error",
    defaultDifficulty: "MVP",
    defaultTime: "10-35 minutes",
    toolsNeeded: ["clean cutting board", "pan or pot", "spatula", "serving plate"],
    safetyCheck: "Safety check",
    step: "Step",
    finalOutput: (name) => `${name} made from safe leftover ingredients.`,
    storageInstructions: "Eat immediately after reheating. Refrigerate any new leftovers within 2 hours.",
    reason: (detail) => detail.reason,
  },
  id: {
    language: "id",
    title: "Pratinjau resep",
    description: "Pratinjau resep terstruktur dari rekomendasi leftover yang dipilih.",
    startMaking: "Mulai Memasak",
    loadingTitle: "Memuat detail resep",
    loadingMessage: "Menyiapkan langkah resep dan catatan keamanan.",
    errorTitle: "Error detail resep",
    defaultDifficulty: "MVP",
    defaultTime: "10-35 menit",
    toolsNeeded: ["talenan bersih", "wajan atau panci", "spatula", "piring saji"],
    safetyCheck: "Cek keamanan",
    step: "Langkah",
    finalOutput: (name) => `${name} dari leftover yang masih aman digunakan.`,
    storageInstructions: "Makan segera setelah dipanaskan. Simpan sisa baru di kulkas dalam 2 jam.",
    reason: (detail) => {
      const reason = detail.reason || "";
      if (reason.startsWith("Matched ") || reason.includes("Confirm freshness")) {
        return `Leftover cocok untuk ${detail.recipe_name}. Pastikan kesegaran dan penyimpanan aman sebelum memasak.`;
      }
      return reason;
    },
  },
};
