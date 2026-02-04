import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createRecipesSlice, type RecipesSliceType } from "./recipeSlice";
import { createFavoritesSlice, type FavoritesSliceType } from "./favoritesSlice";

export const useAppStore = create<RecipesSliceType & FavoritesSliceType>()(
  devtools((...args) => ({
    ...createRecipesSlice(...args),
    ...createFavoritesSlice(...args)
  }))
);