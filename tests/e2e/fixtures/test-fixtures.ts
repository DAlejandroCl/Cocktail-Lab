import { test as base, type Page } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { RecipeModal } from "../pages/RecipeModal";

// ─────────────────────────────────────────────
// Inline API fixture data
// Mirrors the MSW handler defaults so E2E responses are predictable.
// ─────────────────────────────────────────────

export const DRINK = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strCategory: "Cocktail",
};

export const DRINK_2 = {
  idDrink: "2",
  strDrink: "Daiquiri",
  strDrinkThumb: "https://image.com/daiquiri.jpg",
  strCategory: "Cocktail",
};

export const RECIPE_DETAIL = {
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

export const CATEGORIES = [
  { strCategory: "Cocktail" },
  { strCategory: "Shot" },
  { strCategory: "Beer" },
  { strCategory: "Shake" },
];

// ─────────────────────────────────────────────
// API mock helpers
// Playwright route intercepts replace the real CocktailDB calls.
// ─────────────────────────────────────────────

export async function mockDefaultApi(page: Page) {
  await page.route(
    "**/api/json/v1/1/list.php**",
    async (route) => {
      await route.fulfill({ json: { drinks: CATEGORIES } });
    },
  );

  await page.route(
    "**/api/json/v1/1/random.php**",
    async (route) => {
      await route.fulfill({ json: { drinks: [DRINK] } });
    },
  );

  await page.route(
    "**/api/json/v1/1/search.php**",
    async (route) => {
      await route.fulfill({ json: { drinks: [DRINK] } });
    },
  );

  await page.route(
    "**/api/json/v1/1/filter.php**",
    async (route) => {
      await route.fulfill({ json: { drinks: [DRINK] } });
    },
  );

  await page.route(
    "**/api/json/v1/1/lookup.php**",
    async (route) => {
      await route.fulfill({ json: { drinks: [RECIPE_DETAIL] } });
    },
  );
}

export async function mockEmptyResults(page: Page) {
  await page.route("**/api/json/v1/1/random.php**", async (route) => {
    await route.fulfill({ json: { drinks: null } });
  });

  await page.route("**/api/json/v1/1/filter.php**", async (route) => {
    await route.fulfill({ json: { drinks: null } });
  });

  await page.route("**/api/json/v1/1/search.php**", async (route) => {
    await route.fulfill({ json: { drinks: null } });
  });
}

export async function mockLookupError(page: Page) {
  await page.route("**/api/json/v1/1/lookup.php**", async (route) => {
    await route.fulfill({ status: 500, body: "Internal Server Error" });
  });
}

// ─────────────────────────────────────────────
// Extended test fixture with page objects
// ─────────────────────────────────────────────

type Fixtures = {
  homePage: HomePage;
  favoritesPage: FavoritesPage;
  recipeModal: RecipeModal;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  favoritesPage: async ({ page }, use) => {
    await use(new FavoritesPage(page));
  },
  recipeModal: async ({ page }, use) => {
    await use(new RecipeModal(page));
  },
});

export { expect } from "@playwright/test";
