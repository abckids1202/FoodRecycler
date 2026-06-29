export default function FoodChip({ children, tone = "mint" }) {
  const tones = {
    mint: "bg-mint text-forest-900",
    yellow: "bg-food-yellow text-forest-900",
    cream: "bg-white/85 text-forest-900",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-black ${tones[tone] || tones.mint}`}>
      {children}
    </span>
  );
}
