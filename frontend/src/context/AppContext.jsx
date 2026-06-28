import { createContext, useContext, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

const AppContext = createContext(null);

const languageStorageKey = "foodloop_language";
const userStorageKey = "foodloop_user";

export function AppProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(languageStorageKey) || "id");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(userStorageKey);
    return stored ? JSON.parse(stored) : null;
  });

  function setLanguage(value) {
    setLanguageState(value);
    localStorage.setItem(languageStorageKey, value);
  }

  function login(profile) {
    const nextUser = {
      id: profile.id || null,
      name: profile.name || profile.email?.split("@")[0] || "FoodLoop User",
      email: profile.email || "demo@foodloop.ai",
      phone: profile.phone || "",
      age: profile.age || "",
      reason: profile.reason || "",
      provider: profile.provider || "email",
    };
    setUser(nextUser);
    localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(userStorageKey);
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      user,
      login,
      logout,
      t: translations[language] || translations.id,
    }),
    [language, user]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
