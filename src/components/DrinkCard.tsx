import { memo, useCallback, useState } from "react";
import type { Drink } from "../types";
import { useAppStore } from "../stores/useAppStore";
import {
  selectSelectRecipe,
  selectAddFavorite,
  selectRemoveFavorite,
  selectSetNotification,
  selectIsFavorite,
} from "../stores/selectors";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

interface DrinkCardProps {
  drink: Drink;
  index?: number;
}

/* ─────────────────────────────────────────────────────────────
   HEART ICON
───────────────────────────────────────────────────────────── */

function HeartIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   DRINK CARD COMPONENT
───────────────────────────────────────────────────────────── */

function DrinkCardComponent({ drink, index = 0 }: DrinkCardProps) {
  const selectRecipe = useAppStore(selectSelectRecipe);
  const addFavorite = useAppStore(selectAddFavorite);
  const removeFavorite = useAppStore(selectRemoveFavorite);
  const setNotification = useAppStore(selectSetNotification);
  const isFavorite = useAppStore(selectIsFavorite(drink.idDrink));

  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleFavoriteClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);

      if (isFavorite) {
        removeFavorite(drink.idDrink);
        setNotification("Removed from favorites", "info");
        return;
      }

      setIsLoadingDetails(true);
      try {
        const response = await fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`,
        );
        const data = await response.json();
        if (data.drinks?.[0]) {
          addFavorite(data.drinks[0]);
          setNotification("Added to favorites", "success");
        } else {
          setNotification("Unable to load cocktail details", "error");
        }
      } catch {
        setNotification("Unable to load cocktail details", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [drink.idDrink, isFavorite, addFavorite, removeFavorite, setNotification],
  );

  const handleSelectRecipe = useCallback(() => {
    selectRecipe(drink.idDrink);
  }, [selectRecipe, drink.idDrink]);

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
        transition:
          "box-shadow 0.28s var(--ease-out-soft), transform 0.28s var(--ease-out-soft)",
        cursor: "default",
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
      aria-labelledby={`drink-title-${drink.idDrink}`}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {!imgLoaded && (
          <div
            aria-hidden="true"
            className="absolute inset-0 animate-pulse"
            style={{ background: "var(--bg-subtle)" }}
          />
        )}

        <img
          src={drink.strDrinkThumb}
          alt={drink.strDrink}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.4s ease, transform 0.7s ease",
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 40%, rgba(0,0,0,0.25) 100%)",
          }}
        />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          {drink.strCategory ? (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "var(--color-brand)",
                color: "#ffffff",
                backdropFilter: "blur(8px)",
                letterSpacing: "0.08em",
              }}
            >
              {drink.strCategory}
            </span>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isLoadingDetails}
            aria-pressed={isFavorite}
            aria-busy={isLoadingDetails}
            aria-label={
              isFavorite
                ? `Remove ${drink.strDrink} from favorites`
                : `Add ${drink.strDrink} to favorites`
            }
            className={`favorite-btn ${isFavorite ? "is-active" : ""} ${isAnimating ? "scale-110" : ""} ${isLoadingDetails ? "opacity-50 cursor-wait" : ""}`}
          >
            <HeartIcon filled={isFavorite} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="flex flex-col gap-4 p-4 flex-1"
        style={{ borderTop: "1px solid var(--border-card)" }}
      >
        <h3
          id={`drink-title-${drink.idDrink}`}
          className="text-base font-bold leading-snug text-center line-clamp-2 min-h-11"
          style={{ color: "var(--text-primary)" }}
        >
          {drink.strDrink}
        </h3>

        <button
          type="button"
          onClick={handleSelectRecipe}
          className="btn-brand w-full h-10 rounded-lg text-sm mt-auto"
        >
          View Recipe
        </button>
      </div>
    </article>
  );
}

export default memo(
  DrinkCardComponent,
  (prev, next) => prev.drink.idDrink === next.drink.idDrink,
);
