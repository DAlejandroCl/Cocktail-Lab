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

const invalidFilters: SearchFilters = {
  category: undefined,
  ingredient: undefined,
};

// ─────────────────────────────────────────────
// Fixtures that satisfy Zod schemas
// ─────────────────────────────────────────────

// DrinkAPIResponse requires: idDrink, strDrink, strDrinkThumb (url or string)
// strCategory is optional.
const validDrink = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strCategory: "Cocktail",
};

// RecipeAPIResponseSchema requires all strIngredient/strMeasure fields
// (nullableString: optional | null | string min 1 — undefined passes fine).
const validRecipeDetail = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strInstructions: "Mix ingredients. Serve cold.",
  strCategory: "Cocktail",
  strIngredient1: "White rum",
  strIngredient2: "Lime juice",
  strIngredient3: undefined,
  strIngredient4: undefined,
  strIngredient5: undefined,
  strIngredient6: undefined,
  strIngredient7: undefined,
  strIngredient8: undefined,
  strIngredient9: undefined,
  strIngredient10: undefined,
  strIngredient11: undefined,
  strIngredient12: undefined,
  strIngredient13: undefined,
  strIngredient14: undefined,
  strIngredient15: undefined,
  strMeasure1: "50ml",
  strMeasure2: "25ml",
  strMeasure3: undefined,
  strMeasure4: undefined,
  strMeasure5: undefined,
  strMeasure6: undefined,
  strMeasure7: undefined,
  strMeasure8: undefined,
  strMeasure9: undefined,
  strMeasure10: undefined,
  strMeasure11: undefined,
  strMeasure12: undefined,
  strMeasure13: undefined,
  strMeasure14: undefined,
  strMeasure15: undefined,
};

// safeGet returns response.data, so axios.get must resolve with { data: <payload> }
const drinkResponse = (drinks: unknown[] | null) => ({
  data: { drinks },
});

const recipeResponse = (drinks: unknown[] | null) => ({
  data: { drinks },
});

describe("recipeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* -------------------------------------------------- */
  /*                    getCategories                   */
  /* -------------------------------------------------- */

  it("returns categories when API response is valid", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        drinks: [
          { strCategory: "Cocktail" },
          { strCategory: "Ordinary Drink" },
        ],
      },
    });

    const result = await getCategories();

    expect(result).toEqual(["Cocktail", "Ordinary Drink"]);
  });

  it("returns empty array if API fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network error"));

    const result = await getCategories();

    expect(result).toEqual([]);
  });

  /* -------------------------------------------------- */
  /*                    getRecipeById                   */
  /* -------------------------------------------------- */

  it("returns recipe when API response is valid", async () => {
    mockedAxios.get.mockResolvedValue(recipeResponse([validRecipeDetail]));

    const result = await getRecipeById("1");

    expect(result.idDrink).toBe("1");
    expect(result.strDrink).toBe("Mojito");
  });

  it("throws if recipe not found", async () => {
    mockedAxios.get.mockResolvedValue(recipeResponse([]));

    await expect(getRecipeById("999")).rejects.toThrow("Recipe not found");
  });

  /* -------------------------------------------------- */
  /*                    getRecipes                      */
  /* -------------------------------------------------- */

  it("throws if no filters provided", async () => {
    await expect(getRecipes(invalidFilters)).rejects.toThrow(
      "No search filters provided",
    );
  });

  it("returns recipes filtered by category", async () => {
    // searchByCategory uses filter.php which returns drinks without strCategory.
    // getRecipes injects the category from the filter into each drink.
    mockedAxios.get.mockResolvedValue(drinkResponse([validDrink]));

    const result = await getRecipes({ category: "Cocktail" });

    // The service injects strCategory from the filter arg — verify the drink id.
    expect(result[0].idDrink).toBe("1");
    expect(result[0].strCategory).toBe("Cocktail");
  });

  it("deduplicates results when searching by ingredient", async () => {
    // getRecipes calls searchByName then searchByIngredient — two axios.get calls.
    // Both return the same drink; deduplication should yield exactly 1 result.
    mockedAxios.get
      .mockResolvedValueOnce(drinkResponse([validDrink]))
      .mockResolvedValueOnce(drinkResponse([validDrink]));

    const result = await getRecipes({ ingredient: "rum" });

    expect(result.length).toBe(1);
  });

  /* -------------------------------------------------- */
  /*                 getRandomRecipes                   */
  /* -------------------------------------------------- */

  it("returns sorted unique random recipes", async () => {
    const drinkB = { ...validDrink, idDrink: "2", strDrink: "Zombie" };
    const drinkA = { ...validDrink, idDrink: "1", strDrink: "Aperol Spritz" };

    mockedAxios.get
      .mockResolvedValueOnce(drinkResponse([drinkB]))
      .mockResolvedValueOnce(drinkResponse([drinkA]));

    const result = await getRandomRecipes(2);

    expect(result[0].strDrink).toBe("Aperol Spritz");
    expect(result.length).toBe(2);
  });

  it("ignores invalid random responses", async () => {
    // First response has data: null — safeGet returns null → skipped.
    // Second response is valid — should produce 1 drink.
    mockedAxios.get
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce(drinkResponse([validDrink]));

    const result = await getRandomRecipes(2);

    expect(result.length).toBe(1);
  });
});
