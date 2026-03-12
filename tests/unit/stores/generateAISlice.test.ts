import { describe, it, expect, beforeEach, vi } from "vitest";
import { createStore } from "zustand/vanilla";
import { createGenerateAISlice, type AiRecipeSliceType } from "@/stores/generateAISlice";
import { makeGeneratedRecipe } from "../../mocks/factories";
import { DEFAULT_AI_RECIPE_RESPONSE } from "../../mocks/handlers";

// ─── Store factory ─────────────────────────────────────────────────────────────

// createGenerateAISlice expects the full AppState as its generic, but we can
// test it in isolation by casting — the slice only reads its own keys from get().
const createTestStore = () =>
  createStore<AiRecipeSliceType>()(
    (set, get, api) =>
      createGenerateAISlice(
        set as Parameters<typeof createGenerateAISlice>[0],
        get as Parameters<typeof createGenerateAISlice>[1],
        api as Parameters<typeof createGenerateAISlice>[2],
      ),
  );

describe("generateAISlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    vi.restoreAllMocks();
  });

  // ── Initial state ────────────────────────────────────────────────────────

  it("has correct initial state", () => {
    const s = store.getState();
    expect(s.aiIngredients).toEqual([]);
    expect(s.generatedRecipe).toBeNull();
    expect(s.isGenerating).toBe(false);
    expect(s.generationError).toBeNull();
    expect(s.aiRecipes).toEqual([]);
  });

  // ── addIngredient ────────────────────────────────────────────────────────

  it("adds a new ingredient", () => {
    store.getState().addIngredient("Vodka");
    expect(store.getState().aiIngredients).toEqual(["Vodka"]);
  });

  it("trims whitespace from the ingredient", () => {
    store.getState().addIngredient("  Gin  ");
    expect(store.getState().aiIngredients).toEqual(["Gin"]);
  });

  it("ignores empty / whitespace-only strings", () => {
    store.getState().addIngredient("   ");
    expect(store.getState().aiIngredients).toHaveLength(0);
  });

  it("does not add a duplicate (case-insensitive)", () => {
    store.getState().addIngredient("Vodka");
    store.getState().addIngredient("vodka");
    store.getState().addIngredient("VODKA");
    expect(store.getState().aiIngredients).toHaveLength(1);
  });

  it("preserves original casing of first entry", () => {
    store.getState().addIngredient("Blue Curacao");
    expect(store.getState().aiIngredients[0]).toBe("Blue Curacao");
  });

  // ── removeIngredient ─────────────────────────────────────────────────────

  it("removes the specified ingredient", () => {
    store.getState().addIngredient("Rum");
    store.getState().addIngredient("Lime juice");
    store.getState().removeIngredient("Rum");
    expect(store.getState().aiIngredients).toEqual(["Lime juice"]);
  });

  it("does nothing when removing a non-existent ingredient", () => {
    store.getState().addIngredient("Gin");
    store.getState().removeIngredient("Tequila");
    expect(store.getState().aiIngredients).toEqual(["Gin"]);
  });

  // ── clearIngredients ─────────────────────────────────────────────────────

  it("clears all ingredients", () => {
    store.getState().addIngredient("Vodka");
    store.getState().addIngredient("Lime juice");
    store.getState().clearIngredients();
    expect(store.getState().aiIngredients).toEqual([]);
  });

  // ── clearGeneratedRecipe ─────────────────────────────────────────────────

  it("clears the generated recipe and any error", () => {
    const recipe = makeGeneratedRecipe();
    // Manually set state to simulate a previous generation
    store.setState({ generatedRecipe: recipe, generationError: "some error" });

    store.getState().clearGeneratedRecipe();

    expect(store.getState().generatedRecipe).toBeNull();
    expect(store.getState().generationError).toBeNull();
  });

  // ── saveAiRecipe ─────────────────────────────────────────────────────────

  it("saves a generated recipe to aiRecipes", () => {
    const recipe = makeGeneratedRecipe();
    store.getState().saveAiRecipe(recipe);
    expect(store.getState().aiRecipes).toHaveLength(1);
    expect(store.getState().aiRecipes[0].idDrink).toBe(recipe.idDrink);
  });

  it("prepends new recipes so latest appears first", () => {
    const first  = makeGeneratedRecipe({ idDrink: "ai-1" });
    const second = makeGeneratedRecipe({ idDrink: "ai-2" });
    store.getState().saveAiRecipe(first);
    store.getState().saveAiRecipe(second);
    expect(store.getState().aiRecipes[0].idDrink).toBe("ai-2");
  });

  it("does not save a duplicate recipe", () => {
    const recipe = makeGeneratedRecipe({ idDrink: "ai-unique" });
    store.getState().saveAiRecipe(recipe);
    store.getState().saveAiRecipe(recipe);
    expect(store.getState().aiRecipes).toHaveLength(1);
  });

  // ── removeAiRecipe ────────────────────────────────────────────────────────

  it("removes a saved recipe by id", () => {
    const r1 = makeGeneratedRecipe({ idDrink: "ai-1" });
    const r2 = makeGeneratedRecipe({ idDrink: "ai-2" });
    store.getState().saveAiRecipe(r1);
    store.getState().saveAiRecipe(r2);
    store.getState().removeAiRecipe("ai-1");
    expect(store.getState().aiRecipes.map((r) => r.idDrink)).toEqual(["ai-2"]);
  });

  // ── generateRecipe ────────────────────────────────────────────────────────

  it("does nothing when aiIngredients is empty", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    await store.getState().generateRecipe();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(store.getState().isGenerating).toBe(false);
  });

  it("sets isGenerating to true during the request", async () => {
    store.getState().addIngredient("Vodka");

    let observedDuringFetch = false;

    vi.spyOn(global, "fetch").mockImplementation(async () => {
      observedDuringFetch = store.getState().isGenerating;
      return new Response(JSON.stringify(DEFAULT_AI_RECIPE_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    await store.getState().generateRecipe();
    expect(observedDuringFetch).toBe(true);
  });

  it("sets generatedRecipe on success and clears isGenerating", async () => {
    store.getState().addIngredient("Vodka");

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(DEFAULT_AI_RECIPE_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await store.getState().generateRecipe();

    const s = store.getState();
    expect(s.isGenerating).toBe(false);
    expect(s.generatedRecipe).not.toBeNull();
    expect(s.generatedRecipe?.strDrink).toBe(DEFAULT_AI_RECIPE_RESPONSE.recipe.strDrink);
    expect(s.generatedRecipe?.isAIGenerated).toBe(true);
    expect(s.generatedRecipe?.userIngredients).toEqual(["Vodka"]);
  });

  it("maps ingredients into strIngredient1..N fields", async () => {
    store.getState().addIngredient("Gin");

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(DEFAULT_AI_RECIPE_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await store.getState().generateRecipe();

    const recipe = store.getState().generatedRecipe!;
    // First ingredient from the mock response
    expect(recipe.strIngredient1).toBe(DEFAULT_AI_RECIPE_RESPONSE.recipe.ingredients[0].name);
    expect(recipe.strMeasure1).toBe(DEFAULT_AI_RECIPE_RESPONSE.recipe.ingredients[0].measure);
    // Slot beyond the list should be null
    expect(recipe.strIngredient5).toBeNull();
  });

  it("sets generationError on API failure and clears isGenerating", async () => {
    store.getState().addIngredient("Rum");

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500, statusText: "Internal Server Error" }),
    );

    await store.getState().generateRecipe();

    const s = store.getState();
    expect(s.isGenerating).toBe(false);
    expect(s.generatedRecipe).toBeNull();
    expect(s.generationError).toMatch(/API Error/i);
  });

  it("sets generationError on network failure", async () => {
    store.getState().addIngredient("Tequila");

    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    await store.getState().generateRecipe();

    expect(store.getState().generationError).toBe("Network error");
    expect(store.getState().isGenerating).toBe(false);
  });

  it("clears previous error before a new generation attempt", async () => {
    store.setState({ generationError: "old error", aiIngredients: ["Vodka"] });

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(DEFAULT_AI_RECIPE_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await store.getState().generateRecipe();
    expect(store.getState().generationError).toBeNull();
  });
});
