import { http, HttpResponse } from "msw";

// ─────────────────────────────────────────────
// Inline fixtures for handlers
// ─────────────────────────────────────────────

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

  http.get(
    "https://www.thecocktaildb.com/api/json/v1/1/filter.php",
    ({ request }) => {
      const url = new URL(request.url);
      const ingredient = url.searchParams.get("i");
      const category = url.searchParams.get("c");

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

  http.get(
    "https://www.thecocktaildb.com/api/json/v1/1/random.php",
    () => {
      return HttpResponse.json({
        drinks: [DEFAULT_DRINK],
      });
    },
  ),
];
