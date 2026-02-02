import type { StateCreator } from "zustand";
import { getCategories, getRecipes } from "../services/RecipeService";
import type { Category, SearchFilters, Drink } from "../types";

export type RecipesSliceType = {
  categories: Category[];
  recipes: Drink[];
  fetchCategories: () => Promise<void>;
  searchRecipes: (filters: SearchFilters) => Promise<void>;
};

export const createRecipesSlice: StateCreator<
  RecipesSliceType,
  [["zustand/devtools", never]],
  []
> = (set) => ({
  categories: [],
  recipes: [],

  fetchCategories: async () => {
    try {
      const categories = await getCategories();
      set({ categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  },

  searchRecipes: async (filters) => {
    try {
      const recipes = await getRecipes(filters);
      set({ recipes });
      console.log("Recipes found:", recipes);
    } catch (error) {
      console.error("Error searching recipes:", error);
      set({ recipes: [] });
    }
  },
});