import { test as base, type Page } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { RecipeModal } from "../pages/RecipeModal";
import { AIGeneratorPage } from "../pages/AIGeneratorPage";

// ─────────────────────────────────────────────
// Inline API fixture data
// ─────────────────────────────────────────────

export const DRINK = {
  idDrink:       "1",
  strDrink:      "Mojito",
  strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/mojito.jpg",
  strCategory:   "Cocktail",
};

export const DRINK_2 = {
  idDrink:       "2",
  strDrink:      "Daiquiri",
  strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/daiquiri.jpg",
  strCategory:   "Cocktail",
};

export const RECIPE_DETAIL = {
  idDrink:          "1",
  strDrink:         "Mojito",
  strDrinkThumb:    "https://www.thecocktaildb.com/images/media/drink/mojito.jpg",
  strInstructions:  "Mix ingredients. Serve cold.",
  strCategory:      "Cocktail",
  strAlcoholic:     "Alcoholic",
  strGlass:         "Highball glass",
  strIngredient1:   "White rum",
  strIngredient2:   "Lime juice",
  strIngredient3:   null,
  strIngredient4:   null,
  strIngredient5:   null,
  strIngredient6:   null,
  strIngredient7:   null,
  strIngredient8:   null,
  strIngredient9:   null,
  strIngredient10:  null,
  strIngredient11:  null,
  strIngredient12:  null,
  strIngredient13:  null,
  strIngredient14:  null,
  strIngredient15:  null,
  strMeasure1:      "50ml",
  strMeasure2:      "25ml",
  strMeasure3:      null,
  strMeasure4:      null,
  strMeasure5:      null,
  strMeasure6:      null,
  strMeasure7:      null,
  strMeasure8:      null,
  strMeasure9:      null,
  strMeasure10:     null,
  strMeasure11:     null,
  strMeasure12:     null,
  strMeasure13:     null,
  strMeasure14:     null,
  strMeasure15:     null,
};

export const CATEGORIES = [
  { strCategory: "Cocktail" },
  { strCategory: "Shot"     },
  { strCategory: "Beer"     },
  { strCategory: "Shake"    },
];

export const AI_RECIPE_RESPONSE = {
  recipe: {
    strDrink:        "Midnight Velvet",
    strDrinkThumb:   "https://www.thecocktaildb.com/images/media/drink/tquyyt1451299548.jpg",
    strCategory:     "Cocktail",
    strInstructions: "Combine all ingredients in a shaker with ice. Shake for 15 seconds. Double-strain into a chilled glass.",
    ingredients: [
      { name: "Vodka",        measure: "2 oz"   },
      { name: "Lime juice",   measure: "3/4 oz" },
      { name: "Simple syrup", measure: "1/2 oz" },
      { name: "Egg white",    measure: "1"       },
    ],
  },
};

// ─────────────────────────────────────────────
// API mock helpers
// ─────────────────────────────────────────────

// Drinks per category — mirrors the MSW handler fixture so E2E and unit
// tests use the same data shape.
const DRINKS_BY_CATEGORY: Record<string, typeof DRINK[]> = {
  Cocktail: [DRINK],
  Shot:     [DRINK_2],
  Beer:     [{ ...DRINK_2, idDrink: "301", strDrink: "Black and Tan", strCategory: "Beer" }],
  Shake:    [{ ...DRINK_2, idDrink: "401", strDrink: "Vanilla Shake",  strCategory: "Shake" }],
};

export async function mockDefaultApi(page: Page) {
  await page.route(/thecocktaildb\.com\/api\/json\/v1\/1\/list\.php/, async (route) => {
    await route.fulfill({ json: { drinks: CATEGORIES } });
  });

  // filter.php handles both getBrowseRecipes (?c=) and getRecipes (?i= / ?c=)
  // Returns category-specific drinks for ?c= so Browse All gets varied results.
  await page.route(/thecocktaildb\.com\/api\/json\/v1\/1\/filter\.php/, async (route) => {
    const url      = new URL(route.request().url());
    const category = url.searchParams.get("c");

    const drinks = category && DRINKS_BY_CATEGORY[category]
      ? DRINKS_BY_CATEGORY[category]
      : [DRINK];

    await route.fulfill({ json: { drinks } });
  });

  await page.route(/thecocktaildb\.com\/api\/json\/v1\/1\/search\.php/, async (route) => {
    await route.fulfill({ json: { drinks: [DRINK] } });
  });

  await page.route(/thecocktaildb\.com\/api\/json\/v1\/1\/lookup\.php/, async (route) => {
    await route.fulfill({ json: { drinks: [RECIPE_DETAIL] } });
  });
}

export async function mockAIApi(page: Page) {
  await page.route("**/api/ai/generate-recipe", async (route) => {
    await route.fulfill({ json: AI_RECIPE_RESPONSE });
  });
}

export async function mockAIApiError(page: Page) {
  await page.route("**/api/ai/generate-recipe", async (route) => {
    await route.fulfill({ status: 500, body: "Internal Server Error" });
  });
}

export async function mockEmptyResults(page: Page) {
  await page.route(/thecocktaildb\.com\/api\/json\/v1\/1\/filter\.php/, async (route) => {
    await route.fulfill({ json: { drinks: null } });
  });
  await page.route(/thecocktaildb\.com\/api\/json\/v1\/1\/search\.php/, async (route) => {
    await route.fulfill({ json: { drinks: null } });
  });
}

export async function mockLookupError(page: Page) {
  await page.route(/thecocktaildb\.com\/api\/json\/v1\/1\/lookup\.php/, async (route) => {
    await route.fulfill({ status: 500, body: "Internal Server Error" });
  });
}

// ─────────────────────────────────────────────
// Extended test fixture with page objects
// ─────────────────────────────────────────────

type Fixtures = {
  homePage:        HomePage;
  favoritesPage:   FavoritesPage;
  recipeModal:     RecipeModal;
  aiGeneratorPage: AIGeneratorPage;
};

export const test = base.extend<Fixtures>({
  homePage:        async ({ page }, provide) => { await provide(new HomePage(page));        },
  favoritesPage:   async ({ page }, provide) => { await provide(new FavoritesPage(page));   },
  recipeModal:     async ({ page }, provide) => { await provide(new RecipeModal(page));      },
  aiGeneratorPage: async ({ page }, provide) => { await provide(new AIGeneratorPage(page)); },
});

export { expect } from "@playwright/test";
