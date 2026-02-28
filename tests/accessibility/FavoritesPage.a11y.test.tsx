import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { MemoryRouter } from "react-router-dom";
import FavoritesPage from "@/views/FavoritesPage";
import { useAppStore } from "@/stores/useAppStore";
import { makeRecipeDetail, toFavoritesMap } from "../mocks/factories";

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
// Helper
// ─────────────────────────────────────────────

function renderFavoritesPage() {
  return render(
    <MemoryRouter>
      <FavoritesPage />
    </MemoryRouter>,
  );
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("FavoritesPage — Accessibility", () => {

  it("has no accessibility violations in the empty state", async () => {
    const { container } = renderFavoritesPage();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders the empty state heading accessibly", () => {
    renderFavoritesPage();

    expect(
      screen.getByRole("heading", { name: /no favorites yet/i }),
    ).toBeInTheDocument();
  });

  it("renders a main landmark", () => {
    renderFavoritesPage();

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("has no accessibility violations with favorites present", async () => {
    const recipe = makeRecipeDetail({ strDrink: "Margarita" });
    useAppStore.setState({ favorites: toFavoritesMap([recipe]) });

    const { container } = renderFavoritesPage();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders the My Favorites heading when favorites exist", () => {
    const recipe = makeRecipeDetail({ strDrink: "Margarita" });
    useAppStore.setState({ favorites: toFavoritesMap([recipe]) });

    renderFavoritesPage();

    expect(
      screen.getByRole("heading", { name: /my favorites/i }),
    ).toBeInTheDocument();
  });

  it("shows the correct recipe count when favorites exist", () => {
    const recipe = makeRecipeDetail({ strDrink: "Margarita" });
    useAppStore.setState({ favorites: toFavoritesMap([recipe]) });

    renderFavoritesPage();

    expect(screen.getByText(/1 recipe saved/i)).toBeInTheDocument();
  });

  it("each drink card has an accessible article with aria-labelledby", () => {
    const recipe = makeRecipeDetail({ strDrink: "Margarita" });
    useAppStore.setState({ favorites: toFavoritesMap([recipe]) });

    renderFavoritesPage();

    const article = screen.getByRole("article");
    expect(article).toHaveAttribute(
      "aria-labelledby",
      `drink-title-${recipe.idDrink}`,
    );
  });
});
