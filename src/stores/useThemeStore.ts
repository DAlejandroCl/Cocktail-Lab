import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

type Theme = "light" | "dark";

interface ThemeSlice {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.setAttribute("data-theme", theme);
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/* ─────────────────────────────────────────────────────────────
   STORE
───────────────────────────────────────────────────────────── */

export const useThemeStore = create<ThemeSlice>()(
  persist(
    (set) => ({
      theme: getSystemTheme(),

      toggleTheme: () =>
        set((state) => {
          const next: Theme = state.theme === "dark" ? "light" : "dark";
          applyThemeToDocument(next);
          return { theme: next };
        }),

      setTheme: (theme: Theme) =>
        set(() => {
          applyThemeToDocument(theme);
          return { theme };
        }),
    }),
    {
      name: "cocktail-lab-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDocument(state.theme);
        }
      },
    },
  ),
);
