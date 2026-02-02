import { z } from "zod";

export const CategoriesAPIResponseSchema = z.object({
  drinks: z.array(
    z.object({
      strCategory: z.string(),
    })
  ),
});

export const SearchFiltersSchema = z.object({
  ingredient: z.string().optional(),
  category: z.string().optional(),
});

export const RecipesAPIResponseSchema = z.object({
  drinks: z.array(
    z.object({
      idDrink: z.string(),
      strDrink: z.string(),
      strDrinkThumb: z.string(),
    })
  ),
});