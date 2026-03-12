import type { StateCreator } from "zustand";
import type { AppState } from "./useAppStore";
import type { RecipeDetail } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeneratedRecipe extends RecipeDetail {
  isAIGenerated: true;
  generatedAt: string;
  userIngredients: string[];
}

export interface AiRecipeSliceType {
  // State
  aiIngredients: string[];
  generatedRecipe: GeneratedRecipe | null;
  isGenerating: boolean;
  generationError: string | null;
  aiRecipes: GeneratedRecipe[];

  // Actions
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  clearIngredients: () => void;
  generateRecipe: () => Promise<void>;
  clearGeneratedRecipe: () => void;
  saveAiRecipe: (recipe: GeneratedRecipe) => void;
  removeAiRecipe: (recipeId: string) => void;
}

// ─── API Response shape ───────────────────────────────────────────────────────

interface AIIngredient {
  name: string;
  measure: string;
}

interface AIRecipeResponse {
  recipe: {
    strDrink: string;
    strDrinkThumb: string;
    strCategory: string;
    strInstructions: string;
    ingredients: AIIngredient[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ing(list: AIIngredient[], i: number): string | null {
  return list[i]?.name?.trim() || null;
}

function msr(list: AIIngredient[], i: number): string | null {
  return list[i]?.measure?.trim() || null;
}

function mapToGeneratedRecipe(
  data: AIRecipeResponse,
  ingredients: string[],
): GeneratedRecipe {
  const { recipe } = data;
  const list = recipe.ingredients ?? [];

  return {
    // ── Core RecipeDetail fields ──────────────────────────────────────────
    idDrink: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    strDrink: recipe.strDrink,
    strDrinkThumb: recipe.strDrinkThumb,
    strCategory: recipe.strCategory ?? null,
    strInstructions: recipe.strInstructions,

    // ── Ingredients (explicit — preserves TS types) ───────────────────────
    strIngredient1:  ing(list,  0),
    strIngredient2:  ing(list,  1),
    strIngredient3:  ing(list,  2),
    strIngredient4:  ing(list,  3),
    strIngredient5:  ing(list,  4),
    strIngredient6:  ing(list,  5),
    strIngredient7:  ing(list,  6),
    strIngredient8:  ing(list,  7),
    strIngredient9:  ing(list,  8),
    strIngredient10: ing(list,  9),
    strIngredient11: ing(list, 10),
    strIngredient12: ing(list, 11),
    strIngredient13: ing(list, 12),
    strIngredient14: ing(list, 13),
    strIngredient15: ing(list, 14),

    // ── Measures (explicit) ───────────────────────────────────────────────
    strMeasure1:  msr(list,  0),
    strMeasure2:  msr(list,  1),
    strMeasure3:  msr(list,  2),
    strMeasure4:  msr(list,  3),
    strMeasure5:  msr(list,  4),
    strMeasure6:  msr(list,  5),
    strMeasure7:  msr(list,  6),
    strMeasure8:  msr(list,  7),
    strMeasure9:  msr(list,  8),
    strMeasure10: msr(list,  9),
    strMeasure11: msr(list, 10),
    strMeasure12: msr(list, 11),
    strMeasure13: msr(list, 12),
    strMeasure14: msr(list, 13),
    strMeasure15: msr(list, 14),

    // ── AI-specific metadata ──────────────────────────────────────────────
    isAIGenerated: true,
    generatedAt: new Date().toISOString(),
    userIngredients: ingredients,
  };
}

// ─── API Call ─────────────────────────────────────────────────────────────────

async function callAIRecipeAPI(ingredients: string[]): Promise<GeneratedRecipe> {
  const response = await fetch("/api/ai/generate-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const data: AIRecipeResponse = await response.json();
  return mapToGeneratedRecipe(data, ingredients);
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const createGenerateAISlice: StateCreator<
  AppState,
  [["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  AiRecipeSliceType
> = (set, get) => ({
  aiIngredients: [],
  generatedRecipe: null,
  isGenerating: false,
  generationError: null,
  aiRecipes: [],

  addIngredient: (ingredient) => {
    const { aiIngredients } = get();
    const normalized = ingredient.trim().toLowerCase();
    if (!normalized || aiIngredients.map((i) => i.toLowerCase()).includes(normalized)) return;
    set({ aiIngredients: [...aiIngredients, ingredient.trim()] }, false, "ai/addIngredient");
  },

  removeIngredient: (ingredient) => {
    const { aiIngredients } = get();
    set(
      { aiIngredients: aiIngredients.filter((i) => i !== ingredient) },
      false,
      "ai/removeIngredient",
    );
  },

  clearIngredients: () => {
    set({ aiIngredients: [] }, false, "ai/clearIngredients");
  },

  generateRecipe: async () => {
    const { aiIngredients } = get();
    if (aiIngredients.length === 0) return;

    set(
      { isGenerating: true, generationError: null, generatedRecipe: null },
      false,
      "ai/generateRecipe/start",
    );

    try {
      const recipe = await callAIRecipeAPI(aiIngredients);
      set({ generatedRecipe: recipe, isGenerating: false }, false, "ai/generateRecipe/success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      set({ generationError: message, isGenerating: false }, false, "ai/generateRecipe/error");
    }
  },

  clearGeneratedRecipe: () => {
    set({ generatedRecipe: null, generationError: null }, false, "ai/clearGeneratedRecipe");
  },

  saveAiRecipe: (recipe) => {
    const { aiRecipes } = get();
    if (aiRecipes.some((r) => r.idDrink === recipe.idDrink)) return;
    set({ aiRecipes: [recipe, ...aiRecipes] }, false, "ai/saveRecipe");
  },

  removeAiRecipe: (recipeId) => {
    const { aiRecipes } = get();
    set(
      { aiRecipes: aiRecipes.filter((r) => r.idDrink !== recipeId) },
      false,
      "ai/removeRecipe",
    );
  },
});
