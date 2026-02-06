import { useMemo } from "react";
import { useAppStore } from "../stores/useAppStore";
import DrinkCard from "../components/DrinkCard";

export default function FavoritesPage() {
  const favorites = useAppStore((state) => state.favorites);
  const hasFavorites = useMemo(() => favorites.length > 0, [favorites]);

  return (
    <div className="relative min-h-screen">
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-12">
        <div className="flex items-end justify-between mb-10 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">
              My Favorites
            </h2>
            {hasFavorites && (
              <p className="text-slate-400 text-sm mt-1">
                {favorites.length} {favorites.length === 1 ? 'recipe' : 'recipes'} saved
              </p>
            )}
          </div>
        </div>

        {hasFavorites ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((drink, index) => (
              <div
                key={drink.idDrink}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DrinkCard drink={drink} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="glass-panel rounded-full p-8 mb-6">
              <svg 
                className="w-16 h-16 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 font-serif">
              No Favorites Yet
            </h2>
            <p className="text-slate-400 text-center max-w-md font-light mb-8">
              Start exploring recipes and save your favorites by clicking the heart icon on any cocktail card.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
