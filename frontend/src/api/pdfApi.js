import { apiClient } from "./client";
import { getApiBaseUrl } from "./client";

export async function generatePdf(recipeId) {
  const response = await apiClient.post(`/api/pdf/generate/${recipeId}`);
  return response.data;
}

export function getPdfDownloadUrl(recipeId) {
  return `${getApiBaseUrl()}/api/pdf/download/${recipeId}`;
}
