import { ArrowRight, Clock, Flame, Utensils } from "lucide-react";

export default function RecipePreviewMockup({ language = "id" }) {
  const copy = language === "id" ? copyId : copyEn;
  return (
    <div className="grid gap-3">
      {copy.recipes.map((recipe) => (
        <article key={recipe.name} className="rounded-3xl border border-forest-900/10 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-food-yellow text-forest-900">
                <Utensils size={19} />
              </span>
              <h3 className="mt-3 text-lg font-black text-forest-900">{recipe.name}</h3>
              <p className="mt-1 text-sm font-semibold text-ink/65">{recipe.uses}</p>
            </div>
            <ArrowRight size={20} className="mt-2 text-forest-700" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-mint px-3 py-1 text-xs font-black text-forest-900">
              <Clock size={13} /> {recipe.time}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-earth-100 px-3 py-1 text-xs font-black text-forest-900">
              <Flame size={13} /> {recipe.level}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

const copyId = {
  recipes: [
    { name: "Nasi Goreng Kampung", uses: "Memakai nasi, telur, sambal", time: "15 menit", level: "Mudah" },
    { name: "Omelet Sayur", uses: "Memakai telur dan sayur sisa", time: "12 menit", level: "Praktis" },
    { name: "Roti Pisang Panggang", uses: "Memakai roti dan pisang", time: "10 menit", level: "Camilan" },
  ],
};

const copyEn = {
  recipes: [
    { name: "Nasi Goreng Kampung", uses: "Uses rice, egg, sambal", time: "15 min", level: "Easy" },
    { name: "Vegetable Omelet", uses: "Uses egg and vegetables", time: "12 min", level: "Practical" },
    { name: "Banana Toast", uses: "Uses bread and banana", time: "10 min", level: "Snack" },
  ],
};
