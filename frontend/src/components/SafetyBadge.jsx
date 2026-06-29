export default function SafetyBadge({ level = "review", children }) {
  const classes = {
    safe: "bg-mint text-forest-900 border-forest-900/10",
    review: "bg-food-yellow/70 text-forest-900 border-earth-500/20",
    risk: "bg-warning/20 text-amber-900 border-warning/30",
    danger: "bg-danger/10 text-red-800 border-danger/25",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${classes[level] || classes.review}`}>
      {children}
    </span>
  );
}
