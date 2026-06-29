export default function Card({ as: Component = "section", className = "", children, ...props }) {
  return (
    <Component
      className={`rounded-3xl border border-forest-900/10 bg-white/90 shadow-soft ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
