import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "@/stores/useAppStore";
import Header from "@/components/Header";

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

function renderHeader(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
}

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  useAppStore.setState({
    categories: [],
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

describe("Header — Integration", () => {

  describe("layout", () => {
    it("renders the Cocktail Lab logo link", () => {
      renderHeader();

      expect(screen.getByRole("link", { name: /cocktail lab/i })).toBeInTheDocument();
    });

    it("logo link points to /", () => {
      renderHeader();

      expect(
        screen.getByRole("link", { name: /cocktail lab/i }),
      ).toHaveAttribute("href", "/");
    });

    it("renders the Home nav link", () => {
      renderHeader();

      // Desktop + mobile navs both render a "Home" link — use getAllByRole
      const homeLinks = screen.getAllByRole("link", { name: /^home$/i });
      expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("renders the Favorites nav link", () => {
      renderHeader();

      const favLinks = screen.getAllByRole("link", { name: /^favorites$/i });
      expect(favLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("renders the navigation landmark with accessible label", () => {
      renderHeader();

      // Desktop nav: "Main navigation", mobile nav: "Main navigation mobile"
      // Both are present — assert the desktop one specifically.
      expect(
        screen.getByRole("navigation", { name: "Main navigation" }),
      ).toBeInTheDocument();
    });

    it("does not render the search form", () => {
      // SearchForm lives in HeroSection/IndexPage, not in Header.
      renderHeader("/");

      expect(screen.queryByRole("search")).not.toBeInTheDocument();
    });
  });

  describe("active link state", () => {
    it("marks the Home link as active on the / route", () => {
      renderHeader("/");

      const homeLinks = screen.getAllByRole("link", { name: /^home$/i });
      const hasActive = homeLinks.some(
        (el) => el.getAttribute("aria-current") === "page",
      );
      expect(hasActive).toBe(true);
    });

    it("marks the Favorites link as active on the /favorites route", () => {
      renderHeader("/favorites");

      const favLinks = screen.getAllByRole("link", { name: /^favorites$/i });
      const hasActive = favLinks.some(
        (el) => el.getAttribute("aria-current") === "page",
      );
      expect(hasActive).toBe(true);
    });
  });

  describe("theme toggle", () => {
    it("renders a theme toggle button", () => {
      renderHeader();

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("accessibility", () => {
    it("renders inside a header landmark", () => {
      const { container } = renderHeader();

      expect(container.querySelector("header")).toBeInTheDocument();
    });

    it("applies the bordered modifier on non-home routes", () => {
      const { container } = renderHeader("/favorites");

      expect(
        container.querySelector(".site-header--bordered"),
      ).toBeInTheDocument();
    });

    it("does not apply the bordered modifier on the home route", () => {
      const { container } = renderHeader("/");

      expect(
        container.querySelector(".site-header--bordered"),
      ).not.toBeInTheDocument();
    });
  });
});
