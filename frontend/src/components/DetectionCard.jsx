import { titleCase } from "../utils/formatters";
import { useApp } from "../context/AppContext.jsx";

export default function DetectionCard({ item }) {
  const { language } = useApp();
  const copy = detectionCopy[language] || detectionCopy.en;
  return (
    <div className="rounded-lg border border-forest-900/10 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-forest-900">{titleCase(item.label)}</p>
          <p className="mt-1 text-sm text-ink/60">
            {statusLabel(item.confidence, copy)}
          </p>
        </div>
        {item.is_contaminant && (
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">{copy.contaminant}</span>
        )}
      </div>
    </div>
  );
}

const detectionCopy = {
  en: {
    clear: "Looks clear",
    check: "Please check",
    unsure: "May be wrong",
    contaminant: "Contaminant",
  },
  id: {
    clear: "Terlihat jelas",
    check: "Perlu dicek",
    unsure: "Mungkin salah",
    contaminant: "Kontaminan",
  },
};

function statusLabel(confidence = 0.5, copy) {
  if (confidence >= 0.78) return copy.clear;
  if (confidence >= 0.5) return copy.check;
  return copy.unsure;
}
