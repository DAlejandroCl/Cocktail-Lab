import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import DrinkCard from "@/components/DrinkCard";
import { useAppStore } from "@/stores/useAppStore";
import type { Drink } from "@/types";

expect.extend(toHaveNoViolations);

/* -------------------------------------------------- */
/*                 Mock fetch                         */
/* -------------------------------------------------- */

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ drinks: [] }))
    )
  );

  useAppStore.setState({
    ...useAppStore.getState(),
    favorites: {},
    notification: null,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/* -------------------------------------------------- */
/*                 Mock Drink                         */
/* -------------------------------------------------- */

const mockDrink: Drink = {
  idDrink: "123",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strCategory: "Cocktail",
} as Drink;

/* -------------------------------------------------- */
/*                Reset Zustand Store                 */
/* -------------------------------------------------- */

beforeEach(() => {
  const store = useAppStore.getState();

  useAppStore.setState({
    ...store,
    favorites: {},
    notification: null,
  });
});

/* -------------------------------------------------- */
/*                    Tests                           */
/* -------------------------------------------------- */

describe("DrinkCard Accessibility", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<DrinkCard drink={mockDrink} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it("has properly associated heading", () => {
    render(<DrinkCard drink={mockDrink} />);

    const heading = screen.getByRole("heading", {
      name: "Mojito",
    });

    expect(heading).toBeInTheDocument();
  });

  it("favorite button has accessible label", () => {
    render(<DrinkCard drink={mockDrink} />);

    const button = screen.getByRole("button", {
      name: /add mojito to favorites/i,
    });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("view recipe button is accessible", () => {
    render(<DrinkCard drink={mockDrink} />);

    const button = screen.getByRole("button", {
      name: /view recipe/i,
    });

    expect(button).toBeInTheDocument();
  });

  it("image has proper alt text", () => {
    render(<DrinkCard drink={mockDrink} />);

    const image = screen.getByRole("img", {
      name: "Mojito",
    });

    expect(image).toBeInTheDocument();
  });
});