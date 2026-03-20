import { describe, it, expect, beforeEach, vi } from "vitest";
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

  // ── Initial state ──────────────────────────────────────────────────────

  it("has empty favorites in initial state", () => {
    expect(store.getState().favorites).toEqual({});
  });

  it("has empty favoriteOrder in initial state", () => {
    expect(store.getState().favoriteOrder).toEqual({});
  });

  // ── addFavorite ────────────────────────────────────────────────────────

  it("adds a recipe to favorites", () => {
    const recipe = mockRecipe("1");
    store.getState().addFavorite(recipe);
    expect(store.getState().favorites["1"]).toEqual(recipe);
  });

  it("records a timestamp in favoriteOrder when adding a favorite", () => {
    const before = Date.now();
    store.getState().addFavorite(mockRecipe("1"));
    const after  = Date.now();

    const timestamp = store.getState().favoriteOrder["1"];
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  it("uses Date.now() as the timestamp value", () => {
    const mockNow = 1700000000000;
    vi.spyOn(Date, "now").mockReturnValue(mockNow);

    store.getState().addFavorite(mockRecipe("1"));

    expect(store.getState().favoriteOrder["1"]).toBe(mockNow);

    vi.restoreAllMocks();
  });

  it("later-added favorites have a higher timestamp than earlier ones", () => {
    let tick = 1000;
    vi.spyOn(Date, "now").mockImplementation(() => tick++);

    store.getState().addFavorite(mockRecipe("1"));
    store.getState().addFavorite(mockRecipe("2"));

    expect(store.getState().favoriteOrder["2"]).toBeGreaterThan(
      store.getState().favoriteOrder["1"],
    );

    vi.restoreAllMocks();
  });

  // ── removeFavorite ─────────────────────────────────────────────────────

  it("removes the recipe from favorites", () => {
    const recipe = mockRecipe("1");
    store.getState().addFavorite(recipe);
    store.getState().removeFavorite("1");
    expect(store.getState().favorites["1"]).toBeUndefined();
  });

  it("removes the timestamp from favoriteOrder when removing a favorite", () => {
    store.getState().addFavorite(mockRecipe("1"));
    store.getState().removeFavorite("1");
    expect(store.getState().favoriteOrder["1"]).toBeUndefined();
  });

  it("only removes the targeted entry from favoriteOrder", () => {
    store.getState().addFavorite(mockRecipe("1"));
    store.getState().addFavorite(mockRecipe("2"));
    store.getState().removeFavorite("1");

    expect(store.getState().favoriteOrder["2"]).toBeDefined();
  });

  // ── isFavorite ─────────────────────────────────────────────────────────

  it("isFavorite returns true when the recipe is saved", () => {
    store.getState().addFavorite(mockRecipe("1"));
    expect(store.getState().isFavorite("1")).toBe(true);
  });

  it("isFavorite returns false when the recipe is not saved", () => {
    expect(store.getState().isFavorite("999")).toBe(false);
  });

  it("isFavorite returns false after removing a previously added recipe", () => {
    store.getState().addFavorite(mockRecipe("1"));
    store.getState().removeFavorite("1");
    expect(store.getState().isFavorite("1")).toBe(false);
  });
});