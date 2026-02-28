import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { server } from "../mocks/server";
import { useAppStore } from "@/stores/useAppStore";
import Layout from "@/layouts/Layout";
import FavoritesPage from "@/views/FavoritesPage";
import IndexPage from "@/views/IndexPage";
import type { RecipeDetail } from "@/types";

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

const mockDrink = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strCategory: "Cocktail",
};

const mockRecipeDetail: RecipeDetail = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strInstructions: "Mix ingredients. Serve cold.",
  strCategory: "Cocktail",
  strIngredient1: "White rum",
  strIngredient2: "Lime juice",
  strIngredient3: "Sugar",
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
  strMeasure3: "1 tsp",
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

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function renderApp(initialEntries: string[] = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function seedFavorite(recipe: RecipeDetail) {
  useAppStore.setState((state) => ({
    favorites: { ...state.favorites, [recipe.idDrink]: recipe },
  }));
}

// ─────────────────────────────────────────────
// Setup & teardown
// ─────────────────────────────────────────────

beforeEach(() => {
  useAppStore.setState({ favorites: {}, notification: null });

  server.use(
    http.get(
      "https://www.thecocktaildb.com/api/json/v1/1/lookup.php",
      () => HttpResponse.json({ drinks: [mockRecipeDetail] }),
    ),
  );
});

afterEach(() => {
  // MSW handlers are reset by test-setup.ts afterEach — nothing extra needed
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("Favorites Flow — Integration", () => {

  describe("FavoritesPage — empty state", () => {
    it("renders the empty state message when there are no favorites", () => {
      renderApp(["/favorites"]);

      expect(screen.getByText("No Favorites Yet")).toBeInTheDocument();
    });

    it("shows an info notification when favorites list is empty", async () => {
      renderApp(["/favorites"]);

      await waitFor(() => {
        expect(useAppStore.getState().notification).toEqual({
          message: "Your favorites list is empty",
          type: "info",
        });
      });
    });

    it("does not render any DrinkCard when favorites is empty", () => {
      renderApp(["/favorites"]);

      expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });
  });

  describe("FavoritesPage — with favorites", () => {
    beforeEach(() => {
      seedFavorite(mockRecipeDetail);
    });

    it("renders a DrinkCard for each saved favorite", () => {
      renderApp(["/favorites"]);

      expect(screen.getByText("Mojito")).toBeInTheDocument();
      expect(screen.getByRole("article")).toBeInTheDocument();
    });

    it("shows the correct recipe count", () => {
      renderApp(["/favorites"]);

      expect(screen.getByText(/1 recipe saved/i)).toBeInTheDocument();
    });

    it("does not show the empty state when there are favorites", () => {
      renderApp(["/favorites"]);

      expect(screen.queryByText("No Favorites Yet")).not.toBeInTheDocument();
    });

    it("shows plural 'recipes' label when there are multiple favorites", () => {
      const secondRecipe: RecipeDetail = {
        ...mockRecipeDetail,
        idDrink: "2",
        strDrink: "Daiquiri",
      };

      useAppStore.setState((state) => ({
        favorites: {
          ...state.favorites,
          [secondRecipe.idDrink]: secondRecipe,
        },
      }));

      renderApp(["/favorites"]);

      expect(screen.getByText(/2 recipes saved/i)).toBeInTheDocument();
    });
  });

  describe("Add to favorites", () => {
    it("adds a drink to favorites when the heart button is clicked", async () => {
      const user = userEvent.setup();

      renderApp(["/"]);

      useAppStore.setState({
        drinks: { drinks: [mockDrink] },
        hasSearched: true,
      });

      const addButton = await screen.findByRole("button", {
        name: /add mojito to favorites/i,
      });

      await user.click(addButton);

      await waitFor(() => {
        expect(useAppStore.getState().favorites["1"]).toBeDefined();
      });
    });

    it("shows a success notification after adding to favorites", async () => {
      const user = userEvent.setup();

      useAppStore.setState({
        drinks: { drinks: [mockDrink] },
        hasSearched: true,
      });

      renderApp(["/"]);

      const addButton = await screen.findByRole("button", {
        name: /add mojito to favorites/i,
      });

      await user.click(addButton);

      await waitFor(() => {
        expect(useAppStore.getState().notification).toEqual({
          message: "Added to favorites",
          type: "success",
        });
      });
    });

    it("button shows aria-pressed=true after adding to favorites", async () => {
      const user = userEvent.setup();

      useAppStore.setState({
        drinks: { drinks: [mockDrink] },
        hasSearched: true,
      });

      renderApp(["/"]);

      const addButton = await screen.findByRole("button", {
        name: /add mojito to favorites/i,
      });

      await user.click(addButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /remove mojito from favorites/i }),
        ).toHaveAttribute("aria-pressed", "true");
      });
    });

    it("shows error notification when the lookup API fails", async () => {
      const user = userEvent.setup();

      server.use(
        http.get(
          "https://www.thecocktaildb.com/api/json/v1/1/lookup.php",
          () => HttpResponse.error(),
        ),
      );

      useAppStore.setState({
        drinks: { drinks: [mockDrink] },
        hasSearched: true,
      });

      renderApp(["/"]);

      const addButton = await screen.findByRole("button", {
        name: /add mojito to favorites/i,
      });

      await user.click(addButton);

      await waitFor(() => {
        expect(useAppStore.getState().notification).toEqual({
          message: "Unable to load cocktail details",
          type: "error",
        });
      });
    });

    it("does not add to favorites when lookup returns no drinks", async () => {
      const user = userEvent.setup();

      server.use(
        http.get(
          "https://www.thecocktaildb.com/api/json/v1/1/lookup.php",
          () => HttpResponse.json({ drinks: null }),
        ),
      );

      useAppStore.setState({
        drinks: { drinks: [mockDrink] },
        hasSearched: true,
      });

      renderApp(["/"]);

      const addButton = await screen.findByRole("button", {
        name: /add mojito to favorites/i,
      });

      await user.click(addButton);

      await waitFor(() => {
        expect(useAppStore.getState().favorites["1"]).toBeUndefined();
        expect(useAppStore.getState().notification?.type).toBe("error");
      });
    });
  });

  describe("Remove from favorites", () => {
    beforeEach(() => {
      seedFavorite(mockRecipeDetail);
    });

    it("removes a drink from favorites when the heart button is clicked on FavoritesPage", async () => {
      const user = userEvent.setup();

      renderApp(["/favorites"]);

      const card = screen.getByRole("article");
      const removeButton = within(card).getByRole("button", {
        name: /remove mojito from favorites/i,
      });

      await user.click(removeButton);

      await waitFor(() => {
        expect(useAppStore.getState().favorites["1"]).toBeUndefined();
      });
    });

    it("shows an info notification after removing a favorite", async () => {
      const user = userEvent.setup();

      renderApp(["/favorites"]);

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

    it("shows empty state after removing the last favorite", async () => {
      const user = userEvent.setup();

      renderApp(["/favorites"]);

      const card = screen.getByRole("article");
      const removeButton = within(card).getByRole("button", {
        name: /remove mojito from favorites/i,
      });

      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText("No Favorites Yet")).toBeInTheDocument();
      });
    });
  });

  describe("Favorites persistence", () => {
    it("favorites survive a store re-read (state is retained in memory)", () => {
      seedFavorite(mockRecipeDetail);

      const favorites = useAppStore.getState().favorites;

      expect(favorites["1"]).toMatchObject({
        idDrink: "1",
        strDrink: "Mojito",
      });
    });

    it("isFavorite selector returns true for a saved drink", () => {
      seedFavorite(mockRecipeDetail);

      expect(useAppStore.getState().isFavorite("1")).toBe(true);
    });

    it("isFavorite selector returns false for a drink not in favorites", () => {
      expect(useAppStore.getState().isFavorite("999")).toBe(false);
    });
  });
});
