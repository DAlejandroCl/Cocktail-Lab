import axios from "axios";
import {
  CategoriesAPIResponseSchema,
  RecipesAPIResponseSchema,
} from "../utils/recipes-schemas";
import type { SearchFilters } from "../types";

const CATEGORIES_API_URL =
  "https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list";

const FILTER_API_BASE =
  "https://www.thecocktaildb.com/api/json/v1/1/filter.php";

export async function getCategories() {
  const response = await axios.get(CATEGORIES_API_URL);
  const parsed = CategoriesAPIResponseSchema.parse(response.data);
  return parsed.drinks;
}

export async function getRecipes(filters: SearchFilters) {
  let url = FILTER_API_BASE;

  if (filters.category) {
    url += `?c=${encodeURIComponent(filters.category)}`;
  } else if (filters.ingredient) {
    url += `?i=${encodeURIComponent(filters.ingredient)}`;
  } else {
    throw new Error("No search filters provided");
  }

  const response = await axios.get(url);
  const parsed = RecipesAPIResponseSchema.parse(response.data);

  return parsed.drinks;
}
