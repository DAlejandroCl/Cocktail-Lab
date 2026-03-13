import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import DrinkCard from "../components/DrinkCard";
import SkeletonDrinkCard from "../components/SkeletonDrinkCard";
import HeroSection from "../components/HeroSection";
import SortSelector from "../components/SortSelector";
import {
  sortDrinks,
  SORT_OPTIONS,
  type SortOption,
} from "../utils/sortRecipes";
import {
  selectDrinks,
  selectSearchRecipes,
  selectSetNotification,
  selectIsLoading,
  selectHasSearched,
} from "../stores/selectors";

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */

function EmptyState({ onBrowseAll }: { onBrowseAll: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-7"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <svg
          className="w-9 h-9"
          style={{ color: "var(--color-brand)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h2
        className="text-xl font-serif font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Your Perfect Mix Awaits
      </h2>
      <p
        className="text-sm max-w-sm leading-relaxed mb-8"
        style={{ color: "var(--text-secondary)" }}
      >
        Search by ingredients, explore categories, or browse everything we have.
      </p>
      <button onClick={onBrowseAll} className="btn-brand px-7 py-3 rounded-xl">
        Browse All Recipes
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RESULTS HEADER
───────────────────────────────────────────────────────────── */

function ResultsHeader({
  count,
  isLoading,
  hasDrinks,
  onViewAll,
}: {
  count: number;
  isLoading: boolean;
  hasDrinks: boolean;
  onViewAll: () => void;
}) {
  return (
    <div>
      <h2
        className="text-base font-bold uppercase tracking-tighter"
        style={{ color: "var(--text-primary)" }}
      >
        {hasDrinks ? "Results" : "Featured Mixes"}
      </h2>
      {hasDrinks && !isLoading && (
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {count} {count === 1 ? "recipe" : "recipes"} found
        </p>
      )}
      {isLoading && (
        <p
          className="text-xs mt-0.5 animate-fade-in"
          style={{ color: "var(--text-muted)" }}
        >
          Mixing the perfect drinks…
        </p>
      )}
      {hasDrinks && !isLoading && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors duration-200 mt-1"
          style={{ color: "var(--color-brand)", letterSpacing: "0.1em" }}
        >
          View All
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCROLL TO TOP BUTTON
   Appears once the results section enters the viewport.
   Uses IntersectionObserver — no scroll event listeners.
───────────────────────────────────────────────────────────── */

function ScrollToTop({ triggerRef }: { triggerRef: React.RefObject<HTMLElement | null> }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerRef]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll back to top"
      className={`scroll-to-top${visible ? " scroll-to-top--visible" : ""}`}
    >
      <span className="flex flex-col items-center" aria-hidden="true">
        {[2, 1, 0].map((i) => (
          <svg
            key={i}
            className="w-5 h-5 -mb-1"
            style={{ opacity: 0.3 + i * 0.3 }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        ))}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE COMPONENT — Orchestration only
───────────────────────────────────────────────────────────── */

export default function IndexPage() {
  const drinks          = useAppStore(selectDrinks);
  const searchRecipes   = useAppStore(selectSearchRecipes);
  const setNotification = useAppStore(selectSetNotification);
  const isLoading       = useAppStore(selectIsLoading);
  const hasSearched     = useAppStore(selectHasSearched);
  const categories      = useAppStore((s) => s.categories);
  const fetchCategories = useAppStore((s) => s.fetchCategories);

  // Ref passed to HeroSection so the scroll arrow can target this section
  const resultsRef = useRef<HTMLElement>(null);

  const [sortOption, setSortOption] = useState<SortOption>("default");

  const hasDrinks = useMemo(
    () => drinks.drinks.length > 0,
    [drinks.drinks],
  );

  const sortedDrinks = useMemo(
    () => sortDrinks(drinks.drinks, sortOption),
    [drinks.drinks, sortOption],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (hasSearched && !isLoading && drinks.drinks.length === 0) {
      setNotification("No cocktails found with those filters", "info");
    }
  }, [drinks.drinks, isLoading, hasSearched, setNotification]);

  // Scroll to results only when a search completes successfully with results
  useEffect(() => {
    if (hasSearched && !isLoading && drinks.drinks.length > 0) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isLoading, hasSearched, drinks.drinks.length]);

  const handleBrowseAll = () => {
    searchRecipes({ category: "", ingredient: "" });
  };

  return (
    <div style={{ background: "var(--bg-base)" }}>
      {/* Hero — full viewport height, contains SearchForm */}
      <HeroSection
        categories={categories}
        isLoading={isLoading}
        onSubmit={searchRecipes}
        resultsRef={resultsRef}
      />

      {/* Visual separator */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      />

      {/* Results section — scroll target for the hero arrow */}
      <section
        ref={resultsRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24"
        aria-label="Search results"
      >
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 pb-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <ResultsHeader
            count={drinks.drinks.length}
            isLoading={isLoading}
            hasDrinks={hasDrinks}
            onViewAll={handleBrowseAll}
          />
          {hasDrinks && !isLoading && (
            <SortSelector
              options={SORT_OPTIONS}
              value={sortOption}
              onChange={setSortOption}
            />
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonDrinkCard key={i} />
            ))}
          </div>
        ) : hasDrinks ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
            {sortedDrinks.map((drink, index) => (
              <DrinkCard key={drink.idDrink} drink={drink} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState onBrowseAll={handleBrowseAll} />
        )}
      </section>

      {/* Scroll-to-top — fixed bottom-right, appears when results are visible */}
      <ScrollToTop triggerRef={resultsRef} />
    </div>
  );
}
