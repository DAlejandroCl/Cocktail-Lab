import { http, HttpResponse } from "msw";

// ─────────────────────────────────────────────
// Inline fixtures for handlers
// ─────────────────────────────────────────────
// Kept simple and static here. For tests that need specific data,
// override locally with server.use() inside the test.

const DEFAULT_DRINK = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
};

const DEFAULT_RECIPE_DETAIL = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strInstructions: "Mix ingredients. Serve cold.",
  strCategory: "Cocktail",
  strIngredient1: "White rum",
  strIngredient2: "Lime juice",
  strIngredient3: null,
  strIngredient4: null,
  strIngredient5: null,
  strIngredient6: null,
  strIngredient7: null,
  strIngredient8: null,
  strIngredient9: null,
  strIngredient10: null,
  strIngredient11: null,
  strIngredient12: null,
  strIngredient13: null,
  strIngredient14: null,
  strIngredient15: null,
  strMeasure1: "50ml",
  strMeasure2: "25ml",
  strMeasure3: null,
  strMeasure4: null,
  strMeasure5: null,
  strMeasure6: null,
  strMeasure7: null,
  strMeasure8: null,
  strMeasure9: null,
  strMeasure10: null,
  strMeasure11: null,
  strMeasure12: null,
  strMeasure13: null,
  strMeasure14: null,
  strMeasure15: null,
};

// ─────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────

export const handlers = [

  // GET /filter.php — search by category or ingredient
  // Used by: searchByCategory, searchByIngredient
  http.get(
    "https://www.thecocktaildb.com/api/json/v1/1/filter.php",
    ({ request }) => {
      const url = new URL(request.url);
      const ingredient = url.searchParams.get("i");
      const category = url.searchParams.get("c");

      // Special case: ingredient "empty" simulates an API response with no results
      if (ingredient === "empty") {
        return HttpResponse.json({ drinks: null });
      }

      return HttpResponse.json({
        drinks: [
          {
            ...DEFAULT_DRINK,
            strCategory: category ?? "Cocktail",
          },
        ],
      });
    },
  ),

  // GET /search.php — search by name
  // Used by: searchByName
  http.get(
    "https://www.thecocktaildb.com/api/json/v1/1/search.php",
    ({ request }) => {
      const url = new URL(request.url);
      const name = url.searchParams.get("s");

      if (!name || name === "empty") {
        return HttpResponse.json({ drinks: null });
      }

      return HttpResponse.json({
        drinks: [DEFAULT_DRINK],
      });
    },
  ),

  // GET /lookup.php — full recipe detail by drink ID
  // Used by: getRecipeById (selectRecipe, addFavorite in DrinkCard)
  http.get(
    "https://www.thecocktaildb.com/api/json/v1/1/lookup.php",
    ({ request }) => {
      const url = new URL(request.url);
      const id = url.searchParams.get("i");

      if (!id) {
        return HttpResponse.json({ drinks: null }, { status: 400 });
      }

      return HttpResponse.json({
        drinks: [{ ...DEFAULT_RECIPE_DETAIL, idDrink: id }],
      });
    },
  ),

  // GET /list.php?c=list — category list
  // Used by: getCategories
  http.get(
    "https://www.thecocktaildb.com/api/json/v1/1/list.php",
    () => {
      return HttpResponse.json({
        drinks: [
          { strCategory: "Cocktail" },
          { strCategory: "Shot" },
          { strCategory: "Beer" },
          { strCategory: "Shake" },
        ],
      });
    },
  ),

  // GET /random.php — random cocktail
  // Used by: getRandomRecipes (Browse All on IndexPage)
  http.get(
    "https://www.thecocktaildb.com/api/json/v1/1/random.php",
    () => {
      return HttpResponse.json({
        drinks: [DEFAULT_DRINK],
      });
    },
  ),
];
