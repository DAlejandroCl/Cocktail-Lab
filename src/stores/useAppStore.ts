import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createRecipesSlice, type RecipesSliceType } from "./recipeSlice";
import { createFavoritesSlice, type FavoritesSliceType } from "./favoritesSlice";
import { createNotificationSlice, type NotificationSliceType } from "./notificationSlice";
import { createGenerateAISlice, type AiRecipeSliceType } from "./generateAISlice";

// ─── Combined App State ───────────────────────────────────────────────────────

export type AppState =
  & RecipesSliceType
  & FavoritesSliceType
  & NotificationSliceType
  & AiRecipeSliceType;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (...a) => ({
        ...createRecipesSlice(...a),
        ...createFavoritesSlice(...a),
        ...createNotificationSlice(...a),
        ...createGenerateAISlice(...a),
      }),
      {
        name: "cocktail-lab-storage",
        partialize: (state) => ({
          favorites: state.favorites,
          aiRecipes: state.aiRecipes,
        }),
      }
    ),
    { name: "CocktailLabStore" }
  )
);