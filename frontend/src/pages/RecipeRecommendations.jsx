import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import RecommendationCard from "../components/RecommendationCard.jsx";
import { generatePdf } from "../api/pdfApi";
import { getRecommendations, recommendRecipes } from "../api/recipeApi";
import { useApp } from "../context/AppContext.jsx";

export default function RecipeRecommendations() {
  const { batchId } = useParams();
  const { language } = useApp();
  const copy = recommendationCopy[language] || recommendationCopy.en;
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadRecommendations() {
      setStatus("loading");
      setError("");
      try {
        let result = await getRecommendations(batchId);
        if (!result.recommendations?.length) {
          result = await recommendRecipes(batchId);
        }
        if (!isMounted) return;
        setRecommendations(result.recommendations || []);
        setStatus("ready");
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.response?.data?.detail || requestError.message);
        setStatus("error");
      }
    }

    loadRecommendations();
    return () => {
      isMounted = false;
    };
  }, [batchId]);

  async function handleGeneratePdf(recommendationId) {
    await generatePdf(recommendationId);
    navigate(`/recipes/${recommendationId}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      {status === "loading" && <LoadingState title={copy.loadingTitle} message={copy.loadingMessage} />}
      {status === "error" && <ErrorState title={copy.errorTitle} message={error} />}
      {status === "ready" && recommendations.length === 0 && (
        <EmptyState title={copy.emptyTitle} message={copy.emptyMessage} />
      )}
      {status === "ready" && recommendations.length > 0 && (
        <div className="grid gap-3">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.id || recommendation.recipe_key}
            recommendation={recommendation}
            rank={index}
            language={language}
            onPreview={() => navigate(`/recipes/${recommendation.id}`)}
            onGeneratePdf={() => handleGeneratePdf(recommendation.id)}
          />
        ))}
        </div>
      )}
    </div>
  );
}

const recommendationCopy = {
  en: {
    eyebrow: "Recipe ideas",
    title: "Meals you can make",
    description: "Choose the recipe that feels easiest and safest for the ingredients you have.",
    loadingTitle: "Finding recipe ideas",
    loadingMessage: "FoodLoop is matching your leftovers with Indonesian recipes.",
    errorTitle: "Could not load recipes",
    emptyTitle: "No recipe is safe to suggest yet",
    emptyMessage: "Try adding clearer ingredient names such as rice, egg, chicken, tofu, tempeh, sambal, vegetables, bread, or banana.",
  },
  id: {
    eyebrow: "Ide resep",
    title: "Masakan yang bisa dibuat",
    description: "Pilih resep yang terasa paling mudah dan aman untuk bahan yang Anda punya.",
    loadingTitle: "Mencari ide resep",
    loadingMessage: "FoodLoop sedang mencocokkan leftover dengan resep Indonesia.",
    errorTitle: "Resep belum bisa dimuat",
    emptyTitle: "Belum ada resep yang aman disarankan",
    emptyMessage: "Coba tambahkan nama bahan yang lebih jelas, misalnya nasi, telur, ayam, tahu, tempe, sambal, sayur, roti, atau pisang.",
  },
};
