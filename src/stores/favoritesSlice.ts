import type { StateCreator } from "zustand"
import type { RecipeDetail } from "../types"

const FAVORITES_STORAGE_KEY = 'cocktail-lab-favorites';

const loadFavoritesFromStorage = (): RecipeDetail[] => {
    try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
    }
    return [];
};

const saveFavoritesToStorage = (favorites: RecipeDetail[]) => {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
    }
};

export type FavoritesSliceType = {
    favorites: RecipeDetail[]
    addFavorite: (recipe: RecipeDetail) => void
    removeFavorite: (id: RecipeDetail['idDrink']) => void
    isFavorite: (id: RecipeDetail['idDrink']) => boolean
}

export const createFavoritesSlice : StateCreator<FavoritesSliceType> = (set, get) => ({
    favorites: loadFavoritesFromStorage(), // Cargar desde localStorage al iniciar
    
    addFavorite: (recipe) => {
        const { favorites } = get()
        if (!favorites.find(fav => fav.idDrink === recipe.idDrink)) {
            const newFavorites = [...favorites, recipe];
            set({ favorites: newFavorites });
            saveFavoritesToStorage(newFavorites); // Guardar en localStorage
        }
    },
    
    removeFavorite: (id) => {
        const { favorites } = get()
        const newFavorites = favorites.filter(fav => fav.idDrink !== id);
        set({ favorites: newFavorites });
        saveFavoritesToStorage(newFavorites); // Guardar en localStorage
    },
    
    isFavorite: (id) => {
        const { favorites } = get()
        return favorites.some(fav => fav.idDrink === id)
    }
})