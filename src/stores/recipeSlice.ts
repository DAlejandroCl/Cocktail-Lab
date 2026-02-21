import type { StateCreator } from "zustand";
import {
  getCategories,
  getRecipeById,
  getRecipes,
  getRandomRecipes,
} from "../services/recipeService";
import type {
  Category,
  Drink,
  Drinks,
  RecipeDetail,
  SearchFilters,
} from "../types";

export type RecipesSliceType = {
  categories: Category[];
  drinks: Drinks;
  selectedRecipe: RecipeDetail | null;
  modal: boolean;
  isLoading: boolean;
  hasSearched: boolean;
  fetchCategories: () => Promise<void>;
  searchRecipes: (searchFilters: SearchFilters) => Promise<void>;
  selectRecipe: (id: Drink["idDrink"]) => Promise<void>;
  closeModal: () => void;
};

export const createRecipesSlice: StateCreator<RecipesSliceType> = (set) => ({
  categories: [],
  drinks: { drinks: [] },
  selectedRecipe: null,
  modal: false,
  isLoading: false,
  hasSearched: false,

  fetchCategories: async () => {
    try {
      const categories = await getCategories();
      set({ categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  },

  searchRecipes: async (filters) => {
    set({ isLoading: true, hasSearched: true });

    try {
      let drinks: Drink[] = [];

      if (!filters.category && !filters.ingredient) {
        drinks = await getRandomRecipes(150);
      } else {
        drinks = await getRecipes(filters);

        drinks.sort((a, b) => a.strDrink.localeCompare(b.strDrink));
      }

      set({ drinks: { drinks } });
    } catch (error) {
      console.error("Error searching recipes:", error);
      set({ drinks: { drinks: [] } });
    } finally {
      set({ isLoading: false });
    }
  },

  selectRecipe: async (id) => {
    try {
      const selectedRecipe = await getRecipeById(id);
      set({ selectedRecipe, modal: true });
    } catch (error) {
      console.error("Error fetching recipe detail:", error);
    }
  },

  closeModal: () => {
    set({
      modal: false,
      selectedRecipe: null,
    });
  },
});
