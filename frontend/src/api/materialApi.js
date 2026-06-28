import { apiClient } from "./client";

export async function getMaterials() {
  const response = await apiClient.get("/api/materials");
  return response.data;
}
