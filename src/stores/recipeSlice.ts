/**
 * src/stores/recipeSlice.ts
 *
 * Cambios respecto a la versión anterior:
 *  - Añadida acción `openRecipeModal(recipe: RecipeDetail)`:
 *    Permite abrir el Modal directamente con datos ya disponibles en memoria
 *    (recetas de IA, favoritos cacheados) SIN hacer fetch a la API externa.
 *    Es la pieza clave para solucionar el bug de favoritos en recetas de IA.
 */

import type { StateCreator } from "zustand";
import {
  getCategories,
  getRecipeById,
  getRecipes,
  getBrowseRecipes,
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

  /**
   * Selecciona una receta de la API externa por ID.
   * Hace fetch a TheCocktailDB → solo para bebidas con ID numérico real.
   */
  selectRecipe: (id: Drink["idDrink"]) => Promise<void>;

  /**
   * Abre el modal con datos ya disponibles en memoria.
   * Úsalo para recetas de IA (`ai-xxx`) y favoritos persistidos
   * donde el objeto `RecipeDetail` completo ya está en el store.
   */
  openRecipeModal: (recipe: RecipeDetail) => void;

  closeModal: () => void;
};

export const createRecipesSlice: StateCreator<RecipesSliceType> = (set, get) => ({
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
        const categories = get().categories;
        drinks = await getBrowseRecipes(categories);
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

  // ── Nueva acción: abre el modal sin fetch ──────────────────────────────────
  openRecipeModal: (recipe) => {
    set({ selectedRecipe: recipe, modal: true });
  },

  closeModal: () => {
    set({ modal: false, selectedRecipe: null });
  },
});
