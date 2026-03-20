import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/Header";
import type { AppState } from "@/stores/selectors";

vi.mock("@/stores/useAppStore", () => ({
  useAppStore: vi.fn(),
}));

import { useAppStore } from "@/stores/useAppStore";

// ─────────────────────────────────────────────
// Action mocks
// ─────────────────────────────────────────────

const mockFetchCategories = vi.fn();
const mockSearchRecipes = vi.fn();
const mockSetNotification = vi.fn();

// ─────────────────────────────────────────────
// Store helper
// ─────────────────────────────────────────────

function setupStore(overrides?: Partial<AppState>) {
  const mockedUseAppStore = useAppStore as unknown as Mock;

  const baseState: Partial<AppState> = {
    fetchCategories: mockFetchCategories,
    categories: ["Cocktail", "Ordinary Drink"],
    searchRecipes: mockSearchRecipes,
    drinks: { drinks: [] },
    isLoading: false,
    setNotification: mockSetNotification,
  };

  mockedUseAppStore.mockImplementation(
    (selector: (state: AppState) => unknown) =>
      selector({ ...baseState, ...overrides } as AppState),
  );
}

// ─────────────────────────────────────────────
// Render helper
// ─────────────────────────────────────────────

function renderHeader(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStore();
  });

  it("calls fetchCategories on mount", () => {
    renderHeader();

    expect(mockFetchCategories).toHaveBeenCalledTimes(1);
  });

  it("renders navigation links", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /favorites/i })).toBeInTheDocument();
  });

  it("renders the search form on the home route", () => {
    renderHeader("/");
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("does not render the search form on other routes", () => {
    renderHeader("/favorites");
    expect(screen.queryByRole("search")).not.toBeInTheDocument();
  });

  it("shows error notification when submitting without any filters", async () => {
    const user = userEvent.setup();

    renderHeader();

    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockSetNotification).toHaveBeenCalledWith(
      "Please enter an ingredient or select a category.",
      "error",
    );
  });

  it("calls searchRecipes with ingredient when only ingredient is provided", async () => {
    const user = userEvent.setup();

    renderHeader();

    await user.type(
      screen.getByPlaceholderText(/search by ingredient/i),
      "Gin",
    );
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockSearchRecipes).toHaveBeenCalledWith({
      ingredient: "Gin",
      category: "",
    });
  });

  it("calls searchRecipes with category when only category is selected", async () => {
    const user = userEvent.setup();

    renderHeader();

    // Open the Listbox
    await user.click(screen.getByRole("button", { name: /all categories/i }));

    // HeadlessUI v2 applies inert to the outer container when open — query
    // the option directly from the DOM to bypass the accessibility-tree filter.
    await waitFor(() => {
      const options = document.querySelectorAll('[role="option"]');
      expect(options.length).toBeGreaterThan(0);
    });

    const cocktailOption = Array.from(
      document.querySelectorAll('[role="option"]'),
    ).find((el) => el.textContent?.trim() === "Cocktail")!;

    await user.click(cocktailOption);

    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockSearchRecipes).toHaveBeenCalledWith({
      ingredient: "",
      category: "Cocktail",
    });
  });

  it("does not call searchRecipes while loading", async () => {
    const user = userEvent.setup();

    setupStore({ isLoading: true });

    renderHeader();

    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockSearchRecipes).not.toHaveBeenCalled();
  });

  it("shows aria-busy=true on the search form while loading", () => {
    setupStore({ isLoading: true });

    renderHeader();

    // Header sets aria-busy on the form element, not disabled on the button.
    expect(screen.getByRole("search")).toHaveAttribute("aria-busy", "true");
  });
});
