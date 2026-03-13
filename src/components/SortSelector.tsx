import type { SortOptionConfig } from "../utils/sortRecipes";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

interface SortSelectorProps<T extends string> {
  options: SortOptionConfig<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

/* ─────────────────────────────────────────────────────────────
   SORT SELECTOR — horizontal pill group
   Generic over T so it works with both SortOption
   and SortOptionFavorites without casting.
───────────────────────────────────────────────────────────── */

export default function SortSelector<T extends string>({
  options,
  value,
  onChange,
  label = "Sort by",
}: SortSelectorProps<T>) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span
        className="text-xs font-bold uppercase tracking-widest shrink-0"
        style={{ color: "var(--text-muted)", letterSpacing: "0.12em" }}
      >
        {label}
      </span>

      {/* Scrollable pill row on mobile, wraps on desktop */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
        role="group"
        aria-label={label}
        style={{ scrollbarWidth: "none" }}
      >
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={isActive}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap"
              style={
                isActive
                  ? {
                      background: "var(--color-brand)",
                      color: "#ffffff",
                      boxShadow: "0 2px 10px rgba(242, 127, 13, 0.35)",
                    }
                  : {
                      background: "var(--bg-subtle)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
