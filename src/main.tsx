import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./router";

/* ─────────────────────────────────────────────────────────────
   THEME INITIALIZATION — Runs before React mounts to avoid
   flash of wrong theme (FOWT). Reads persisted Zustand state
   from localStorage and applies the correct class to <html>
   before the first paint.
───────────────────────────────────────────────────────────── */

(function initTheme() {
  try {
    const stored = localStorage.getItem("cocktail-lab-theme");
    const parsed = stored ? JSON.parse(stored) : null;
    const savedTheme = parsed?.state?.theme as "light" | "dark" | undefined;

    const theme =
      savedTheme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.setAttribute("data-theme", theme);
  } catch {
    document.documentElement.classList.add("dark");
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);