import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class HomePage {
  readonly page: Page;

  readonly homeLink: Locator;
  readonly favoritesLink: Locator;
  readonly logo: Locator;

  readonly heroHeading: Locator;
  readonly heroSubtitle: Locator;

  readonly searchForm: Locator;
  readonly ingredientInput: Locator;
  readonly categoryButton: Locator;
  readonly searchButton: Locator;

  readonly browseAllButton: Locator;
  readonly resultsHeading: Locator;
  readonly recipeCountLabel: Locator;
  readonly drinkCards: Locator;
  readonly skeletonCards: Locator;

  readonly emptyStateHeading: Locator;

  readonly notification: Locator;

  constructor(page: Page) {
    this.page = page;

    this.homeLink      = page.getByRole("link", { name: /home/i });
    this.favoritesLink = page.getByRole("link", { name: /favorites/i });
    this.logo          = page.getByText("Cocktail Lab");

    this.heroHeading  = page.getByRole("heading", { name: /discover your next/i });
    this.heroSubtitle = page.getByText(/timeless classics/i);

    this.searchForm     = page.getByRole("search");
    this.ingredientInput = page.getByLabel(/search cocktails by ingredient/i);
    this.categoryButton  = page.getByRole("button", { name: /all categories/i });
    this.searchButton    = page.getByRole("button", { name: /^search$/i });

    this.browseAllButton  = page.getByRole("button", { name: /browse all recipes/i });
    this.resultsHeading   = page.getByRole("heading", { name: /featured mixes/i });
    this.recipeCountLabel = page.getByText(/found \d+ recipe/i);
    this.drinkCards       = page.getByRole("article");
    this.skeletonCards    = page.locator('[role="presentation"][aria-hidden="true"]');

    this.emptyStateHeading = page.getByRole("heading", { name: /your perfect mix awaits/i });

    this.notification = page.getByRole("status").or(page.getByRole("alert"));
  }

  async goto() {
    await this.page.goto("/");
  }

  async goToFavorites() {
    await this.favoritesLink.click();
  }

  async searchByIngredient(ingredient: string) {
    await this.ingredientInput.fill(ingredient);
    await this.searchButton.click();
  }

  async selectCategory(category: string) {
    await this.categoryButton.click();
    await this.page.getByRole("option", { name: category }).click();
  }

  async searchByCategory(category: string) {
    await this.selectCategory(category);
    await this.searchButton.click();
  }

  async browseAll() {
    await this.browseAllButton.click();
  }

  async submitEmptySearch() {
    await this.searchButton.click();
  }

  firstCard() {
    return this.drinkCards.first();
  }

  cardByName(name: string) {
    return this.drinkCards.filter({ hasText: name });
  }

  viewRecipeButton(cardLocator: Locator) {
    return cardLocator.getByRole("button", { name: /view recipe/i });
  }

  favoriteButton(cardLocator: Locator) {
    return cardLocator.getByRole("button", {
      name: /add .+ to favorites|remove .+ from favorites/i,
    });
  }

  async expectResultsVisible() {
    await expect(this.resultsHeading).toBeVisible();
    await expect(this.drinkCards.first()).toBeVisible();
  }

  async expectEmptyState() {
    await expect(this.emptyStateHeading).toBeVisible();
  }

  async expectNotification(text: string | RegExp) {
    const locator = this.page.getByRole("status").or(this.page.getByRole("alert"));
    await expect(locator).toBeVisible();
    await expect(locator).toContainText(text);
  }

  async expectErrorNotification(text: string | RegExp) {
    await expect(this.page.getByRole("alert")).toBeVisible();
    await expect(this.page.getByRole("alert")).toContainText(text);
  }
}
