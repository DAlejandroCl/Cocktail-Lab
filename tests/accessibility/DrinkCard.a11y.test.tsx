import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import DrinkCard from "@/components/DrinkCard";
import { useAppStore } from "@/stores/useAppStore";
import type { Drink } from "@/types";

// ─────────────────────────────────────────────
// Fixture
// ─────────────────────────────────────────────

const mockDrink: Drink = {
  idDrink: "123",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strCategory: "Cocktail",
};

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ drinks: [] }), {
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );

  useAppStore.setState({
    favorites: {},
    notification: null,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("DrinkCard — Accessibility", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<DrinkCard drink={mockDrink} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has a properly associated heading for the drink name", () => {
    render(<DrinkCard drink={mockDrink} />);

    expect(
      screen.getByRole("heading", { name: "Mojito" }),
    ).toBeInTheDocument();
  });

  it("favorite button has an accessible label and aria-pressed=false when not a favorite", () => {
    render(<DrinkCard drink={mockDrink} />);

    const button = screen.getByRole("button", {
      name: /add mojito to favorites/i,
    });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("View Recipe button is accessible", () => {
    render(<DrinkCard drink={mockDrink} />);

    expect(
      screen.getByRole("button", { name: /view recipe/i }),
    ).toBeInTheDocument();
  });

  it("image has descriptive alt text", () => {
    render(<DrinkCard drink={mockDrink} />);

    expect(screen.getByRole("img", { name: "Mojito" })).toBeInTheDocument();
  });

  it("card is wrapped in an article with aria-labelledby pointing to the drink title", () => {
    render(<DrinkCard drink={mockDrink} />);

    const article = screen.getByRole("article");
    expect(article).toHaveAttribute("aria-labelledby", "drink-title-123");
  });
});
