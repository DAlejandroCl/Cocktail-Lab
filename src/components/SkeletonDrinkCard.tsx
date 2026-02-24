export default function SkeletonDrinkCard() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="glass-card rounded-2xl overflow-hidden relative animate-pulse"
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(251, 146, 60, 0.08), transparent 70%)",
        }}
      />

      <div className="relative aspect-4/5 overflow-hidden bg-white/5">
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/30" />

        <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
          <div className="h-6 w-20 rounded-full bg-white/20 backdrop-blur-md" />

          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md" />
        </div>
      </div>

      <div className="relative p-5 bg-transparent backdrop-blur-md border-t border-white/10">
        <div className="space-y-2 mb-4">
          <div className="h-4 w-3/4 mx-auto rounded-md bg-white/20" />
          <div className="h-4 w-1/2 mx-auto rounded-md bg-white/15" />
        </div>

        <div className="h-11 w-full rounded-xl bg-white/20" />
      </div>
    </div>
  );
}
