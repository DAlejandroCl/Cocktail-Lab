/* ─────────────────────────────────────────────────────────────
   SKELETON DRINK CARD — Loading placeholder with shimmer
───────────────────────────────────────────────────────────── */

export default function SkeletonDrinkCard() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="animate-pulse"
        style={{
          aspectRatio: "4/3",
          background: "var(--bg-subtle)",
        }}
      />

      <div
        className="p-4 space-y-3"
        style={{ borderTop: "1px solid var(--border-card)" }}
      >
        <div
          className="animate-pulse h-4 rounded-lg mx-auto"
          style={{
            width: "70%",
            background: "var(--bg-subtle)",
          }}
        />
        <div
          className="animate-pulse h-4 rounded-lg mx-auto"
          style={{
            width: "45%",
            background: "var(--bg-subtle)",
          }}
        />
        <div
          className="animate-pulse h-10 rounded-lg mt-2"
          style={{
            background: "var(--bg-subtle)",
          }}
        />
      </div>
    </div>
  );
}
