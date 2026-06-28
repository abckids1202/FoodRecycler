import { apiClient } from "./client";

export async function getNotificationPreferences(userId) {
  const response = await apiClient.get(`/api/notifications/preferences/${userId}`);
  return response.data;
}

export async function saveNotificationPreferences(payload) {
  const response = await apiClient.post("/api/notifications/preferences", payload);
  return response.data;
}

export async function disableNotificationPreferences(userId) {
  const response = await apiClient.post(`/api/notifications/preferences/${userId}/disable`);
  return response.data;
}

export async function getReminderPreview() {
  const response = await apiClient.get("/api/notifications/preview");
  return response.data;
}
