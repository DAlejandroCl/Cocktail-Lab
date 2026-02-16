import type { RecipesSliceType } from "./recipeSlice";
import type { FavoritesSliceType } from "./favoritesSlice";
import type { NotificationSliceType } from "./notificationSlice";

export type AppState =
  RecipesSliceType &
  FavoritesSliceType &
  NotificationSliceType;

// Recipes
export const selectDrinks = (state: AppState) => state.drinks;
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectModal = (state: AppState) => state.modal;
export const selectSelectedRecipe = (state: AppState) => state.selectedRecipe;
export const selectSearchRecipes = (state: AppState) => state.searchRecipes;
export const selectSelectRecipe = (state: AppState) => state.selectRecipe;
export const selectCloseModal = (state: AppState) => state.closeModal;

// Favorites
export const selectFavoritesMap = (state: AppState) => state.favorites;
export const selectAddFavorite = (state: AppState) => state.addFavorite;
export const selectRemoveFavorite = (state: AppState) => state.removeFavorite;
export const selectIsFavorite = (id: string) => (state: AppState) =>
  !!state.favorites[id];

// Notification
export const selectNotification = (state: AppState) => state.notification;
export const selectSetNotification = (state: AppState) => state.setNotification;
export const selectClearNotification = (state: AppState) =>
  state.clearNotification;

export const selectHasSearched = (state: AppState) => state.hasSearched;
