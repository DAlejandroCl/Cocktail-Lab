import { useMemo } from "react";
import { useAppStore } from "../stores/useAppStore";
import DrinkCard from "../components/DrinkCard";

export default function IndexPage() {
  const drinks = useAppStore((state) => state.drinks);
  const hasDrinks = useMemo(() => drinks.drinks.length > 0, [drinks]);

  return (
    <div className="bg-slate-900 min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Recipes</h1>
          {hasDrinks && (
            <p className="text-slate-400">
              Found {drinks.drinks.length} {drinks.drinks.length === 1 ? 'recipe' : 'recipes'}
            </p>
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🍹</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              No recipes found
            </h2>
            <p className="text-slate-400 text-center max-w-md">
              Try searching for a different ingredient, name, or category to discover amazing cocktail recipes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}