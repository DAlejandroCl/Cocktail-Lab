import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Modal from "@/components/Modal";
import { useAppStore } from "@/stores/useAppStore";
import type { RecipeDetail } from "@/types";

expect.extend(toHaveNoViolations);

/* -------------------------------------------------- */
/*                   Mock Recipe                      */
/* -------------------------------------------------- */

const mockRecipe: RecipeDetail = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strInstructions: "Mix ingredients. Serve chilled.",
  strIngredient1: "Rum",
  strMeasure1: "50ml",
} as RecipeDetail;

/* -------------------------------------------------- */
/*              Reset Zustand Store                   */
/* -------------------------------------------------- */

beforeEach(() => {
  useAppStore.setState({
    ...useAppStore.getState(),
    modal: true,
    selectedRecipe: mockRecipe,
    favorites: {},
  });
});

/* -------------------------------------------------- */
/*                      Tests                         */
/* -------------------------------------------------- */

describe("Modal Accessibility", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<Modal />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it("renders dialog role", () => {
    render(<Modal />);

    const dialog = screen.getByRole("dialog");

    expect(dialog).toBeInTheDocument();
  });

  it("has correct title association", () => {
    render(<Modal />);

    const heading = screen.getByRole("heading", {
      name: "Mojito",
    });

    expect(heading).toBeInTheDocument();
  });

  it("has accessible close button", () => {
    render(<Modal />);

    const closeButton = screen.getByRole("button", {
      name: /close modal/i,
    });

    expect(closeButton).toBeInTheDocument();
  });

  it("favorite button has aria-pressed", () => {
    render(<Modal />);

    const favButton = screen.getByRole("button", {
      name: /add to favorites/i,
    });

    expect(favButton).toHaveAttribute("aria-pressed", "false");
  });

  it("image has correct alt text", () => {
    render(<Modal />);

    const image = screen.getByRole("img", {
      name: /image of mojito cocktail/i,
    });

    expect(image).toBeInTheDocument();
  });

  it("ingredients section is properly labeled", () => {
    render(<Modal />);

    const ingredientsHeading = screen.getByRole("heading", {
      name: /ingredients/i,
    });

    expect(ingredientsHeading).toBeInTheDocument();
  });

  it("instructions section is properly labeled", () => {
    render(<Modal />);

    const instructionsHeading = screen.getByRole("heading", {
      name: /instructions/i,
    });

    expect(instructionsHeading).toBeInTheDocument();
  });
});