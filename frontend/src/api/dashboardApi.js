import { apiClient } from "./client";

export async function getDashboardSummary(userId) {
  const response = await apiClient.get("/api/dashboard/summary", { params: { user_id: userId } });
  return response.data;
}

export async function getMaterialStats(userId) {
  const response = await apiClient.get("/api/dashboard/leftovers", { params: { user_id: userId } });
  return response.data;
}

export async function getRecipeStats(userId) {
  const response = await apiClient.get("/api/dashboard/recipes", { params: { user_id: userId } });
  return response.data;
}

export async function getStopReasonStats(userId) {
  const response = await apiClient.get("/api/dashboard/stop-reasons", { params: { user_id: userId } });
  return response.data;
}
