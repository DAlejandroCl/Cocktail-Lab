import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "@/stores/useAppStore";
import FavoritesPage from "@/views/FavoritesPage";
import type { RecipeDetail } from "@/types";

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

const mockRecipe: RecipeDetail = {
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

const mockRecipe2: RecipeDetail = {
  ...mockRecipe,
  idDrink: "2",
  strDrink: "Daiquiri",
  strDrinkThumb: "https://image.com/daiquiri.jpg",
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function renderFavoritesPage() {
  return render(
    <MemoryRouter>
      <FavoritesPage />
    </MemoryRouter>,
  );
}

function seedFavorite(...recipes: RecipeDetail[]) {
  const favorites = Object.fromEntries(recipes.map((r) => [r.idDrink, r]));
  useAppStore.setState({ favorites });
}

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  useAppStore.setState({
    favorites: {},
    notification: null,
  });
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("FavoritesPage — Integration", () => {

  describe("empty state", () => {
    it("renders the empty state heading when there are no favorites", () => {
      renderFavoritesPage();

      expect(
        screen.getByRole("heading", { name: /no favorites yet/i }),
      ).toBeInTheDocument();
    });

    it("renders the page heading 'My Favorites'", () => {
      renderFavoritesPage();

      expect(
        screen.getByRole("heading", { name: /my favorites/i }),
      ).toBeInTheDocument();
    });

    it("does not render any drink cards when favorites is empty", () => {
      renderFavoritesPage();

      expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });

    it("does not show the recipe count when favorites is empty", () => {
      renderFavoritesPage();

      expect(screen.queryByText(/recipe saved/i)).not.toBeInTheDocument();
    });

    it("dispatches an info notification when the list is empty", async () => {
      renderFavoritesPage();

      await waitFor(() => {
        expect(useAppStore.getState().notification).toEqual({
          message: "Your favorites list is empty",
          type: "info",
        });
      });
    });
  });

  describe("with favorites", () => {
    beforeEach(() => {
      seedFavorite(mockRecipe);
    });

    it("renders a DrinkCard for each saved favorite", () => {
      renderFavoritesPage();

      expect(screen.getByRole("article")).toBeInTheDocument();
      expect(screen.getByText("Mojito")).toBeInTheDocument();
    });

    it("shows singular 'recipe saved' when there is one favorite", () => {
      renderFavoritesPage();

      expect(screen.getByText(/1 recipe saved/i)).toBeInTheDocument();
    });

    it("shows plural 'recipes saved' when there are multiple favorites", () => {
      seedFavorite(mockRecipe, mockRecipe2);

      renderFavoritesPage();

      expect(screen.getByText(/2 recipes saved/i)).toBeInTheDocument();
    });

    it("does not show the empty state heading when there are favorites", () => {
      renderFavoritesPage();

      expect(
        screen.queryByRole("heading", { name: /no favorites yet/i }),
      ).not.toBeInTheDocument();
    });

    it("does not dispatch a notification when favorites exist", () => {
      renderFavoritesPage();

      expect(useAppStore.getState().notification).toBeNull();
    });

    it("renders the correct drink thumbnail with alt text", () => {
      renderFavoritesPage();

      const img = screen.getByRole("img", { name: "Mojito" });
      expect(img).toHaveAttribute("src", mockRecipe.strDrinkThumb);
    });

    it("renders one card per favorite when there are multiple", () => {
      seedFavorite(mockRecipe, mockRecipe2);

      renderFavoritesPage();

      expect(screen.getAllByRole("article")).toHaveLength(2);
      expect(screen.getByText("Mojito")).toBeInTheDocument();
      expect(screen.getByText("Daiquiri")).toBeInTheDocument();
    });
  });

  describe("remove from favorites", () => {
    beforeEach(() => {
      seedFavorite(mockRecipe);
    });

    it("removes the drink from the store when the heart button is clicked", async () => {
      const user = userEvent.setup();

      renderFavoritesPage();

      const card = screen.getByRole("article");
      const removeButton = within(card).getByRole("button", {
        name: /remove mojito from favorites/i,
      });

      await user.click(removeButton);

      await waitFor(() => {
        expect(useAppStore.getState().favorites["1"]).toBeUndefined();
      });
    });

    it("dispatches an info notification after removing", async () => {
      const user = userEvent.setup();

      renderFavoritesPage();

      const card = screen.getByRole("article");
      const removeButton = within(card).getByRole("button", {
        name: /remove mojito from favorites/i,
      });

      await user.click(removeButton);

      await waitFor(() => {
        expect(useAppStore.getState().notification).toEqual({
          message: "Removed from favorites",
          type: "info",
        });
      });
    });

    it("shows the empty state after removing the last favorite", async () => {
      const user = userEvent.setup();

      renderFavoritesPage();

      const card = screen.getByRole("article");
      const removeButton = within(card).getByRole("button", {
        name: /remove mojito from favorites/i,
      });

      await user.click(removeButton);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /no favorites yet/i }),
        ).toBeInTheDocument();
      });
    });

    it("removes only the clicked card when there are multiple favorites", async () => {
      const user = userEvent.setup();

      seedFavorite(mockRecipe, mockRecipe2);

      renderFavoritesPage();

      const cards = screen.getAllByRole("article");
      const mojitoCard = cards.find((card) =>
        within(card).queryByText("Mojito"),
      )!;

      const removeButton = within(mojitoCard).getByRole("button", {
        name: /remove mojito from favorites/i,
      });

      await user.click(removeButton);

      await waitFor(() => {
        expect(useAppStore.getState().favorites["1"]).toBeUndefined();
        expect(useAppStore.getState().favorites["2"]).toBeDefined();
      });

      expect(screen.queryByText("Mojito")).not.toBeInTheDocument();
      expect(screen.getByText("Daiquiri")).toBeInTheDocument();
    });

    it("heart button shows aria-pressed=true before removal", async () => {
      const user = userEvent.setup();

      renderFavoritesPage();

      const card = screen.getByRole("article");
      const removeButton = within(card).getByRole("button", {
        name: /remove mojito from favorites/i,
      });

      expect(removeButton).toHaveAttribute("aria-pressed", "true");

      await user.click(removeButton);

      await waitFor(() => {
        expect(
          screen.queryByRole("button", { name: /remove mojito from favorites/i }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("each drink card has an accessible article role with labelledby", () => {
      seedFavorite(mockRecipe);

      renderFavoritesPage();

      const article = screen.getByRole("article");
      expect(article).toHaveAttribute("aria-labelledby", "drink-title-1");
    });

    it("favorite button has a descriptive aria-label", () => {
      seedFavorite(mockRecipe);

      renderFavoritesPage();

      expect(
        screen.getByRole("button", { name: /remove mojito from favorites/i }),
      ).toBeInTheDocument();
    });

    it("favorite button has aria-pressed=true for saved drinks", () => {
      seedFavorite(mockRecipe);

      renderFavoritesPage();

      const card = screen.getByRole("article");
      const button = within(card).getByRole("button", {
        name: /remove mojito from favorites/i,
      });

      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });
});
