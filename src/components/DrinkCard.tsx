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

type DrinkCardProps = {
  drink: Drink;
};

function DrinkCardComponent({ drink }: DrinkCardProps) {
  const selectRecipe = useAppStore(selectSelectRecipe);
  const addFavorite = useAppStore(selectAddFavorite);
  const removeFavorite = useAppStore(selectRemoveFavorite);
  const setNotification = useAppStore(selectSetNotification);
  const isFavorite = useAppStore(selectIsFavorite(drink.idDrink));

  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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
      } catch (error) {
        console.error(error);
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
      className="glass-card rounded-2xl overflow-hidden group relative"
      aria-labelledby={`drink-title-${drink.idDrink}`}
    >
      <div className="relative aspect-4/5 overflow-hidden">
        <img
          src={drink.strDrinkThumb}
          alt={drink.strDrink}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/40"></div>

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          {drink.strCategory && (
            <span
              id={`drink-category-${drink.idDrink}`}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xl backdrop-blur-md bg-primary/95 text-navy-deep border border-primary/30"
            >
              {drink.strCategory}
            </span>
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
            className={`favorite-button w-10 h-10 rounded-lg border border-white/30 flex items-center justify-center shadow-lg backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              isFavorite ? "is-active" : "bg-black/40"
            } ${isAnimating ? "animate-heart-pop" : ""} ${
              isLoadingDetails ? "opacity-50 cursor-wait" : ""
            }`}
          >
            <svg
              aria-hidden="true"
              className="w-4 h-4 transition-all duration-300"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative p-5 backdrop-blur-xl bg-white/10 border-t border-white/20">
        <h3
          id={`drink-title-${drink.idDrink}`}
          className="text-lg font-semibold text-white leading-tight mb-4 line-clamp-2 min-h-14 text-center"
        >
          {drink.strDrink}
        </h3>

        <button
          type="button"
          onClick={handleSelectRecipe}
          aria-describedby={
            drink.strCategory ? `drink-category-${drink.idDrink}` : undefined
          }
          className="button-primary w-full h-11 bg-primary text-navy-deep font-bold rounded-xl shadow-lg shadow-primary/20 text-sm tracking-wide hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all duration-300 flex items-center justify-center gap-2"
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
