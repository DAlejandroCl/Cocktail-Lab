import type { StateCreator } from "zustand";
import type { RecipeDetail } from "../types";
import type { AppState } from "./useAppStore";

export type FavoritesMap = Record<string, RecipeDetail>;

export type FavoritesSliceType = {
  favorites: FavoritesMap;
  addFavorite: (recipe: RecipeDetail) => void;
  removeFavorite: (id: RecipeDetail["idDrink"]) => void;
  isFavorite: (id: RecipeDetail["idDrink"]) => boolean;
};

export const createFavoritesSlice: StateCreator<
  AppState,
  [],
  [],
  FavoritesSliceType
> = (set, get) => ({
  favorites: {},

  addFavorite: (recipe) =>
    set((state) => ({
      favorites: {
        ...state.favorites,
        [recipe.idDrink]: recipe,
      },
    })),

  removeFavorite: (id) =>
    set((state) => {
      const updated = { ...state.favorites };
      delete updated[id];
      return { favorites: updated };
    }),

  isFavorite: (id) => !!get().favorites[id],
});
