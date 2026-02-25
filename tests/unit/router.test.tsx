import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Suspense } from "react";
import { AppRoutes } from "@/router";

/* -------------------------------------------------- */
/*                     Mocks                          */
/* -------------------------------------------------- */

vi.mock("@/layouts/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock("@/views/IndexPage", () => ({
  default: () => <div data-testid="index-page">Index Page</div>,
}));

vi.mock("@/views/FavoritesPage", () => ({
  default: () => <div data-testid="favorites-page">Favorites Page</div>,
}));

/* ================================================== */
/*                        TESTS                       */
/* ================================================== */

describe("AppRoutes", () => {
  it("renders IndexPage on '/'", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Suspense fallback={null}>
          <AppRoutes />
        </Suspense>
      </MemoryRouter>
    );

    expect(screen.getByTestId("index-page")).toBeInTheDocument();
  });

  it("renders FavoritesPage on '/favorites'", () => {
    render(
      <MemoryRouter initialEntries={["/favorites"]}>
        <Suspense fallback={null}>
          <AppRoutes />
        </Suspense>
      </MemoryRouter>
    );

    expect(screen.getByTestId("favorites-page")).toBeInTheDocument();
  });
});