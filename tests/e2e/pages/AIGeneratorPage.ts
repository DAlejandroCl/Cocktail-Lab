import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class AIGeneratorPage {
  readonly page: Page;

  // ── Navigation ─────────────────────────────────────────────────────────────
  readonly navLink: Locator;

  // ── Ingredient builder ─────────────────────────────────────────────────────
  readonly ingredientInput: Locator;
  readonly addIngredientButton: Locator;
  readonly suggestionListbox: Locator;
  readonly clearAllButton: Locator;

  // ── Generate ───────────────────────────────────────────────────────────────
  readonly generateButton: Locator;

  // ── States ─────────────────────────────────────────────────────────────────
  readonly loadingIndicator: Locator;
  readonly recipeCard: Locator;
  readonly errorAlert: Locator;

  // ── Recipe actions ─────────────────────────────────────────────────────────
  readonly addToFavoritesButton: Locator;
  readonly saveCreationButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navLink = page.getByRole("link", { name: /ai generator/i });

    this.ingredientInput      = page.getByPlaceholder(/search an ingredient/i);
    this.addIngredientButton  = page.getByRole("button", { name: /add ingredient/i });
    this.suggestionListbox    = page.getByRole("listbox", { name: /ingredient suggestions/i });
    this.clearAllButton       = page.getByRole("button", { name: /clear all/i });

    this.generateButton       = page.getByRole("button", { name: /generate recipe/i });

    this.loadingIndicator     = page.getByRole("status", { name: /generating recipe/i });
    this.recipeCard           = page.getByRole("article", { name: /generated recipe/i });
    this.errorAlert           = page.getByRole("alert");

    this.addToFavoritesButton = page.getByRole("button", { name: /add to favorites/i });
    this.saveCreationButton   = page.getByRole("button", { name: /save creation|saved/i });
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto("/ai");
  }

  async goViaNavLink() {
    await this.navLink.click();
    await this.page.waitForURL("**/ai");
  }

  // ── Ingredient helpers ──────────────────────────────────────────────────────

  async addIngredient(name: string) {
    await this.ingredientInput.fill(name);
    await this.ingredientInput.press("Enter");
  }

  async addIngredients(names: string[]) {
    for (const name of names) {
      await this.addIngredient(name);
    }
  }

  async addIngredientViaButton(name: string) {
    await this.ingredientInput.fill(name);
    await this.addIngredientButton.click();
  }

  ingredientTag(name: string) {
    return this.page.locator(".ingredient-tag", { hasText: name });
  }

  removeButton(name: string) {
    return this.page.getByRole("button", { name: new RegExp(`remove ${name}`, "i") });
  }

  suggestion(name: string) {
    return this.page.getByRole("option", { name });
  }

  // ── Flow helpers ────────────────────────────────────────────────────────────

  async generate() {
    await this.generateButton.click();
  }

  async addIngredientsAndGenerate(names: string[]) {
    await this.addIngredients(names);
    await this.generate();
    await expect(this.recipeCard).toBeVisible({ timeout: 10_000 });
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async expectGenerateDisabled() {
    await expect(this.generateButton).toBeDisabled();
  }

  async expectGenerateEnabled() {
    await expect(this.generateButton).toBeEnabled();
  }

  async expectRecipeVisible() {
    await expect(this.recipeCard).toBeVisible({ timeout: 10_000 });
  }

  async expectErrorVisible() {
    await expect(this.errorAlert).toBeVisible({ timeout: 10_000 });
  }
}
