import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCategories,
  getRecipes,
  getRecipeById,
  getBrowseRecipes,
} from "@/services/recipeService";
import type { SearchFilters, Drink } from "@/types";

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

const validDrink = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strCategory: "Cocktail",
};

const validDrink2 = {
  idDrink: "2",
  strDrink: "Daiquiri",
  strDrinkThumb: "https://image.com/daiquiri.jpg",
  strCategory: "Cocktail",
};

const validDrinkNoCategory = {
  idDrink: "3",
  strDrink: "Mystery",
  strDrinkThumb: "https://image.com/mystery.jpg",
};

const validRecipeDetail = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strInstructions: "Mix it.",
  strCategory: "Cocktail",
  strAlcoholic: "Alcoholic",
  strGlass: "Highball",
  strIngredient1: "Rum",
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
  strMeasure1: "50ml",
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
};

const invalidFilters: SearchFilters = {
  category: undefined,
  ingredient: undefined,
};

// ─────────────────────────────────────────────
// fetch mock helpers
// ─────────────────────────────────────────────

function makeFetchResponse(data: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? "OK" : "Internal Server Error",
    json: async () => data,
  } as Response;
}

function mockFetch(data: unknown, ok = true) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(makeFetchResponse(data, ok));
}

function mockFetchOnce(data: unknown, ok = true) {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(makeFetchResponse(data, ok));
}

function mockFetchRejected(error = new Error("Network error")) {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(error);
}

function mockFetchRejectedOnce(error = new Error("Network error")) {
  vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(error);
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("recipeService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ── getCategories ──────────────────────────────────────────────────────

  describe("getCategories", () => {
    it("returns categories when API response is valid", async () => {
      mockFetch({ drinks: [{ strCategory: "Cocktail" }, { strCategory: "Shot" }] });

      const result = await getCategories();

      expect(result).toEqual(["Cocktail", "Shot"]);
    });

    it("returns empty array on network error", async () => {
      mockFetchRejected();

      const result = await getCategories();

      expect(result).toEqual([]);
    });

    it("returns empty array when response is not ok", async () => {
      mockFetch({}, false);

      const result = await getCategories();

      expect(result).toEqual([]);
    });

    it("returns empty array when schema validation fails", async () => {
      mockFetch({ wrong: "shape" });

      const result = await getCategories();

      expect(result).toEqual([]);
    });

    it("returns empty array when drinks is null", async () => {
      mockFetch({ drinks: null });

      const result = await getCategories();

      expect(result).toEqual([]);
    });
  });

  // ── getRecipes — ingredient only ──────────────────────────────────────

  describe("getRecipes — ingredient only", () => {
    it("merges and deduplicates searchByName and searchByIngredient results", async () => {
      mockFetchOnce({ drinks: [validDrink] });
      mockFetchOnce({ drinks: [validDrink, validDrink2] });

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result).toHaveLength(2);
    });

    it("enriches drinks missing strCategory by fetching their detail", async () => {
      mockFetchOnce({ drinks: [validDrinkNoCategory] });
      mockFetchOnce({ drinks: [] });
      mockFetchOnce({ drinks: [validRecipeDetail] });

      const result = await getRecipes({ ingredient: "Mystery" });

      expect(result[0].strCategory).toBe("Cocktail");
    });

    it("returns drink without category when enrichment fetch fails", async () => {
      mockFetchOnce({ drinks: [validDrinkNoCategory] });
      mockFetchOnce({ drinks: [] });
      mockFetchRejectedOnce();

      const result = await getRecipes({ ingredient: "Mystery" });

      expect(result[0].idDrink).toBe("3");
      expect(result[0].strCategory).toBeUndefined();
    });

    it("throws when no filters provided", async () => {
      await expect(getRecipes(invalidFilters)).rejects.toThrow(
        "No search filters provided",
      );
    });

    it("handles not-ok response from searchByName gracefully", async () => {
      mockFetchOnce({}, false);
      mockFetchOnce({ drinks: [validDrink] });

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result.some((d: Drink) => d.idDrink === "1")).toBe(true);
    });

    it("handles invalid schema from searchByName gracefully", async () => {
      mockFetchOnce({ wrong: "shape" });
      mockFetchOnce({ drinks: [validDrink] });

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result.some((d: Drink) => d.idDrink === "1")).toBe(true);
    });

    it("handles null drinks array in searchByName", async () => {
      mockFetchOnce({ drinks: null });
      mockFetchOnce({ drinks: [validDrink] });

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result).toHaveLength(1);
    });

    it("handles not-ok response from searchByIngredient gracefully", async () => {
      mockFetchOnce({ drinks: [validDrink] });
      mockFetchOnce({}, false);

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result.some((d: Drink) => d.idDrink === "1")).toBe(true);
    });

    it("handles invalid schema from searchByIngredient gracefully", async () => {
      mockFetchOnce({ drinks: [validDrink] });
      mockFetchOnce({ wrong: "shape" });

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result.some((d: Drink) => d.idDrink === "1")).toBe(true);
    });

    it("handles null drinks array in searchByIngredient", async () => {
      mockFetchOnce({ drinks: [validDrink] });
      mockFetchOnce({ drinks: null });

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result).toHaveLength(1);
    });
  });

  // ── getRecipes — category only ────────────────────────────────────────

  describe("getRecipes — category only", () => {
    it("returns drinks with strCategory injected from the filter", async () => {
      mockFetch({ drinks: [{ idDrink: "1", strDrink: "Mojito", strDrinkThumb: "https://image.com/mojito.jpg" }] });

      const result = await getRecipes({ category: "Cocktail" });

      expect(result[0].strCategory).toBe("Cocktail");
    });

    it("returns empty array when no drinks found for category", async () => {
      mockFetch({ drinks: [] });

      const result = await getRecipes({ category: "Cocktail" });

      expect(result).toEqual([]);
    });

    it("returns empty array when searchByCategory returns not-ok response", async () => {
      mockFetch({}, false);

      const result = await getRecipes({ category: "Cocktail" });

      expect(result).toEqual([]);
    });

    it("returns empty array when searchByCategory schema fails", async () => {
      mockFetch({ wrong: "shape" });

      const result = await getRecipes({ category: "Cocktail" });

      expect(result).toEqual([]);
    });

    it("returns empty array when drinks is null in searchByCategory", async () => {
      mockFetch({ drinks: null });

      const result = await getRecipes({ category: "Cocktail" });

      expect(result).toEqual([]);
    });
  });

  // ── getRecipes — ingredient + category combined ───────────────────────

  describe("getRecipes — ingredient + category combined", () => {
    it("filters combined results by the specified category", async () => {
      const cocktailDrink = { ...validDrink,  strCategory: "Cocktail" };
      const shotDrink     = { ...validDrink2, strCategory: "Shot"     };

      mockFetchOnce({ drinks: [cocktailDrink] });
      mockFetchOnce({ drinks: [cocktailDrink, shotDrink] });

      const result = await getRecipes({ ingredient: "Rum", category: "Cocktail" });

      expect(result.every((d: Drink) => d.strCategory === "Cocktail")).toBe(true);
    });

    it("returns empty array when no drinks match the category after filtering", async () => {
      mockFetchOnce({ drinks: [validDrink] });
      mockFetchOnce({ drinks: [] });

      const result = await getRecipes({ ingredient: "Rum", category: "Shot" });

      expect(result).toEqual([]);
    });

    it("enriches drinks without category before filtering in combined mode", async () => {
      mockFetchOnce({ drinks: [validDrinkNoCategory] });
      mockFetchOnce({ drinks: [] });
      mockFetchOnce({ drinks: [{ ...validRecipeDetail, idDrink: "3", strCategory: "Cocktail" }] });

      const result = await getRecipes({ ingredient: "Mystery", category: "Cocktail" });

      expect(result[0].strCategory).toBe("Cocktail");
    });
  });

  // ── getRecipeById ──────────────────────────────────────────────────────

  describe("getRecipeById", () => {
    it("returns parsed recipe detail on success", async () => {
      mockFetch({ drinks: [validRecipeDetail] });

      const result = await getRecipeById("1");

      expect(result.idDrink).toBe("1");
      expect(result.strDrink).toBe("Mojito");
    });

    it("throws 'Recipe not found' when drinks array is empty", async () => {
      mockFetch({ drinks: [] });

      await expect(getRecipeById("999")).rejects.toThrow("Recipe not found");
    });

    it("throws 'Recipe not found' when drinks key is missing from response", async () => {
      mockFetch({ something: "else" });

      await expect(getRecipeById("999")).rejects.toThrow("Recipe not found");
    });

    it("throws 'Invalid API response' when response is not ok", async () => {
      mockFetch({}, false);

      await expect(getRecipeById("1")).rejects.toThrow("Invalid API response");
    });

    it("throws 'Invalid recipe data' when schema parse fails", async () => {
      mockFetch({ drinks: [{ idDrink: "1" }] });

      await expect(getRecipeById("1")).rejects.toThrow("Invalid recipe data");
    });

    it("throws on network error", async () => {
      mockFetchRejected();

      await expect(getRecipeById("1")).rejects.toThrow("Invalid API response");
    });
  });

  // ── getBrowseRecipes ───────────────────────────────────────────────────

  describe("getBrowseRecipes", () => {
    it("returns an array of drinks when categories are provided", async () => {
      mockFetchOnce({ drinks: [validDrink] });
      mockFetchOnce({ drinks: [validDrink2] });

      const result = await getBrowseRecipes(["Cocktail", "Shot"]);

      expect(result.length).toBeGreaterThan(0);
    });

    it("injects strCategory from the category parameter into each drink", async () => {
      mockFetchOnce({ drinks: [{ idDrink: "1", strDrink: "Mojito", strDrinkThumb: "img.jpg" }] });

      const result = await getBrowseRecipes(["Cocktail"]);

      expect(result[0].strCategory).toBe("Cocktail");
    });

    it("deduplicates drinks that appear in multiple categories", async () => {
      mockFetchOnce({ drinks: [validDrink] });
      mockFetchOnce({ drinks: [validDrink] });

      const result = await getBrowseRecipes(["Cocktail", "Shot"]);

      const ids = result.map((d) => d.idDrink);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("caps drinks at 12 per category", async () => {
      const manyDrinks = Array.from({ length: 15 }, (_, i) => ({
        idDrink: String(i + 1),
        strDrink: `Drink ${i + 1}`,
        strDrinkThumb: `https://image.com/${i + 1}.jpg`,
      }));

      mockFetchOnce({ drinks: manyDrinks });

      const result = await getBrowseRecipes(["Cocktail"]);

      expect(result.length).toBeLessThanOrEqual(12);
    });

    it("returns empty array when given an empty categories list", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const result = await getBrowseRecipes([]);

      expect(result).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("skips categories that return not-ok response from the API", async () => {
      mockFetchOnce({}, false);
      mockFetchOnce({ drinks: [validDrink2] });

      const result = await getBrowseRecipes(["Cocktail", "Shot"]);

      expect(result.some((d) => d.idDrink === "2")).toBe(true);
    });

    it("skips categories that return null drinks array", async () => {
      mockFetchOnce({ drinks: null });
      mockFetchOnce({ drinks: [validDrink] });

      const result = await getBrowseRecipes(["Cocktail", "Shot"]);

      expect(result).toHaveLength(1);
    });

    it("returns a shuffled result — same elements, potentially different order", async () => {
      const drinks = Array.from({ length: 6 }, (_, i) => ({
        idDrink: String(i + 1),
        strDrink: `Drink ${i + 1}`,
        strDrinkThumb: `https://image.com/${i + 1}.jpg`,
      }));

      mockFetchOnce({ drinks });

      const result = await getBrowseRecipes(["Cocktail"]);

      const resultIds = result.map((d) => d.idDrink).sort();
      const sourceIds = drinks.map((d) => d.idDrink).sort();
      expect(resultIds).toEqual(sourceIds);
    });
  });

  // ── deduplicate — internal edge case ──────────────────────────────────

  describe("deduplicate — via getRecipes", () => {
    it("skips drinks without idDrink", async () => {
      const drinkWithoutId = {
        strDrink: "Ghost Drink",
        strDrinkThumb: "https://image.com/ghost.jpg",
        strCategory: "Cocktail",
      };

      mockFetchOnce({ drinks: [drinkWithoutId, validDrink] });
      mockFetchOnce({ drinks: [] });

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result.every((d: Drink) => d.idDrink)).toBe(true);
    });
  });
});
