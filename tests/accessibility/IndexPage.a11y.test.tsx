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
    drinks:        { drinks: [] },
    isLoading:     false,
    hasSearched:   false,
    favorites:     {},
    favoriteOrder: {},
    notification:  null,
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

  // ── axe automated audits ──────────────────────────────────────────────

  it("has no accessibility violations in the empty state", async () => {
    const { container } = renderIndexPage();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations in the loading state", async () => {
    useAppStore.setState({ isLoading: true });

    const { container } = renderIndexPage();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations when drinks are displayed", async () => {
    const drink = makeDrink({ strDrink: "Margarita" });

    useAppStore.setState({
      drinks:      { drinks: [drink] },
      hasSearched: true,
      isLoading:   false,
    });

    const { container } = renderIndexPage();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // ── Empty state ───────────────────────────────────────────────────────

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

  // ── Loading state ─────────────────────────────────────────────────────

  it("shows the correct loading message during fetch", () => {
    useAppStore.setState({ isLoading: true });

    renderIndexPage();

    expect(
      screen.getByText(/mixing the perfect drinks…/i),
    ).toBeInTheDocument();
  });

  it("renders 20 skeleton cards with role=presentation while loading", () => {
    useAppStore.setState({ isLoading: true });

    renderIndexPage();

    const skeletons = screen.getAllByRole("presentation", { hidden: true });
    expect(skeletons).toHaveLength(20);
  });

  // ── Results state ─────────────────────────────────────────────────────

  it("renders the Results heading when drinks are present", () => {
    const drink = makeDrink({ strDrink: "Margarita" });

    useAppStore.setState({
      drinks:      { drinks: [drink] },
      hasSearched: true,
      isLoading:   false,
    });

    renderIndexPage();

    expect(
      screen.getByRole("heading", { name: /^results$/i }),
    ).toBeInTheDocument();
  });

  it("shows the recipe count label when drinks are present", () => {
    const drink = makeDrink({ strDrink: "Margarita" });

    useAppStore.setState({
      drinks:      { drinks: [drink] },
      hasSearched: true,
      isLoading:   false,
    });

    renderIndexPage();

    // Single result → "1 recipe found" (singular)
    expect(screen.getByText("1 recipe found")).toBeInTheDocument();
  });

  it("drink cards are wrapped in articles with aria-labelledby", () => {
    const drink = makeDrink({ strDrink: "Margarita" });

    useAppStore.setState({
      drinks:      { drinks: [drink] },
      hasSearched: true,
      isLoading:   false,
    });

    renderIndexPage();

    const article = screen.getByRole("article");
    expect(article).toHaveAttribute(
      "aria-labelledby",
      `drink-title-${drink.idDrink}`,
    );
  });

  it("results section has aria-label for screen readers", () => {
    renderIndexPage();

    expect(
      screen.getByRole("region", { name: /search results/i }),
    ).toBeInTheDocument();
  });

  // ── Decorative elements are hidden from AT ────────────────────────────

  it("hero ticker strip is aria-hidden", () => {
    renderIndexPage();

    const ticker = document.querySelector(".hero-ticker");
    expect(ticker).toHaveAttribute("aria-hidden", "true");
  });

  it("hero bubble zone is aria-hidden", () => {
    renderIndexPage();

    const zone = document.querySelector(".hero-bubble-zone");
    expect(zone).toHaveAttribute("aria-hidden", "true");
  });

  it("mesh gradient layer is aria-hidden", () => {
    renderIndexPage();

    const mesh = document.querySelector(".hero-mesh");
    expect(mesh).toHaveAttribute("aria-hidden", "true");
  });

  it("scroll arrow has a descriptive aria-label", () => {
    renderIndexPage();

    expect(
      screen.getByRole("button", { name: /scroll to results/i }),
    ).toBeInTheDocument();
  });
});
