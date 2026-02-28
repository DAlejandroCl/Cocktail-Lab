import { test, expect, mockDefaultApi } from "./fixtures/test-fixtures";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await mockDefaultApi(page);
  });

  test.describe("Home page ( / )", () => {
    test("loads the home page and shows the hero heading", async ({ page, homePage }) => {
      await homePage.goto();

      await expect(page).toHaveURL("/");
      await expect(homePage.heroHeading).toBeVisible();
    });

    test("shows the search form on the home route", async ({ homePage }) => {
      await homePage.goto();

      await expect(homePage.searchForm).toBeVisible();
      await expect(homePage.ingredientInput).toBeVisible();
      await expect(homePage.categoryButton).toBeVisible();
      await expect(homePage.searchButton).toBeVisible();
    });

    test("shows the Browse All Recipes button in the empty state", async ({ homePage }) => {
      await homePage.goto();

      await expect(homePage.browseAllButton).toBeVisible();
    });

    test("page title includes Cocktail Lab", async ({ page, homePage }) => {
      await homePage.goto();

      await expect(page).toHaveTitle(/cocktail lab/i);
    });
  });

  test.describe("Header navigation", () => {
    test("Home link is present", async ({ homePage }) => {
      await homePage.goto();

      await expect(homePage.homeLink).toBeVisible();
    });

    test("Favorites link is present", async ({ homePage }) => {
      await homePage.goto();

      await expect(homePage.favoritesLink).toBeVisible();
    });

    test("logo link is present and has correct text", async ({ homePage }) => {
      await homePage.goto();

      await expect(homePage.logo).toBeVisible();
    });

    test("clicking Favorites navigates to /favorites", async ({ page, homePage }) => {
      await homePage.goto();
      await homePage.goToFavorites();

      await expect(page).toHaveURL("/favorites");
    });

    test("clicking Home link from Favorites navigates back to /", async ({ page, homePage, favoritesPage }) => {
      await favoritesPage.goto();
      await favoritesPage.goToHome();

      await expect(page).toHaveURL("/");
    });

    test("logo click navigates back to home from /favorites", async ({ page, favoritesPage }) => {
      await favoritesPage.goto();

      await page.getByText("Cocktail Lab").click();

      await expect(page).toHaveURL("/");
    });

    test("Home link is marked aria-current=page on the home route", async ({ page, homePage }) => {
      await homePage.goto();

      const homeLink = page.getByRole("link", { name: /^home$/i });
      await expect(homeLink).toHaveAttribute("aria-current", "page");
    });

    test("Favorites link is marked aria-current=page on the favorites route", async ({ page, favoritesPage }) => {
      await favoritesPage.goto();

      await expect(page).toHaveURL("/favorites");
      const favLink = page.getByRole("link", { name: /favorites/i });
      await expect(favLink).toHaveAttribute("aria-current", "page");
    });

    test("Home link is NOT aria-current=page when on /favorites", async ({ page, favoritesPage }) => {
      await favoritesPage.goto();

      const homeLink = page.getByRole("link", { name: /^home$/i });
      await expect(homeLink).not.toHaveAttribute("aria-current", "page");
    });
  });

  test.describe("Route-conditional content", () => {
    test("search form is hidden on the Favorites page", async ({ page, favoritesPage }) => {
      await favoritesPage.goto();

      await expect(page.getByRole("search")).not.toBeVisible();
    });

    test("search form reappears after navigating back to /", async ({ page, homePage, favoritesPage }) => {
      await favoritesPage.goto();
      await expect(page.getByRole("search")).not.toBeVisible();

      await favoritesPage.goToHome();
      await expect(page.getByRole("search")).toBeVisible();
    });

    test("My Favorites heading is visible on /favorites", async ({ favoritesPage }) => {
      await favoritesPage.goto();

      await expect(favoritesPage.pageHeading).toBeVisible();
    });

    test("My Favorites heading is not on the home page", async ({ page, homePage }) => {
      await homePage.goto();

      await expect(page.getByRole("heading", { name: /my favorites/i })).not.toBeVisible();
    });
  });

  test.describe("Skip link", () => {
    test("skip link is present and points to #main-content", async ({ page, homePage }) => {
      await homePage.goto();

      const skipLink = page.getByRole("link", { name: /skip to main content/i });
      await expect(skipLink).toHaveAttribute("href", "#main-content");
    });

    test("main landmark has id=main-content", async ({ page, homePage }) => {
      await homePage.goto();

      await expect(page.locator("#main-content")).toBeVisible();
    });
  });

  test.describe("Browser Back / Forward", () => {
    test("Back button returns to home after visiting favorites", async ({ page, homePage }) => {
      await homePage.goto();
      await homePage.goToFavorites();

      await expect(page).toHaveURL("/favorites");

      await page.goBack();

      await expect(page).toHaveURL("/");
      await expect(homePage.heroHeading).toBeVisible();
    });

    test("Forward button goes to favorites after going back", async ({ page, homePage }) => {
      await homePage.goto();
      await homePage.goToFavorites();
      await page.goBack();

      await page.goForward();

      await expect(page).toHaveURL("/favorites");
    });
  });
});
