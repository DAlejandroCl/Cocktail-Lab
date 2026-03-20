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
} from "../stores/selectors";

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */

function FavoritesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <svg
          className="w-10 h-10"
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </div>

      <h2
        className="text-2xl font-serif font-bold mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        No Favorites Yet
      </h2>

      <p
        className="text-sm font-normal max-w-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        Start exploring recipes and save your favorites by clicking the heart
        icon on any cocktail card.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

export default function FavoritesPage() {
  const favorites     = useAppStore(selectFavoritesMap);
  const favoriteOrder = useAppStore(selectFavoriteOrder);
  const setNotification = useAppStore(selectSetNotification);

  const [sortOption, setSortOption] = useState<SortOptionFavorites>("recently-added");

  const favoritesArray = useMemo(
    () => Object.values(favorites),
    [favorites],
  );

  const sortedFavorites = useMemo(
    () => sortFavorites(favoritesArray, sortOption, favoriteOrder),
    [favoritesArray, sortOption, favoriteOrder],
  );

  const hasFavorites = favoritesArray.length > 0;

  useEffect(() => {
    if (!hasFavorites) {
      setNotification("Your favorites list is empty", "info");
    }
  }, [hasFavorites, setNotification]);

  return (
    <main className="relative min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">

        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div>
            <h2
              className="text-xl font-bold uppercase tracking-tighter"
              style={{ color: "var(--text-primary)" }}
            >
              My Favorites
            </h2>
            {hasFavorites && (
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {favoritesArray.length}{" "}
                {favoritesArray.length === 1 ? "recipe" : "recipes"} saved
              </p>
            )}
          </div>

          {hasFavorites && (
            <SortSelector
              options={SORT_OPTIONS_FAVORITES}
              value={sortOption}
              onChange={setSortOption}
            />
          )}
        </div>

        {hasFavorites ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {sortedFavorites.map((drink, index) => (
              <div
                key={drink.idDrink}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DrinkCard drink={drink} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <FavoritesEmptyState />
        )}
      </div>
    </main>
  );
}
