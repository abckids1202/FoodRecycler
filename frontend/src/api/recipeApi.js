import { apiClient } from "./client";

export async function recommendRecipes(batchId) {
  const response = await apiClient.post(`/api/recipes/recommend/${batchId}`);
  return response.data;
}

export async function generateRecipe(batchId, recipeType) {
  const response = await apiClient.post(`/api/recipes/generate/${batchId}`, {
    recipe_type: recipeType,
  });
  return response.data;
}

export async function getRecipe(recipeId) {
  const response = await apiClient.get(`/api/recipes/${recipeId}`);
  return response.data;
}

export async function getRecommendations(batchId) {
  const response = await apiClient.get(`/api/recipes/recommend/${batchId}`);
  return response.data;
}

export async function getRecommendationDetail(recommendationId) {
  const response = await apiClient.get(`/api/recipes/recommendation/${recommendationId}`);
  return response.data;
}

export async function startCookingSession(recommendationId, payload) {
  const response = await apiClient.post(`/api/recipes/recommendation/${recommendationId}/sessions`, payload);
  return response.data;
}

export async function finishCookingSession(sessionId, payload) {
  const response = await apiClient.post(`/api/recipes/sessions/${sessionId}/finish`, payload);
  return response.data;
}

export async function stopCookingSession(sessionId, payload) {
  const response = await apiClient.post(`/api/recipes/sessions/${sessionId}/stop`, payload);
  return response.data;
}

export async function updateCookingSessionProgress(sessionId, payload) {
  const response = await apiClient.post(`/api/recipes/sessions/${sessionId}/progress`, payload);
  return response.data;
}

export async function getCookingSession(sessionId) {
  const response = await apiClient.get(`/api/recipes/sessions/${sessionId}`);
  return response.data;
}

export async function getUserCookingSessions(userId) {
  const response = await apiClient.get(`/api/recipes/sessions/user/${userId}`);
  return response.data;
}
