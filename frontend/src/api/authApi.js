import { apiClient } from "./client";

export async function demoAuth(profile) {
  const response = await apiClient.post("/api/auth/demo", {
    name: profile.name || profile.email?.split("@")[0] || "FoodLoop User",
    email: profile.email,
    provider: profile.provider || "email",
    phone: profile.phone || null,
    age: profile.age ? Number(profile.age) : null,
    reason: profile.reason || null,
  });
  return response.data;
}
