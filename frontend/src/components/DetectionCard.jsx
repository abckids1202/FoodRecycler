import { formatConfidence, formatPercent, titleCase } from "../utils/formatters";
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
            {copy.confidence} {formatConfidence(item.confidence)} / {copy.area} {formatPercent(item.estimated_area_percent)}
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
    confidence: "Confidence",
    area: "Area",
    contaminant: "Contaminant",
  },
  id: {
    confidence: "Keyakinan",
    area: "Area",
    contaminant: "Kontaminan",
  },
};
