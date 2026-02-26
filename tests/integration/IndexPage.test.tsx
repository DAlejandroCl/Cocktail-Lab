import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "../mocks/server";
import { useAppStore } from "@/stores/useAppStore";
import IndexPage from "@/views/IndexPage";

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

/**
 * IndexPage no necesita Routes/Layout, pero DrinkCard llama a selectRecipe
 * (que abre el Modal) y éste usa useNavigate internamente via headlessui.
 * Envolver en MemoryRouter evita el error "useNavigate outside Router".
 */
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
    drinks: { drinks: [] },
    isLoading: false,
    hasSearched: false,
    notification: null,
    favorites: {},
  });
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("IndexPage — Integration", () => {

  // ── Estado inicial ────────────────────────────────────────────────────

  describe("initial state", () => {
    it("renders the empty state heading", () => {
      renderIndexPage();

      // Texto real del componente — h2 cuando no hay drinks
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

  // ── Loading state ─────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows 8 skeleton cards while fetching", async () => {
      const user = userEvent.setup();

      // Delay the MSW response so we can assert the loading UI
      server.use(
        http.get(
          "https://www.thecocktaildb.com/api/json/v1/1/random.php",
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return HttpResponse.json({
              drinks: [
                {
                  idDrink: "1",
                  strDrink: "Mojito",
                  strDrinkThumb: "https://image.com/mojito.jpg",
                },
              ],
            });
          },
        ),
      );

      renderIndexPage();

      await user.click(
        screen.getByRole("button", { name: /browse all recipes/i }),
      );

      // SkeletonDrinkCard tiene role="presentation" y aria-hidden="true"
      // Necesitamos { hidden: true } para que Testing Library los encuentre
      const skeletons = screen.getAllByRole("presentation", { hidden: true });
      expect(skeletons).toHaveLength(8);
    });

    it("shows the loading subtitle text while fetching", async () => {
      const user = userEvent.setup();

      server.use(
        http.get(
          "https://www.thecocktaildb.com/api/json/v1/1/random.php",
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return HttpResponse.json({
              drinks: [
                {
                  idDrink: "1",
                  strDrink: "Mojito",
                  strDrinkThumb: "https://image.com/mojito.jpg",
                },
              ],
            });
          },
        ),
      );

      renderIndexPage();

      await user.click(
        screen.getByRole("button", { name: /browse all recipes/i }),
      );

      // Texto real del JSX: "Mixing the perfect drinks for you…"
      expect(
        screen.getByText(/mixing the perfect drinks for you/i),
      ).toBeInTheDocument();
    });
  });

  // ── Resultado exitoso ─────────────────────────────────────────────────

  describe("successful fetch", () => {
    it("displays drink cards after fetching", async () => {
      const user = userEvent.setup();

      renderIndexPage();

      await user.click(
        screen.getByRole("button", { name: /browse all recipes/i }),
      );

      await waitFor(() => {
        expect(screen.getByText("Mojito")).toBeInTheDocument();
      });
    });

    it("shows the correct recipe count after fetching", async () => {
      const user = userEvent.setup();

      renderIndexPage();

      await user.click(
        screen.getByRole("button", { name: /browse all recipes/i }),
      );

      // "Found 1 recipe" — singular porque el handler devuelve 1 drink
      await waitFor(() => {
        expect(screen.getByText(/found 1 recipe/i)).toBeInTheDocument();
      });
    });

    it("shows plural 'recipes' label when multiple drinks are returned", () => {
      // Override handler para devolver 2 drinks
      server.use(
        http.get(
          "https://www.thecocktaildb.com/api/json/v1/1/random.php",
          () =>
            HttpResponse.json({
              drinks: [
                {
                  idDrink: "1",
                  strDrink: "Mojito",
                  strDrinkThumb: "https://image.com/mojito.jpg",
                },
              ],
            }),
        ),
      );

      // Seed directamente 2 drinks en el store para evitar depender
      // del número de llamadas paralelas que hace getRandomRecipes(150)
      useAppStore.setState({
        drinks: { drinks: [
          { idDrink: "1", strDrink: "Mojito", strDrinkThumb: "https://image.com/mojito.jpg" },
          { idDrink: "2", strDrink: "Daiquiri", strDrinkThumb: "https://image.com/daiquiri.jpg" },
        ]},
        hasSearched: true,
        isLoading: false,
      });

      renderIndexPage();

      expect(screen.getByText(/found 2 recipes/i)).toBeInTheDocument();
    });

    it("replaces the empty state heading with 'Featured Mixes' after drinks load", async () => {
      const user = userEvent.setup();

      renderIndexPage();

      await user.click(
        screen.getByRole("button", { name: /browse all recipes/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /featured mixes/i }),
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
        expect(screen.getByText("Mojito")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("presentation", { hidden: true }),
      ).not.toBeInTheDocument();
    });
  });

  // ── Sin resultados ────────────────────────────────────────────────────

  describe("empty results", () => {
    it("shows an info notification when no drinks are found", async () => {
      // Seed el estado post-búsqueda sin resultados directamente.
      // No se puede usar el botón "Browse All" para este caso porque
      // handleBrowseAll siempre pasa { category: "", ingredient: "" }
      // lo que activa getRandomRecipes(150), nunca un resultado vacío.
      // La forma correcta es simular el estado que el slice produciría
      // tras una búsqueda sin resultados.
      useAppStore.setState({
        drinks: { drinks: [] },
        isLoading: false,
        hasSearched: true,
        notification: null,
      });

      renderIndexPage();

      // El useEffect de IndexPage dispara setNotification cuando:
      // hasSearched=true && !isLoading && drinks.length === 0
      await waitFor(() => {
        expect(useAppStore.getState().notification).toEqual({
          message: "No cocktails found with those filters",
          type: "info",
        });
      });
    });

    it("does not show notification on initial render (hasSearched=false)", () => {
      // hasSearched=false por defecto — el useEffect no debe disparar
      renderIndexPage();

      expect(useAppStore.getState().notification).toBeNull();
    });

    it("keeps showing empty state UI when no drinks found", () => {
      useAppStore.setState({
        drinks: { drinks: [] },
        isLoading: false,
        hasSearched: true,
      });

      renderIndexPage();

      // El empty state sigue visible (no hay drinks que mostrar)
      expect(
        screen.getByRole("heading", { name: /your perfect mix awaits/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Accesibilidad ─────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("Browse All button is keyboard accessible", async () => {
      renderIndexPage();

      const button = screen.getByRole("button", { name: /browse all recipes/i });

      button.focus();
      expect(button).toHaveFocus();
    });

    it("drink cards are rendered as articles with accessible names", async () => {
      useAppStore.setState({
        drinks: { drinks: [
          { idDrink: "1", strDrink: "Mojito", strDrinkThumb: "https://image.com/mojito.jpg" },
        ]},
        hasSearched: true,
        isLoading: false,
      });

      renderIndexPage();

      const article = screen.getByRole("article");
      expect(article).toHaveAttribute("aria-labelledby", "drink-title-1");
    });
  });
});
