import { apiClient } from "./client";

export async function demoAuth(profile) {
  const response = await apiClient.post("/api/auth/demo", {
    name: profile.name || profile.email?.split("@")[0] || "FoodLoop User",
    email: profile.email,
    provider: profile.provider || "email",
    phone: profile.phone || null,
    phone_country_code: profile.phoneCountryCode || profile.phone_country_code || "+62",
    age: profile.age ? Number(profile.age) : null,
    reason: profile.reason || null,
    reminder_opt_in: Boolean(profile.reminderOptIn || profile.reminder_opt_in),
    reminder_channel: profile.reminderChannel || profile.reminder_channel || "none",
  });
  return response.data;
}
