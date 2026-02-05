import type { Drink } from "../types";
import { useAppStore } from "../stores/useAppStore";

type DrinkCardProps = {
  drink: Drink;
};

export default function DrinkCard({ drink }: DrinkCardProps) {
  const selectRecipe = useAppStore((state) => state.selectRecipe);

  const isFavorite = useAppStore((state) => state.isFavorite(drink.idDrink));

  return (
    <div className="glass-card rounded-2xl overflow-hidden group">
      <div className="relative aspect-4/5 overflow-hidden">
        <img
          src={drink.strDrinkThumb}
          alt={`Image of ${drink.strDrink}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>
      </div>

      <div className="p-4 bg-slate-900/70 backdrop-blur-sm border-t border-white/10">
        <div className="grid grid-cols-[1fr_auto] gap-3 items-start mb-3">
          <h3 className="text-lg font-bold text-white leading-tight">
            {drink.strDrink}
          </h3>

          {drink.strCategory && (
            <span className="bg-primary text-navy-deep text-[10px] font-bold px-2.5 py-1.5 rounded-md tracking-wider uppercase whitespace-nowrap shadow-lg">
              {drink.strCategory}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => selectRecipe(drink.idDrink)}
            className="flex-1 py-3 button-primary w-full md:w-auto px-10 h-12 bg-primary text-navy-deep font-bold rounded-xl shadow-lg shadow-primary/20"
            aria-label={`View recipe for ${drink.strDrink}`}
          >
            View Recipe
          </button>

          <button
            className={`favorite-button w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center shadow-md transition-all ${
              isFavorite
                ? "text-primary animate-heart-pop"
                : "text-white hover:bg-white/10"
            }`}
          >
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
          </button>
        </div>
      </div>
    </div>
  );
}
