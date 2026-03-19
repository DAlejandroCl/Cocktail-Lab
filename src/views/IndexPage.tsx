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
  visibleCount,
  isLoading,
  hasDrinks,
}: {
  count: number;
  visibleCount: number;
  isLoading: boolean;
  hasDrinks: boolean;
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
          {visibleCount < count
            ? `Showing ${visibleCount} of ${count} recipes`
            : `${count} ${count === 1 ? "recipe" : "recipes"} found`}
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
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCROLL TO TOP BUTTON
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

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll back to top"
      className={`scroll-to-top${visible ? " scroll-to-top--visible" : ""}`}
    >
      <span className="flex flex-col items-center" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            className={`scroll-to-top__chevron scroll-to-top__chevron--${i}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        ))}
      </span>
      <span className="scroll-to-top__label">Top</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   DRINK GRID
   - Always paginates via infinite scroll regardless of search type
   - Spinner shown below grid while next batch is pending
   - gridKey from parent forces remount on new dataset / sort change
───────────────────────────────────────────────────────────── */

const INITIAL_VISIBLE = 20;
const LOAD_MORE_STEP  = 20;

interface DrinkGridProps {
  drinks: ReturnType<typeof sortDrinks>;
  gridKey: string;
  onVisibleCountChange: (count: number) => void;
}

function DrinkGrid({ drinks: sortedDrinks, onVisibleCountChange }: DrinkGridProps) {
  const [visibleCount,  setVisibleCount]  = useState(INITIAL_VISIBLE);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef   = useRef(false);

  const hasMore       = visibleCount < sortedDrinks.length;
  const skeletonCount = Math.min(LOAD_MORE_STEP, sortedDrinks.length - visibleCount);

  const visibleDrinks = useMemo(
    () => sortedDrinks.slice(0, visibleCount),
    [sortedDrinks, visibleCount],
  );

  useEffect(() => {
    onVisibleCountChange(Math.min(visibleCount, sortedDrinks.length));
  }, [visibleCount, sortedDrinks.length, onVisibleCountChange]);

  useEffect(() => {
    if (!hasMore) return;

    const handleScroll = () => {
      if (loadingRef.current) return;
      if (!containerRef.current) return;

      const { bottom } = containerRef.current.getBoundingClientRect();
      const threshold  = window.innerHeight + 300;

      if (bottom <= threshold) {
        loadingRef.current = true;
        setShowSkeletons(true);

        // One rAF to let React paint the skeletons, then load the next batch
        requestAnimationFrame(() => {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, sortedDrinks.length));
          setShowSkeletons(false);
          loadingRef.current = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, sortedDrinks.length]);

  return (
    <div ref={containerRef}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
        {visibleDrinks.map((drink, index) => (
          <DrinkCard key={drink.idDrink} drink={drink} index={index} />
        ))}

        {showSkeletons && Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonDrinkCard key={`sk-${i}`} />
        ))}
      </div>
    </div>
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

  const resultsRef = useRef<HTMLElement>(null);

  const [sortOption,   setSortOption]   = useState<SortOption>("default");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const hasDrinks = useMemo(
    () => drinks.drinks.length > 0,
    [drinks.drinks],
  );

  const sortedDrinks = useMemo(
    () => sortDrinks(drinks.drinks, sortOption),
    [drinks.drinks, sortOption],
  );

  // gridKey forces DrinkGrid remount (resetting visibleCount) on new data or sort
  const gridKey = `${drinks.drinks.map((d) => d.idDrink).join(",")}-${sortOption}`;

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (hasSearched && !isLoading && drinks.drinks.length === 0) {
      setNotification("No cocktails found with those filters", "info");
    }
  }, [drinks.drinks, isLoading, hasSearched, setNotification]);

  useEffect(() => {
    if (hasSearched && !isLoading && drinks.drinks.length > 0) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isLoading, hasSearched, drinks.drinks.length]);

  const handleBrowseAll = () => {
    searchRecipes({ category: "", ingredient: "" });
  };

  return (
    <div className="page-gradient-bg">
      <HeroSection
        categories={categories}
        isLoading={isLoading}
        onSubmit={searchRecipes}
        resultsRef={resultsRef}
      />

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      />

      <section
        ref={resultsRef}
        className="max-w-w-full px-4 sm:px-6 lg:px-8 py-10 pb-24"
        aria-label="Search results"
        style={{ background: "var(--grid-bg)" }}
      >
        <div className="max-w-7xl mx-auto">
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 pb-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <ResultsHeader
            count={drinks.drinks.length}
            visibleCount={visibleCount}
            isLoading={isLoading}
            hasDrinks={hasDrinks}
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
            {Array.from({ length: 20 }).map((_, i) => (
              <SkeletonDrinkCard key={i} />
            ))}
          </div>
        ) : hasDrinks ? (
          <DrinkGrid
            key={gridKey}
            gridKey={gridKey}
            drinks={sortedDrinks}
            onVisibleCountChange={setVisibleCount}
          />
        ) : (
          <EmptyState onBrowseAll={handleBrowseAll} />
        )}
        </div>
      </section>

      <ScrollToTop triggerRef={resultsRef} />
    </div>
  );
}
