import { describe, it, expect, vi } from "vitest";
import type { AppState } from "@/stores/selectors";
import type { Drink, RecipeDetail } from "@/types";

import {
  selectDrinks,
  selectIsLoading,
  selectModal,
  selectSelectedRecipe,
  selectSearchRecipes,
  selectSelectRecipe,
  selectCloseModal,
  selectFavoritesMap,
  selectAddFavorite,
  selectRemoveFavorite,
  selectIsFavorite,
  selectNotification,
  selectSetNotification,
  selectClearNotification,
  selectHasSearched,
} from "@/stores/selectors";

/* ================================================== */
/*                 VALID MOCK DATA                    */
/* ================================================== */

const mockDrink: Drink = {
  idDrink: "1",
  strDrink: "Margarita",
  strDrinkThumb: "https://example.com/image.jpg",
  strCategory: "Cocktail",
};

const mockRecipe: RecipeDetail = {
  idDrink: "1",
  strDrink: "Margarita",
  strDrinkThumb: "https://example.com/image.jpg",
  strInstructions: "Shake well and serve chilled.",
  strCategory: "Cocktail",

  strIngredient1: "Tequila",
  strIngredient2: "Lime Juice",
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

  strMeasure1: "2 oz",
  strMeasure2: "1 oz",
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

/* ================================================== */
/*                    MOCK STATE                      */
/* ================================================== */

const mockState = {
  /* -------- Recipes Slice -------- */
  categories: [],
  drinks: {
    drinks: [mockDrink],
  },
  selectedRecipe: mockRecipe,
  modal: true,
  isLoading: false,
  hasSearched: true,

  fetchCategories: vi.fn(),
  searchRecipes: vi.fn(),
  selectRecipe: vi.fn(),
  closeModal: vi.fn(),

  /* -------- Favorites Slice -------- */
  favorites: {
    "1": mockRecipe,
  },
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  isFavorite: vi.fn((id: string) => id === "1"),

  /* -------- Notification Slice -------- */
  notification: {
    message: "Saved successfully",
    type: "success",
  },
  setNotification: vi.fn(),
  clearNotification: vi.fn(),
} satisfies AppState;

/* ================================================== */
/*                     TEST SUITE                     */
/* ================================================== */

describe("Selectors", () => {
  /* ---------------- Recipes ---------------- */

  it("selectDrinks returns drinks", () => {
    expect(selectDrinks(mockState)).toEqual(mockState.drinks);
  });

  it("selectIsLoading returns loading state", () => {
    expect(selectIsLoading(mockState)).toBe(false);
  });

  it("selectModal returns modal state", () => {
    expect(selectModal(mockState)).toBe(true);
  });

  it("selectSelectedRecipe returns selected recipe", () => {
    expect(selectSelectedRecipe(mockState)).toEqual(mockRecipe);
  });

  it("selectHasSearched returns hasSearched flag", () => {
    expect(selectHasSearched(mockState)).toBe(true);
  });

  it("selectSearchRecipes returns searchRecipes function", () => {
    expect(selectSearchRecipes(mockState)).toBe(mockState.searchRecipes);
  });

  it("selectSelectRecipe returns selectRecipe function", () => {
    expect(selectSelectRecipe(mockState)).toBe(mockState.selectRecipe);
  });

  it("selectCloseModal returns closeModal function", () => {
    expect(selectCloseModal(mockState)).toBe(mockState.closeModal);
  });

  /* ---------------- Favorites ---------------- */

  it("selectFavoritesMap returns favorites map", () => {
    expect(selectFavoritesMap(mockState)).toEqual(mockState.favorites);
  });

  it("selectAddFavorite returns addFavorite function", () => {
    expect(selectAddFavorite(mockState)).toBe(mockState.addFavorite);
  });

  it("selectRemoveFavorite returns removeFavorite function", () => {
    expect(selectRemoveFavorite(mockState)).toBe(mockState.removeFavorite);
  });

  it("selectIsFavorite returns true when favorite exists", () => {
    expect(selectIsFavorite("1")(mockState)).toBe(true);
  });

  it("selectIsFavorite returns false when favorite does not exist", () => {
    expect(selectIsFavorite("999")(mockState)).toBe(false);
  });

  /* ---------------- Notification ---------------- */

  it("selectNotification returns notification object", () => {
    expect(selectNotification(mockState)).toEqual(mockState.notification);
  });

  it("selectSetNotification returns setNotification function", () => {
    expect(selectSetNotification(mockState)).toBe(mockState.setNotification);
  });

  it("selectClearNotification returns clearNotification function", () => {
    expect(selectClearNotification(mockState)).toBe(
      mockState.clearNotification,
    );
  });
});