import type { StateCreator } from "zustand";
import type { RecipeDetail } from "../types";

export type FavoritesMap = Record<string, RecipeDetail>;

/* favoriteOrder stores the timestamp (Date.now()) for each idDrink.
   It lives parallel to `favorites` so RecipeDetail / Zod schema are untouched. */
export type FavoriteOrder = Record<string, number>;

export type FavoritesSliceType = {
  favorites: FavoritesMap;
  favoriteOrder: FavoriteOrder;
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
  favoriteOrder: {},

  addFavorite: (recipe) =>
    set((state) => ({
      favorites: {
        ...state.favorites,
        [recipe.idDrink]: recipe,
      },
      favoriteOrder: {
        ...state.favoriteOrder,
        [recipe.idDrink]: Date.now(),
      },
    })),

  removeFavorite: (id) =>
    set((state) => {
      const updatedFavorites = { ...state.favorites };
      const updatedOrder    = { ...state.favoriteOrder };
      delete updatedFavorites[id];
      delete updatedOrder[id];
      return { favorites: updatedFavorites, favoriteOrder: updatedOrder };
    }),

  isFavorite: (id) => !!get().favorites[id],
});
