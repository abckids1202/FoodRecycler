export default function Button({ as: Component = "button", variant = "primary", className = "", children, ...props }) {
  const variants = {
    primary: "bg-forest-900 text-white hover:bg-forest-700",
    secondary: "border border-forest-900/15 bg-white text-forest-900 hover:bg-forest-50",
    warning: "bg-earth-500 text-white hover:bg-earth-500/90",
  };

  return (
    <Component
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
