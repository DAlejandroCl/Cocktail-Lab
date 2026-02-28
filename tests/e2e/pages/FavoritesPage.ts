import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class FavoritesPage {
  readonly page: Page;

  readonly favoritesNavLink: Locator;
  readonly homeNavLink: Locator;

  readonly pageHeading: Locator;
  readonly recipeCountLabel: Locator;
  readonly drinkCards: Locator;

  readonly emptyHeading: Locator;
  readonly emptyDescription: Locator;

  readonly notification: Locator;

  constructor(page: Page) {
    this.page = page;

    this.favoritesNavLink = page.getByRole("link", { name: /favorites/i });
    this.homeNavLink      = page.getByRole("link", { name: /home/i });

    this.pageHeading      = page.getByRole("heading", { name: /my favorites/i });
    this.recipeCountLabel = page.getByText(/\d+ recipe[s]? saved/i);
    this.drinkCards       = page.getByRole("article");

    this.emptyHeading     = page.getByRole("heading", { name: /no favorites yet/i });
    this.emptyDescription = page.getByText(/start exploring recipes/i);

    this.notification = page.getByRole("status").or(page.getByRole("alert"));
  }

  async goto() {
    await this.page.goto("/favorites");
  }

  async goToHome() {
    await this.homeNavLink.click();
  }

  firstCard() {
    return this.drinkCards.first();
  }

  cardByName(name: string) {
    return this.drinkCards.filter({ hasText: name });
  }

  removeButton(cardLocator: Locator) {
    return cardLocator.getByRole("button", {
      name: /remove .+ from favorites/i,
    });
  }

  viewRecipeButton(cardLocator: Locator) {
    return cardLocator.getByRole("button", { name: /view recipe/i });
  }

  async expectEmptyState() {
    await expect(this.emptyHeading).toBeVisible();
    await expect(this.emptyDescription).toBeVisible();
  }

  async expectCardCount(count: number) {
    await expect(this.drinkCards).toHaveCount(count);
  }

  async expectNotification(text: string | RegExp) {
    await expect(this.notification).toBeVisible();
    await expect(this.notification).toContainText(text);
  }

  async expectInfoNotification(text: string | RegExp) {
    await expect(this.page.getByRole("status")).toBeVisible();
    await expect(this.page.getByRole("status")).toContainText(text);
  }
}
