import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";
import { useApp } from "../context/AppContext.jsx";
import AnalysisResult from "../pages/AnalysisResult.jsx";
import AdminPanel from "../pages/AdminPanel.jsx";
import ChatHelper from "../pages/ChatHelper.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Auth from "../pages/Auth.jsx";
import History from "../pages/History.jsx";
import HistoryDetail from "../pages/HistoryDetail.jsx";
import Help from "../pages/Help.jsx";
import Home from "../pages/Home.jsx";
import RecipeDetail from "../pages/RecipeDetail.jsx";
import RecipeCookingGuide from "../pages/RecipeCookingGuide.jsx";
import RecipeRecommendations from "../pages/RecipeRecommendations.jsx";
import ReminderSettings from "../pages/ReminderSettings.jsx";
import Start from "../pages/Start.jsx";
import Upload from "../pages/Upload.jsx";

export default function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      <Route path="/welcome" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route
        path="/*"
        element={
          user ? (
            <AppLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/start" element={<Start />} />
                <Route path="/upload" element={<Navigate to="/start" replace />} />
                <Route path="/camera" element={<Navigate to="/upload" replace />} />
                <Route path="/chat" element={<ChatHelper />} />
                <Route path="/help" element={<Help />} />
                <Route path="/analysis/:batchId" element={<AnalysisResult />} />
                <Route path="/recommendations/:batchId" element={<RecipeRecommendations />} />
                <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
                <Route path="/recipes/:recipeId/start" element={<RecipeCookingGuide />} />
                <Route path="/history" element={<History />} />
                <Route path="/history/:analysisId" element={<HistoryDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reminders" element={<ReminderSettings />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          ) : (
            <Navigate to="/welcome" replace />
          )
        }
      />
    </Routes>
  );
}
