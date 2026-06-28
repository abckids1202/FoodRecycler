import { useApp } from "../context/AppContext.jsx";

export default function LanguageSelect({ compact = false }) {
  const { language, setLanguage, t } = useApp();
  const nextLanguage = language === "id" ? "en" : "id";

  return (
    <div className={compact ? "" : "flex items-center gap-2"}>
      {!compact && <span className="text-sm font-semibold text-forest-900">{t.language}</span>}
      <button
        type="button"
        onClick={() => setLanguage(nextLanguage)}
        className="focus-ring inline-flex min-h-10 items-center gap-1 rounded-lg border border-forest-900/10 bg-white px-3 text-sm font-black text-forest-900 shadow-sm transition hover:bg-forest-50"
        aria-label={language === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
        title={language === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      >
        <span className={language === "id" ? "text-forest-700" : "text-ink/35"}>ID</span>
        <span className="text-ink/25">/</span>
        <span className={language === "en" ? "text-forest-700" : "text-ink/35"}>ENG</span>
      </button>
    </div>
  );
}
