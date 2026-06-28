export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-lg border border-forest-900/10 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink/60">{label}</p>
          <p className="mt-2 text-3xl font-bold text-forest-900">{value}</p>
        </div>
        {Icon && (
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-forest-50 text-forest-700">
            <Icon size={21} />
          </span>
        )}
      </div>
      {hint && <p className="mt-3 text-sm text-ink/60">{hint}</p>}
    </div>
  );
}
