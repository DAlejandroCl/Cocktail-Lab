import type { StateCreator } from "zustand"
import type { RecipeDetail } from "../types"

export type FavoritesSliceType = {
    favorites: RecipeDetail[]
    addFavorite: (recipe: RecipeDetail) => void
    removeFavorite: (id: RecipeDetail['idDrink']) => void
    isFavorite: (id: RecipeDetail['idDrink']) => boolean
}

export const createFavoritesSlice : StateCreator<FavoritesSliceType> = (set, get) => ({
    favorites: [],
    addFavorite: (recipe) => {
        const { favorites } = get()
        if (!favorites.find(fav => fav.idDrink === recipe.idDrink)) {
            set({
                favorites: [...favorites, recipe]
            })
        }
    },
    removeFavorite: (id) => {
        const { favorites } = get()
        set({
            favorites: favorites.filter(fav => fav.idDrink !== id)
        })
    },
    isFavorite: (id) => {
        const { favorites } = get()
        return favorites.some(fav => fav.idDrink === id)
    }
})
