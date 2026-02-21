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
    mockedAxios.get.mockResolvedValue({
      data: {
        drinks: [
          {
            idDrink: "123",
            strDrink: "Mojito",
            strCategory: "Cocktail",
            strInstructions: "Mix.",
          },
        ],
      },
    });

    const result = await getRecipeById("123");

    expect(result.idDrink).toBe("123");
    expect(result.strDrink).toBe("Mojito");
  });

  it("throws if recipe not found", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { drinks: [] },
    });

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
    mockedAxios.get.mockResolvedValue({
      data: {
        drinks: [
          {
            idDrink: "1",
            strDrink: "Test",
          },
        ],
      },
    });

    const result = await getRecipes({
      category: "Cocktail",
    });

    expect(result[0].strCategory).toBe("Cocktail");
  });

  it("deduplicates results when searching by ingredient", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          drinks: [{ idDrink: "1", strDrink: "A" }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          drinks: [{ idDrink: "1", strDrink: "A" }],
        },
      });

    const result = await getRecipes({
      ingredient: "rum",
    });

    expect(result.length).toBe(1);
  });

  /* -------------------------------------------------- */
  /*                 getRandomRecipes                   */
  /* -------------------------------------------------- */

  it("returns sorted unique random recipes", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          drinks: [{ idDrink: "2", strDrink: "B" }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          drinks: [{ idDrink: "1", strDrink: "A" }],
        },
      });

    const result = await getRandomRecipes(2);

    expect(result[0].strDrink).toBe("A");
    expect(result.length).toBe(2);
  });

  it("ignores invalid random responses", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({
        data: {
          drinks: [{ idDrink: "1", strDrink: "Valid" }],
        },
      });

    const result = await getRandomRecipes(2);

    expect(result.length).toBe(1);
  });
});
