import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Suspense } from "react";
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
        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </MemoryRouter>
    );

    // "Ready to Mix" is the IndexPage empty-state heading — unique to that view
    expect(
      await screen.findByRole("heading", { name: /ready to mix/i })
    ).toBeInTheDocument();
  });

  it("renders FavoritesPage on '/favorites'", async () => {
    render(
      <MemoryRouter initialEntries={["/favorites"]}>
        <Suspense fallback={<div>Loading...</div>}>
          <AppRoutes />
        </Suspense>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /my favorites/i })
    ).toBeInTheDocument();
  });
});
