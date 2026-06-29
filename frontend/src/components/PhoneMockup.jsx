export default function PhoneMockup({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-[360px] rounded-[2rem] border border-white/30 bg-forest-950/80 p-3 shadow-2xl shadow-black/25 ${className}`}>
      <div className="rounded-[1.5rem] bg-earth-50 p-4">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-forest-900/20" />
        {children}
      </div>
    </div>
  );
}
