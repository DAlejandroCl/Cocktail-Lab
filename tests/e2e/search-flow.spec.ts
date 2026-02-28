import { test, expect, mockDefaultApi, mockEmptyResults, DRINK } from "./fixtures/test-fixtures";

test.describe("Search flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockDefaultApi(page);
  });

  test.describe("Browse All Recipes", () => {
    test("clicking Browse All loads drink cards", async ({ page, homePage }) => {
      await homePage.goto();

      await homePage.browseAll();

      await homePage.expectResultsVisible();
    });

    test("Featured Mixes heading appears after loading", async ({ homePage }) => {
      await homePage.goto();
      await homePage.browseAll();

      await expect(homePage.resultsHeading).toBeVisible();
    });

    test("recipe count label shows how many drinks were found", async ({ homePage }) => {
      await homePage.goto();
      await homePage.browseAll();

      await expect(homePage.recipeCountLabel).toBeVisible();
    });

    test("skeleton cards appear while loading", async ({ page, homePage }) => {
      await page.route("**/api/json/v1/1/random.php**", async (route) => {
        await new Promise((r) => setTimeout(r, 300));
        await route.fulfill({ json: { drinks: [DRINK] } });
      });

      await homePage.goto();
      await homePage.browseAll();

      await expect(homePage.skeletonCards.first()).toBeVisible();

      await homePage.expectResultsVisible();
      await expect(homePage.skeletonCards).toHaveCount(0);
    });

    test("empty-state heading is replaced by results after Browse All", async ({ homePage }) => {
      await homePage.goto();
      await expect(homePage.emptyStateHeading).toBeVisible();

      await homePage.browseAll();

      await expect(homePage.emptyStateHeading).not.toBeVisible();
      await expect(homePage.resultsHeading).toBeVisible();
    });
  });

  test.describe("Search by ingredient", () => {
    test("typing an ingredient and clicking Search shows results", async ({ homePage }) => {
      await homePage.goto();

      await homePage.searchByIngredient("Rum");

      await homePage.expectResultsVisible();
    });

    test("drink card shows the correct drink name", async ({ page, homePage }) => {
      await homePage.goto();
      await homePage.searchByIngredient("Rum");

      await expect(page.getByText(DRINK.strDrink)).toBeVisible();
    });

    test("can search again with a different ingredient", async ({ homePage }) => {
      await homePage.goto();

      await homePage.searchByIngredient("Gin");
      await homePage.expectResultsVisible();

      await homePage.searchByIngredient("Vodka");
      await homePage.expectResultsVisible();
    });
  });

  test.describe("Search by category", () => {
    test("selecting a category and clicking Search shows results", async ({ homePage }) => {
      await homePage.goto();

      await homePage.searchByCategory("Cocktail");

      await homePage.expectResultsVisible();
    });

    test("selected category name appears in the Listbox trigger", async ({ page, homePage }) => {
      await homePage.goto();

      await homePage.selectCategory("Cocktail");

      await expect(page.getByRole("button", { name: /cocktail/i })).toBeVisible();
    });

    test("category dropdown lists all options from the API", async ({ page, homePage }) => {
      await homePage.goto();

      await homePage.categoryButton.click();

      await expect(page.getByRole("option", { name: "Cocktail" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Shot" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Beer" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Shake" })).toBeVisible();
    });

    test("Escape closes the category dropdown", async ({ page, homePage }) => {
      await homePage.goto();

      await homePage.categoryButton.click();
      await expect(page.getByRole("option", { name: "Cocktail" })).toBeVisible();

      await page.keyboard.press("Escape");

      await expect(page.getByRole("option", { name: "Cocktail" })).not.toBeVisible();
    });
  });

  test.describe("Combined ingredient + category search", () => {
    test("using both filters at once returns results", async ({ homePage }) => {
      await homePage.goto();

      await homePage.ingredientInput.fill("Rum");
      await homePage.selectCategory("Cocktail");
      await homePage.searchButton.click();

      await homePage.expectResultsVisible();
    });
  });

  test.describe("Empty-submit validation", () => {
    test("submitting with no filters shows an error notification", async ({ homePage }) => {
      await homePage.goto();

      await homePage.submitEmptySearch();

      await homePage.expectErrorNotification(/please enter an ingredient or select a category/i);
    });

    test("focus moves to the ingredient input after empty submit", async ({ page, homePage }) => {
      await homePage.goto();

      await homePage.submitEmptySearch();

      await expect(homePage.ingredientInput).toBeFocused();
    });

    test("search button is disabled while loading", async ({ page, homePage }) => {
      await page.route("**/api/json/v1/1/random.php**", async (route) => {
        await new Promise((r) => setTimeout(r, 300));
        await route.fulfill({ json: { drinks: [DRINK] } });
      });

      await homePage.goto();
      await homePage.browseAll();

      await expect(homePage.searchButton).toBeDisabled();
    });
  });

  test.describe("Empty results state", () => {
    test("info notification appears when search returns no drinks", async ({ page, homePage }) => {
      await mockEmptyResults(page);
      await homePage.goto();

      await homePage.searchByIngredient("xyzxyz");

      await homePage.expectNotification(/no cocktails found/i);
    });

    test("empty state heading stays visible when no drinks are found", async ({ page, homePage }) => {
      await mockEmptyResults(page);
      await homePage.goto();

      await homePage.searchByIngredient("xyzxyz");

      await expect(homePage.emptyStateHeading).toBeVisible();
    });
  });

  test.describe("Recipe modal", () => {
    test("clicking View Recipe opens the modal", async ({ homePage, recipeModal }) => {
      await homePage.goto();
      await homePage.browseAll();

      const card = homePage.firstCard();
      await homePage.viewRecipeButton(card).click();

      await recipeModal.expectVisible();
    });

    test("modal shows the correct cocktail title", async ({ homePage, recipeModal }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.viewRecipeButton(homePage.firstCard()).click();

      await recipeModal.expectTitle(DRINK.strDrink);
    });

    test("modal shows the cocktail image", async ({ homePage, recipeModal }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.viewRecipeButton(homePage.firstCard()).click();

      await expect(recipeModal.image).toBeVisible();
    });

    test("modal shows the Ingredients section", async ({ homePage, recipeModal }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.viewRecipeButton(homePage.firstCard()).click();

      await recipeModal.expectIngredient("White rum");
    });

    test("modal shows the Instructions section", async ({ homePage, recipeModal }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.viewRecipeButton(homePage.firstCard()).click();

      await recipeModal.expectInstruction(/mix ingredients/i);
    });

    test("modal closes via the top ✕ button", async ({ homePage, recipeModal }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.viewRecipeButton(homePage.firstCard()).click();
      await recipeModal.expectVisible();

      await recipeModal.closeViaTopButton();

      await recipeModal.expectHidden();
    });

    test("modal closes via the bottom Close button", async ({ homePage, recipeModal }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.viewRecipeButton(homePage.firstCard()).click();
      await recipeModal.expectVisible();

      await recipeModal.closeViaBottomButton();

      await recipeModal.expectHidden();
    });

    test("modal closes when Escape is pressed", async ({ homePage, recipeModal }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.viewRecipeButton(homePage.firstCard()).click();
      await recipeModal.expectVisible();

      await recipeModal.closeViaEscape();

      await recipeModal.expectHidden();
    });

    test("modal closes when clicking the backdrop overlay", async ({ homePage, recipeModal }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.viewRecipeButton(homePage.firstCard()).click();
      await recipeModal.expectVisible();

      await recipeModal.closeViaBackdrop();

      await recipeModal.expectHidden();
    });
  });
});
