import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/Header";
import type { AppState } from "@/stores/useAppStore";

vi.mock("@/stores/useAppStore", () => ({
  useAppStore: vi.fn(),
}));

import { useAppStore } from "@/stores/useAppStore";

/* -------------------- Mocks -------------------- */

const mockFetchCategories = vi.fn();
const mockSearchRecipes = vi.fn();
const mockSetNotification = vi.fn();

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

function renderHeader(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
}

/* -------------------- Tests -------------------- */

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
    expect(
      screen.getByRole("link", { name: /favorites/i }),
    ).toBeInTheDocument();
  });

  it("renders search form only on home route", () => {
    renderHeader("/");
    expect(screen.getByRole("search")).toBeInTheDocument();

    renderHeader("/favorites");
    expect(screen.queryByRole("search")).not.toBeInTheDocument();
  });

  it("shows error if submitting without filters", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockSetNotification).toHaveBeenCalledWith(
      "Please enter an ingredient or select a category.",
      "error",
    );
  });

  it("calls searchRecipes when ingredient is provided", async () => {
    const user = userEvent.setup();
    renderHeader();

    const input = screen.getByPlaceholderText(/search by ingredients/i);

    await user.type(input, "Gin");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockSearchRecipes).toHaveBeenCalledWith({
      ingredient: "Gin",
      category: "",
    });
  });

  it("calls searchRecipes when category is selected", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByText("All Categories"));
    await user.click(screen.getByText("Cocktail"));
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockSearchRecipes).toHaveBeenCalledWith({
      ingredient: "",
      category: "Cocktail",
    });
  });

  it("disables search button while loading", () => {
    setupStore({ isLoading: true });

    renderHeader();

    const button = screen.getByRole("button", { name: /search/i });
    expect(button).toBeDisabled();
  });

  it("does not call searchRecipes while loading", async () => {
    const user = userEvent.setup();
    setupStore({ isLoading: true });

    renderHeader();

    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockSearchRecipes).not.toHaveBeenCalled();
  });
});