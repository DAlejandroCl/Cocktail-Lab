import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import ThemeToggle from "@/components/ThemeToggle";
import { useThemeStore } from "@/stores/useThemeStore";

// ─────────────────────────────────────────────
// Setup — reset theme store before each test
// ─────────────────────────────────────────────

beforeEach(() => {
  useThemeStore.setState({ theme: "light" });
  document.documentElement.classList.remove("dark");
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("ThemeToggle", () => {

  it("renders a button", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has aria-label 'Switch to dark mode' when theme is light", () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
  });

  it("has aria-label 'Switch to light mode' when theme is dark", () => {
    useThemeStore.setState({ theme: "dark" });
    render(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: /switch to light mode/i }),
    ).toBeInTheDocument();
  });

  it("has aria-pressed=false when theme is light", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("has aria-pressed=true when theme is dark", () => {
    useThemeStore.setState({ theme: "dark" });
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles theme from light to dark on click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button"));

    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("toggles theme from dark to light on click", async () => {
    useThemeStore.setState({ theme: "dark" });
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button"));

    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("updates aria-label after toggle", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button"));

    expect(
      screen.getByRole("button", { name: /switch to light mode/i }),
    ).toBeInTheDocument();
  });
});
