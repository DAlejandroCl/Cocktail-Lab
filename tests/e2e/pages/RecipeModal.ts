import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class RecipeModal {
  readonly page: Page;

  readonly dialog: Locator;
  private readonly panel: Locator;

  readonly title: Locator;
  readonly image: Locator;
  readonly closeButtonTop: Locator;

  readonly ingredientsSection: Locator;
  readonly instructionsSection: Locator;

  readonly closeButtonBottom: Locator;
  readonly favoriteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dialog = page.locator('[role="dialog"][aria-modal="true"]');

    this.panel = page.locator(
      '[aria-labelledby="modal-title"]:not([role="dialog"])',
    );

    this.title            = page.locator("#modal-title");
    this.image            = page.getByAltText(/image of .+ cocktail/i);
    this.closeButtonTop   = page.getByLabel("Close modal").first();

    this.ingredientsSection = page.locator(
      "section[aria-labelledby='ingredients-heading']",
    );

    this.instructionsSection = page.locator(
      "section[aria-labelledby='instructions-heading']",
    );

    this.closeButtonBottom = page
      .getByRole("button", { name: /close modal/i })
      .last();

    this.favoriteButton = page.getByRole("button", {
      name: /add to favorites|remove from favorites/i,
    });
  }

  // ── Assertions ─────────────────────────────────────────────────────────

  async expectVisible() {
    await expect(this.title).toBeVisible({ timeout: 10_000 });
  }

  async expectHidden() {
    await expect(this.title).not.toBeVisible({ timeout: 10_000 });
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

  // ── Actions ───────────────────────────────────────────────────────────

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
    const box = await this.panel.boundingBox();
    const viewport = this.page.viewportSize();
    const isMobile = viewport ? viewport.width < 768 : false;

    let x: number;
    let y: number;

    if (box && box.y > 10) {
      x = Math.round(box.x + box.width / 2);
      y = Math.round(box.y / 2);
    } else {
      x = 10;
      y = 10;
    }

    if (isMobile) {
      await this.page.touchscreen.tap(x, y);
    } else {
      await this.page.mouse.click(x, y);
    }
  }

  async toggleFavorite() {
    await this.favoriteButton.click();
  }
}
