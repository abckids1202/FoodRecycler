import { apiClient } from "./client";

export async function uploadWasteImage({ file, userId, condition, clarification }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("condition", condition || "unknown");
  if (userId) formData.append("user_id", userId);
  if (clarification) formData.append("clarification", clarification);

  const response = await apiClient.post("/api/analysis/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function analyzeWasteText({ text, userId, condition = "unknown" }) {
  const response = await apiClient.post("/api/analysis/text", {
    text,
    user_id: userId,
    condition,
  });
  return response.data;
}

export async function analyzeWasteBatch(batchId) {
  const response = await apiClient.get(`/api/analysis/${batchId}`);
  return response.data;
}

export async function getWasteBatch(batchId) {
  const response = await apiClient.get(`/api/analysis/${batchId}`);
  return response.data;
}

export async function clarifyWasteBatch(batchId, text) {
  const response = await apiClient.post(`/api/analysis/${batchId}/clarify`, { text });
  return response.data;
}

export async function getWasteHistory(userId) {
  const response = await apiClient.get(`/api/analysis/history/user/${userId}`);
  return response.data;
}
