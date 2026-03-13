import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useThemeStore } from "../stores/useThemeStore";

/* ─────────────────────────────────────────────────────────────
   THEME TOGGLE BUTTON
   Syncs with Zustand store and applies class to <html>
───────────────────────────────────────────────────────────── */

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2.25rem",
        height: "2.25rem",
        borderRadius: "9999px",
        background: "var(--bg-subtle)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-secondary)",
        cursor: "pointer",
        transition: "background 0.25s, color 0.25s, border-color 0.25s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-brand)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-brand)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
      }}
    >
      {isDark ? (
        <SunIcon className="w-4.5 h-4.5" aria-hidden="true" />
      ) : (
        <MoonIcon className="w-4.5 h-4.5" aria-hidden="true" />
      )}
    </button>
  );
}
