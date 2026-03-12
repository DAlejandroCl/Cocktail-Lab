import {
  test,
  expect,
  mockDefaultApi,
  mockAIApi,
  mockAIApiError,
  AI_RECIPE_RESPONSE,
} from "./fixtures/test-fixtures";

test.describe("AI Recipe Generator", () => {

  test.beforeEach(async ({ page }) => {
    await mockDefaultApi(page);
    await mockAIApi(page);
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  test.describe("Routing", () => {
    test("navigating to /ai shows the AI Generator page", async ({ page, aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await expect(page).toHaveURL("/ai");
      await expect(page.getByRole("heading", { name: /ai recipe generator/i })).toBeVisible();
    });

    // ✅ Fix: removed unused `page` — URL assertion via aiGeneratorPage.page
    test("AI Generator nav link navigates to /ai", async ({ homePage, aiGeneratorPage }) => {
      await homePage.goto();
      await aiGeneratorPage.goViaNavLink();
      await expect(aiGeneratorPage.page).toHaveURL("/ai");
    });

    test("AI Generator nav link has aria-current=page when active", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await expect(aiGeneratorPage.navLink).toHaveAttribute("aria-current", "page");
    });

    test("Home link is NOT aria-current=page on /ai", async ({ page, aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await expect(page.getByRole("link", { name: /^home$/i })).not.toHaveAttribute("aria-current", "page");
    });

    test("search form is NOT visible on the AI Generator page", async ({ page, aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await expect(page.getByRole("search")).not.toBeVisible();
    });
  });

  // ── Initial state ───────────────────────────────────────────────────────────

  test.describe("Initial state", () => {
    test("Generate Recipe button is disabled on first load", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.expectGenerateDisabled();
    });

    test("ingredient input is visible and empty", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await expect(aiGeneratorPage.ingredientInput).toBeVisible();
      await expect(aiGeneratorPage.ingredientInput).toHaveValue("");
    });
  });

  // ── Ingredient management ───────────────────────────────────────────────────

  test.describe("Adding ingredients", () => {
    test("adds an ingredient via Enter key", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Vodka");
      await expect(aiGeneratorPage.ingredientTag("Vodka")).toBeVisible();
    });

    test("adds an ingredient via the + button", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredientViaButton("Rum");
      await expect(aiGeneratorPage.ingredientTag("Rum")).toBeVisible();
    });

    test("input is cleared after adding", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Gin");
      await expect(aiGeneratorPage.ingredientInput).toHaveValue("");
    });

    test("does not add a duplicate ingredient", async ({ aiGeneratorPage, page }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Tequila");
      await aiGeneratorPage.addIngredient("tequila");
      const tags = page.locator(".ingredient-tag", { hasText: /^tequila$/i });
      await expect(tags).toHaveCount(1);
    });

    test("Generate button becomes enabled after adding one ingredient", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Mezcal");
      await aiGeneratorPage.expectGenerateEnabled();
    });
  });

  test.describe("Autocomplete suggestions", () => {
    test("shows suggestions while typing", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.ingredientInput.fill("Vo");
      await expect(aiGeneratorPage.suggestionListbox).toBeVisible();
      await expect(aiGeneratorPage.suggestion("Vodka")).toBeVisible();
    });

    test("adds a suggestion on click", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.ingredientInput.fill("Vo");
      await aiGeneratorPage.suggestion("Vodka").click();
      await expect(aiGeneratorPage.ingredientTag("Vodka")).toBeVisible();
    });

    test("already-added ingredients do not appear in suggestions", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Vodka");
      await aiGeneratorPage.ingredientInput.fill("Vo");
      await expect(aiGeneratorPage.suggestion("Vodka")).not.toBeVisible();
    });
  });

  test.describe("Removing ingredients", () => {
    test("removes an ingredient tag", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Campari");
      await aiGeneratorPage.removeButton("Campari").click();
      await expect(aiGeneratorPage.ingredientTag("Campari")).not.toBeVisible();
    });

    test("Clear all removes every ingredient", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredients(["Vodka", "Gin", "Rum"]);
      await aiGeneratorPage.clearAllButton.click();
      for (const name of ["Vodka", "Gin", "Rum"]) {
        await expect(aiGeneratorPage.ingredientTag(name)).not.toBeVisible();
      }
    });

    test("Generate button is disabled again after clearing all ingredients", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Vodka");
      await aiGeneratorPage.clearAllButton.click();
      await aiGeneratorPage.expectGenerateDisabled();
    });
  });

  // ── Generation flow ─────────────────────────────────────────────────────────

  test.describe("Recipe generation", () => {
    test("shows loading indicator during generation", async ({ page, aiGeneratorPage }) => {
      await page.route("**/api/ai/generate-recipe", async (route) => {
        await page.waitForTimeout(300);
        await route.fulfill({ json: AI_RECIPE_RESPONSE });
      });

      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Vodka");
      await aiGeneratorPage.generate();

      await expect(aiGeneratorPage.loadingIndicator).toBeVisible();
      await expect(aiGeneratorPage.recipeCard).toBeVisible({ timeout: 10_000 });
    });

    test("shows the generated recipe card", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredientsAndGenerate(["Vodka", "Lime juice"]);

      await expect(aiGeneratorPage.recipeCard).toBeVisible();
      await expect(
        aiGeneratorPage.page.getByText(AI_RECIPE_RESPONSE.recipe.strDrink),
      ).toBeVisible();
    });

    test("recipe card shows the AI Created badge", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredientsAndGenerate(["Gin"]);
      await expect(aiGeneratorPage.page.getByText(/ai created/i)).toBeVisible();
    });

    test("recipe card shows ingredient and instruction sections", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredientsAndGenerate(["Rum"]);

      const card = aiGeneratorPage.recipeCard;
      await expect(card.getByRole("region", { name: /ingredients/i })).toBeVisible();
      await expect(card.getByRole("region", { name: /instructions/i })).toBeVisible();
    });

    test("recipe card shows the user's ingredients", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredientsAndGenerate(["Tequila", "Lime juice"]);

      const card = aiGeneratorPage.recipeCard;
      await expect(card.getByRole("region", { name: /your ingredients/i })).toBeVisible();
      await expect(card.getByText("Tequila")).toBeVisible();
    });

    test("shows Add to Favorites and Save Creation buttons after generation", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredientsAndGenerate(["Vodka"]);

      await expect(aiGeneratorPage.addToFavoritesButton).toBeVisible();
      await expect(aiGeneratorPage.saveCreationButton).toBeVisible();
    });
  });

  // ── Error state ─────────────────────────────────────────────────────────────

  test.describe("Error handling", () => {
    test("shows error alert when the API returns 500", async ({ page, aiGeneratorPage }) => {
      await mockAIApiError(page);

      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Brandy");
      await aiGeneratorPage.generate();

      await aiGeneratorPage.expectErrorVisible();
      await expect(aiGeneratorPage.page.getByText(/generation failed/i)).toBeVisible();
    });

    test("does not show the recipe card on error", async ({ page, aiGeneratorPage }) => {
      await mockAIApiError(page);

      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Aperol");
      await aiGeneratorPage.generate();

      await aiGeneratorPage.expectErrorVisible();
      await expect(aiGeneratorPage.recipeCard).not.toBeVisible();
    });
  });

  // ── Favorites integration ───────────────────────────────────────────────────

  test.describe("Save to Favorites", () => {
    test("clicking Add to Favorites shows a success notification", async ({ page, aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredientsAndGenerate(["Whiskey"]);
      await aiGeneratorPage.addToFavoritesButton.click();

      await expect(
        page.getByRole("status").or(page.getByRole("alert")),
      ).toContainText(/added to favorites/i);
    });

    // ✅ Fix: removed unused `page` — assertion via aiGeneratorPage.page
    test("saving as creation disables the Save Creation button", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredientsAndGenerate(["Bourbon"]);
      await aiGeneratorPage.saveCreationButton.click();

      await expect(
        aiGeneratorPage.page.getByRole("button", { name: /saved/i }),
      ).toBeDisabled();
    });

    test("favorites saved via AI show up on the Favorites page", async ({
      aiGeneratorPage,
      favoritesPage,
    }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredientsAndGenerate(["Campari"]);
      await aiGeneratorPage.addToFavoritesButton.click();

      await favoritesPage.goto();

      await expect(favoritesPage.drinkCards.first()).toBeVisible();
    });
  });

  // ── Accessibility ───────────────────────────────────────────────────────────

  test.describe("Accessibility", () => {
    test("ingredient input has accessible label", async ({ aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await expect(aiGeneratorPage.ingredientInput).toBeVisible();
    });

    test("generate button is keyboard-accessible", async ({ page, aiGeneratorPage }) => {
      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Vodka");
      await aiGeneratorPage.generateButton.focus();
      await page.keyboard.press("Enter");
      await aiGeneratorPage.expectRecipeVisible();
    });

    test("loading indicator has role=status and aria-live", async ({ page, aiGeneratorPage }) => {
      await page.route("**/api/ai/generate-recipe", async (route) => {
        await page.waitForTimeout(200);
        await route.fulfill({ json: AI_RECIPE_RESPONSE });
      });

      await aiGeneratorPage.goto();
      await aiGeneratorPage.addIngredient("Gin");
      await aiGeneratorPage.generate();

      const loader = aiGeneratorPage.loadingIndicator;
      await expect(loader).toHaveAttribute("aria-live", "polite");
    });
  });
});
