import type { RecipeDetail } from "@/types";
import type { Drink } from "@/types";

// ─────────────────────────────────────────────
// Drink factory (list card)
// ─────────────────────────────────────────────

let drinkIdCounter = 1;

export function makeDrink(overrides: Partial<Drink> = {}): Drink {
  const id = String(drinkIdCounter++);

  return {
    idDrink: id,
    strDrink: `Test Drink ${id}`,
    strDrinkThumb: `https://image.com/drink-${id}.jpg`,
    strCategory: "Cocktail",
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// RecipeDetail factory (full recipe)
// ─────────────────────────────────────────────

export function makeRecipeDetail(
  overrides: Partial<RecipeDetail> = {},
): RecipeDetail {
  const id = String(drinkIdCounter++);

  return {
    idDrink: id,
    strDrink: `Test Recipe ${id}`,
    strDrinkThumb: `https://image.com/recipe-${id}.jpg`,
    strInstructions: "Mix all ingredients and serve.",
    strCategory: "Cocktail",

    strIngredient1: "Rum",
    strIngredient2: "Lime juice",
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
    strMeasure2: "25ml",
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

    ...overrides,
  };
}

export function resetFactoryCounters() {
  drinkIdCounter = 1;
}

// ─────────────────────────────────────────────
// Collection helpers
// ─────────────────────────────────────────────

export function makeDrinks(count: number, overrides: Partial<Drink> = {}): Drink[] {
  return Array.from({ length: count }, () => makeDrink(overrides));
}

export function toFavoritesMap(
  recipes: RecipeDetail[],
): Record<string, RecipeDetail> {
  return Object.fromEntries(recipes.map((r) => [r.idDrink, r]));
}
