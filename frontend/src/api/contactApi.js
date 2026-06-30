import { apiClient } from "./client";

export async function submitContactMessage(payload) {
  const response = await apiClient.post("/api/contact/messages", payload);
  return response.data;
}
