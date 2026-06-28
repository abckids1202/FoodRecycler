import { apiClient } from "./client";

export async function submitDetectionCorrection(payload) {
  const response = await apiClient.post("/api/feedback/correction", payload);
  return response.data;
}

export async function submitExperienceFeedback(payload) {
  const response = await apiClient.post("/api/feedback/experience", payload);
  return response.data;
}
