import { useApp } from "../context/AppContext.jsx";
import { CookingPot } from "lucide-react";

export default function LoadingState({ title, message }) {
  const { language } = useApp();
  const copy = loadingCopy[language] || loadingCopy.en;
  return (
    <div className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-start gap-4">
        <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700">
          <CookingPot size={22} />
          <span className="absolute -right-1 -top-1 h-4 w-4 animate-spin rounded-full border-2 border-forest-100 border-t-forest-700" />
        </span>
        <div>
          <p className="font-semibold text-forest-900">{title || copy.title}</p>
          <p className="mt-1 text-sm leading-6 text-ink/60">{message || copy.message}</p>
        </div>
      </div>
    </div>
  );
}

const loadingCopy = {
  en: {
    title: "Working",
    message: "Preparing the next result.",
  },
  id: {
    title: "Memproses",
    message: "Menyiapkan hasil berikutnya.",
  },
};
