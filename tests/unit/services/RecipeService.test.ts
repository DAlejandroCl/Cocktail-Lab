import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  getCategories,
  getRecipes,
  getRecipeById,
  getRandomRecipes,
} from "@/services/recipeService";
import type { SearchFilters } from "@/types";

vi.mock("axios");

const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
};

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
// Helpers
// ─────────────────────────────────────────────

function mockGet(data: unknown) {
  mockedAxios.get.mockResolvedValue({ data });
}

function mockGetOnce(data: unknown) {
  mockedAxios.get.mockResolvedValueOnce({ data });
}

function mockGetRejected(error = new Error("Network error")) {
  mockedAxios.get.mockRejectedValue(error);
}

function mockGetRejectedOnce(error = new Error("Network error")) {
  mockedAxios.get.mockRejectedValueOnce(error);
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("recipeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getCategories ──────────────────────────────────────────────────────

  describe("getCategories", () => {
    it("returns categories when API response is valid", async () => {
      mockGet({ drinks: [{ strCategory: "Cocktail" }, { strCategory: "Shot" }] });

      const result = await getCategories();

      expect(result).toEqual(["Cocktail", "Shot"]);
    });

    it("returns empty array on network error", async () => {
      mockGetRejected();

      const result = await getCategories();

      expect(result).toEqual([]);
    });

    it("returns empty array when safeGet returns null (invalid response shape)", async () => {
      mockedAxios.get.mockResolvedValue(null);

      const result = await getCategories();

      expect(result).toEqual([]);
    });

    it("returns empty array when schema validation fails (branch L54)", async () => {
      mockGet({ wrong: "shape" });

      const result = await getCategories();

      expect(result).toEqual([]);
    });

    it("returns empty array when drinks is null (nullish coalescing branch L59)", async () => {
      mockGet({ drinks: null });

      const result = await getCategories();

      expect(result).toEqual([]);
    });
  });

  // ── getRecipes — ingredient only ──────────────────────────────────────

  describe("getRecipes — ingredient only", () => {
    it("merges and deduplicates searchByName and searchByIngredient results", async () => {
      mockGetOnce({ drinks: [validDrink] });           
      mockGetOnce({ drinks: [validDrink, validDrink2] }); 

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result).toHaveLength(2);
    });

    it("enriches drinks missing strCategory by fetching their detail", async () => {
      mockGetOnce({ drinks: [validDrinkNoCategory] });
      mockGetOnce({ drinks: [] });                      
      mockGetOnce({ drinks: [validRecipeDetail] });     

      const result = await getRecipes({ ingredient: "Mystery" });

      expect(result[0].strCategory).toBe("Cocktail");
    });

    it("returns drink without category when enrichment fetch fails (catch branch)", async () => {
      mockGetOnce({ drinks: [validDrinkNoCategory] }); 
      mockGetOnce({ drinks: [] });                      
      mockGetRejectedOnce();                            

      const result = await getRecipes({ ingredient: "Mystery" });

      expect(result[0].idDrink).toBe("3");
      expect(result[0].strCategory).toBeUndefined();
    });

    it("throws when no filters provided", async () => {
      await expect(getRecipes(invalidFilters)).rejects.toThrow(
        "No search filters provided",
      );
    });

    it("returns empty array when searchByName returns null data (branch L129)", async () => {
      mockedAxios.get.mockResolvedValueOnce(null); 
      mockGetOnce({ drinks: [validDrink] });       

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result.some(d => d.idDrink === "1")).toBe(true);
    });

    it("returns empty array when searchByName schema fails (branch L133)", async () => {
      mockGetOnce({ wrong: "shape" });
      mockGetOnce({ drinks: [validDrink] }); 

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result.some(d => d.idDrink === "1")).toBe(true);
    });

    it("handles null drinks in searchByName (nullish branch L138)", async () => {
      mockGetOnce({ drinks: null }); 
      mockGetOnce({ drinks: [validDrink] });

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result).toHaveLength(1);
    });

    it("returns empty array when searchByIngredient returns null data (branch L145)", async () => {
      mockGetOnce({ drinks: [validDrink] }); 
      mockedAxios.get.mockResolvedValueOnce(null); 

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result.some(d => d.idDrink === "1")).toBe(true);
    });

    it("returns empty array when searchByIngredient schema fails (branch L149)", async () => {
      mockGetOnce({ drinks: [validDrink] }); 
      mockGetOnce({ wrong: "shape" });        

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result.some(d => d.idDrink === "1")).toBe(true);
    });

    it("handles null drinks in searchByIngredient (nullish branch L154)", async () => {
      mockGetOnce({ drinks: [validDrink] }); 
      mockGetOnce({ drinks: null });          

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result).toHaveLength(1);
    });
  });

  // ── getRecipes — category only ────────────────────────────────────────

  describe("getRecipes — category only", () => {
    it("returns drinks with strCategory injected from the filter", async () => {
      mockGet({ drinks: [{ idDrink: "1", strDrink: "Mojito", strDrinkThumb: "https://image.com/mojito.jpg" }] });

      const result = await getRecipes({ category: "Cocktail" });

      expect(result[0].strCategory).toBe("Cocktail");
    });

    it("returns empty array when no drinks found for category", async () => {
      mockGet({ drinks: [] });

      const result = await getRecipes({ category: "Cocktail" });

      expect(result).toEqual([]);
    });

    it("returns empty array when searchByCategory returns null data (branch L161)", async () => {
      mockedAxios.get.mockResolvedValue(null); 

      const result = await getRecipes({ category: "Cocktail" });

      expect(result).toEqual([]);
    });

    it("returns empty array when searchByCategory schema fails (branch L165)", async () => {
      mockGet({ wrong: "shape" });

      const result = await getRecipes({ category: "Cocktail" });

      expect(result).toEqual([]);
    });

    it("handles null drinks in searchByCategory (nullish branch L170)", async () => {
      mockGet({ drinks: null });

      const result = await getRecipes({ category: "Cocktail" });

      expect(result).toEqual([]);
    });
  });

  // ── getRecipes — ingredient + category combined ───────────────────────

  describe("getRecipes — ingredient + category combined", () => {
    it("filters combined results by the specified category", async () => {
      const cocktailDrink = { ...validDrink, strCategory: "Cocktail" };
      const shotDrink = { ...validDrink2, strCategory: "Shot" };

      mockGetOnce({ drinks: [cocktailDrink] });               
      mockGetOnce({ drinks: [cocktailDrink, shotDrink] });    

      const result = await getRecipes({ ingredient: "Rum", category: "Cocktail" });

      expect(result.every(d => d.strCategory === "Cocktail")).toBe(true);
    });

    it("returns empty array when no drinks match the category after filtering", async () => {
      mockGetOnce({ drinks: [validDrink] }); 
      mockGetOnce({ drinks: [] });

      const result = await getRecipes({ ingredient: "Rum", category: "Shot" });

      expect(result).toEqual([]);
    });

    it("enriches drinks without category before filtering in combined mode", async () => {
      mockGetOnce({ drinks: [validDrinkNoCategory] }); 
      mockGetOnce({ drinks: [] });                      
      mockGetOnce({ drinks: [{ ...validRecipeDetail, idDrink: "3", strCategory: "Cocktail" }] }); // lookup

      const result = await getRecipes({ ingredient: "Mystery", category: "Cocktail" });

      expect(result[0].strCategory).toBe("Cocktail");
    });
  });

  // ── getRecipeById ──────────────────────────────────────────────────────

  describe("getRecipeById", () => {
    it("returns parsed recipe detail on success", async () => {
      mockGet({ drinks: [validRecipeDetail] });

      const result = await getRecipeById("1");

      expect(result.idDrink).toBe("1");
      expect(result.strDrink).toBe("Mojito");
    });

    it("throws 'Recipe not found' when drinks array is empty", async () => {
      mockGet({ drinks: [] });

      await expect(getRecipeById("999")).rejects.toThrow("Recipe not found");
    });

    it("throws 'Recipe not found' when drinks key is missing from response", async () => {
      mockGet({ something: "else" });

      await expect(getRecipeById("999")).rejects.toThrow("Recipe not found");
    });

    it("throws 'Invalid API response' when safeGet returns null", async () => {
      mockedAxios.get.mockResolvedValue(null);

      await expect(getRecipeById("1")).rejects.toThrow("Invalid API response");
    });

    it("throws 'Invalid recipe data' when schema parse fails", async () => {
      mockGet({ drinks: [{ idDrink: "1" }] });

      await expect(getRecipeById("1")).rejects.toThrow("Invalid recipe data");
    });

    it("throws on network error", async () => {
      mockGetRejected();

      await expect(getRecipeById("1")).rejects.toThrow("Invalid API response");
    });
  });

  // ── getRandomRecipes ───────────────────────────────────────────────────

  describe("getRandomRecipes", () => {
    it("returns sorted unique drinks", async () => {
      mockGetOnce({ drinks: [validDrink2] }); 
      mockGetOnce({ drinks: [validDrink] });  

      const result = await getRandomRecipes(2);

      expect(result[0].strDrink).toBe("Daiquiri");
      expect(result[1].strDrink).toBe("Mojito");
    });

    it("deduplicates drinks with the same idDrink", async () => {
      mockGetOnce({ drinks: [validDrink] });
      mockGetOnce({ drinks: [validDrink] }); 

      const result = await getRandomRecipes(2);

      expect(result).toHaveLength(1);
    });

    it("skips null responses from safeGet", async () => {
      mockedAxios.get.mockResolvedValueOnce(null);
      mockGetOnce({ drinks: [validDrink] });

      const result = await getRandomRecipes(2);

      expect(result).toHaveLength(1);
    });

    it("skips responses with empty drinks array", async () => {
      mockGetOnce({ drinks: [] });
      mockGetOnce({ drinks: [validDrink] });

      const result = await getRandomRecipes(2);

      expect(result).toHaveLength(1);
    });

    it("skips responses that fail schema validation", async () => {
      mockGetOnce({ drinks: [{ wrong: "shape" }] });
      mockGetOnce({ drinks: [validDrink] });

      const result = await getRandomRecipes(2);

      expect(result.some(d => d.idDrink === "1")).toBe(true);
    });

    it("returns empty array when all responses are null", async () => {
      mockedAxios.get.mockResolvedValue(null);

      const result = await getRandomRecipes(3);

      expect(result).toEqual([]);
    });

    it("caps results at 100 when more than 100 unique drinks are returned", async () => {
      const manyDrinks = Array.from({ length: 105 }, (_, i) => ({
        idDrink: String(i + 1),
        strDrink: `Drink ${String(i + 1).padStart(3, "0")}`,
        strDrinkThumb: `https://image.com/drink${i + 1}.jpg`,
        strCategory: "Cocktail",
      }));

      mockedAxios.get.mockResolvedValue({ data: { drinks: manyDrinks } });

      const result = await getRandomRecipes(1);

      expect(result.length).toBeLessThanOrEqual(100);
    });
  });

  // ── deduplicate — internal edge case ──────────────────────────────────

  describe("deduplicate — via getRecipes", () => {
    it("skips drinks without idDrink (branch L237)", async () => {
      const drinkWithoutId = {
        strDrink: "Ghost Drink",
        strDrinkThumb: "https://image.com/ghost.jpg",
        strCategory: "Cocktail",
      };

      mockGetOnce({ drinks: [drinkWithoutId, validDrink] });
      mockGetOnce({ drinks: [] });                          

      const result = await getRecipes({ ingredient: "Rum" });

      expect(result.every(d => d.idDrink)).toBe(true);
    });
  });
});