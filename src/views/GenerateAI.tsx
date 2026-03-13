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

/* ─────────────────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────────────────── */

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

const LOADING_PHASES = [
  "Analyzing your ingredients…",
  "Consulting the alchemist…",
  "Balancing flavour profiles…",
  "Selecting the perfect glass…",
  "Crafting your recipe…",
];

/* ─────────────────────────────────────────────────────────────
   INGREDIENT TAG
───────────────────────────────────────────────────────────── */

interface IngredientTagProps {
  name: string;
  onRemove: (name: string) => void;
}

const IngredientTag = memo(function IngredientTag({
  name,
  onRemove,
}: IngredientTagProps) {
  return (
    <span className="ingredient-tag">
      {name}
      <button
        type="button"
        onClick={() => onRemove(name)}
        aria-label={`Remove ${name}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1rem",
          height: "1rem",
          borderRadius: "9999px",
          opacity: 0.7,
          transition: "opacity 0.15s",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          padding: 0,
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")
        }
      >
        <svg
          className="w-2.5 h-2.5"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" d="M2 2l6 6M8 2l-6 6" />
        </svg>
      </button>
    </span>
  );
});

/* ─────────────────────────────────────────────────────────────
   GENERATING LOADER
───────────────────────────────────────────────────────────── */

function GeneratingLoader() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setPhase((p) => (p + 1) % LOADING_PHASES.length),
      900,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Generating recipe"
      className="flex flex-col items-center justify-center gap-6 py-16"
    >
      <div className="relative w-20 h-20" aria-hidden="true">
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ border: "2px solid rgba(242, 127, 13, 0.2)" }}
        />
        <span
          className="absolute inset-2 rounded-full animate-ping"
          style={{
            border: "2px solid rgba(242, 127, 13, 0.35)",
            animationDelay: "200ms",
          }}
        />
        <span
          className="absolute inset-4 rounded-full animate-ping"
          style={{
            border: "2px solid rgba(242, 127, 13, 0.55)",
            animationDelay: "400ms",
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-8 h-8 animate-bounce"
            style={{ color: "var(--color-brand)" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.75H14.25M3.75 3.75H20.25L17.25 12.75C16.5 15 14.25 16.5 12 16.5C9.75 16.5 7.5 15 6.75 12.75L3.75 3.75Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V20.25M8.25 20.25H15.75"
            />
          </svg>
        </span>
      </div>

      <p
        key={phase}
        className="text-sm font-medium tracking-wide animate-fade-up"
        style={{ color: "var(--color-brand)" }}
      >
        {LOADING_PHASES[phase]}
      </p>

      <div className="flex gap-2" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              background: "rgba(242, 127, 13, 0.45)",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GENERATED RECIPE CARD
───────────────────────────────────────────────────────────── */

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
    const name = recipe[
      `strIngredient${i}` as keyof GeneratedRecipe
    ] as string | null;
    if (name?.trim()) {
      const measure = recipe[
        `strMeasure${i}` as keyof GeneratedRecipe
      ] as string | null;
      ingredients.push({ name, measure });
    }
  }

  return (
    <article
      className="animate-card-enter"
      aria-label={`Generated recipe: ${recipe.strDrink}`}
      style={{
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={recipe.strDrinkThumb}
          alt={recipe.strDrink}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
          }}
        />

        <div className="absolute top-3 left-3 z-10">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{ background: "var(--color-brand)", color: "#ffffff" }}
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a1 1 0 011 1v1.268l1.098-.634a1 1 0 011 1.732L10 5.732V7h1.268l.634-1.098a1 1 0 011.732 1L12.268 8l1.366.098a1 1 0 010 1.732L12.268 10H11v1.268l1.098.634a1 1 0 01-1 1.732L10 12.268V11H8.732l-.634 1.098a1 1 0 01-1.732-1L7.732 10H7v-.732l-1.098.634a1 1 0 01-1-1.732L6.268 8 4.902 7.902a1 1 0 010-1.732L6.268 7H7V5.732L5.902 5.098a1 1 0 011-1.732L8 3.97V2a1 1 0 011-1z" />
            </svg>
            AI Crafted
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h2 className="text-2xl font-serif font-bold text-white leading-tight">
            {recipe.strDrink}
          </h2>
          {recipe.strCategory && (
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>
              {recipe.strCategory}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6">

        <section aria-labelledby="recipe-ingredients-heading">
          <h3
            id="recipe-ingredients-heading"
            className="text-[10px] font-bold tracking-widest uppercase mb-3 flex items-center gap-2"
            style={{ color: "var(--color-brand)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ingredients
          </h3>
          <ul
            role="list"
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {ingredients.map(({ name, measure }, idx) => (
              <li
                key={name}
                className="flex items-center justify-between px-4 py-3 text-sm"
                style={{
                  borderBottom:
                    idx < ingredients.length - 1
                      ? "1px solid var(--border-subtle)"
                      : "none",
                }}
              >
                <span style={{ color: "var(--text-primary)" }}>{name}</span>
                <span
                  className="font-bold text-xs shrink-0 ml-4"
                  style={{ color: "var(--color-brand)" }}
                >
                  {measure?.trim() || "–"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="recipe-instructions-heading">
          <h3
            id="recipe-instructions-heading"
            className="text-[10px] font-bold tracking-widest uppercase mb-3 flex items-center gap-2"
            style={{ color: "var(--color-brand)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Instructions
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {recipe.strInstructions}
          </p>
        </section>

        <section aria-labelledby="recipe-your-ingredients-heading">
          <h3
            id="recipe-your-ingredients-heading"
            className="text-[10px] font-bold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Your ingredients used
          </h3>
          <div className="flex flex-wrap gap-2">
            {recipe.userIngredients.map((ing) => (
              <span key={ing} className="ingredient-tag" style={{ cursor: "default" }}>
                {ing}
              </span>
            ))}
          </div>
        </section>

        <div
          className="flex gap-3 pt-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <button
            type="button"
            onClick={onSaveToFavorites}
            className="btn-brand flex-1 h-11 rounded-xl text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Add to Favorites
          </button>

          <button
            type="button"
            onClick={onSaveCreation}
            disabled={isSaved}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Recipe already saved to My Creations" : "Save to My Creations"}
            className="btn-ghost flex-1 h-11 rounded-xl text-sm"
            style={
              isSaved
                ? {
                    opacity: 0.5,
                    cursor: "default",
                    color: "var(--color-brand)",
                    borderColor: "var(--border-brand)",
                  }
                : undefined
            }
          >
            <svg
              className="w-4 h-4"
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
            </svg>
            {isSaved ? "Saved" : "Save Creation"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN VIEW
───────────────────────────────────────────────────────────── */

function GenerateAI() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

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

  const filteredSuggestions = SUGGESTIONS.filter(
    (s) =>
      inputValue.trim().length > 0 &&
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !aiIngredients.map((i) => i.toLowerCase()).includes(s.toLowerCase()),
  ).slice(0, 8);

  const canGenerate = aiIngredients.length > 0 && !isGenerating;

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

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-10">

        <div
          className="mb-8 pb-6"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3"
            style={{
              background: "rgba(242, 127, 13, 0.1)",
              border: "1px solid rgba(242, 127, 13, 0.25)",
              color: "var(--color-brand)",
            }}
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a1 1 0 011 1v1.268l1.098-.634a1 1 0 011 1.732L10 5.732V7h1.268l.634-1.098a1 1 0 011.732 1L12.268 8l1.366.098a1 1 0 010 1.732L12.268 10H11v1.268l1.098.634a1 1 0 01-1 1.732L10 12.268V11H8.732l-.634 1.098a1 1 0 01-1.732-1L7.732 10H7v-.732l-1.098.634a1 1 0 01-1-1.732L6.268 8 4.902 7.902a1 1 0 010-1.732L6.268 7H7V5.732L5.902 5.098a1 1 0 011-1.732L8 3.97V2a1 1 0 011-1z" />
            </svg>
            Powered by AI
          </span>

          <h1
            className="text-2xl font-bold uppercase tracking-tighter"
            style={{ color: "var(--text-primary)" }}
          >
            Your Home Bar
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            List the ingredients you have on hand, and our AI will craft a
            unique cocktail for you.
          </p>
        </div>

        <section
          aria-label="Ingredient selector"
          className="mb-8 rounded-2xl p-5 space-y-4"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div>
            <label
              htmlFor={inputId}
              className="block text-[10px] font-bold tracking-widest uppercase mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Your Ingredients
            </label>

            {aiIngredients.length > 0 && (
              <div
                className="flex flex-wrap gap-2 mb-3 p-3 rounded-xl min-h-12"
                aria-label="Selected ingredients"
                aria-live="polite"
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-subtle)",
                }}
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
                  className="w-full h-11 px-4 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                  onFocusCapture={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor =
                      "rgba(242, 127, 13, 0.5)";
                  }}
                  onBlurCapture={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor =
                      "var(--border-subtle)";
                  }}
                />

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul
                    id="ai-ingredient-suggestions"
                    ref={listboxRef}
                    role="listbox"
                    aria-label="Ingredient suggestions"
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-30 custom-scrollbar"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                      maxHeight: "15rem",
                      overflowY: "auto",
                    }}
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
                        className="px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100"
                        style={{
                          background:
                            idx === highlightedIdx
                              ? "rgba(242, 127, 13, 0.12)"
                              : "transparent",
                          color:
                            idx === highlightedIdx
                              ? "var(--color-brand)"
                              : "var(--text-primary)",
                        }}
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
                className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  background: "rgba(242, 127, 13, 0.1)",
                  border: "1px solid rgba(242, 127, 13, 0.25)",
                  color: "var(--color-brand)",
                  opacity: inputValue.trim() ? 1 : 0.35,
                  cursor: inputValue.trim() ? "pointer" : "not-allowed",
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" />
                </svg>
              </button>
            </div>

            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Press{" "}
              <kbd
                className="px-1.5 py-0.5 rounded font-mono text-[10px]"
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                Enter
              </kbd>{" "}
              or click <span style={{ color: "var(--color-brand)" }}>+</span> to add · Minimum 1 ingredient
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              aria-busy={isGenerating}
              className="btn-brand flex-1 h-12 rounded-xl text-sm"
              style={!canGenerate ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
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
                className="btn-ghost h-12 px-4 rounded-xl text-sm"
                style={{ color: "var(--text-muted)" }}
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
            className="rounded-2xl px-5 py-4 flex items-start gap-4 mb-8"
            style={{
              background: "rgba(248, 113, 113, 0.08)",
              border: "1px solid rgba(248, 113, 113, 0.2)",
            }}
          >
            <svg
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "#f87171" }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#f87171" }}>
                Generation Failed
              </p>
              <p className="text-xs" style={{ color: "rgba(248,113,113,0.75)" }}>
                {generationError}
              </p>
            </div>
          </div>
        )}

        {generatedRecipe && !isGenerating && (
          <>
            <div
              className="flex items-center justify-between mb-4 pt-6"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <h2
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                Generated Recipe
              </h2>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(242, 127, 13, 0.1)",
                  border: "1px solid rgba(242, 127, 13, 0.2)",
                  color: "var(--color-brand)",
                }}
              >
                AI Crafted
              </span>
            </div>

            <GeneratedRecipeCard
              recipe={generatedRecipe}
              isSaved={isSaved}
              onSaveToFavorites={handleSaveToFavorites}
              onSaveCreation={handleSaveCreation}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default memo(GenerateAI);
