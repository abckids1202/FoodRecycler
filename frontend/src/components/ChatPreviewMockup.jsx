import Button from "./Button.jsx";
import SafetyBadge from "./SafetyBadge.jsx";

export default function ChatPreviewMockup({ language = "id" }) {
  const copy = language === "id" ? copyId : copyEn;
  return (
    <div className="space-y-3">
      <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-forest-900 px-4 py-3 text-sm font-semibold leading-6 text-white">
        {copy.user}
      </div>
      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-6 text-ink shadow-sm">
        <p className="font-bold text-forest-900">FoodLoop</p>
        <p className="mt-1">{copy.reply}</p>
        <div className="mt-3">
          <SafetyBadge level="review">{copy.safety}</SafetyBadge>
        </div>
      </div>
      <div className="rounded-2xl border border-forest-900/10 bg-mint p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-forest-700">{copy.recipeLabel}</p>
        <h3 className="mt-2 text-lg font-black text-forest-900">Nasi Goreng Kampung</h3>
        <p className="mt-1 text-sm font-semibold text-ink/70">15 menit - Mudah - 2 porsi</p>
        <Button className="mt-4 w-full">{copy.cta}</Button>
      </div>
    </div>
  );
}

const copyId = {
  user: "Aku punya nasi sisa, telur, sambal.",
  reply: "Bisa jadi Nasi Goreng Kampung. Cek dulu apakah nasinya disimpan di kulkas dan tidak bau.",
  safety: "Perlu cek: penyimpanan",
  recipeLabel: "Ide cocok",
  cta: "Mulai masak",
};

const copyEn = {
  user: "I have leftover rice, egg, and sambal.",
  reply: "This can become Nasi Goreng Kampung. First, check whether the rice was refrigerated and smells normal.",
  safety: "Check storage first",
  recipeLabel: "Good idea",
  cta: "Start cooking",
};
