import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "@/stores/useThemeStore";

// ─────────────────────────────────────────────
// Setup — reset to light before each test
// ─────────────────────────────────────────────

beforeEach(() => {
  useThemeStore.setState({ theme: "light" });
  document.documentElement.classList.remove("dark");
  document.documentElement.removeAttribute("data-theme");
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("useThemeStore", () => {

  // ── Initial state ──────────────────────────────────────────────────────

  it("has a theme value of 'light' or 'dark' in initial state", () => {
    const { theme } = useThemeStore.getState();
    expect(["light", "dark"]).toContain(theme);
  });

  // ── toggleTheme ────────────────────────────────────────────────────────

  it("toggles from light to dark", () => {
    useThemeStore.setState({ theme: "light" });

    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("toggles from dark to light", () => {
    useThemeStore.setState({ theme: "dark" });

    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("adds 'dark' class to documentElement when toggling to dark", () => {
    useThemeStore.setState({ theme: "light" });

    useThemeStore.getState().toggleTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes 'dark' class from documentElement when toggling to light", () => {
    useThemeStore.setState({ theme: "dark" });
    document.documentElement.classList.add("dark");

    useThemeStore.getState().toggleTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("sets data-theme attribute on documentElement when toggling", () => {
    useThemeStore.setState({ theme: "light" });

    useThemeStore.getState().toggleTheme();

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  // ── setTheme ───────────────────────────────────────────────────────────

  it("setTheme sets theme to dark", () => {
    useThemeStore.getState().setTheme("dark");

    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("setTheme sets theme to light", () => {
    useThemeStore.setState({ theme: "dark" });

    useThemeStore.getState().setTheme("light");

    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("setTheme adds 'dark' class when setting dark", () => {
    useThemeStore.getState().setTheme("dark");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("setTheme removes 'dark' class when setting light", () => {
    document.documentElement.classList.add("dark");

    useThemeStore.getState().setTheme("light");

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("setTheme updates data-theme attribute", () => {
    useThemeStore.getState().setTheme("dark");

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  // ── applyThemeToDocument side effects ──────────────────────────────────

  it("toggling twice returns to the original theme", () => {
    useThemeStore.setState({ theme: "light" });

    useThemeStore.getState().toggleTheme();
    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
