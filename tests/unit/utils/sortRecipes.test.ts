import { describe, it, expect } from "vitest";
import {
  sortDrinks,
  sortFavorites,
  SORT_OPTIONS,
  SORT_OPTIONS_FAVORITES,
} from "@/utils/sortRecipes";
import type { Drink } from "@/types";
import type { FavoriteOrder } from "@/stores/favoritesSlice";

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

const makeDrink = (id: string, name: string, category = "Cocktail"): Drink => ({
  idDrink:       id,
  strDrink:      name,
  strDrinkThumb: "image.jpg",
  strCategory:   category,
});

const aperol  = makeDrink("1", "Aperol Spritz", "Cocktail");
const mojito  = makeDrink("2", "Mojito",         "Cocktail");
const bshot   = makeDrink("3", "B-52",           "Shot");
const zombie  = makeDrink("4", "Zombie",         "Cocktail");

// ─────────────────────────────────────────────
// sortDrinks
// ─────────────────────────────────────────────

describe("sortDrinks", () => {
  it("'default' returns drinks in original order", () => {
    const result = sortDrinks([zombie, aperol, mojito], "default");
    expect(result.map((d) => d.strDrink)).toEqual(["Zombie", "Aperol Spritz", "Mojito"]);
  });

  it("'name-asc' sorts alphabetically A → Z", () => {
    const result = sortDrinks([zombie, mojito, aperol], "name-asc");
    expect(result.map((d) => d.strDrink)).toEqual(["Aperol Spritz", "Mojito", "Zombie"]);
  });

  it("'name-desc' sorts alphabetically Z → A", () => {
    const result = sortDrinks([aperol, mojito, zombie], "name-desc");
    expect(result.map((d) => d.strDrink)).toEqual(["Zombie", "Mojito", "Aperol Spritz"]);
  });

  it("'category-asc' groups by category then sorts by name within each group", () => {
    const result = sortDrinks([zombie, bshot, aperol, mojito], "category-asc");
    // Cocktail < Shot alphabetically
    // Within Cocktail: Aperol Spritz < Mojito < Zombie
    expect(result[0].strCategory).toBe("Cocktail");
    expect(result[result.length - 1].strCategory).toBe("Shot");
    const cocktails = result.filter((d) => d.strCategory === "Cocktail");
    expect(cocktails.map((d) => d.strDrink)).toEqual(["Aperol Spritz", "Mojito", "Zombie"]);
  });

  it("'category-asc' handles drinks with undefined category (treated as '')", () => {
    const nocat = { ...aperol, strCategory: undefined };
    const result = sortDrinks([mojito, nocat as Drink], "category-asc");
    // '' < 'Cocktail' → nocat comes first
    expect(result[0].idDrink).toBe(nocat.idDrink);
  });

  it("does not mutate the original array", () => {
    const original = [zombie, aperol, mojito];
    const copy     = [...original];
    sortDrinks(original, "name-asc");
    expect(original).toEqual(copy);
  });

  it("returns empty array when input is empty", () => {
    expect(sortDrinks([], "name-asc")).toEqual([]);
  });

  it("SORT_OPTIONS has 4 entries with the expected values", () => {
    expect(SORT_OPTIONS.map((o) => o.value)).toEqual([
      "default", "name-asc", "name-desc", "category-asc",
    ]);
  });
});

// ─────────────────────────────────────────────
// sortFavorites
// ─────────────────────────────────────────────

describe("sortFavorites", () => {
  const order: FavoriteOrder = {
    "1": 1000, // aperol — oldest
    "2": 3000, // mojito — newest
    "4": 2000, // zombie — middle
  };

  it("'recently-added' sorts by timestamp descending (newest first)", () => {
    const result = sortFavorites([aperol, zombie, mojito], "recently-added", order);
    expect(result.map((d) => d.idDrink)).toEqual(["2", "4", "1"]);
  });

  it("'recently-added' treats missing timestamp as 0 (oldest)", () => {
    const noOrder: FavoriteOrder = {};
    const result = sortFavorites([aperol, mojito], "recently-added", noOrder);
    // Both have 0 — order is stable, just verifies no crash
    expect(result).toHaveLength(2);
  });

  it("'name-asc' sorts alphabetically A → Z", () => {
    const result = sortFavorites([zombie, mojito, aperol], "name-asc", order);
    expect(result.map((d) => d.strDrink)).toEqual(["Aperol Spritz", "Mojito", "Zombie"]);
  });

  it("'name-desc' sorts alphabetically Z → A", () => {
    const result = sortFavorites([aperol, mojito, zombie], "name-desc", order);
    expect(result.map((d) => d.strDrink)).toEqual(["Zombie", "Mojito", "Aperol Spritz"]);
  });

  it("'category-asc' groups by category then name", () => {
    const result = sortFavorites([zombie, bshot, aperol], "category-asc", order);
    expect(result[result.length - 1].strCategory).toBe("Shot");
  });

  it("does not mutate the original array", () => {
    const original = [zombie, aperol, mojito];
    const copy     = [...original];
    sortFavorites(original, "recently-added", order);
    expect(original).toEqual(copy);
  });

  it("SORT_OPTIONS_FAVORITES has 4 entries with the expected values", () => {
    expect(SORT_OPTIONS_FAVORITES.map((o) => o.value)).toEqual([
      "recently-added", "name-asc", "name-desc", "category-asc",
    ]);
  });
});
