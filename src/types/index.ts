import { z } from "zod";
import {
  CategoriesAPIResponseSchema,
  DrinksAPIResponse,
  DrinkAPIResponse,
  RecipeAPIResponseSchema,
  SearchFiltersSchema,
} from "../utils/recipes-schemas";

export type CategoriesAPIResponse = z.infer<typeof CategoriesAPIResponseSchema>;
export type DrinksAPIResponseType = z.infer<typeof DrinksAPIResponse>;
export type Category = string;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
export type Drink = z.infer<typeof DrinkAPIResponse>;
export type Drinks = z.infer<typeof DrinksAPIResponse>;
export type RecipeDetail = z.infer<typeof RecipeAPIResponseSchema>;