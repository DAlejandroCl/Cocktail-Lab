import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createRecipesSlice, type RecipesSliceType } from "./recipeSlice";
import { createFavoritesSlice, type FavoritesSliceType } from "./favoritesSlice";
import { createNotificationSlice, type NotificationSliceType } from "./notificationSlice";

export type AppState =
  & RecipesSliceType
  & FavoritesSliceType
  & NotificationSliceType;

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (...a) => ({
        ...createRecipesSlice(...a),
        ...createFavoritesSlice(...a),
        ...createNotificationSlice(...a),
      }),
      {
        name: "cocktail-lab-storage",
        partialize: (state) => ({
          favorites: state.favorites,
        }),
      }
    )
  )
);
