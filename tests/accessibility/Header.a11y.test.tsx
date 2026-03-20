import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/Header";
import { useAppStore } from "@/stores/useAppStore";

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  useAppStore.setState({
    categories: ["Cocktail", "Ordinary Drink"],
    drinks: { drinks: [] },
    isLoading: false,
    favorites: {},
    notification: null,
  });
});

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

function renderHeader(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Header />
    </MemoryRouter>,
  );
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("Header — Accessibility", () => {

  it("has no accessibility violations on the home page", async () => {
    const { container } = renderHeader("/");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations on the favorites page", async () => {
    const { container } = renderHeader("/favorites");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders the navigation landmark with an accessible label", () => {
    renderHeader("/");
    // AnimatedNav now renders a <nav aria-label="Main navigation"> element.
    // getAllByRole because both desktop and mobile navs share the same label.
    const navs = screen.getAllByRole("navigation", { name: /main navigation/i });
    expect(navs.length).toBeGreaterThanOrEqual(1);
  });

  it("sets aria-current=page on the active nav link", () => {
    renderHeader("/favorites");
    // NavLink with end=false on /favorites marks aria-current="page".
    // Multiple matches (desktop + mobile) — at least one must be present.
    const activeLinks = screen.getAllByRole("link", { name: /favorites/i });
    const hasActiveCurrent = activeLinks.some(
      (el) => el.getAttribute("aria-current") === "page",
    );
    expect(hasActiveCurrent).toBe(true);
  });

  it("focus is not trapped after interacting with the header", async () => {
    const user = userEvent.setup();
    renderHeader("/");

    // Tab through focusable elements until we land inside a nav,
    // then confirm one more Tab moves focus forward (no trap).
    let attempts = 0;
    while (attempts < 10) {
      await user.tab();
      attempts++;
      if (document.activeElement?.closest("nav")) break;
    }

    const activeInNav = document.activeElement;
    expect(activeInNav?.closest("nav")).not.toBeNull();

    await user.tab();
    expect(document.activeElement).not.toBe(activeInNav);
  });
});
