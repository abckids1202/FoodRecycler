import { CheckCircle2, Flame, Leaf, PackageCheck, PauseCircle, Percent, Utensils } from "lucide-react";
import StatCard from "./StatCard.jsx";

export default function DashboardStats({ summary, language = "en" }) {
  const copy = statsCopy[language] || statsCopy.en;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label={copy.totalAnalyses} value={summary.totalAnalyses} hint={copy.totalAnalysesHint} icon={PackageCheck} />
      <StatCard label={copy.foodIdeas} value={summary.foodIdeas} hint={copy.foodIdeasHint} icon={Utensils} />
      <StatCard label={copy.recipesStarted} value={summary.recipesStarted} hint={copy.recipesStartedHint} icon={Flame} />
      <StatCard label={copy.recipesFinished} value={summary.recipesFinished} hint={copy.recipesFinishedHint} icon={CheckCircle2} />
      <StatCard label={copy.recipesStopped} value={summary.recipesStopped} hint={copy.recipesStoppedHint} icon={PauseCircle} />
      <StatCard label={copy.completionRate} value={`${summary.completionRate}%`} hint={copy.completionRateHint} icon={Percent} />
      <StatCard label={copy.topLeftover} value={summary.topMaterial} hint={copy.topLeftoverHint} icon={Leaf} />
      <StatCard label={copy.mostCompleted} value={summary.mostCompletedRecipe} hint={copy.mostCompletedHint} icon={CheckCircle2} />
    </div>
  );
}

const statsCopy = {
  en: {
    totalAnalyses: "Total analyses",
    totalAnalysesHint: "Leftover checks created",
    foodIdeas: "Food ideas made",
    foodIdeasHint: "Traditional Indonesian matches",
    recipesStarted: "Recipes started",
    recipesStartedHint: "Users began cooking",
    recipesFinished: "Recipes finished",
    recipesFinishedHint: "Actually cooked to completion",
    recipesStopped: "Recipes stopped",
    recipesStoppedHint: "Stopped with problem notes",
    completionRate: "Completion rate",
    completionRateHint: "Finished / started",
    topLeftover: "Top leftover",
    topLeftoverHint: "Most detected ingredient",
    mostCompleted: "Most completed",
    mostCompletedHint: "Most often finished",
  },
  id: {
    totalAnalyses: "Total analisis",
    totalAnalysesHint: "Cek leftover dibuat",
    foodIdeas: "Ide makanan dibuat",
    foodIdeasHint: "Kecocokan makanan Indonesia",
    recipesStarted: "Resep dimulai",
    recipesStartedHint: "Pengguna mulai memasak",
    recipesFinished: "Resep selesai",
    recipesFinishedHint: "Benar-benar selesai dimasak",
    recipesStopped: "Resep dihentikan",
    recipesStoppedHint: "Berhenti dengan catatan masalah",
    completionRate: "Tingkat selesai",
    completionRateHint: "Selesai / dimulai",
    topLeftover: "Leftover teratas",
    topLeftoverHint: "Bahan paling sering terdeteksi",
    mostCompleted: "Paling sering selesai",
    mostCompletedHint: "Paling sering diselesaikan",
  },
};
