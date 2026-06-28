import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import RecommendationCard from "../components/RecommendationCard.jsx";
import { generatePdf } from "../api/pdfApi";
import { getRecommendations } from "../api/recipeApi";
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
        const result = await getRecommendations(batchId);
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
        eyebrow={`Batch ${batchId}`}
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
    title: "Recipe recommendations",
    description: "Recommendations are ranked by food safety rules, leftover condition, contamination risk, and detector confidence.",
    loadingTitle: "Loading recommendations",
    loadingMessage: "Reading recipe matches from the backend.",
    errorTitle: "Recommendation backend error",
    emptyTitle: "No recipe matches yet",
    emptyMessage: "Try describing the leftover with more food names, or add more recipes to the JSON file.",
  },
  id: {
    title: "Rekomendasi resep",
    description: "Rekomendasi diurutkan berdasarkan aturan keamanan, kondisi leftover, risiko kontaminasi, dan keyakinan deteksi.",
    loadingTitle: "Memuat rekomendasi",
    loadingMessage: "Mengambil kecocokan resep dari backend.",
    errorTitle: "Error backend rekomendasi",
    emptyTitle: "Belum ada resep yang cocok",
    emptyMessage: "Coba jelaskan leftover dengan nama bahan yang lebih lengkap, atau tambahkan resep ke file JSON.",
  },
};
