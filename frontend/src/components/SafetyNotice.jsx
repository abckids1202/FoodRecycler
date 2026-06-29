import { ShieldCheck } from "lucide-react";

export default function SafetyNotice({ title, children, tone = "review" }) {
  const tones = {
    safe: "border-forest-900/10 bg-mint/80 text-forest-900",
    review: "border-earth-500/25 bg-food-yellow/25 text-forest-900",
    danger: "border-danger/25 bg-danger/10 text-red-900",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone] || tones.review}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/80">
          <ShieldCheck size={20} />
        </span>
        <div>
          {title && <p className="font-black">{title}</p>}
          <div className="mt-1 text-sm leading-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
