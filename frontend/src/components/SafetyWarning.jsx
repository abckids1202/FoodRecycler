import { ShieldAlert } from "lucide-react";

export default function SafetyWarning({ children }) {
  return (
    <div className="rounded-lg border border-earth-500/30 bg-earth-100 p-4 text-earth-500">
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 shrink-0" size={20} />
        <p className="text-sm font-medium leading-6">{children}</p>
      </div>
    </div>
  );
}
