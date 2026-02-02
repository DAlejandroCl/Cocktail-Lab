import type { StateCreator } from "zustand"
import { getCategories, getRecipeById, getRecipes } from "../services/RecipeService"
import type { Category, Drink, Drinks, RecipeDetail, SearchFilters } from "../types"

export type RecipesSliceType = {
    categories: Category[]
    drinks: Drinks
    selectedRecipe: RecipeDetail
    modal: boolean
    fetchCategories: () => Promise<void>
    searchRecipes: (searchFilters: SearchFilters) => Promise<void>
    selectRecipe: (id: Drink['idDrink']) => Promise<void>
    closeModal: () => void
}

export const createRecipesSlice : StateCreator<RecipesSliceType> = (set) => ({
    categories: [],
    drinks: {
        drinks: []
    },
    selectedRecipe: {} as RecipeDetail,
    modal: false,
    fetchCategories: async () => {
        const categories = await getCategories()
        set({
            categories: categories
        })
    },
    searchRecipes: async (filters) => {
       const drinks = await getRecipes(filters)
       set({
            drinks: { drinks }
       })
    },
    selectRecipe: async (id) => {
        const selectedRecipe = await getRecipeById(id)
        set({
            selectedRecipe,
            modal: true
        })
    },
    closeModal: () => {
        set({
            modal: false,
            selectedRecipe: {} as RecipeDetail
        })
    }
})