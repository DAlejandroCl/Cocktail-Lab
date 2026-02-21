import type { StateCreator } from "zustand";
import type { RecipeDetail } from "../types";

export type FavoritesMap = Record<string, RecipeDetail>;

export type FavoritesSliceType = {
  favorites: FavoritesMap;
  addFavorite: (recipe: RecipeDetail) => void;
  removeFavorite: (id: RecipeDetail["idDrink"]) => void;
  isFavorite: (id: RecipeDetail["idDrink"]) => boolean;
};

export const createFavoritesSlice: StateCreator<
  FavoritesSliceType,
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