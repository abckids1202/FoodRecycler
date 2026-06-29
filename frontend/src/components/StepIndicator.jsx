export default function StepIndicator({ steps = [], current = 0 }) {
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {steps.map((step, index) => {
        const active = index <= current;
        return (
          <div key={step} className="flex items-center gap-2 rounded-2xl bg-white/80 p-2">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black ${active ? "bg-forest-900 text-white" : "bg-earth-100 text-ink/55"}`}>
              {index + 1}
            </span>
            <span className={`text-sm font-bold ${active ? "text-forest-900" : "text-ink/50"}`}>{step}</span>
          </div>
        );
      })}
    </div>
  );
}
