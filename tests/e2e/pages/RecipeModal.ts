import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class RecipeModal {
  readonly page: Page;

  readonly dialog: Locator;

  readonly title: Locator;
  readonly image: Locator;
  readonly closeButtonTop: Locator;

  readonly ingredientsSection: Locator;
  readonly instructionsSection: Locator;

  readonly closeButtonBottom: Locator;
  readonly favoriteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dialog           = page.getByRole("dialog");
    this.title            = page.locator("#modal-title");
    this.image            = page.getByAltText(/image of .+ cocktail/i);
    this.closeButtonTop   = page.getByLabel("Close modal").first();

    this.ingredientsSection = page
      .getByRole("region", { name: /ingredients/i })
      .or(page.locator("section[aria-labelledby='ingredients-heading']"));

    this.instructionsSection = page
      .getByRole("region", { name: /instructions/i })
      .or(page.locator("section[aria-labelledby='instructions-heading']"));

    this.closeButtonBottom = page
      .getByRole("button", { name: /close modal/i })
      .last();

    this.favoriteButton = page.getByRole("button", {
      name: /add to favorites|remove from favorites/i,
    });
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async expectHidden() {
    await expect(this.dialog).not.toBeVisible();
  }

  async expectTitle(name: string | RegExp) {
    await expect(this.title).toContainText(name);
  }

  async expectIngredient(name: string | RegExp) {
    await expect(this.ingredientsSection).toContainText(name);
  }

  async expectInstruction(text: string | RegExp) {
    await expect(this.instructionsSection).toContainText(text);
  }

  async expectFavoriteButtonLabel(label: string | RegExp) {
    await expect(this.favoriteButton).toHaveAccessibleName(label);
  }

  async closeViaTopButton() {
    await this.closeButtonTop.click();
  }

  async closeViaBottomButton() {
    await this.closeButtonBottom.click();
  }

  async closeViaEscape() {
    await this.page.keyboard.press("Escape");
  }

  async closeViaBackdrop() {
    await this.page.mouse.click(10, 10);
  }

  async toggleFavorite() {
    await this.favoriteButton.click();
  }
}
