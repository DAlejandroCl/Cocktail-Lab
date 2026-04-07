import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import DrinkCard from "../components/DrinkCard";
import SortSelector from "../components/SortSelector";
import {
  sortFavorites,
  SORT_OPTIONS_FAVORITES,
  type SortOptionFavorites,
} from "../utils/sortRecipes";
import {
  selectFavoritesMap,
  selectFavoriteOrder,
  selectSetNotification,
  selectAiRecipes,
  selectRemoveAiRecipe,
  selectOpenRecipeModal,
} from "../stores/selectors";
import type { GeneratedRecipe } from "../stores/generateAISlice";
import type { RecipeDetail } from "../types";

/* ─────────────────────────────────────────────────────────────
   EMPTY STATES
───────────────────────────────────────────────────────────── */

function FavoritesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }}>
        <svg className="w-9 h-9" style={{ color: "var(--color-brand)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-serif font-bold mb-2" style={{ color: "var(--text-primary)" }}>No Favorites Yet</h2>
      <p className="text-sm max-w-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Start exploring recipes and save your favorites by clicking the heart icon on any cocktail card.
      </p>
    </div>
  );
}

function CreationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }}>
        <svg className="w-7 h-7" style={{ color: "var(--color-brand)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
        </svg>
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>No saved creations yet</p>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Generate a recipe in AI Generator and click "Save Creation".
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   AI CREATION CARD
───────────────────────────────────────────────────────────── */

interface AiCreationCardProps {
  recipe: GeneratedRecipe;
  index: number;
  onRemove: (id: string) => void;
  onViewRecipe: (recipe: RecipeDetail) => void;
}

function AiCreationCard({ recipe, index, onRemove, onViewRecipe }: AiCreationCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article
      className="animate-card-enter"
      style={{
        animationDelay: `${index * 0.06}s`,
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.28s var(--ease-out-soft), transform 0.28s var(--ease-out-soft)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "var(--shadow-card-hover)";
        el.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "var(--shadow-card)";
        el.style.transform = "translateY(0)";
      }}
      aria-labelledby={`creation-title-${recipe.idDrink}`}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {!imgLoaded && (
          <div aria-hidden="true" className="absolute inset-0 animate-pulse"
            style={{ background: "var(--bg-subtle)" }} />
        )}
        <img
          src={recipe.strDrinkThumb}
          alt={recipe.strDrink}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.4s ease, transform 0.7s ease" }}
        />
        <div aria-hidden="true" className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 40%, rgba(0,0,0,0.25) 100%)" }} />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "var(--color-brand)", color: "#ffffff" }}
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a1 1 0 011 1v1.268l1.098-.634a1 1 0 011 1.732L10 5.732V7h1.268l.634-1.098a1 1 0 011.732 1L12.268 8l1.366.098a1 1 0 010 1.732L12.268 10H11v1.268l1.098.634a1 1 0 01-1 1.732L10 12.268V11H8.732l-.634 1.098a1 1 0 01-1.732-1L7.732 10H7v-.732l-1.098.634a1 1 0 01-1-1.732L6.268 8 4.902 7.902a1 1 0 010-1.732L6.268 7H7V5.732L5.902 5.098a1 1 0 011-1.732L8 3.97V2a1 1 0 011-1z" />
            </svg>
            AI
          </span>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(recipe.idDrink); }}
            aria-label={`Remove ${recipe.strDrink} from My Creations`}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(248,113,113,0.35)",
              color: "#f87171",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 flex-1" style={{ borderTop: "1px solid var(--border-card)" }}>
        <h3
          id={`creation-title-${recipe.idDrink}`}
          className="text-base font-bold leading-snug text-center line-clamp-2 min-h-11"
          style={{ color: "var(--text-primary)" }}
        >
          {recipe.strDrink}
        </h3>

        <button
          type="button"
          onClick={() => onViewRecipe(recipe)}
          className="btn-brand w-full h-10 rounded-lg text-sm mt-auto"
        >
          View Recipe
        </button>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

export default function FavoritesPage() {
  const favorites      = useAppStore(selectFavoritesMap);
  const favoriteOrder  = useAppStore(selectFavoriteOrder);
  const setNotification = useAppStore(selectSetNotification);
  const aiRecipes      = useAppStore(selectAiRecipes);
  const removeAiRecipe = useAppStore(selectRemoveAiRecipe);
  const openRecipeModal = useAppStore(selectOpenRecipeModal);

  const [sortOption, setSortOption] = useState<SortOptionFavorites>("recently-added");

  const allFavoritesArray = useMemo(() => Object.values(favorites), [favorites]);

  const apiFavorites = useMemo(
    () => allFavoritesArray.filter((d) => !d.idDrink.startsWith("ai-")) as RecipeDetail[],
    [allFavoritesArray],
  );

  const aiFavorites = useMemo(
    () => allFavoritesArray.filter((d) => d.idDrink.startsWith("ai-")) as RecipeDetail[],
    [allFavoritesArray],
  );

  const sortedApiFavorites = useMemo(
    () => sortFavorites(apiFavorites, sortOption, favoriteOrder),
    [apiFavorites, sortOption, favoriteOrder],
  );

  const sortedAiFavorites = useMemo(
    () => sortFavorites(aiFavorites, sortOption, favoriteOrder),
    [aiFavorites, sortOption, favoriteOrder],
  );

  const hasFavorites  = apiFavorites.length > 0 || aiFavorites.length > 0;
  const hasCreations  = aiRecipes.length > 0;
  const hasAnything   = hasFavorites || hasCreations;
  const totalCount    = allFavoritesArray.length + aiRecipes.length;

  const handleRemoveCreation = (id: string) => {
    removeAiRecipe(id);
    setNotification("Removed from My Creations", "info");
  };

  useEffect(() => {
    if (!hasAnything) setNotification("Your favorites list is empty", "info");
  }, [hasAnything, setNotification]);

  return (
    <article aria-labelledby="favorites-heading" className="relative min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <h2 id="favorites-heading" className="text-xl font-bold uppercase tracking-tighter" style={{ color: "var(--text-primary)" }}>
              My Favorites
            </h2>
            {hasAnything && (
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {totalCount} {totalCount === 1 ? "recipe" : "recipes"} saved
              </p>
            )}
          </div>
          {hasAnything && (
            <SortSelector options={SORT_OPTIONS_FAVORITES} value={sortOption} onChange={setSortOption} />
          )}
        </div>

        {apiFavorites.length > 0 && (
          <section aria-label="Saved cocktails from TheCocktailDB" className="mb-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {sortedApiFavorites.map((drink, index) => (
                <div key={drink.idDrink} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <DrinkCard drink={drink} fullRecipe={drink} index={index} />
                </div>
              ))}
            </div>
          </section>
        )}

        {aiFavorites.length > 0 && (
          <section aria-label="AI recipes saved as favorites" className="mb-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {sortedAiFavorites.map((drink, index) => (
                <div key={drink.idDrink} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <DrinkCard drink={drink} fullRecipe={drink} index={index} />
                </div>
              ))}
            </div>
          </section>
        )}

        {!hasFavorites && !hasCreations && <FavoritesEmptyState />}

        {(hasCreations || hasAnything) && (
          <section aria-labelledby="creations-heading">
            <div className="flex items-center justify-between mb-6 pt-6"
              style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div>
                <h3 id="creations-heading" className="text-lg font-bold uppercase tracking-tighter" style={{ color: "var(--text-primary)" }}>
                  My Creations
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Recipes generated by AI and saved with "Save Creation"
                </p>
              </div>

              {hasCreations && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                  style={{ background: "rgba(242, 127, 13, 0.1)", border: "1px solid rgba(242, 127, 13, 0.25)", color: "var(--color-brand)" }}>
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 1a1 1 0 011 1v1.268l1.098-.634a1 1 0 011 1.732L10 5.732V7h1.268l.634-1.098a1 1 0 011.732 1L12.268 8l1.366.098a1 1 0 010 1.732L12.268 10H11v1.268l1.098.634a1 1 0 01-1 1.732L10 12.268V11H8.732l-.634 1.098a1 1 0 01-1.732-1L7.732 10H7v-.732l-1.098.634a1 1 0 01-1-1.732L6.268 8 4.902 7.902a1 1 0 010-1.732L6.268 7H7V5.732L5.902 5.098a1 1 0 011-1.732L8 3.97V2a1 1 0 011-1z" />
                  </svg>
                  {aiRecipes.length} {aiRecipes.length === 1 ? "creation" : "creations"}
                </span>
              )}
            </div>

            {hasCreations ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {aiRecipes.map((recipe, index) => (
                  <div key={recipe.idDrink} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <AiCreationCard
                      recipe={recipe}
                      index={index}
                      onRemove={handleRemoveCreation}
                      onViewRecipe={openRecipeModal}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <CreationsEmptyState />
            )}
          </section>
        )}

      </div>
    </article>
  );
}