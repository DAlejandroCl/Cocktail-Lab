import { useMemo } from "react";
import { useAppStore } from "../stores/useAppStore";
import DrinkCard from "../components/DrinkCard";

export default function IndexPage() {  
  const recipes = useAppStore((state) => state.recipes);
  const hasRecipes = useMemo(() => recipes.length > 0, [recipes]);

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Recipes</h1>

      {hasRecipes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 my-10 gap-10">
          {recipes.map((drink) => (
            <DrinkCard key={drink.idDrink} drink={drink} />
          ))}
        </div>
      ) : (
        <p className="text-center text-xl">No drinks available</p>
      )}
    </>
  );
}