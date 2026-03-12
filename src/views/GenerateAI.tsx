import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useAppStore } from "../stores/useAppStore";
import {
  selectAiIngredients,
  selectGeneratedRecipe,
  selectIsGenerating,
  selectGenerationError,
  selectAddIngredient,
  selectRemoveIngredient,
  selectClearIngredients,
  selectGenerateRecipe,
  selectClearGeneratedRecipe,
  selectSaveAiRecipe,
  selectIsAiRecipeSaved,
  selectAddFavorite,
  selectSetNotification,
} from "../stores/selectors";
import type { GeneratedRecipe } from "../stores/generateAISlice";

// ─── Static ingredient suggestions ───────────────────────────────────────────

const SUGGESTIONS = [
  "Vodka", "Gin", "Rum", "Tequila", "Mezcal", "Whiskey", "Bourbon",
  "Brandy", "Triple Sec", "Cointreau", "Blue Curacao", "Kahlúa",
  "Baileys", "Amaretto", "Peach Schnapps", "Elderflower liqueur",
  "Limoncello", "Campari", "Aperol", "Vermouth", "Absinthe",
  "Lime juice", "Lemon juice", "Orange juice", "Grapefruit juice",
  "Pineapple juice", "Cranberry juice", "Coconut cream", "Heavy cream",
  "Egg white", "Simple syrup", "Honey syrup", "Agave nectar", "Grenadine",
  "Soda water", "Tonic water", "Ginger beer", "Cola",
  "Mint", "Basil", "Cucumber", "Jalapeño",
  "Strawberry", "Raspberry", "Mango", "Passion fruit",
  "Angostura bitters", "Orange bitters",
];

// ─── Loading phase messages ───────────────────────────────────────────────────

const LOADING_PHASES = [
  "Analyzing your ingredients…",
  "Consulting the alchemist…",
  "Balancing flavour profiles…",
  "Selecting the perfect glass…",
  "Crafting your recipe…",
];

// ─── IngredientTag ────────────────────────────────────────────────────────────

interface IngredientTagProps {
  name: string;
  onRemove: (name: string) => void;
}

const IngredientTag = memo(function IngredientTag({ name, onRemove }: IngredientTagProps) {
  return (
    <span className="ingredient-tag inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-primary/20 text-primary border border-primary/30 transition-colors duration-150 hover:bg-primary/30">
      {name}
      <button
        type="button"
        onClick={() => onRemove(name)}
        aria-label={`Remove ${name}`}
        className="w-4 h-4 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-primary/40 transition-all duration-150"
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M2 2l6 6M8 2l-6 6" />
        </svg>
      </button>
    </span>
  );
});

// ─── GeneratingLoader ─────────────────────────────────────────────────────────

function GeneratingLoader() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % LOADING_PHASES.length), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Generating recipe"
      className="flex flex-col items-center justify-center gap-6 py-20"
    >
      <div className="relative w-20 h-20" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        <span className="absolute inset-2 rounded-full border-2 border-primary/35 animate-ping [animation-delay:200ms]" />
        <span className="absolute inset-4 rounded-full border-2 border-primary/55 animate-ping [animation-delay:400ms]" />
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.75 3.75H14.25M3.75 3.75H20.25L17.25 12.75C16.5 15 14.25 16.5 12 16.5C9.75 16.5 7.5 15 6.75 12.75L3.75 3.75Z" />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 16.5V20.25M8.25 20.25H15.75" />
          </svg>
        </span>
      </div>

      <p key={phase} className="text-primary/80 text-sm font-medium tracking-wide animate-fade-up">
        {LOADING_PHASES[phase]}
      </p>

      <div className="flex gap-2" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── GeneratedRecipeCard ──────────────────────────────────────────────────────

interface GeneratedRecipeCardProps {
  recipe: GeneratedRecipe;
  isSaved: boolean;
  onSaveToFavorites: () => void;
  onSaveCreation: () => void;
}

function GeneratedRecipeCard({
  recipe,
  isSaved,
  onSaveToFavorites,
  onSaveCreation,
}: GeneratedRecipeCardProps) {
  const ingredients: Array<{ name: string; measure: string | null }> = [];
  for (let i = 1; i <= 15; i++) {
    const name = recipe[`strIngredient${i}` as keyof GeneratedRecipe] as string | null;
    if (name) {
      const measure = recipe[`strMeasure${i}` as keyof GeneratedRecipe] as string | null;
      ingredients.push({ name, measure });
    }
  }

  return (
    <article
      className="glass-card animate-card-enter rounded-2xl overflow-hidden"
      aria-label={`Generated recipe: ${recipe.strDrink}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={recipe.strDrinkThumb}
          alt={recipe.strDrink}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-primary text-navy-deep shadow-lg">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a1 1 0 011 1v1.268l1.098-.634a1 1 0 011 1.732L10 5.732V7h1.268l.634-1.098a1 1 0 011.732 1L12.268 8l1.366.098a1 1 0 010 1.732L12.268 10H11v1.268l1.098.634a1 1 0 01-1 1.732L10 12.268V11H8.732l-.634 1.098a1 1 0 01-1.732-1L7.732 10H7v-.732l-1.098.634a1 1 0 01-1-1.732L6.268 8 4.902 7.902a1 1 0 010-1.732L6.268 7H7V5.732L5.902 5.098a1 1 0 011-1.732L8 3.97V2a1 1 0 011-1z" />
            </svg>
            AI Created
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h2 className="text-2xl font-bold text-white leading-tight">{recipe.strDrink}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {recipe.strCategory && (
              <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                {recipe.strCategory}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 p-6 space-y-6">
        <section aria-label="Ingredients">
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-primary/70 mb-3">
            Ingredients
          </h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2" role="list">
            {ingredients.map(({ name, measure }) => (
              <li key={name} className="flex items-start gap-2 text-sm text-white/80">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" aria-hidden="true" />
                <span>
                  {measure && (
                    <span className="font-semibold text-primary/90">{measure} </span>
                  )}
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Instructions">
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-primary/70 mb-3">
            Instructions
          </h3>
          <p className="text-sm text-white/75 leading-relaxed">{recipe.strInstructions}</p>
        </section>

        <section aria-label="Your ingredients used">
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-primary/70 mb-2">
            Your ingredients
          </h3>
          <div className="flex flex-wrap gap-2">
            {recipe.userIngredients.map((ing) => (
              <span
                key={ing}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/20"
              >
                {ing}
              </span>
            ))}
          </div>
        </section>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onSaveToFavorites}
            className="button-primary flex-1 h-11 bg-primary text-navy-deep font-bold rounded-xl text-sm tracking-wide flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Add to Favorites
          </button>

          <button
            type="button"
            onClick={onSaveCreation}
            disabled={isSaved}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Recipe already saved to My Creations" : "Save to My Creations"}
            className={`flex-1 h-11 rounded-xl text-sm font-bold tracking-wide border flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep ${
              isSaved
                ? "border-primary/30 text-primary/50 cursor-default bg-primary/5"
                : "border-white/20 text-white/80 hover:border-primary/40 hover:text-primary hover:bg-primary/10 active:scale-[0.98]"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
            </svg>
            {isSaved ? "Saved" : "Save Creation"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

function GenerateAI() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const [inputValue, setInputValue]         = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx]   = useState(-1);

  // ── Store ────────────────────────────────────────────────────────────────
  const aiIngredients     = useAppStore(selectAiIngredients);
  const generatedRecipe   = useAppStore(selectGeneratedRecipe);
  const isGenerating      = useAppStore(selectIsGenerating);
  const generationError   = useAppStore(selectGenerationError);

  const addIngredient        = useAppStore(selectAddIngredient);
  const removeIngredient     = useAppStore(selectRemoveIngredient);
  const clearIngredients     = useAppStore(selectClearIngredients);
  const generateRecipe       = useAppStore(selectGenerateRecipe);
  const clearGeneratedRecipe = useAppStore(selectClearGeneratedRecipe);
  const saveAiRecipe         = useAppStore(selectSaveAiRecipe);
  const addFavorite          = useAppStore(selectAddFavorite);
  const setNotification      = useAppStore(selectSetNotification);

  const isSaved = useAppStore(
    selectIsAiRecipeSaved(generatedRecipe?.idDrink ?? ""),
  );

  // ── Derived ──────────────────────────────────────────────────────────────
  const filteredSuggestions = SUGGESTIONS.filter(
    (s) =>
      inputValue.trim().length > 0 &&
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !aiIngredients.map((i) => i.toLowerCase()).includes(s.toLowerCase()),
  ).slice(0, 8);

  const canGenerate = aiIngredients.length > 0 && !isGenerating;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const commitIngredient = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      addIngredient(trimmed);
      setInputValue("");
      setShowSuggestions(false);
      setHighlightedIdx(-1);
      inputRef.current?.focus();
    },
    [addIngredient],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIdx((p) => Math.min(p + 1, filteredSuggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIdx((p) => Math.max(p - 1, -1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIdx >= 0 && filteredSuggestions[highlightedIdx]) {
          commitIngredient(filteredSuggestions[highlightedIdx]);
        } else if (inputValue.trim()) {
          commitIngredient(inputValue);
        }
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setHighlightedIdx(-1);
      }
    },
    [highlightedIdx, filteredSuggestions, inputValue, commitIngredient],
  );

  const handleGenerate = useCallback(async () => {
    clearGeneratedRecipe();
    await generateRecipe();
  }, [generateRecipe, clearGeneratedRecipe]);

  const handleSaveToFavorites = useCallback(() => {
    if (!generatedRecipe) return;
    addFavorite(generatedRecipe);
    setNotification(`${generatedRecipe.strDrink} added to favorites`, "success");
  }, [generatedRecipe, addFavorite, setNotification]);

  const handleSaveCreation = useCallback(() => {
    if (!generatedRecipe || isSaved) return;
    saveAiRecipe(generatedRecipe);
    setNotification("Recipe saved to My Creations", "success");
  }, [generatedRecipe, isSaved, saveAiRecipe, setNotification]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !listboxRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen">
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-12">

        <div className="mb-10 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1a1 1 0 011 1v1.268l1.098-.634a1 1 0 011 1.732L10 5.732V7h1.268l.634-1.098a1 1 0 011.732 1L12.268 8l1.366.098a1 1 0 010 1.732L12.268 10H11v1.268l1.098.634a1 1 0 01-1 1.732L10 12.268V11H8.732l-.634 1.098a1 1 0 01-1.732-1L7.732 10H7v-.732l-1.098.634a1 1 0 01-1-1.732L6.268 8 4.902 7.902a1 1 0 010-1.732L6.268 7H7V5.732L5.902 5.098a1 1 0 011-1.732L8 3.97V2a1 1 0 011-1z" />
              </svg>
              Powered by AI
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">
            AI Recipe Generator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tell us what's in your bar and our AI will craft a unique cocktail recipe for you.
          </p>
        </div>

        <section aria-label="Ingredient selector" className="glass-card rounded-2xl p-6 space-y-5 mb-8">

          <div>
            <label
              htmlFor={inputId}
              className="block text-[10px] font-bold tracking-widest uppercase text-white/60 mb-3"
            >
              Your Ingredients
            </label>

            {aiIngredients.length > 0 && (
              <div
                className="flex flex-wrap gap-2 mb-3 p-3 rounded-xl bg-white/5 border border-white/10 min-h-12"
                aria-label="Selected ingredients"
                aria-live="polite"
              >
                {aiIngredients.map((ing) => (
                  <IngredientTag key={ing} name={ing} onRemove={removeIngredient} />
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  id={inputId}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                    setHighlightedIdx(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search an ingredient… (e.g. Vodka)"
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions && filteredSuggestions.length > 0}
                  aria-controls="ai-ingredient-suggestions"
                  aria-activedescendant={
                    highlightedIdx >= 0 ? `ai-suggestion-${highlightedIdx}` : undefined
                  }
                  className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/60 focus:bg-white/15 transition-all duration-200"
                />

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul
                    id="ai-ingredient-suggestions"
                    ref={listboxRef}
                    role="listbox"
                    aria-label="Ingredient suggestions"
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-navy-muted/95 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden z-30 custom-scrollbar max-h-60 overflow-y-auto"
                  >
                    {filteredSuggestions.map((s, idx) => (
                      <li
                        key={s}
                        id={`ai-suggestion-${idx}`}
                        role="option"
                        aria-selected={idx === highlightedIdx}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          commitIngredient(s);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100 ${
                          idx === highlightedIdx
                            ? "bg-primary/20 text-primary"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={() => commitIngredient(inputValue)}
                disabled={!inputValue.trim()}
                aria-label="Add ingredient"
                className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-white/30 mt-2">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              or click <span className="text-primary/60">+</span> to add · Minimum 1 ingredient
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              aria-busy={isGenerating}
              className="button-primary flex-1 h-12 bg-primary text-navy-deep font-bold rounded-xl text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 1a1 1 0 011 1v1.268l1.098-.634a1 1 0 011 1.732L10 5.732V7h1.268l.634-1.098a1 1 0 011.732 1L12.268 8l1.366.098a1 1 0 010 1.732L12.268 10H11v1.268l1.098.634a1 1 0 01-1 1.732L10 12.268V11H8.732l-.634 1.098a1 1 0 01-1.732-1L7.732 10H7v-.732l-1.098.634a1 1 0 01-1-1.732L6.268 8 4.902 7.902a1 1 0 010-1.732L6.268 7H7V5.732L5.902 5.098a1 1 0 011-1.732L8 3.97V2a1 1 0 011-1z" />
                  </svg>
                  Generate Recipe
                </>
              )}
            </button>

            {aiIngredients.length > 0 && !isGenerating && (
              <button
                type="button"
                onClick={clearIngredients}
                aria-label="Clear all ingredients"
                className="h-12 px-4 rounded-xl border border-white/15 text-white/50 text-xs font-semibold hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
              >
                Clear all
              </button>
            )}
          </div>
        </section>

        {isGenerating && <GeneratingLoader />}

        {generationError && !isGenerating && (
          <div
            role="alert"
            className="rounded-2xl border border-red-400/20 bg-red-400/10 px-6 py-5 flex items-start gap-4 mb-8"
          >
            <svg
              className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-red-400 text-sm font-semibold mb-1">Generation Failed</p>
              <p className="text-red-400/70 text-xs">{generationError}</p>
            </div>
          </div>
        )}

        {/* ── Generated recipe ── */}
        {generatedRecipe && !isGenerating && (
          <GeneratedRecipeCard
            recipe={generatedRecipe}
            isSaved={isSaved}
            onSaveToFavorites={handleSaveToFavorites}
            onSaveCreation={handleSaveCreation}
          />
        )}
      </main>
    </div>
  );
}

export default memo(GenerateAI);
