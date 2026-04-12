import type { GeneratedRecipe } from "../stores/generateAISlice";

   INGREDIENT ROW
───────────────────────────────────────────────────────────── */

function IngredientRow({ ingredient, measure }: { ingredient: string; measure: string | null | undefined }) {
  return (
    <li className="flex items-center justify-between px-4 py-3 gap-4"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{ingredient}</span>
      <span className="text-sm font-bold shrink-0" style={{ color: "var(--color-brand)" }}>
        {measure?.trim() || "–"}
      </span>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP ROW
───────────────────────────────────────────────────────────── */

function StepRow({ step, index }: { step: string; index: number }) {
  return (
    <li className="flex gap-4">
      <span
        className="flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
        aria-hidden="true"
        style={
          index === 0
            ? { background: "var(--color-brand)", color: "#ffffff" }
            : {
                background: "rgba(242, 127, 13, 0.12)",
                border: "1px solid rgba(242, 127, 13, 0.3)",
                color: "var(--color-brand)",
              }
        }
      >
        {index + 1}
      </span>
      <p className="text-sm leading-relaxed pt-0.5" style={{ color: "var(--text-secondary)" }}>{step}</p>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────
   GENERATED RECIPE CARD
───────────────────────────────────────────────────────────── */

interface GeneratedRecipeCardProps {
  recipe: GeneratedRecipe;
  isSaved: boolean;
  onSaveCreation: () => void;
  onRecraft: () => void;
  isRecrafting: boolean;
}

export default function GeneratedRecipeCard({
  recipe,
  isSaved,
  onSaveCreation,
  onRecraft,
  isRecrafting,
}: GeneratedRecipeCardProps) {
  const ingredients = Array.from({ length: 15 }, (_, i) => {
    const n = i + 1;
    const ingredient = recipe[`strIngredient${n}` as keyof GeneratedRecipe] as string | null;
    const measure    = recipe[`strMeasure${n}` as keyof GeneratedRecipe] as string | null;
    return ingredient?.trim() ? { ingredient, measure } : null;
  }).filter(Boolean) as { ingredient: string; measure: string | null }[];

  const steps = recipe.strInstructions
    ? recipe.strInstructions
        .split(/\.\s+/)
        .filter((s) => s.trim().length > 0)
        .map((s) => s.trim() + (s.endsWith(".") ? "" : "."))
    : [];

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
        <img src={recipe.strDrinkThumb} alt={recipe.strDrink} className="w-full h-full object-cover" />
        <div className="absolute inset-0" aria-hidden="true"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />

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
          <h2 className="text-2xl font-serif font-bold text-white leading-tight">{recipe.strDrink}</h2>
          {recipe.strCategory && (
            <p className="text-sm mt-1 italic" style={{ color: "rgba(255,255,255,0.7)" }}>{recipe.strCategory}</p>
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-8 pb-6">

        <section aria-labelledby="ai-recipe-ingredients-heading">
          <h3 id="ai-recipe-ingredients-heading" className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <svg className="w-4 h-4" style={{ color: "var(--color-brand)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ingredients
          </h3>
          <ul className="rounded-xl overflow-hidden"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }}>
            {ingredients.map(({ ingredient, measure }) => (
              <IngredientRow key={ingredient} ingredient={ingredient} measure={measure} />
            ))}
          </ul>
        </section>

        {steps.length > 0 && (
          <section aria-labelledby="ai-recipe-instructions-heading">
            <h3 id="ai-recipe-instructions-heading" className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <svg className="w-4 h-4" style={{ color: "var(--color-brand)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Instructions
            </h3>
            <ol className="space-y-5">
              {steps.map((step, i) => (
                <StepRow key={i} step={step} index={i} />
              ))}
            </ol>
          </section>
        )}

        <section aria-labelledby="ai-recipe-used-heading"
          style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <h3 id="ai-recipe-used-heading" className="text-[10px] font-bold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}>
            Your ingredients used
          </h3>
          <div className="flex flex-wrap gap-2">
            {recipe.userIngredients.map((ing) => (
              <span key={ing} className="ingredient-tag" style={{ cursor: "default" }}>{ing}</span>
            ))}
          </div>
        </section>

        <div className="flex gap-3" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>

          <button
            type="button"
            onClick={onSaveCreation}
            disabled={isSaved}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Recipe already saved to My Creations" : "Save to My Creations"}
            className="btn-brand flex-1 h-11 rounded-xl text-sm"
            style={isSaved ? { opacity: 0.55, cursor: "default" } : undefined}
          >
            <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
            </svg>
            {isSaved ? "Saved to My Creations" : "Save Creation"}
          </button>

          <button
            type="button"
            onClick={onRecraft}
            disabled={isRecrafting}
            aria-label="Re-craft recipe with same ingredients"
            className="btn-ghost h-11 px-4 rounded-xl text-sm flex items-center gap-2"
            style={isRecrafting ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
          >
            <svg
              className={`w-4 h-4 ${isRecrafting ? "animate-spin" : ""}`}
              fill="none" stroke="currentColor" strokeWidth={2.5}
              viewBox="0 0 24 24" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Re-craft
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
