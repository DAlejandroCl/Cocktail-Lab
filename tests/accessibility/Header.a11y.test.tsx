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

    const button = screen.getByRole("button", { name: /all categories/i });

    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");

    expect(button).toHaveAttribute("aria-activedescendant");
  });

  it("Listbox options have role=option when open", async () => {
    const user = userEvent.setup();

    renderHeader("/");

    await user.click(screen.getByRole("button", { name: /all categories/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: /cocktail/i }),
      ).toBeInTheDocument();
    });
  });

  it("selecting an option via keyboard updates the trigger text", async () => {
    const user = userEvent.setup();

    renderHeader("/");

    const button = screen.getByRole("button", { name: /all categories/i });

    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(button.textContent).toMatch(/cocktail|ordinary drink/i);
  });

  it("focus is not trapped after interacting with the header", async () => {
    const user = userEvent.setup();

    renderHeader("/");

    const homeLink = screen.getByRole("link", { name: /^home$/i });

    await user.tab();
    expect(homeLink).toHaveFocus();

    await user.tab();
    expect(document.body).not.toHaveFocus();
  });
});
