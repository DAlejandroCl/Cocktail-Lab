import {
  test,
  expect,
  mockDefaultApi,
  mockLookupError,
  DRINK,
  RECIPE_DETAIL,
} from "./fixtures/test-fixtures";

test.describe("Browse and Favorite", () => {
  test.beforeEach(async ({ page }) => {
    await mockDefaultApi(page);
  });

  test.describe("Add favorite from drink card", () => {
    test("clicking the heart button adds the drink to favorites", async ({
      page,
      homePage,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      const card = homePage.firstCard();
      await homePage.favoriteButton(card).click();

      await expect(
        card.getByRole("button", { name: /remove .+ from favorites/i }),
      ).toBeVisible();
    });

    test("shows a success notification after adding", async ({ homePage }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.favoriteButton(homePage.firstCard()).click();

      await homePage.expectNotification(/added to favorites/i);
    });

    test("heart button has aria-pressed=true after adding", async ({ homePage }) => {
      await homePage.goto();
      await homePage.browseAll();

      const card = homePage.firstCard();
      await homePage.favoriteButton(card).click();

      await expect(
        card.getByRole("button", { name: /remove .+ from favorites/i }),
      ).toHaveAttribute("aria-pressed", "true");
    });

    test("shows error notification when the lookup API fails", async ({
      page,
      homePage,
    }) => {
      await mockLookupError(page);
      await homePage.goto();
      await homePage.browseAll();

      await homePage.favoriteButton(homePage.firstCard()).click();

      await homePage.expectErrorNotification(/unable to load cocktail details/i);
    });
  });

  test.describe("Add favorite from the Recipe Modal", () => {
    test("favorite button in modal adds the drink", async ({
      homePage,
      recipeModal,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.viewRecipeButton(homePage.firstCard()).click();
      await recipeModal.expectVisible();

      await recipeModal.toggleFavorite();

      await recipeModal.expectFavoriteButtonLabel(/remove from favorites/i);
    });

    test("success notification appears after adding from modal", async ({
      page,
      homePage,
      recipeModal,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.viewRecipeButton(homePage.firstCard()).click();
      await recipeModal.toggleFavorite();

      await expect(page.getByRole("status")).toContainText(/added to favorites/i);
    });

    test("adding from modal is reflected on the card heart button", async ({
      homePage,
      recipeModal,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      const card = homePage.firstCard();
      await homePage.viewRecipeButton(card).click();
      await recipeModal.toggleFavorite();
      await recipeModal.closeViaBottomButton();

      await expect(
        card.getByRole("button", { name: /remove .+ from favorites/i }),
      ).toBeVisible();
    });
  });

  test.describe("Favorites page — after adding", () => {
    test("saved drink appears on the Favorites page", async ({
      page,
      homePage,
      favoritesPage,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.favoriteButton(homePage.firstCard()).click();
      await homePage.goToFavorites();

      await expect(page.getByText(RECIPE_DETAIL.strDrink)).toBeVisible();
    });

    test("recipe count label shows '1 recipe saved'", async ({
      homePage,
      favoritesPage,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.favoriteButton(homePage.firstCard()).click();
      await homePage.goToFavorites();

      await expect(favoritesPage.recipeCountLabel).toContainText(/1 recipe saved/i);
    });

    test("favorites survive a client-side route change", async ({
      page,
      homePage,
      favoritesPage,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.favoriteButton(homePage.firstCard()).click();

      await homePage.goToFavorites();
      await favoritesPage.goToHome();
      await homePage.goToFavorites();

      await expect(page.getByText(RECIPE_DETAIL.strDrink)).toBeVisible();
    });
  });

  test.describe("Remove favorite from home page", () => {
    test("clicking the active heart button removes the drink", async ({
      homePage,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      const card = homePage.firstCard();

      await homePage.favoriteButton(card).click();
      await expect(
        card.getByRole("button", { name: /remove .+ from favorites/i }),
      ).toBeVisible();

      await card
        .getByRole("button", { name: /remove .+ from favorites/i })
        .click();

      await expect(
        card.getByRole("button", { name: /add .+ to favorites/i }),
      ).toBeVisible();
    });

    test("shows info notification after removing", async ({ homePage }) => {
      await homePage.goto();
      await homePage.browseAll();

      const card = homePage.firstCard();
      await homePage.favoriteButton(card).click();

      await card
        .getByRole("button", { name: /remove .+ from favorites/i })
        .click();

      await homePage.expectNotification(/removed from favorites/i);
    });
  });

  test.describe("Remove favorite from Favorites page", () => {
    test("removed drink disappears from the list", async ({
      homePage,
      favoritesPage,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.favoriteButton(homePage.firstCard()).click();
      await homePage.goToFavorites();

      const card = favoritesPage.firstCard();
      await favoritesPage.removeButton(card).click();

      await favoritesPage.expectEmptyState();
    });

    test("shows info notification after removing from Favorites page", async ({
      homePage,
      favoritesPage,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.favoriteButton(homePage.firstCard()).click();
      await homePage.goToFavorites();

      await favoritesPage.removeButton(favoritesPage.firstCard()).click();

      await favoritesPage.expectInfoNotification(/removed from favorites/i);
    });

    test("removing the last favorite shows the empty state", async ({
      homePage,
      favoritesPage,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      await homePage.favoriteButton(homePage.firstCard()).click();
      await homePage.goToFavorites();

      await favoritesPage.removeButton(favoritesPage.firstCard()).click();

      await favoritesPage.expectEmptyState();
    });
  });

  test.describe("Favorites page — empty state", () => {
    test("shows empty state heading with no favorites", async ({ favoritesPage }) => {
      await favoritesPage.goto();

      await favoritesPage.expectEmptyState();
    });

    test("shows info notification when the list is empty", async ({ favoritesPage }) => {
      await favoritesPage.goto();

      await favoritesPage.expectInfoNotification(/your favorites list is empty/i);
    });

    test("no drink cards are rendered when favorites is empty", async ({ favoritesPage }) => {
      await favoritesPage.goto();

      await favoritesPage.expectCardCount(0);
    });
  });

  test.describe("Remove favorite from the Recipe Modal", () => {
    test("toggling the favorite button in the modal removes the drink", async ({
      homePage,
      recipeModal,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      const card = homePage.firstCard();

      await homePage.favoriteButton(card).click();

      await homePage.viewRecipeButton(card).click();
      await recipeModal.expectVisible();

      await recipeModal.toggleFavorite(); // Remove

      await recipeModal.expectFavoriteButtonLabel(/add to favorites/i);
    });

    test("info notification appears after removing from modal", async ({
      page,
      homePage,
      recipeModal,
    }) => {
      await homePage.goto();
      await homePage.browseAll();

      const card = homePage.firstCard();
      await homePage.favoriteButton(card).click();

      await homePage.viewRecipeButton(card).click();
      await recipeModal.toggleFavorite();

      await expect(page.getByRole("status")).toContainText(/removed from favorites/i);
    });
  });
});
