import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import IndexPage from "@/views/IndexPage";
import { useAppStore } from "@/stores/useAppStore";
import type { AppState } from "@/stores/selectors";
import type { Drink } from "@/types";

expect.extend(toHaveNoViolations);

/* ================================================== */
/*                    Mocks                           */
/* ================================================== */

vi.mock("@/stores/useAppStore");

vi.mock("@/components/DrinkCard", () => ({
  default: ({ drink }: { drink: Drink }) => (
    <div data-testid="drink-card">{drink.strDrink}</div>
  ),
}));

vi.mock("@/components/SkeletonDrinkCard", () => ({
  default: () => <div data-testid="skeleton-card" />,
}));

/* ================================================== */
/*                Mock Helpers                        */
/* ================================================== */

type Selector<T> = (state: AppState) => T;

function mockStore(state: AppState) {
  vi.mocked(useAppStore).mockImplementation(
    <T,>(selector: Selector<T>): T => selector(state)
  );
}

/* ================================================== */
/*                Mock Base State                     */
/* ================================================== */

const mockSearchRecipes = vi.fn();
const mockSetNotification = vi.fn();
const mockSelectRecipe = vi.fn();
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();
const mockCloseModal = vi.fn();
const mockClearNotification = vi.fn();
const mockFetchCategories = vi.fn();
const mockIsFavorite = vi.fn().mockReturnValue(false);

const baseState: AppState = {
  /* Recipes slice */
  drinks: { drinks: [] },
  categories: [],
  isLoading: false,
  modal: false,
  selectedRecipe: null,
  hasSearched: false,

  searchRecipes: mockSearchRecipes,
  selectRecipe: mockSelectRecipe,
  closeModal: mockCloseModal,
  fetchCategories: mockFetchCategories,

  /* Favorites slice */
  favorites: {},
  addFavorite: mockAddFavorite,
  removeFavorite: mockRemoveFavorite,
  isFavorite: mockIsFavorite,

  /* Notification slice */
  notification: null,
  setNotification: mockSetNotification,
  clearNotification: mockClearNotification,
};

/* ================================================== */
/*                     TESTS                          */
/* ================================================== */

describe("IndexPage Accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state accessibly", async () => {
    mockStore({
      ...baseState,
      drinks: { drinks: [] },
      isLoading: false,
      hasSearched: false,
    });

    const { container } = render(<IndexPage />);

    expect(
      screen.getByRole("heading", { name: /your perfect mix awaits/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /browse all recipes/i })
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders loading state accessibly", async () => {
    mockStore({
      ...baseState,
      isLoading: true,
    });

    const { container } = render(<IndexPage />);

    expect(
      screen.getByText(/mixing the perfect drinks for you/i)
    ).toBeInTheDocument();

    expect(screen.getAllByTestId("skeleton-card")).toHaveLength(8);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders drinks grid accessibly", async () => {
    const mockDrink: Drink = {
      idDrink: "1",
      strDrink: "Margarita",
      strDrinkThumb: "https://test.com/image.jpg",
      strCategory: "Cocktail",
    };

    mockIsFavorite.mockReturnValue(true);

    mockStore({
      ...baseState,
      drinks: { drinks: [mockDrink] },
      hasSearched: true,
    });

    const { container } = render(<IndexPage />);

    expect(
      screen.getByRole("heading", { name: /featured mixes/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/found 1 recipe/i)).toBeInTheDocument();

    expect(screen.getByTestId("drink-card")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /view all/i })
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});