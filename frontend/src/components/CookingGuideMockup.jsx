import Button from "./Button.jsx";

export default function CookingGuideMockup({ language = "id" }) {
  const copy = language === "id" ? copyId : copyEn;
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black text-forest-700">{copy.step}</p>
        <span className="rounded-full bg-mint px-3 py-1 text-xs font-black text-forest-900">2/6</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-earth-100">
        <div className="h-full w-1/3 rounded-full bg-forest-900" />
      </div>
      <div className="mt-5 rounded-3xl bg-earth-50 p-5">
        <h3 className="text-xl font-black text-forest-900">{copy.title}</h3>
        <p className="mt-3 text-lg leading-8 text-ink/80">{copy.body}</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary">{copy.prev}</Button>
        <Button>{copy.next}</Button>
      </div>
    </div>
  );
}

const copyId = {
  step: "Langkah 2 dari 6",
  title: "Panaskan dan aduk",
  body: "Masukkan nasi, lalu aduk sampai panas merata dan beruap.",
  prev: "Sebelumnya",
  next: "Berikutnya",
};

const copyEn = {
  step: "Step 2 of 6",
  title: "Heat and stir",
  body: "Add rice, then stir until evenly hot and steaming.",
  prev: "Previous",
  next: "Next",
};
