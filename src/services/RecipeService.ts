import axios from "axios";
import {
  CategoriesAPIResponseSchema,
  DrinksAPIResponse,
  RecipeAPIResponseSchema,
  DrinkAPIResponse
} from "../utils/recipes-schemas";
import type { SearchFilters } from "../types";
import { z } from "zod";

type RawDrinkFromAPI = {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strCategory?: string;
};

const CATEGORIES_API_URL =
  "https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list";

const FILTER_API_BASE =
  "https://www.thecocktaildb.com/api/json/v1/1/filter.php";

const SEARCH_API_BASE = 
  "https://www.thecocktaildb.com/api/json/v1/1/search.php";

const LOOKUP_API_BASE = 
  "https://www.thecocktaildb.com/api/json/v1/1/lookup.php";

export async function getCategories() {
  const response = await axios.get(CATEGORIES_API_URL);
  const parsed = CategoriesAPIResponseSchema.parse(response.data);
  return parsed.drinks;
}

export async function getRecipes(filters: SearchFilters) {
  if (!filters.category && !filters.ingredient) {
    throw new Error("No search filters provided");
  }

  let results: z.infer<typeof DrinkAPIResponse>[] = [];

  if (filters.ingredient && !filters.category) {
    const byName = await searchByName(filters.ingredient);
    const byIngredient = await searchByIngredient(filters.ingredient);
    
    const combined = [...byName, ...byIngredient];
    const uniqueMap = new Map<string, z.infer<typeof DrinkAPIResponse>>();
    combined.forEach(drink => uniqueMap.set(drink.idDrink, drink));
    results = Array.from(uniqueMap.values());
  }
  else if (filters.category && !filters.ingredient) {
    results = await searchByCategory(filters.category);
    results = results.map(drink => ({
      ...drink,
      strCategory: filters.category
    }));
  }
  else if (filters.ingredient && filters.category) {
    const byName = await searchByName(filters.ingredient);
    const byIngredient = await searchByIngredient(filters.ingredient);
    
    const ingredientResults = [...byName, ...byIngredient];
    const uniqueIngredientMap = new Map<string, z.infer<typeof DrinkAPIResponse>>();
    ingredientResults.forEach(drink => uniqueIngredientMap.set(drink.idDrink, drink));
    let allIngredientResults = Array.from(uniqueIngredientMap.values());
    
    allIngredientResults = await enrichWithCategories(allIngredientResults);
    
    results = allIngredientResults.filter(drink => 
      drink.strCategory?.toLowerCase() === filters.category?.toLowerCase()
    );
  }

  const needsEnrichment = results.some(drink => !drink.strCategory);
  if (needsEnrichment) {
    results = await enrichWithCategories(results);
  }

  return results;
}

async function enrichWithCategories(drinks: z.infer<typeof DrinkAPIResponse>[]) {
  const enrichedDrinks = await Promise.all(
    drinks.map(async (drink) => {
      if (drink.strCategory) {
        return drink;
      }
      
      try {
        const details = await getRecipeById(drink.idDrink);
        return {
          ...drink,
          strCategory: details.strCategory
        };
      } catch (error) {
        console.error(`Error fetching category for drink ${drink.idDrink}:`, error);
        return drink;
      }
    })
  );
  
  return enrichedDrinks;
}

async function searchByName(name: string): Promise<z.infer<typeof DrinkAPIResponse>[]> {
  try {
    const url = `${SEARCH_API_BASE}?s=${encodeURIComponent(name)}`;
    const response = await axios.get(url);
    
    if (!response.data.drinks) return [];
    
    return response.data.drinks.map((drink: RawDrinkFromAPI) => ({
      idDrink: drink.idDrink,
      strDrink: drink.strDrink,
      strDrinkThumb: drink.strDrinkThumb,
      strCategory: drink.strCategory
    }));
  } catch (error) {
    console.error("Error searching by name:", error);
    return [];
  }
}

async function searchByIngredient(ingredient: string): Promise<z.infer<typeof DrinkAPIResponse>[]> {
  try {
    const url = `${FILTER_API_BASE}?i=${encodeURIComponent(ingredient)}`;
    const response = await axios.get(url);
    
    if (!response.data.drinks) return [];
    
    const parsed = DrinksAPIResponse.safeParse(response.data);
    return parsed.success ? parsed.data.drinks : [];
  } catch (error) {
    console.error("Error searching by ingredient:", error);
    return [];
  }
}

async function searchByCategory(category: string): Promise<z.infer<typeof DrinkAPIResponse>[]> {
  try {
    const url = `${FILTER_API_BASE}?c=${encodeURIComponent(category)}`;
    const response = await axios.get(url);
    
    if (!response.data.drinks) return [];
    
    const parsed = DrinksAPIResponse.safeParse(response.data);
    return parsed.success ? parsed.data.drinks : [];
  } catch (error) {
    console.error("Error searching by category:", error);
    return [];
  }
}

export async function getRecipeById(id: string) {
  const url = `${LOOKUP_API_BASE}?i=${id}`;
  const response = await axios.get(url);
  
  if (!response.data.drinks || !response.data.drinks[0]) {
    throw new Error("Recipe not found");
  }
  
  const parsed = RecipeAPIResponseSchema.safeParse(response.data.drinks[0]);
  if (!parsed.success) {
    throw new Error("Invalid recipe data");
  }
  return parsed.data;
}