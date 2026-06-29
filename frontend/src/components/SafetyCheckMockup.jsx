import { CheckCircle2 } from "lucide-react";
import SafetyBadge from "./SafetyBadge.jsx";

export default function SafetyCheckMockup({ language = "id" }) {
  const copy = language === "id" ? copyId : copyEn;
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
      <SafetyBadge level="safe">{copy.badge}</SafetyBadge>
      <h3 className="mt-4 text-xl font-black text-forest-900">{copy.title}</h3>
      <div className="mt-4 space-y-3">
        {copy.items.map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl bg-earth-50 p-3 text-sm font-bold text-forest-900">
            <CheckCircle2 size={18} className="text-forest-700" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

const copyId = {
  badge: "Cek keamanan",
  title: "Sebelum jadi resep",
  items: ["Tidak bau busuk", "Tidak berlendir atau berjamur", "Disimpan dengan aman", "Kalau ragu, jangan dikonsumsi"],
};

const copyEn = {
  badge: "Safety check",
  title: "Before recipe ideas",
  items: ["No rotten smell", "No slime or mold", "Stored safely", "When unsure, do not eat"],
};
