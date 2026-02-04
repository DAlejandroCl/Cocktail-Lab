import { useMemo } from "react";
import { useAppStore } from "../stores/useAppStore";
import DrinkCard from "../components/DrinkCard";

export default function IndexPage() {
  const drinks = useAppStore((state) => state.drinks);
  const searchRecipes = useAppStore((state) => state.searchRecipes);
  const hasDrinks = useMemo(() => drinks.drinks.length > 0, [drinks]);

  const handleBrowseAll = () => {
    searchRecipes({ category: "Cocktail", ingredient: "" });
  };

  return (
    <div className="relative">
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-end justify-between mb-10 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">
              {hasDrinks ? "Featured Mixes" : "Ready to Mix"}
            </h2>
            {hasDrinks && (
              <p className="text-slate-400 text-sm mt-1">
                Found {drinks.drinks.length} {drinks.drinks.length === 1 ? 'recipe' : 'recipes'}
              </p>
            )}
          </div>
          {hasDrinks && (
            <button 
              onClick={handleBrowseAll}
              className="text-primary text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
            >
              VIEW ALL 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {hasDrinks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {drinks.drinks.map((drink, index) => (
              <div
                key={drink.idDrink}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DrinkCard drink={drink} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="glass-panel rounded-full p-8 mb-6">
              <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 font-serif">
              Your Perfect Mix Awaits
            </h2>
            <p className="text-slate-400 text-center max-w-md font-light mb-8">
              Search by ingredients, explore categories, or discover something new. 
              Your next signature drink is just a search away.
            </p>
            
            <button
              onClick={handleBrowseAll}
              className="px-8 py-3 bg-primary hover:bg-orange-500 text-navy-deep font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse All Recipes
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
