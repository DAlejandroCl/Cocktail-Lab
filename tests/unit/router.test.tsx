import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "@/router";

/* -------------------------------------------------- */
/*                     Mocks                          */
/* -------------------------------------------------- */

vi.mock("@/stores/useAppStore", () => ({
  useAppStore: vi.fn((selector: (s: object) => unknown) =>
    selector({
      categories: [],
      drinks: { drinks: [] },
      isLoading: false,
      hasSearched: false,
      notification: null,
      favorites: {},
      modal: false,
      selectedRecipe: null,
      fetchCategories: vi.fn(),
      searchRecipes: vi.fn(),
      selectRecipe: vi.fn(),
      openRecipeModal: vi.fn(),
      closeModal: vi.fn(),
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorite: () => false,
      setNotification: vi.fn(),
      clearNotification: vi.fn(),
    })
  ),
}));

/* ================================================== */
/*                        TESTS                       */
/* ================================================== */

describe("AppRoutes", () => {
  it("renders IndexPage on '/'", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // "Your Perfect Mix Awaits" is the IndexPage empty-state heading — unique to that view
    expect(
      await screen.findByRole("heading", { name: /your perfect mix awaits/i })
    ).toBeInTheDocument();
  });

  it("renders FavoritesPage on '/favorites'", async () => {
    render(
      <MemoryRouter initialEntries={["/favorites"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /my favorites/i })
    ).toBeInTheDocument();
  });

  it("renders NotFoundPage on an unknown route", async () => {
    render(
      <MemoryRouter initialEntries={["/this-does-not-exist"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // NotFoundPage renders an h1 with "Recipe Not Found"
    expect(
      await screen.findByRole("heading", { name: /recipe not found/i })
    ).toBeInTheDocument();
  });
});
