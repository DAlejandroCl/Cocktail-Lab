import axios from "axios";
import {
  CategoriesAPIResponseSchema,
  DrinksAPIResponse,
  RecipeAPIResponseSchema,
  DrinkAPIResponse,
} from "../utils/recipes-schemas";
import type { SearchFilters } from "../types";
import { z } from "zod";

async function safeGet<T>(url: string): Promise<T | null> {
  try {
    const response = await axios.get(url);

    if (
      !response ||
      typeof response.data !== "object" ||
      response.data === null
    ) {
      console.error("Invalid API response shape");
      return null;
    }

    return response.data as T;
  } catch (error) {
    console.error("Network/API error:", error);
    return null;
  }
}

type Drink = z.infer<typeof DrinkAPIResponse>;

const CATEGORIES_API_URL =
  "https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list";

const FILTER_API_BASE =
  "https://www.thecocktaildb.com/api/json/v1/1/filter.php";

const SEARCH_API_BASE =
  "https://www.thecocktaildb.com/api/json/v1/1/search.php";

const LOOKUP_API_BASE =
  "https://www.thecocktaildb.com/api/json/v1/1/lookup.php";

export async function getCategories(): Promise<string[]> {
  const data = await safeGet<unknown>(CATEGORIES_API_URL);
  if (!data) return [];

  const parsed = CategoriesAPIResponseSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Invalid categories schema:", parsed.error);
    return [];
  }

  return parsed.data.drinks?.map((item) => item.strCategory) ?? [];
}

export async function getRecipes(filters: SearchFilters): Promise<Drink[]> {
  if (!filters.category && !filters.ingredient) {
    throw new Error("No search filters provided");
  }

  let results: Drink[] = [];

  if (filters.ingredient && !filters.category) {
    const byName = await searchByName(filters.ingredient);
    const byIngredient = await searchByIngredient(filters.ingredient);

    results = deduplicate([...byName, ...byIngredient]);
  } else if (filters.category && !filters.ingredient) {
    const byCategory = await searchByCategory(filters.category);

    results = byCategory.map((drink) => ({
      ...drink,
      strCategory: filters.category,
    }));
  } else if (filters.ingredient && filters.category) {
    const byName = await searchByName(filters.ingredient);
    const byIngredient = await searchByIngredient(filters.ingredient);

    const combined = deduplicate([...byName, ...byIngredient]);

    const enriched = await enrichWithCategories(combined);

    results = enriched.filter(
      (drink) =>
        drink.strCategory?.toLowerCase() === filters.category?.toLowerCase(),
    );
  }

  if (results.some((drink) => !drink.strCategory)) {
    results = await enrichWithCategories(results);
  }

  return results;
}

async function enrichWithCategories(drinks: Drink[]): Promise<Drink[]> {
  return Promise.all(
    drinks.map(async (drink) => {
      if (drink.strCategory) return drink;

      try {
        const details = await getRecipeById(drink.idDrink);

        return {
          ...drink,
          strCategory: details.strCategory,
        };
      } catch (error) {
        console.error(
          `Error fetching category for drink ${drink.idDrink}:`,
          error,
        );
        return drink;
      }
    }),
  );
}

async function searchByName(name: string): Promise<Drink[]> {
  const url = `${SEARCH_API_BASE}?s=${encodeURIComponent(name)}`;

  const data = await safeGet<unknown>(url);
  if (!data) return [];

  const parsed = DrinksAPIResponse.safeParse(data);

  if (!parsed.success) {
    console.error("Invalid searchByName schema:", parsed.error);
    return [];
  }

  return parsed.data.drinks ?? [];
}

async function searchByIngredient(ingredient: string): Promise<Drink[]> {
  const url = `${FILTER_API_BASE}?i=${encodeURIComponent(ingredient)}`;

  const data = await safeGet<unknown>(url);
  if (!data) return [];

  const parsed = DrinksAPIResponse.safeParse(data);

  if (!parsed.success) {
    console.error("Invalid ingredient schema:", parsed.error);
    return [];
  }

  return parsed.data.drinks ?? [];
}

async function searchByCategory(category: string): Promise<Drink[]> {
  const url = `${FILTER_API_BASE}?c=${encodeURIComponent(category)}`;

  const data = await safeGet<unknown>(url);
  if (!data) return [];

  const parsed = DrinksAPIResponse.safeParse(data);

  if (!parsed.success) {
    console.error("Invalid category schema:", parsed.error);
    return [];
  }

  return parsed.data.drinks ?? [];
}

export async function getRecipeById(id: string) {
  const url = `${LOOKUP_API_BASE}?i=${encodeURIComponent(id)}`;

  const data = await safeGet<unknown>(url);

  if (!data || typeof data !== "object") {
    throw new Error("Invalid API response");
  }

  if (
    !("drinks" in data) ||
    !Array.isArray((data as { drinks: unknown }).drinks) ||
    (data as { drinks: unknown[] }).drinks.length === 0
  ) {
    throw new Error("Recipe not found");
  }

  const drinks = (data as { drinks: unknown[] }).drinks;

  const parsed = RecipeAPIResponseSchema.safeParse(drinks[0]);

  if (!parsed.success) {
    console.error("Invalid recipe schema:", parsed.error);
    throw new Error("Invalid recipe data");
  }

  return parsed.data;
}

function deduplicate(drinks: Drink[]): Drink[] {
  const map = new Map<string, Drink>();

  drinks.forEach((drink) => {
    if (drink.idDrink) {
      map.set(drink.idDrink, drink);
    }
  });

  return Array.from(map.values());
}
