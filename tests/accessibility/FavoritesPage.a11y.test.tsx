import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import FavoritesPage from "@/views/FavoritesPage";
import { useAppStore } from "@/stores/useAppStore";
import type { AppState } from "@/stores/selectors";
import type { RecipeDetail } from "@/types";

expect.extend(toHaveNoViolations);

/* ================================================== */
/*                    Mocks                           */
/* ================================================== */

vi.mock("@/stores/useAppStore");

vi.mock("@/components/DrinkCard", () => ({
  default: ({ drink }: { drink: RecipeDetail }) => (
    <div data-testid="drink-card">{drink.strDrink}</div>
  ),
}));

const mockSetNotification = vi.fn();

/* ================================================== */
/*                Mock Recipe Factory                 */
/* ================================================== */

function createMockRecipe(
  overrides?: Partial<RecipeDetail>
): RecipeDetail {
  return {
    idDrink: "1",
    strDrink: "Test Drink",
    strDrinkThumb: "image.jpg",
    strInstructions: "Mix and serve.",
    strCategory: "Cocktail",

    strIngredient1: null,
    strIngredient2: null,
    strIngredient3: null,
    strIngredient4: null,
    strIngredient5: null,
    strIngredient6: null,
    strIngredient7: null,
    strIngredient8: null,
    strIngredient9: null,
    strIngredient10: null,
    strIngredient11: null,
    strIngredient12: null,
    strIngredient13: null,
    strIngredient14: null,
    strIngredient15: null,

    strMeasure1: null,
    strMeasure2: null,
    strMeasure3: null,
    strMeasure4: null,
    strMeasure5: null,
    strMeasure6: null,
    strMeasure7: null,
    strMeasure8: null,
    strMeasure9: null,
    strMeasure10: null,
    strMeasure11: null,
    strMeasure12: null,
    strMeasure13: null,
    strMeasure14: null,
    strMeasure15: null,

    ...overrides,
  };
}

/* ================================================== */
/*                    Store Helper                    */
/* ================================================== */

type Selector<T> = (state: AppState) => T;

function mockStore(partialState: Partial<AppState>) {
  vi.mocked(useAppStore).mockImplementation(
    <T,>(selector: Selector<T>): T =>
      selector(partialState as AppState)
  );
}

/* ================================================== */
/*                     TESTS                          */
/* ================================================== */

describe("FavoritesPage Accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state accessibly", async () => {
    mockStore({
      favorites: {},
      setNotification: mockSetNotification,
    });

    const { container } = render(<FavoritesPage />);

    expect(
      screen.getByRole("heading", { name: /no favorites yet/i })
    ).toBeInTheDocument();

    expect(screen.getByRole("main")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders favorites list accessibly", async () => {
    const mockRecipe = createMockRecipe({
      idDrink: "1",
      strDrink: "Margarita",
    });

    mockStore({
      favorites: { "1": mockRecipe },
      setNotification: mockSetNotification,
    });

    const { container } = render(<FavoritesPage />);

    expect(
      screen.getByRole("heading", { name: /my favorites/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/1 recipe saved/i)
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("drink-card")
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});