export default function ProgressMockup({ language = "id" }) {
  const copy = language === "id" ? copyId : copyEn;
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
      <p className="text-sm font-black uppercase tracking-[0.14em] text-forest-700">{copy.title}</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {copy.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-earth-50 p-3">
            <p className="text-2xl font-black text-forest-900">{stat.value}</p>
            <p className="mt-1 text-xs font-bold leading-5 text-ink/60">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-mint p-4 text-sm font-bold text-forest-900">
        {copy.note}
      </div>
    </div>
  );
}

const copyId = {
  title: "Riwayat ringkas",
  stats: [
    { value: "8", label: "Resep selesai" },
    { value: "3", label: "Sering: nasi" },
    { value: "2", label: "Dilanjutkan" },
  ],
  note: "FoodLoop menyimpan apakah resep benar-benar dimasak, bukan hanya direkomendasikan.",
};

const copyEn = {
  title: "Usage summary",
  stats: [
    { value: "8", label: "Finished" },
    { value: "3", label: "Often: rice" },
    { value: "2", label: "Continued" },
  ],
  note: "FoodLoop tracks whether recommendations actually become cooked meals.",
};
