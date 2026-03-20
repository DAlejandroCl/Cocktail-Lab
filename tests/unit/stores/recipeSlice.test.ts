import { describe, it, expect, vi, beforeEach } from "vitest";
import { createStore } from "zustand/vanilla";
import {
  createRecipesSlice,
  type RecipesSliceType,
} from "@/stores/recipeSlice";

// ─────────────────────────────────────────────
// Mock recipeService — must be declared before
// the named imports so TypeScript resolves the
// module through the mock factory at compile time
// ─────────────────────────────────────────────

vi.mock("@/services/recipeService", () => ({
  getCategories:    vi.fn(),
  getRecipes:       vi.fn(),
  getRecipeById:    vi.fn(),
  getBrowseRecipes: vi.fn(),
}));

import {
  getCategories,
  getRecipes,
  getRecipeById,
  getBrowseRecipes,
} from "@/services/recipeService";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const createTestStore = () =>
  createStore<RecipesSliceType>(createRecipesSlice);

const makeDrink = (id: string, name: string) => ({
  idDrink:       id,
  strDrink:      name,
  strDrinkThumb: "image.jpg",
  strCategory:   "Cocktail",
});

const makeRecipeDetail = (id: string, name: string) => ({
  idDrink:         id,
  strDrink:        name,
  strDrinkThumb:   "image.jpg",
  strInstructions: "Mix.",
  strCategory:     "Cocktail",
  strIngredient1:  "Rum",
  strIngredient2:  null, strIngredient3:  null, strIngredient4:  null,
  strIngredient5:  null, strIngredient6:  null, strIngredient7:  null,
  strIngredient8:  null, strIngredient9:  null, strIngredient10: null,
  strIngredient11: null, strIngredient12: null, strIngredient13: null,
  strIngredient14: null, strIngredient15: null,
  strMeasure1:     "50ml",
  strMeasure2:     null, strMeasure3:  null, strMeasure4:  null,
  strMeasure5:     null, strMeasure6:  null, strMeasure7:  null,
  strMeasure8:     null, strMeasure9:  null, strMeasure10: null,
  strMeasure11:    null, strMeasure12: null, strMeasure13: null,
  strMeasure14:    null, strMeasure15: null,
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("recipeSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  // ── Initial state ─────────────────────────────────────────────────────

  describe("initial state", () => {
    it("has empty categories", () => {
      expect(store.getState().categories).toEqual([]);
    });

    it("has empty drinks list", () => {
      expect(store.getState().drinks).toEqual({ drinks: [] });
    });

    it("has null selectedRecipe", () => {
      expect(store.getState().selectedRecipe).toBeNull();
    });

    it("has modal closed", () => {
      expect(store.getState().modal).toBe(false);
    });

    it("is not loading", () => {
      expect(store.getState().isLoading).toBe(false);
    });

    it("has not searched yet", () => {
      expect(store.getState().hasSearched).toBe(false);
    });

    it("does not have isBrowsing in state", () => {
      // isBrowsing was removed — browse vs filtered is handled at the view level
      expect((store.getState() as Record<string, unknown>).isBrowsing).toBeUndefined();
    });
  });

  // ── fetchCategories ───────────────────────────────────────────────────

  describe("fetchCategories", () => {
    it("sets categories on success", async () => {
      vi.mocked(getCategories).mockResolvedValue(["Cocktail", "Shot"]);

      await store.getState().fetchCategories();

      expect(store.getState().categories).toEqual(["Cocktail", "Shot"]);
    });

    it("keeps categories empty when the service throws", async () => {
      vi.mocked(getCategories).mockRejectedValue(new Error("Network error"));

      await store.getState().fetchCategories();

      expect(store.getState().categories).toEqual([]);
    });
  });

  // ── searchRecipes ─────────────────────────────────────────────────────

  describe("searchRecipes", () => {
    it("sets isLoading=true and hasSearched=true immediately", async () => {
      vi.mocked(getBrowseRecipes).mockResolvedValue([]);

      const promise = store.getState().searchRecipes({ category: "", ingredient: "" });

      expect(store.getState().isLoading).toBe(true);
      expect(store.getState().hasSearched).toBe(true);

      await promise;
    });

    it("sets isLoading=false after completing", async () => {
      vi.mocked(getBrowseRecipes).mockResolvedValue([]);

      await store.getState().searchRecipes({ category: "", ingredient: "" });

      expect(store.getState().isLoading).toBe(false);
    });

    it("calls getBrowseRecipes with store categories when filters are empty", async () => {
      // Pre-load categories into the store
      vi.mocked(getCategories).mockResolvedValue(["Cocktail", "Shot", "Beer"]);
      await store.getState().fetchCategories();

      vi.mocked(getBrowseRecipes).mockResolvedValue([]);

      await store.getState().searchRecipes({ category: "", ingredient: "" });

      expect(getBrowseRecipes).toHaveBeenCalledWith(["Cocktail", "Shot", "Beer"]);
      expect(getRecipes).not.toHaveBeenCalled();
    });

    it("calls getBrowseRecipes with empty array when no categories loaded yet", async () => {
      vi.mocked(getBrowseRecipes).mockResolvedValue([]);

      await store.getState().searchRecipes({ category: "", ingredient: "" });

      expect(getBrowseRecipes).toHaveBeenCalledWith([]);
    });

    it("calls getRecipes when ingredient filter is provided", async () => {
      const drinks = [makeDrink("1", "Mojito")];
      vi.mocked(getRecipes).mockResolvedValue(drinks);

      await store.getState().searchRecipes({ ingredient: "Rum", category: "" });

      expect(getRecipes).toHaveBeenCalledWith({ ingredient: "Rum", category: "" });
      expect(getBrowseRecipes).not.toHaveBeenCalled();
    });

    it("calls getRecipes when category filter is provided", async () => {
      const drinks = [makeDrink("1", "Mojito")];
      vi.mocked(getRecipes).mockResolvedValue(drinks);

      await store.getState().searchRecipes({ ingredient: "", category: "Shot" });

      expect(getRecipes).toHaveBeenCalledWith({ ingredient: "", category: "Shot" });
      expect(getBrowseRecipes).not.toHaveBeenCalled();
    });

    it("sorts drinks alphabetically when using filters", async () => {
      vi.mocked(getRecipes).mockResolvedValue([
        makeDrink("2", "Zombie"),
        makeDrink("1", "Aperol Spritz"),
      ]);

      await store.getState().searchRecipes({ category: "Cocktail", ingredient: "" });

      const names = store.getState().drinks.drinks.map((d) => d.strDrink);
      expect(names).toEqual(["Aperol Spritz", "Zombie"]);
    });

    it("stores the drinks returned by getBrowseRecipes in state", async () => {
      const drinks = [makeDrink("1", "Mojito"), makeDrink("2", "Daiquiri")];
      vi.mocked(getBrowseRecipes).mockResolvedValue(drinks);

      await store.getState().searchRecipes({ category: "", ingredient: "" });

      expect(store.getState().drinks.drinks).toHaveLength(2);
    });

    it("sets empty drinks and isLoading=false when getBrowseRecipes throws", async () => {
      vi.mocked(getBrowseRecipes).mockRejectedValue(new Error("API down"));

      await store.getState().searchRecipes({ category: "", ingredient: "" });

      expect(store.getState().drinks.drinks).toEqual([]);
      expect(store.getState().isLoading).toBe(false);
    });

    it("sets empty drinks and isLoading=false when getRecipes throws", async () => {
      vi.mocked(getRecipes).mockRejectedValue(new Error("API down"));

      await store.getState().searchRecipes({ category: "Shot", ingredient: "" });

      expect(store.getState().drinks.drinks).toEqual([]);
      expect(store.getState().isLoading).toBe(false);
    });
  });

  // ── selectRecipe ──────────────────────────────────────────────────────

  describe("selectRecipe", () => {
    it("sets selectedRecipe and opens modal on success", async () => {
      const detail = makeRecipeDetail("1", "Mojito");
      vi.mocked(getRecipeById).mockResolvedValue(detail);

      await store.getState().selectRecipe("1");

      expect(store.getState().selectedRecipe).toEqual(detail);
      expect(store.getState().modal).toBe(true);
    });

    it("does not open modal when the service throws", async () => {
      vi.mocked(getRecipeById).mockRejectedValue(new Error("Not found"));

      await store.getState().selectRecipe("999");

      expect(store.getState().selectedRecipe).toBeNull();
      expect(store.getState().modal).toBe(false);
    });
  });

  // ── closeModal ────────────────────────────────────────────────────────

  describe("closeModal", () => {
    it("sets modal=false and clears selectedRecipe", async () => {
      const detail = makeRecipeDetail("1", "Mojito");
      vi.mocked(getRecipeById).mockResolvedValue(detail);

      await store.getState().selectRecipe("1");
      expect(store.getState().modal).toBe(true);

      store.getState().closeModal();

      expect(store.getState().modal).toBe(false);
      expect(store.getState().selectedRecipe).toBeNull();
    });
  });
});
