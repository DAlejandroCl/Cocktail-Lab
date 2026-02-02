import type { Drink } from "../types";

type DrinkCardProps = {
  drink: Drink;
};

export default function DrinkCard({ drink }: DrinkCardProps) {
  return (
    <div className="border shadow-lg rounded-lg overflow-hidden">
      <div className="">
        <img
          src={drink.strDrinkThumb}
          alt={`Image of ${drink.strDrink}`}
          className="w-full h-auto"
        />
      </div>
      <div className="p-4">
        <h2 className="text-2xl truncate font-black mb-3">{drink.strDrink}</h2>
        <div className="flex justify-center">
          <button className="w-80 rounded-lg bg-orange-400 text-white py-3 px-6 font-medium transition-all duration-200 hover:scale-[1.02]">
            View Recipe
          </button>
        </div>
      </div>
    </div>
  );
}