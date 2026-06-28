import { AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

export default function ErrorState({ title, message }) {
  const { language } = useApp();
  const copy = errorCopy[language] || errorCopy.en;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/70 text-red-800">
          <AlertTriangle size={20} />
        </span>
        <div>
          <p className="font-semibold">{title || copy.title}</p>
          {message && <p className="mt-1 text-sm leading-6">{message}</p>}
        </div>
      </div>
    </div>
  );
}

const errorCopy = {
  en: {
    title: "Something went wrong",
  },
  id: {
    title: "Terjadi kesalahan",
  },
};
