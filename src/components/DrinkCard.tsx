import type { Drink } from "../types";
import { useAppStore } from "../stores/useAppStore";
import { useState } from "react";

type DrinkCardProps = {
  drink: Drink;
};

export default function DrinkCard({ drink }: DrinkCardProps) {
  const selectRecipe = useAppStore((state) => state.selectRecipe);
  const isFavorite = useAppStore((state) => state.isFavorite(drink.idDrink));
  const addFavorite = useAppStore((state) => state.addFavorite);
  const removeFavorite = useAppStore((state) => state.removeFavorite);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);

    if (isFavorite) {
      removeFavorite(drink.idDrink);
    } else {
      setIsLoadingDetails(true);
      
      try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`);
        const data = await response.json();
        
        if (data.drinks && data.drinks[0]) {
          const fullRecipe = data.drinks[0];
          addFavorite(fullRecipe);
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden group relative">
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
           style={{ 
             background: 'radial-gradient(circle at 50% 0%, rgba(251, 146, 60, 0.15), transparent 70%)'
           }}
      />
      
      <div className="relative aspect-4/5 overflow-hidden">
        <img
          src={drink.strDrinkThumb}
          alt={`Image of ${drink.strDrink}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {drink.strCategory && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xl backdrop-blur-md bg-primary/90 text-navy-deep border border-primary/20">
              {drink.strCategory}
            </span>
          </div>
        )}
      </div>

      <div className="relative p-5 bg-linear-to-b from-white/8 to-white/3 backdrop-blur-xl border-t border-white/10">
        <h3 className="text-lg font-bold text-white leading-tight mb-4 line-clamp-2 min-h-14 group-hover:text-primary transition-colors duration-300">
          {drink.strDrink}
        </h3>

        <div className="flex gap-2.5">
          <button
            onClick={() => selectRecipe(drink.idDrink)}
            className="button-primary flex-1 h-11 bg-primary text-navy-deep font-bold rounded-xl shadow-lg shadow-primary/20 text-sm tracking-wide"
            aria-label={`View recipe for ${drink.strDrink}`}
          >
            View Recipe
          </button>

          <button
            onClick={handleFavoriteClick}
            disabled={isLoadingDetails}
            className={`favorite-button w-11 h-11 rounded-xl border border-white/20 flex items-center justify-center shadow-md ${
              isFavorite ? "is-active" : ""
            } ${isAnimating ? "animate-heart-pop" : ""} ${isLoadingDetails ? "opacity-50 cursor-wait" : ""}`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isLoadingDetails ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5 transition-all duration-300"
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
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
