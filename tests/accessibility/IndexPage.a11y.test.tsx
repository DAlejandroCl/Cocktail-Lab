import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { MemoryRouter } from "react-router-dom";
import IndexPage from "@/views/IndexPage";
import { useAppStore } from "@/stores/useAppStore";
import { makeDrink } from "../mocks/factories";

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  useAppStore.setState({
    drinks: { drinks: [] },
    isLoading: false,
    hasSearched: false,
    favorites: {},
    notification: null,
  });
});

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
// Tests
// ─────────────────────────────────────────────

describe("IndexPage — Accessibility", () => {

  it("has no accessibility violations in the empty state", async () => {
    const { container } = renderIndexPage();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders the empty state heading accessibly", () => {
    renderIndexPage();

    expect(
      screen.getByRole("heading", { name: /your perfect mix awaits/i }),
    ).toBeInTheDocument();
  });

  it("Browse All Recipes button is accessible in the empty state", () => {
    renderIndexPage();

    expect(
      screen.getByRole("button", { name: /browse all recipes/i }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations in the loading state", async () => {
    useAppStore.setState({ isLoading: true });

    const { container } = renderIndexPage();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("shows the loading message during fetch", () => {
    useAppStore.setState({ isLoading: true });

    renderIndexPage();

    expect(
      screen.getByText(/mixing the perfect drinks for you/i),
    ).toBeInTheDocument();
  });

  it("renders 8 skeleton cards with aria-hidden while loading", () => {
    useAppStore.setState({ isLoading: true });

    renderIndexPage();

    const skeletons = screen.getAllByRole("presentation", { hidden: true });
    expect(skeletons).toHaveLength(8);
  });

  it("has no accessibility violations when drinks are displayed", async () => {
    const drink = makeDrink({ strDrink: "Margarita" });

    useAppStore.setState({
      drinks: { drinks: [drink] },
      hasSearched: true,
      isLoading: false,
    });

    const { container } = renderIndexPage();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders the Featured Mixes heading when drinks are present", () => {
    const drink = makeDrink({ strDrink: "Margarita" });

    useAppStore.setState({
      drinks: { drinks: [drink] },
      hasSearched: true,
      isLoading: false,
    });

    renderIndexPage();

    expect(
      screen.getByRole("heading", { name: /featured mixes/i }),
    ).toBeInTheDocument();
  });

  it("shows the recipe count when drinks are present", () => {
    const drink = makeDrink({ strDrink: "Margarita" });

    useAppStore.setState({
      drinks: { drinks: [drink] },
      hasSearched: true,
      isLoading: false,
    });

    renderIndexPage();

    expect(screen.getByText(/found 1 recipe/i)).toBeInTheDocument();
  });

  it("drink cards are wrapped in articles with aria-labelledby", () => {
    const drink = makeDrink({ strDrink: "Margarita" });

    useAppStore.setState({
      drinks: { drinks: [drink] },
      hasSearched: true,
      isLoading: false,
    });

    renderIndexPage();

    const article = screen.getByRole("article");
    expect(article).toHaveAttribute(
      "aria-labelledby",
      `drink-title-${drink.idDrink}`,
    );
  });

  it("View All button is accessible when drinks are present", () => {
    const drink = makeDrink({ strDrink: "Margarita" });

    useAppStore.setState({
      drinks: { drinks: [drink] },
      hasSearched: true,
      isLoading: false,
    });

    renderIndexPage();

    expect(
      screen.getByRole("button", { name: /view all/i }),
    ).toBeInTheDocument();
  });
});
