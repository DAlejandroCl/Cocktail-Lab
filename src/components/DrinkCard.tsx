import type { Drink } from "../types";
import { useAppStore } from "../stores/useAppStore";

type DrinkCardProps = {
  drink: Drink;
};

export default function DrinkCard({ drink }: DrinkCardProps) {
  const selectRecipe = useAppStore((state) => state.selectRecipe);

  return (
    <div className="group bg-white shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden h-56 bg-slate-100">
        <img
          src={drink.strDrinkThumb}
          alt={`Image of ${drink.strDrink}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <h2 className="text-lg text-center text-slate-800 mb-3 truncate group-hover:text-orange-500 transition-colors duration-200">
          {drink.strDrink}
        </h2>

        <button
          onClick={() => selectRecipe(drink.idDrink)}
          className="w-full rounded-lg bg-orange-400 hover:bg-orange-500 text-white py-2.5 px-5 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
          aria-label={`View recipe for ${drink.strDrink}`}
        >
          View Recipe
        </button>
      </div>
    </div>
  );
}