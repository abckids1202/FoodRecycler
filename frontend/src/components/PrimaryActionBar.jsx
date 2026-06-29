export default function PrimaryActionBar({ children }) {
  return (
    <div className="sticky bottom-20 z-30 -mx-3 border-t border-forest-900/10 bg-earth-50/95 px-3 py-3 backdrop-blur md:bottom-0 md:mx-0 md:rounded-2xl md:border md:bg-white/90">
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}
