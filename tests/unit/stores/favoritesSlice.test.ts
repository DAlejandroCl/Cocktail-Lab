import { describe, it, expect, beforeEach } from "vitest";
import { createStore } from "zustand/vanilla";
import { createFavoritesSlice } from "@/stores/favoritesSlice";
import type { RecipeDetail } from "@/types";

const createTestStore = () =>
  createStore(createFavoritesSlice);

const mockRecipe = (id: string): RecipeDetail => ({
  idDrink: id,
  strDrink: `Drink ${id}`,
  strCategory: "Cocktail",
  strInstructions: "Mix.",
  strDrinkThumb: "image.jpg",
} as RecipeDetail);

describe("favoritesSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it("has empty initial state", () => {
    expect(store.getState().favorites).toEqual({});
  });

  it("adds a favorite", () => {
    const recipe = mockRecipe("1");
    store.getState().addFavorite(recipe);
    expect(store.getState().favorites["1"]).toEqual(recipe);
  });

  it("removes a favorite", () => {
    const recipe = mockRecipe("1");
    store.getState().addFavorite(recipe);
    store.getState().removeFavorite("1");
    expect(store.getState().favorites["1"]).toBeUndefined();
  });

  it("isFavorite works correctly", () => {
    const recipe = mockRecipe("1");
    store.getState().addFavorite(recipe);
    expect(store.getState().isFavorite("1")).toBe(true);
    expect(store.getState().isFavorite("999")).toBe(false);
  });
});