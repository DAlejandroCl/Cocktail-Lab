import type { RecipesSliceType } from "./recipeSlice";
import type { FavoritesSliceType } from "./favoritesSlice";
import type { NotificationSliceType } from "./notificationSlice";
import type { AiRecipeSliceType } from "./generateAISlice";

// ─── Combined AppState (mirrors useAppStore) ──────────────────────────────────

export type AppState =
  RecipesSliceType &
  FavoritesSliceType &
  NotificationSliceType &
  AiRecipeSliceType;

// ─── Recipes ──────────────────────────────────────────────────────────────────

export const selectDrinks          = (s: AppState) => s.drinks;
export const selectIsLoading       = (s: AppState) => s.isLoading;
export const selectModal           = (s: AppState) => s.modal;
export const selectSelectedRecipe  = (s: AppState) => s.selectedRecipe;
export const selectSearchRecipes   = (s: AppState) => s.searchRecipes;
export const selectSelectRecipe    = (s: AppState) => s.selectRecipe;
export const selectCloseModal      = (s: AppState) => s.closeModal;
export const selectHasSearched     = (s: AppState) => s.hasSearched;

// ─── Favorites ────────────────────────────────────────────────────────────────

export const selectFavoritesMap    = (s: AppState) => s.favorites;
export const selectFavoriteOrder   = (s: AppState) => s.favoriteOrder;
export const selectAddFavorite     = (s: AppState) => s.addFavorite;
export const selectRemoveFavorite  = (s: AppState) => s.removeFavorite;
export const selectIsFavorite      = (id: string) => (s: AppState) => !!s.favorites[id];

// ─── Notification ─────────────────────────────────────────────────────────────

export const selectNotification      = (s: AppState) => s.notification;
export const selectSetNotification   = (s: AppState) => s.setNotification;
export const selectClearNotification = (s: AppState) => s.clearNotification;

// ─── AI Recipe Generator ──────────────────────────────────────────────────────

export const selectAiIngredients       = (s: AppState) => s.aiIngredients;
export const selectGeneratedRecipe     = (s: AppState) => s.generatedRecipe;
export const selectIsGenerating        = (s: AppState) => s.isGenerating;
export const selectGenerationError     = (s: AppState) => s.generationError;
export const selectAiRecipes           = (s: AppState) => s.aiRecipes;

export const selectAddIngredient       = (s: AppState) => s.addIngredient;
export const selectRemoveIngredient    = (s: AppState) => s.removeIngredient;
export const selectClearIngredients    = (s: AppState) => s.clearIngredients;
export const selectGenerateRecipe      = (s: AppState) => s.generateRecipe;
export const selectClearGeneratedRecipe = (s: AppState) => s.clearGeneratedRecipe;
export const selectSaveAiRecipe        = (s: AppState) => s.saveAiRecipe;
export const selectRemoveAiRecipe      = (s: AppState) => s.removeAiRecipe;

export const selectIsAiRecipeSaved =
  (recipeId: string) => (s: AppState) =>
    s.aiRecipes.some((r) => r.idDrink === recipeId);
