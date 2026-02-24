import { describe, it, expect } from "vitest";
import {
  CategoriesAPIResponseSchema,
  SearchFiltersSchema,
  DrinkAPIResponse,
  DrinksAPIResponse,
  RecipeAPIResponseSchema,
} from "@/utils/recipes-schemas";

/* -------------------------------------------------- */
/*              CategoriesAPIResponseSchema           */
/* -------------------------------------------------- */

describe("CategoriesAPIResponseSchema", () => {
  it("parses valid categories", () => {
    const result = CategoriesAPIResponseSchema.parse({
      drinks: [{ strCategory: "Cocktail" }],
    });

    expect(result.drinks).toEqual([{ strCategory: "Cocktail" }]);
  });

  it("transforms null drinks into empty array", () => {
    const result = CategoriesAPIResponseSchema.parse({
      drinks: null,
    });

    expect(result.drinks).toEqual([]);
  });

  it("transforms undefined drinks into empty array", () => {
    const result = CategoriesAPIResponseSchema.parse({});

    expect(result.drinks).toEqual([]);
  });
});

/* -------------------------------------------------- */
/*                  SearchFiltersSchema               */
/* -------------------------------------------------- */

describe("SearchFiltersSchema", () => {
  it("passes with ingredient only", () => {
    const result = SearchFiltersSchema.parse({
      ingredient: "rum",
    });

    expect(result.ingredient).toBe("rum");
  });

  it("passes with category only", () => {
    const result = SearchFiltersSchema.parse({
      category: "Cocktail",
    });

    expect(result.category).toBe("Cocktail");
  });

  it("fails if no filters provided", () => {
    const result = SearchFiltersSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("fails if strings are empty", () => {
    const result = SearchFiltersSchema.safeParse({
      ingredient: "",
    });

    expect(result.success).toBe(false);
  });
});

/* -------------------------------------------------- */
/*                  DrinkAPIResponse                  */
/* -------------------------------------------------- */

describe("DrinkAPIResponse", () => {
  it("parses valid drink", () => {
    const result = DrinkAPIResponse.parse({
      idDrink: "1",
      strDrink: "Mojito",
      strDrinkThumb: "https://image.com",
      strCategory: "Cocktail",
    });

    expect(result.idDrink).toBe("1");
  });

  it("accepts non-url thumbnail string", () => {
    const result = DrinkAPIResponse.parse({
      idDrink: "1",
      strDrink: "Mojito",
      strDrinkThumb: "image.jpg",
    });

    expect(result.strDrinkThumb).toBe("image.jpg");
  });

  it("fails if idDrink missing", () => {
    const result = DrinkAPIResponse.safeParse({
      strDrink: "Mojito",
      strDrinkThumb: "image.jpg",
    });

    expect(result.success).toBe(false);
  });
});

/* -------------------------------------------------- */
/*                DrinksAPIResponse                   */
/* -------------------------------------------------- */

describe("DrinksAPIResponse", () => {
  it("parses valid drinks array", () => {
    const result = DrinksAPIResponse.parse({
      drinks: [
        {
          idDrink: "1",
          strDrink: "Mojito",
          strDrinkThumb: "image.jpg",
        },
      ],
    });

    expect(result.drinks.length).toBe(1);
  });

  it("transforms null drinks into empty array", () => {
    const result = DrinksAPIResponse.parse({
      drinks: null,
    });

    expect(result.drinks).toEqual([]);
  });

  it("transforms undefined drinks into empty array", () => {
    const result = DrinksAPIResponse.parse({});

    expect(result.drinks).toEqual([]);
  });
});

/* -------------------------------------------------- */
/*            RecipeAPIResponseSchema                 */
/* -------------------------------------------------- */

describe("RecipeAPIResponseSchema", () => {
  const baseRecipe = {
    idDrink: "1",
    strDrink: "Mojito",
    strDrinkThumb: "image.jpg",
    strInstructions: "Mix ingredients",
  };

  it("parses valid full recipe", () => {
    const result = RecipeAPIResponseSchema.parse({
      ...baseRecipe,
      strIngredient1: "Rum",
      strMeasure1: "50ml",
    });

    expect(result.idDrink).toBe("1");
    expect(result.strIngredient1).toBe("Rum");
  });

  it("transforms empty ingredient into null", () => {
    const result = RecipeAPIResponseSchema.parse({
      ...baseRecipe,
      strIngredient1: "",
    });

    expect(result.strIngredient1).toBeNull();
  });

  it("transforms undefined ingredient into null", () => {
    const result = RecipeAPIResponseSchema.parse(baseRecipe);

    expect(result.strIngredient1).toBeNull();
  });

  it("fails if strInstructions missing", () => {
    const result = RecipeAPIResponseSchema.safeParse({
      idDrink: "1",
      strDrink: "Mojito",
      strDrinkThumb: "image.jpg",
    });

    expect(result.success).toBe(false);
  });
});