/**
 * src/stores/useAppStore.ts
 *
 * Cambios:
 *  - `partialize` ahora excluye explícitamente el estado volátil de IA
 *    (`generatedRecipe`, `isGenerating`, `generationError`, `showAiHistory`)
 *    para que no se persistan en localStorage.
 *  - `aiRecipes` y `favorites` siguen persistiéndose.
 */

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
        /**
         * Solo persiste lo que debe sobrevivir a un reload.
         * El resto (estado de UI, loaders, receta actual en generación)
         * se reinicia a sus valores iniciales con cada carga.
         */
        partialize: (state) => ({
          favorites: state.favorites,
          favoriteOrder: state.favoriteOrder,
          aiRecipes: state.aiRecipes,
          // Nota: showAiHistory NO se persiste → siempre empieza colapsado
        }),
      }
    ),
    { name: "CocktailLabStore" }
  )
);
