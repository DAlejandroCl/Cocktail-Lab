import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { useAppStore } from "../stores/useAppStore";
import DrinkCard from "../components/DrinkCard";
import SkeletonDrinkCard from "../components/SkeletonDrinkCard";
import { Listbox, Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import {
  selectDrinks,
  selectSearchRecipes,
  selectSetNotification,
  selectIsLoading,
  selectHasSearched,
} from "../stores/selectors";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

interface SearchFilters {
  ingredient: string;
  category: string;
}

/* ─────────────────────────────────────────────────────────────
   HERO SECTION — Lives in the document flow, not the header.
   This ensures the sticky navbar never traps the hero and that
   cards scroll naturally below the search form.
───────────────────────────────────────────────────────────── */

interface HeroSectionProps {
  categories: string[];
  isLoading: boolean;
  onSubmit: (filters: SearchFilters) => void;
}

function HeroSection({ categories, isLoading, onSubmit }: HeroSectionProps) {
  const ingredientRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    ingredient: "",
    category: "",
  });
  const setNotification = useAppStore(selectSetNotification);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!filters.ingredient && !filters.category) {
      setNotification(
        "Please enter an ingredient or select a category.",
        "error",
      );
      ingredientRef.current?.focus();
      return;
    }
    onSubmit(filters);
  };

  return (
    <section
      className="relative text-center px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20"
      aria-label="Search cocktails"
    >
      {/* Ambient glow — decorative */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          style={{
            position: "absolute",
            top: "0%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(700px, 100vw)",
            height: "320px",
            background:
              "radial-gradient(ellipse, rgba(242, 127, 13, 0.07) 0%, transparent 70%)",
            borderRadius: "9999px",
          }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto" style={{ zIndex: 1 }}>
        {/* Eyebrow */}
        <p
          className="text-xs font-bold uppercase tracking-widest mb-5 text-brand"
          style={{ letterSpacing: "0.15em" }}
        >
          500+ Premium Recipes
        </p>

        {/* Heading */}
        <h1
          className="font-serif leading-tight mb-5"
          style={{
            fontSize: "clamp(2.1rem, 5.5vw, 4rem)",
            color: "var(--text-primary)",
          }}
        >
          Find Your{" "}
          <em className="not-italic text-brand" style={{ fontStyle: "italic" }}>
            Perfect Mix
          </em>
        </h1>

        {/* Subtext */}
        <p
          className="text-sm sm:text-base font-normal mb-10 max-w-md mx-auto leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          From timeless classics to bold new creations — discover your next
          signature drink.
        </p>

        {/* Search form */}
        <form onSubmit={handleSubmit} role="search" aria-busy={isLoading}>
          <div
            className="glass-panel rounded-2xl p-1.5 flex flex-col sm:flex-row items-stretch gap-1.5"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}
          >
            {/* Text input */}
            <div className="flex-1 relative flex items-center">
              <MagnifyingGlassIcon
                className="absolute left-4 w-4 h-4 pointer-events-none shrink-0"
                style={{ color: "var(--text-muted)" }}
                aria-hidden="true"
              />
              <label htmlFor="ingredient" className="sr-only">
                Search cocktails by ingredient
              </label>
              <input
                ref={ingredientRef}
                id="ingredient"
                name="ingredient"
                type="text"
                value={filters.ingredient}
                onChange={handleChange}
                placeholder="Search by ingredient (e.g. Gin, Rum, Lime)"
                className="search-input pl-11 pr-4 h-12 rounded-xl"
              />
            </div>

            {/* Divider */}
            <div
              className="hidden sm:block w-px self-stretch my-1.5"
              style={{ background: "var(--border-subtle)" }}
              aria-hidden="true"
            />

            {/* Category dropdown */}
            <div className="relative sm:w-48">
              <Listbox
                value={filters.category}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value }))
                }
              >
                <Listbox.Button
                  className="w-full h-12 flex items-center justify-between px-4 rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  style={{
                    background: "transparent",
                    color: filters.category
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  }}
                >
                  <span className="text-sm truncate">
                    {filters.category || "All Categories"}
                  </span>
                  <ChevronDownIcon
                    className="w-4 h-4 ml-2 shrink-0"
                    style={{ color: "var(--text-muted)" }}
                    aria-hidden="true"
                  />
                </Listbox.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-150"
                  enterFrom="opacity-0 translate-y-2"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options
                    className="absolute mt-2 w-full rounded-xl overflow-hidden z-50 focus:outline-none custom-scrollbar"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                      maxHeight: "16rem",
                      overflowY: "auto",
                    }}
                  >
                    {/* "All Categories" option */}
                    <Listbox.Option value="" as={Fragment}>
                      {({ active }) => (
                        <li
                          className="px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors duration-100"
                          style={{
                            background: active
                              ? "var(--color-brand)"
                              : "transparent",
                            color: active
                              ? "#ffffff"
                              : "var(--text-secondary)",
                          }}
                        >
                          All Categories
                        </li>
                      )}
                    </Listbox.Option>

                    {/* Dynamic category options */}
                    {categories.map((cat) => (
                      <Listbox.Option key={cat} value={cat} as={Fragment}>
                        {({ active }) => (
                          <li
                            className="px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors duration-100"
                            style={{
                              background: active
                                ? "var(--color-brand)"
                                : "transparent",
                              color: active
                                ? "#ffffff"
                                : "var(--text-primary)",
                            }}
                          >
                            {cat}
                          </li>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </Listbox>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-brand h-12 px-6 sm:px-7 rounded-xl shrink-0"
            >
              <SparklesIcon className="w-4 h-4" aria-hidden="true" />
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

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
    <div
      className="flex items-end justify-between mb-7 pb-5"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
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
      </div>
      {hasDrinks && !isLoading && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors duration-200"
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
   PAGE COMPONENT
───────────────────────────────────────────────────────────── */

export default function IndexPage() {
  const drinks          = useAppStore(selectDrinks);
  const searchRecipes   = useAppStore(selectSearchRecipes);
  const setNotification = useAppStore(selectSetNotification);
  const isLoading       = useAppStore(selectIsLoading);
  const hasSearched     = useAppStore(selectHasSearched);
  const categories      = useAppStore((s) => s.categories);
  const fetchCategories = useAppStore((s) => s.fetchCategories);

  const hasDrinks = useMemo(
    () => drinks.drinks.length > 0,
    [drinks.drinks],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (hasSearched && !isLoading && drinks.drinks.length === 0) {
      setNotification("No cocktails found with those filters", "info");
    }
  }, [drinks.drinks, isLoading, hasSearched, setNotification]);

  const handleBrowseAll = () => {
    searchRecipes({ category: "", ingredient: "" });
  };

  return (
    <div style={{ background: "var(--bg-base)" }}>
      {/* Hero + search — normal document flow, scrolls with page */}
      <HeroSection
        categories={categories}
        isLoading={isLoading}
        onSubmit={searchRecipes}
      />

      {/* Visual separator */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      />

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        <ResultsHeader
          count={drinks.drinks.length}
          isLoading={isLoading}
          hasDrinks={hasDrinks}
          onViewAll={handleBrowseAll}
        />

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonDrinkCard key={i} />
            ))}
          </div>
        ) : hasDrinks ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
            {drinks.drinks.map((drink, index) => (
              <DrinkCard key={drink.idDrink} drink={drink} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState onBrowseAll={handleBrowseAll} />
        )}
      </section>
    </div>
  );
}
