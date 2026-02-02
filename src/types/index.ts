import { z } from "zod";
import {
  CategoriesAPIResponseSchema,
  DrinksAPIResponse,
  DrinkAPIResponse,
  RecipeAPIResponseSchema,
  SearchFiltersSchema,
} from "../utils/recipes-schemas";

export type Category = z.infer<typeof CategoriesAPIResponseSchema>["drinks"][number];
export type Categories = z.infer<typeof CategoriesAPIResponseSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
export type Drink = z.infer<typeof DrinkAPIResponse>;
export type Drinks = z.infer<typeof DrinksAPIResponse>;
export type RecipeDetail = z.infer<typeof RecipeAPIResponseSchema>;