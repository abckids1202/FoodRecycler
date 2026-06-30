export default function StepIndicator({ steps = [], current = 0 }) {
  return (
    <div className="grid max-w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => {
        const active = index <= current;
        return (
          <div key={step} className="flex min-w-0 items-center gap-2 rounded-2xl bg-white/80 p-2">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black ${active ? "bg-forest-900 text-white" : "bg-earth-100 text-ink/55"}`}>
              {index + 1}
            </span>
            <span className={`min-w-0 break-words text-sm font-bold leading-4 ${active ? "text-forest-900" : "text-ink/50"}`}>{step}</span>
          </div>
        );
      })}
    </div>
  );
}
