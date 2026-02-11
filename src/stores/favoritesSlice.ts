import type { StateCreator } from "zustand";
import type { RecipeDetail } from "../types";

const FAVORITES_STORAGE_KEY = "cocktail-lab-favorites";

type FavoritesMap = Record<string, RecipeDetail>;

const loadFavoritesFromStorage = (): FavoritesMap => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return {};

    const parsed: RecipeDetail[] = JSON.parse(stored);

    return parsed.reduce<FavoritesMap>((acc, recipe) => {
      acc[recipe.idDrink] = recipe;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error loading favorites:", error);
    return {};
  }
};

const saveFavoritesToStorage = (favorites: FavoritesMap) => {
  try {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(Object.values(favorites))
    );
  } catch (error) {
    console.error("Error saving favorites:", error);
  }
};

export type FavoritesSliceType = {
  favorites: FavoritesMap;
  addFavorite: (recipe: RecipeDetail) => void;
  removeFavorite: (id: RecipeDetail["idDrink"]) => void;
  isFavorite: (id: RecipeDetail["idDrink"]) => boolean;
};

export const createFavoritesSlice: StateCreator<FavoritesSliceType> = (
  set,
  get
) => ({
  favorites: loadFavoritesFromStorage(),

  addFavorite: (recipe) =>
    set((state) => {
      if (state.favorites[recipe.idDrink]) return state;

      const updated = {
        ...state.favorites,
        [recipe.idDrink]: recipe,
      };

      saveFavoritesToStorage(updated);

      return { favorites: updated };
    }),

  removeFavorite: (id) =>
    set((state) => {
      if (!state.favorites[id]) return state;

      const updated = { ...state.favorites };
      delete updated[id];

      saveFavoritesToStorage(updated);

      return { favorites: updated };
    }),

  isFavorite: (id) => !!get().favorites[id],
});
