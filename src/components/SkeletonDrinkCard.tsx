export default function SkeletonDrinkCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden relative animate-pulse">
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(251, 146, 60, 0.08), transparent 70%)",
        }}
      />

      <div className="relative aspect-4/5 bg-slate-700/40" />

      <div className="relative p-5 bg-linear-to-b from-white/8 to-white/3 backdrop-blur-xl border-t border-white/10">
        <div className="space-y-2 mb-4">
          <div className="h-4 w-3/4 rounded-md bg-slate-600/40" />
          <div className="h-4 w-1/2 rounded-md bg-slate-600/30" />
        </div>

        <div className="flex gap-2.5">
          <div className="flex-1 h-11 rounded-xl bg-slate-600/30" />
          <div className="w-11 h-11 rounded-xl bg-slate-600/30" />
        </div>
      </div>
    </div>
  );
}
