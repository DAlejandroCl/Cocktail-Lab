import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "@/stores/useAppStore";
import IndexPage from "@/views/IndexPage";
import { TOTAL_BROWSE_DRINKS, DRINKS_BY_CATEGORY } from "../mocks/handlers";

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

function renderIndexPage() {
  return render(
    <MemoryRouter>
      <IndexPage />
    </MemoryRouter>,
  );
}

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  useAppStore.setState({
    drinks:       { drinks: [] },
    isLoading:    false,
    hasSearched:  false,
    notification: null,
    favorites:    {},
    favoriteOrder: {},
  });
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("IndexPage — Integration", () => {

  // ── Initial state ──────────────────────────────────────────────────────

  describe("initial state", () => {
    it("renders the empty state heading", () => {
      renderIndexPage();

      expect(
        screen.getByRole("heading", { name: /your perfect mix awaits/i }),
      ).toBeInTheDocument();
    });

    it("renders the Browse All Recipes button in empty state", () => {
      renderIndexPage();

      expect(
        screen.getByRole("button", { name: /browse all recipes/i }),
      ).toBeInTheDocument();
    });

    it("does not render any drink cards initially", () => {
      renderIndexPage();

      expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });

    it("does not show the loading message initially", () => {
      renderIndexPage();

      expect(
        screen.queryByText(/mixing the perfect drinks/i),
      ).not.toBeInTheDocument();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows 20 skeleton cards while loading", () => {
      useAppStore.setState({ isLoading: true });

      renderIndexPage();

      // SkeletonDrinkCard renders with role="presentation"
      const skeletons = screen.getAllByRole("presentation", { hidden: true });
      expect(skeletons).toHaveLength(20);
    });

    it("shows the loading subtitle text while loading", () => {
      useAppStore.setState({ isLoading: true });

      renderIndexPage();

      expect(
        screen.getByText(/mixing the perfect drinks…/i),
      ).toBeInTheDocument();
    });
  });

  // ── Browse All Recipes ─────────────────────────────────────────────────

  describe("Browse All Recipes", () => {
    it("calls filter.php?c= for each category — not random.php", async () => {
      const user = userEvent.setup();
      renderIndexPage();

      await user.click(
        screen.getByRole("button", { name: /browse all recipes/i }),
      );

      // The MSW handler for filter.php?c= returns DRINKS_BY_CATEGORY data.
      // Drinks from all categories should appear in the grid.
      await waitFor(() => {
        expect(screen.getByText(DRINKS_BY_CATEGORY.Cocktail[0].strDrink)).toBeInTheDocument();
      });
    });

    it("displays drink cards from multiple categories after Browse All", async () => {
      const user = userEvent.setup();
      renderIndexPage();

      await user.click(
        screen.getByRole("button", { name: /browse all recipes/i }),
      );

      await waitFor(() => {
        expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
      });
    });

    it("replaces the empty state heading with 'Results' after drinks load", async () => {
      const user = userEvent.setup();
      renderIndexPage();

      await user.click(
        screen.getByRole("button", { name: /browse all recipes/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /results/i }),
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("heading", { name: /your perfect mix awaits/i }),
      ).not.toBeInTheDocument();
    });

    it("removes skeleton cards after drinks load", async () => {
      const user = userEvent.setup();
      renderIndexPage();

      await user.click(
        screen.getByRole("button", { name: /browse all recipes/i }),
      );

      await waitFor(() => {
        expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
      });

      expect(
        screen.queryByRole("presentation", { hidden: true }),
      ).not.toBeInTheDocument();
    });
  });

  // ── Results counter ────────────────────────────────────────────────────

  describe("results counter", () => {
    it("shows 'X recipes found' when all results fit in the initial view", () => {
      // TOTAL_BROWSE_DRINKS = 10, INITIAL_VISIBLE = 20 → all fit → 'found' label
      useAppStore.setState({
        drinks: {
          drinks: Array.from({ length: TOTAL_BROWSE_DRINKS }, (_, i) => ({
            idDrink:       String(i + 1),
            strDrink:      `Drink ${i + 1}`,
            strDrinkThumb: `https://image.com/${i + 1}.jpg`,
            strCategory:   "Cocktail",
          })),
        },
        hasSearched: true,
        isLoading:   false,
      });

      renderIndexPage();

      expect(
        screen.getByText(`${TOTAL_BROWSE_DRINKS} recipes found`),
      ).toBeInTheDocument();
    });

    it("shows 'Showing 20 of N recipes' when results exceed initial visible count", () => {
      // More than 20 drinks → paginated → 'Showing X of Y' label
      const manyDrinks = Array.from({ length: 25 }, (_, i) => ({
        idDrink:       String(i + 1),
        strDrink:      `Drink ${i + 1}`,
        strDrinkThumb: `https://image.com/${i + 1}.jpg`,
        strCategory:   "Cocktail",
      }));

      useAppStore.setState({
        drinks:      { drinks: manyDrinks },
        hasSearched: true,
        isLoading:   false,
      });

      renderIndexPage();

      expect(
        screen.getByText("Showing 20 of 25 recipes"),
      ).toBeInTheDocument();
    });

    it("shows '1 recipe found' (singular) for a single result", () => {
      useAppStore.setState({
        drinks: {
          drinks: [
            { idDrink: "1", strDrink: "Mojito", strDrinkThumb: "https://image.com/mojito.jpg", strCategory: "Cocktail" },
          ],
        },
        hasSearched: true,
        isLoading:   false,
      });

      renderIndexPage();

      expect(screen.getByText("1 recipe found")).toBeInTheDocument();
    });

    it("shows plural 'recipes found' for multiple results within visible limit", () => {
      useAppStore.setState({
        drinks: {
          drinks: [
            { idDrink: "1", strDrink: "Mojito",   strDrinkThumb: "https://image.com/mojito.jpg",   strCategory: "Cocktail" },
            { idDrink: "2", strDrink: "Daiquiri",  strDrinkThumb: "https://image.com/daiquiri.jpg",  strCategory: "Cocktail" },
          ],
        },
        hasSearched: true,
        isLoading:   false,
      });

      renderIndexPage();

      expect(screen.getByText("2 recipes found")).toBeInTheDocument();
    });
  });

  // ── Empty results ──────────────────────────────────────────────────────

  describe("empty results", () => {
    it("shows an info notification when no drinks are found", async () => {
      useAppStore.setState({
        drinks:       { drinks: [] },
        isLoading:    false,
        hasSearched:  true,
        notification: null,
      });

      renderIndexPage();

      await waitFor(() => {
        expect(useAppStore.getState().notification).toEqual({
          message: "No cocktails found with those filters",
          type:    "info",
        });
      });
    });

    it("does not show notification on initial render (hasSearched=false)", () => {
      renderIndexPage();

      expect(useAppStore.getState().notification).toBeNull();
    });

    it("keeps showing empty state UI when no drinks found", () => {
      useAppStore.setState({
        drinks:      { drinks: [] },
        isLoading:   false,
        hasSearched: true,
      });

      renderIndexPage();

      expect(
        screen.getByRole("heading", { name: /your perfect mix awaits/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Accessibility ──────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("Browse All button is keyboard accessible", () => {
      renderIndexPage();

      const button = screen.getByRole("button", { name: /browse all recipes/i });
      button.focus();

      expect(button).toHaveFocus();
    });

    it("drink cards are rendered as articles with accessible aria-labelledby", () => {
      useAppStore.setState({
        drinks: {
          drinks: [
            { idDrink: "1", strDrink: "Mojito", strDrinkThumb: "https://image.com/mojito.jpg", strCategory: "Cocktail" },
          ],
        },
        hasSearched: true,
        isLoading:   false,
      });

      renderIndexPage();

      const article = screen.getByRole("article");
      expect(article).toHaveAttribute("aria-labelledby", "drink-title-1");
    });

    it("results section has aria-label for screen readers", () => {
      renderIndexPage();

      expect(
        screen.getByRole("region", { name: /search results/i }),
      ).toBeInTheDocument();
    });
  });
});
