import { apiClient } from "./client";

export async function getAdminSummary(userEmail) {
  const response = await apiClient.get("/api/admin/summary", {
    headers: { "x-user-email": userEmail },
  });
  return response.data;
}
