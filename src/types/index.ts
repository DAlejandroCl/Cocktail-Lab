import { z } from "zod";
import {
  CategoriesAPIResponseSchema,
  RecipesAPIResponseSchema,
} from "../utils/recipes-schemas";

export type Category = z.infer<
  typeof CategoriesAPIResponseSchema
>["drinks"][number];

export type Drink = z.infer<typeof RecipesAPIResponseSchema>["drinks"][number];

export type SearchFilters = {
  ingredient: string;
  category: string;
};
