import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/Header";
import type { Drink } from "@/types";
import { useAppStore } from "@/stores/useAppStore";

expect.extend(toHaveNoViolations);

/* -------------------------------------------------- */
/*              Setup Zustand Store                   */
/* -------------------------------------------------- */

beforeEach(() => {
  useAppStore.setState({
    ...useAppStore.getState(),
    categories: ["Cocktail", "Ordinary Drink"],
    drinks: { drinks: [] },
    isLoading: false,
    favorites: {},
    fetchCategories: vi.fn(),
    searchRecipes: vi.fn(),
    setNotification: vi.fn(),
  });
});

/* -------------------------------------------------- */
/*               Helper Renderer                      */
/* -------------------------------------------------- */

const renderWithRouter = (route = "/") => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Header />
    </MemoryRouter>
  );
};

/* ================================================== */
/*                  Accessibility Tests               */
/* ================================================== */

describe("Header Accessibility – WCAG Advanced", () => {
  /* ---------------- Automated Axe ---------------- */

  it("should have no accessibility violations", async () => {
    const { container } = renderWithRouter("/");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  /* ---------------- Navigation ---------------- */

  it("renders navigation landmark with correct label", () => {
    renderWithRouter("/");
    expect(
      screen.getByRole("navigation", { name: /main navigation/i })
    ).toBeInTheDocument();
  });

  it("sets aria-current on active link", () => {
    renderWithRouter("/favorites");
    expect(
      screen.getByRole("link", { name: /favorites/i })
    ).toHaveAttribute("aria-current", "page");
  });

  /* ================================================== */
  /*                     FORM TESTS                     */
  /* ================================================== */

  it("renders search landmark on home page", () => {
    renderWithRouter("/");
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("applies aria-busy when loading", () => {
    useAppStore.setState({
      ...useAppStore.getState(),
      isLoading: true,
    });

    renderWithRouter("/");
    expect(screen.getByRole("search")).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("focuses ingredient input when validation fails", async () => {
    const user = userEvent.setup();
    renderWithRouter("/");

    const submitButton = screen.getByRole("button", { name: /search/i });
    const input = screen.getByLabelText(
      /search cocktails by ingredient/i
    );

    await user.click(submitButton);
    expect(input).toHaveFocus();
  });

  /* ================================================== */
  /*               LISTBOX ACCESSIBILITY                */
  /* ================================================== */

  it("updates aria-expanded dynamically", async () => {
    const user = userEvent.setup();
    renderWithRouter("/");

    const button = screen.getByRole("button", {
      name: /all categories/i,
    });

    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("manages aria-activedescendant correctly", async () => {
    const user = userEvent.setup();
    renderWithRouter("/");

    const button = screen.getByRole("button", {
      name: /all categories/i,
    });

    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");

    expect(button).toHaveAttribute("aria-activedescendant");
  });

  it("selects option via keyboard and updates text", async () => {
    const user = userEvent.setup();
    renderWithRouter("/");

    const button = screen.getByRole("button", {
      name: /all categories/i,
    });

    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(button.textContent).toMatch(/cocktail|ordinary drink/i);
  });

  /* ================================================== */
  /*                 ARIA-LIVE RESULTS                  */
  /* ================================================== */

  const getLiveRegion = () =>
    screen.getByText((_, element) =>
      element?.getAttribute("aria-live") === "polite"
    );

  it("renders exactly one polite live region", () => {
    renderWithRouter("/");

    const regions = screen.getAllByText((_, element) =>
      element?.getAttribute("aria-live") === "polite"
    );

    expect(regions).toHaveLength(1);
  });

  it("live region uses aria-atomic=true", () => {
    renderWithRouter("/");
    expect(getLiveRegion()).toHaveAttribute("aria-atomic", "true");
  });

  it("announces exact result count when drinks update", async () => {
    const { rerender } = renderWithRouter("/");

    const mockDrinks: Drink[] = [
      {
        idDrink: "1",
        strDrink: "Test 1",
        strDrinkThumb: "https://example.com/drink1.jpg",
        strCategory: "Cocktail",
      },
      {
        idDrink: "2",
        strDrink: "Test 2",
        strDrinkThumb: "https://example.com/drink2.jpg",
        strCategory: "Cocktail",
      },
    ];

    useAppStore.setState({
      ...useAppStore.getState(),
      drinks: { drinks: mockDrinks },
    });

    rerender(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getLiveRegion().textContent).toMatch(/2/i);
    });
  });

  it("announces no results found", async () => {
    const { rerender } = renderWithRouter("/");

    useAppStore.setState({
      ...useAppStore.getState(),
      drinks: { drinks: [] },
    });

    rerender(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getLiveRegion().textContent).toMatch(/no results/i);
    });
  });

  it("does NOT announce while loading", async () => {
    useAppStore.setState({
      ...useAppStore.getState(),
      isLoading: true,
    });

    renderWithRouter("/");

    expect(getLiveRegion().textContent).toBe("");
  });

  it("focus is not trapped after announcement", async () => {
    const user = userEvent.setup();
    renderWithRouter("/");

    const homeLink = screen.getByRole("link", { name: /home/i });

    await user.tab();
    expect(homeLink).toHaveFocus();

    await user.tab();
    expect(document.body).not.toHaveFocus();
  });
});