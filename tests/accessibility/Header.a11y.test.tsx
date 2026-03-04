import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
    expect(
      screen.getByRole("navigation", { name: /main navigation/i }),
    ).toBeInTheDocument();
  });

  it("sets aria-current=page on the active nav link", () => {
    renderHeader("/favorites");
    expect(
      screen.getByRole("link", { name: /favorites/i }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("renders the search landmark on the home page", () => {
    renderHeader("/");
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("applies aria-busy=true to the form when loading", () => {
    useAppStore.setState({ isLoading: true });
    renderHeader("/");
    expect(screen.getByRole("search")).toHaveAttribute("aria-busy", "true");
  });

  it("applies aria-busy=false to the form when not loading", () => {
    useAppStore.setState({ isLoading: false });
    renderHeader("/");
    expect(screen.getByRole("search")).toHaveAttribute("aria-busy", "false");
  });

  it("focuses the ingredient input when validation fails on empty submit", async () => {
    const user = userEvent.setup();
    renderHeader("/");

    const input = screen.getByLabelText(/search cocktails by ingredient/i);
    await user.click(screen.getByRole("button", { name: /^search$/i }));

    expect(input).toHaveFocus();
  });

  it("Listbox trigger updates aria-expanded when opened", async () => {
    const user = userEvent.setup();
    renderHeader("/");

    const button = screen.getByRole("button", { name: /all categories/i });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("Listbox trigger collapses when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderHeader("/");

    const button = screen.getByRole("button", { name: /all categories/i });
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("manages aria-activedescendant when navigating options with the keyboard", async () => {
    const user = userEvent.setup();
    renderHeader("/");

    await user.click(screen.getByRole("button", { name: /all categories/i }));
    await user.keyboard("{ArrowDown}");

    // HeadlessUI v2 applies inert+aria-hidden to content outside the open
    // Listbox, so screen.getByRole("listbox") will not find it.
    // Query the DOM directly to bypass the accessibility-tree filter.
    await waitFor(() => {
      const listbox = document.querySelector('[role="listbox"]');
      expect(listbox).not.toBeNull();
      expect(listbox).toHaveAttribute("aria-activedescendant");
    });
  });

  it("Listbox options have role=option when open", async () => {
    const user = userEvent.setup();
    renderHeader("/");

    await user.click(screen.getByRole("button", { name: /all categories/i }));

    // HeadlessUI v2 applies inert+aria-hidden to content outside the open
    // Listbox — query the DOM directly to bypass the accessibility-tree filter.
    await waitFor(() => {
      const options = document.querySelectorAll('[role="option"]');
      expect(options.length).toBeGreaterThan(0);

      const labels = Array.from(options).map((o) => o.textContent ?? "");
      expect(labels.some((l) => /cocktail/i.test(l))).toBe(true);
    });
  });

  it("selecting an option via keyboard updates the trigger text", async () => {
    const user = userEvent.setup();
    renderHeader("/");

    const button = screen.getByRole("button", { name: /all categories/i });

    await user.click(button);
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(button.textContent).toMatch(/cocktail|ordinary drink/i);
    });
  });

  it("focus is not trapped after interacting with the header", async () => {
    const user = userEvent.setup();
    renderHeader("/");

    // Tab through all focusable elements until we land inside the nav,
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
