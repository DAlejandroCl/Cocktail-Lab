import { http, HttpResponse } from "msw";

// ─────────────────────────────────────────────
// Fixtures — drinks per category
//
// Each category has its own set of drinks with
// unique idDrinks so getBrowseRecipes can
// deduplicate correctly across categories.
// ─────────────────────────────────────────────

export const DRINKS_BY_CATEGORY: Record<string, Array<{ idDrink: string; strDrink: string; strDrinkThumb: string }>> = {
  Cocktail: [
    { idDrink: "101", strDrink: "Mojito",          strDrinkThumb: "https://image.com/mojito.jpg"    },
    { idDrink: "102", strDrink: "Negroni",          strDrinkThumb: "https://image.com/negroni.jpg"   },
    { idDrink: "103", strDrink: "Margarita",        strDrinkThumb: "https://image.com/margarita.jpg" },
  ],
  Shot: [
    { idDrink: "201", strDrink: "B-52",             strDrinkThumb: "https://image.com/b52.jpg"       },
    { idDrink: "202", strDrink: "Tequila Shot",     strDrinkThumb: "https://image.com/tequila.jpg"   },
    { idDrink: "203", strDrink: "Kamikaze",         strDrinkThumb: "https://image.com/kamikaze.jpg"  },
  ],
  Beer: [
    { idDrink: "301", strDrink: "Black and Tan",    strDrinkThumb: "https://image.com/blacktan.jpg"  },
    { idDrink: "302", strDrink: "Snakebite",        strDrinkThumb: "https://image.com/snakebite.jpg" },
  ],
  Shake: [
    { idDrink: "401", strDrink: "Vanilla Shake",   strDrinkThumb: "https://image.com/vanilla.jpg"   },
    { idDrink: "402", strDrink: "Chocolate Shake", strDrinkThumb: "https://image.com/chocolate.jpg" },
  ],
};

// Total unique drinks across all categories — used in test assertions
export const TOTAL_BROWSE_DRINKS = Object.values(DRINKS_BY_CATEGORY).flat().length;

// Default single drink for ingredient/name search handlers
const DEFAULT_DRINK = DRINKS_BY_CATEGORY.Cocktail[0];

const DEFAULT_RECIPE_DETAIL = {
  idDrink: "101",
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

export const DEFAULT_AI_RECIPE_RESPONSE = {
  recipe: {
    strDrink: "Midnight Velvet",
    strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/tquyyt1451299548.jpg",
    strCategory: "Cocktail",
    strInstructions:
      "Combine all ingredients in a shaker with ice. Shake for 15 seconds. Double-strain into a chilled glass.",
    ingredients: [
      { name: "Vodka",        measure: "2 oz"   },
      { name: "Lime juice",   measure: "3/4 oz" },
      { name: "Simple syrup", measure: "1/2 oz" },
      { name: "Egg white",    measure: "1"      },
    ],
  },
};

// ─────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────

export const handlers = [

  // ── CocktailDB — filter (ingredient / category) ───────────────────────
  //
  // When called with ?c= (getBrowseRecipes): return the category-specific
  // drinks from DRINKS_BY_CATEGORY so tests can assert on realistic counts
  // and deduplication. Falls back to DEFAULT_DRINK for unknown categories.
  //
  // When called with ?i= (getRecipes by ingredient): return DEFAULT_DRINK
  // or empty for the "empty" sentinel value.

  http.get("https://www.thecocktaildb.com/api/json/v1/1/filter.php", ({ request }) => {
    const url        = new URL(request.url);
    const ingredient = url.searchParams.get("i");
    const category   = url.searchParams.get("c");

    if (ingredient === "empty") {
      return HttpResponse.json({ drinks: null });
    }

    if (ingredient) {
      return HttpResponse.json({ drinks: [DEFAULT_DRINK] });
    }

    if (category) {
      const drinks = DRINKS_BY_CATEGORY[category] ?? [
        { ...DEFAULT_DRINK, strCategory: category },
      ];
      return HttpResponse.json({ drinks });
    }

    return HttpResponse.json({ drinks: [DEFAULT_DRINK] });
  }),

  // ── CocktailDB — search (by name) ────────────────────────────────────

  http.get("https://www.thecocktaildb.com/api/json/v1/1/search.php", ({ request }) => {
    const url  = new URL(request.url);
    const name = url.searchParams.get("s");

    if (!name || name === "empty") {
      return HttpResponse.json({ drinks: null });
    }

    return HttpResponse.json({ drinks: [DEFAULT_DRINK] });
  }),

  // ── CocktailDB — lookup by id ─────────────────────────────────────────

  http.get("https://www.thecocktaildb.com/api/json/v1/1/lookup.php", ({ request }) => {
    const url = new URL(request.url);
    const id  = url.searchParams.get("i");

    if (!id) {
      return HttpResponse.json({ drinks: null }, { status: 400 });
    }

    return HttpResponse.json({ drinks: [{ ...DEFAULT_RECIPE_DETAIL, idDrink: id }] });
  }),

  // ── CocktailDB — category list ────────────────────────────────────────

  http.get("https://www.thecocktaildb.com/api/json/v1/1/list.php", () =>
    HttpResponse.json({
      drinks: Object.keys(DRINKS_BY_CATEGORY).map((strCategory) => ({ strCategory })),
    }),
  ),

  // ── AI Recipe Generator ───────────────────────────────────────────────

  http.post("/api/ai/generate-recipe", async ({ request }) => {
    let body: { ingredients?: unknown };

    try {
      body = await request.json() as { ingredients?: unknown };
    } catch {
      return HttpResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { ingredients } = body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return HttpResponse.json(
        { error: "At least one ingredient is required." },
        { status: 422 },
      );
    }

    return HttpResponse.json(DEFAULT_AI_RECIPE_RESPONSE);
  }),
];
