import { Sprout } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

export default function EmptyState({ title, message, action }) {
  const { language } = useApp();
  const copy = language === "id" ? emptyCopy.id : emptyCopy.en;
  return (
    <div className="rounded-lg border border-dashed border-forest-900/15 bg-white p-6 text-center shadow-soft sm:p-8">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-forest-50 text-forest-700">
        <Sprout size={23} />
      </span>
      <p className="mt-4 text-lg font-semibold text-forest-900">{title || copy.title}</p>
      {(message || copy.message) && <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink/60">{message || copy.message}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

const emptyCopy = {
  en: {
    title: "Nothing here yet",
    message: "Start by analyzing leftovers or asking the AI assistant.",
  },
  id: {
    title: "Belum ada data",
    message: "Mulai dengan menganalisis leftover atau bertanya ke Asisten AI.",
  },
};
