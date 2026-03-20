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
  selectFavoriteOrder,
  selectAddFavorite,
  selectRemoveFavorite,
  selectIsFavorite,
  selectNotification,
  selectSetNotification,
  selectClearNotification,
  selectHasSearched,
  // AI selectors
  selectAiIngredients,
  selectGeneratedRecipe,
  selectIsGenerating,
  selectGenerationError,
  selectAiRecipes,
  selectAddIngredient,
  selectRemoveIngredient,
  selectClearIngredients,
  selectGenerateRecipe,
  selectClearGeneratedRecipe,
  selectSaveAiRecipe,
  selectRemoveAiRecipe,
  selectIsAiRecipeSaved,
} from "@/stores/selectors";
import { makeGeneratedRecipe } from "../../mocks/factories";

/* ================================================== */
/*                 VALID MOCK DATA                    */
/* ================================================== */

const mockDrink: Drink = {
  idDrink:       "1",
  strDrink:      "Margarita",
  strDrinkThumb: "https://example.com/image.jpg",
  strCategory:   "Cocktail",
};

const mockRecipe: RecipeDetail = {
  idDrink:          "1",
  strDrink:         "Margarita",
  strDrinkThumb:    "https://example.com/image.jpg",
  strInstructions:  "Shake well and serve chilled.",
  strCategory:      "Cocktail",

  strIngredient1:  "Tequila",
  strIngredient2:  "Lime Juice",
  strIngredient3:  null,
  strIngredient4:  null,
  strIngredient5:  null,
  strIngredient6:  null,
  strIngredient7:  null,
  strIngredient8:  null,
  strIngredient9:  null,
  strIngredient10: null,
  strIngredient11: null,
  strIngredient12: null,
  strIngredient13: null,
  strIngredient14: null,
  strIngredient15: null,

  strMeasure1:  "2 oz",
  strMeasure2:  "1 oz",
  strMeasure3:  null,
  strMeasure4:  null,
  strMeasure5:  null,
  strMeasure6:  null,
  strMeasure7:  null,
  strMeasure8:  null,
  strMeasure9:  null,
  strMeasure10: null,
  strMeasure11: null,
  strMeasure12: null,
  strMeasure13: null,
  strMeasure14: null,
  strMeasure15: null,
};

const mockAiRecipe = makeGeneratedRecipe({ idDrink: "ai-test-1" });

/* ================================================== */
/*                    MOCK STATE                      */
/* ================================================== */

const mockState = {
  /* ── RecipesSlice ── */
  categories:     [],
  drinks:         { drinks: [mockDrink] },
  selectedRecipe: mockRecipe,
  modal:          true,
  isLoading:      false,
  hasSearched:    true,

  fetchCategories: vi.fn(),
  searchRecipes:   vi.fn(),
  selectRecipe:    vi.fn(),
  closeModal:      vi.fn(),

  /* ── FavoritesSlice ── */
  favorites:      { "1": mockRecipe },
  favoriteOrder:  { "1": 1700000000000 },
  addFavorite:    vi.fn(),
  removeFavorite: vi.fn(),
  isFavorite:     vi.fn((id: string) => id === "1"),

  /* ── NotificationSlice ── */
  notification: { message: "Saved successfully", type: "success" as const },
  setNotification:   vi.fn(),
  clearNotification: vi.fn(),

  /* ── AiRecipeSlice ── */
  aiIngredients:    ["Vodka", "Lime juice"],
  generatedRecipe:  mockAiRecipe,
  isGenerating:     false,
  generationError:  null,
  aiRecipes:        [mockAiRecipe],

  addIngredient:        vi.fn(),
  removeIngredient:     vi.fn(),
  clearIngredients:     vi.fn(),
  generateRecipe:       vi.fn(),
  clearGeneratedRecipe: vi.fn(),
  saveAiRecipe:         vi.fn(),
  removeAiRecipe:       vi.fn(),
} satisfies AppState;

/* ================================================== */
/*                     TEST SUITE                     */
/* ================================================== */

describe("Selectors", () => {

  /* ── RecipesSlice ── */

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

  /* ── FavoritesSlice ── */

  it("selectFavoritesMap returns favorites map", () => {
    expect(selectFavoritesMap(mockState)).toEqual(mockState.favorites);
  });

  it("selectFavoriteOrder returns favoriteOrder timestamp record", () => {
    expect(selectFavoriteOrder(mockState)).toEqual(mockState.favoriteOrder);
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

  /* ── NotificationSlice ── */

  it("selectNotification returns notification object", () => {
    expect(selectNotification(mockState)).toEqual(mockState.notification);
  });

  it("selectSetNotification returns setNotification function", () => {
    expect(selectSetNotification(mockState)).toBe(mockState.setNotification);
  });

  it("selectClearNotification returns clearNotification function", () => {
    expect(selectClearNotification(mockState)).toBe(mockState.clearNotification);
  });

  /* ── AiRecipeSlice ── */

  it("selectAiIngredients returns aiIngredients array", () => {
    expect(selectAiIngredients(mockState)).toEqual(["Vodka", "Lime juice"]);
  });

  it("selectGeneratedRecipe returns generatedRecipe", () => {
    expect(selectGeneratedRecipe(mockState)).toEqual(mockAiRecipe);
  });

  it("selectIsGenerating returns isGenerating flag", () => {
    expect(selectIsGenerating(mockState)).toBe(false);
  });

  it("selectGenerationError returns generationError", () => {
    expect(selectGenerationError(mockState)).toBeNull();
  });

  it("selectAiRecipes returns saved AI recipes", () => {
    expect(selectAiRecipes(mockState)).toEqual([mockAiRecipe]);
  });

  it("selectAddIngredient returns addIngredient function", () => {
    expect(selectAddIngredient(mockState)).toBe(mockState.addIngredient);
  });

  it("selectRemoveIngredient returns removeIngredient function", () => {
    expect(selectRemoveIngredient(mockState)).toBe(mockState.removeIngredient);
  });

  it("selectClearIngredients returns clearIngredients function", () => {
    expect(selectClearIngredients(mockState)).toBe(mockState.clearIngredients);
  });

  it("selectGenerateRecipe returns generateRecipe function", () => {
    expect(selectGenerateRecipe(mockState)).toBe(mockState.generateRecipe);
  });

  it("selectClearGeneratedRecipe returns clearGeneratedRecipe function", () => {
    expect(selectClearGeneratedRecipe(mockState)).toBe(mockState.clearGeneratedRecipe);
  });

  it("selectSaveAiRecipe returns saveAiRecipe function", () => {
    expect(selectSaveAiRecipe(mockState)).toBe(mockState.saveAiRecipe);
  });

  it("selectRemoveAiRecipe returns removeAiRecipe function", () => {
    expect(selectRemoveAiRecipe(mockState)).toBe(mockState.removeAiRecipe);
  });

  it("selectIsAiRecipeSaved returns true when the recipe is in aiRecipes", () => {
    expect(selectIsAiRecipeSaved("ai-test-1")(mockState)).toBe(true);
  });

  it("selectIsAiRecipeSaved returns false when the recipe is not in aiRecipes", () => {
    expect(selectIsAiRecipeSaved("non-existent-id")(mockState)).toBe(false);
  });
});
