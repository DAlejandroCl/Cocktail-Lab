import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import DrinkCard from "@/components/DrinkCard";
import type { Drink, RecipeDetail } from "@/types";
import type { AppState } from "@/stores/useAppStore";

vi.mock("@/stores/useAppStore", () => ({
  useAppStore: vi.fn(),
}));

import { useAppStore } from "@/stores/useAppStore";

const mockSelectRecipe = vi.fn();
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();
const mockSetNotification = vi.fn();

/* ---------- Drink (card view) ---------- */

const mockDrink: Drink = {
  idDrink: "123",
  strDrink: "Mojito",
  strDrinkThumb: "image.jpg",
  strCategory: "Cocktail",
};

/* ---------- RecipeDetail (full object) ---------- */

const mockRecipeDetail: RecipeDetail = {
  idDrink: "123",
  strDrink: "Mojito",
  strDrinkThumb: "image.jpg",
  strInstructions: "Mix ingredients",
  strCategory: "Cocktail",

  strIngredient1: "Rum",
  strIngredient2: "Mint",
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

  strMeasure1: "50ml",
  strMeasure2: "5 leaves",
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
};

/* ---------- Store Setup ---------- */

function setupStore(overrides?: Partial<AppState>) {
  const mockedUseAppStore = useAppStore as unknown as Mock;

  const baseState: Partial<AppState> = {
    selectRecipe: mockSelectRecipe,
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
    setNotification: mockSetNotification,
    favorites: {},
  };

  mockedUseAppStore.mockImplementation(
    (selector: (state: AppState) => unknown) =>
      selector({ ...baseState, ...overrides } as AppState),
  );
}

/* ---------- Tests ---------- */

describe("DrinkCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStore();
  });

  it("renders drink name and image", () => {
    render(<DrinkCard drink={mockDrink} />);

    expect(screen.getByText("Mojito")).toBeInTheDocument();
    expect(screen.getByAltText("Mojito")).toBeInTheDocument();
  });

  it("calls selectRecipe when clicking View Recipe", () => {
    render(<DrinkCard drink={mockDrink} />);

    fireEvent.click(screen.getByRole("button", { name: /view recipe/i }));

    expect(mockSelectRecipe).toHaveBeenCalledWith("123");
  });

  it("adds favorite when not already favorite", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: async () => ({
        drinks: [mockRecipeDetail],
      }),
    } as Response);

    render(<DrinkCard drink={mockDrink} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /add mojito to favorites/i,
      }),
    );

    await waitFor(() => {
      expect(mockAddFavorite).toHaveBeenCalledWith(mockRecipeDetail);
      expect(mockSetNotification).toHaveBeenCalledWith(
        "Added to favorites",
        "success",
      );
    });
  });

  it("removes favorite if already favorite", () => {
    setupStore({
      favorites: { "123": mockRecipeDetail },
    });

    render(<DrinkCard drink={mockDrink} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /remove mojito from favorites/i,
      }),
    );

    expect(mockRemoveFavorite).toHaveBeenCalledWith("123");
    expect(mockSetNotification).toHaveBeenCalledWith(
      "Removed from favorites",
      "info",
    );
  });

  it("shows error notification if fetch fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network error"),
    );

    render(<DrinkCard drink={mockDrink} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /add mojito to favorites/i,
      }),
    );

    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalledWith(
        "Unable to load cocktail details",
        "error",
      );
    });
  });
});