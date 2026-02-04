import type { Drink } from "../types";
import { useAppStore } from "../stores/useAppStore";

type DrinkCardProps = {
  drink: Drink;
};

export default function DrinkCard({ drink }: DrinkCardProps) {
  const selectRecipe = useAppStore((state) => state.selectRecipe);

  return (
    <div className="glass-card rounded-2xl overflow-hidden group">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={drink.strDrinkThumb}
          alt={`Image of ${drink.strDrink}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
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
            className="flex-1 py-3 rounded-lg bg-primary hover:bg-orange-500 text-navy-deep text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md"
            aria-label={`View recipe for ${drink.strDrink}`}
          >
            View Recipe
          </button>
          
          <button 
            className="w-12 h-12 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/20 flex items-center justify-center text-white hover:text-primary transition-all active:scale-95 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement favorite functionality
              
            }}
            aria-label="Add to favorites"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
