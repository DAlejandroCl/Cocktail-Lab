import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("renders a dialog with proper role", () => {
    render(<Modal />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("sets initial focus inside the modal (Headless UI initialFocus)", async () => {
    render(<Modal />);

    const closeButtons = screen.getAllByRole("button", {
      name: /close modal/i,
    });

    await waitFor(() => {
      expect(closeButtons[0]).toHaveFocus();
    });
  });

  it("keeps focus within the modal when tabbing (jsdom-safe validation)", async () => {
    const user = userEvent.setup();
    render(<Modal />);

    const dialog = screen.getByRole("dialog");

    await user.tab();

    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("restores focus to previously focused element when closed", async () => {
    const user = userEvent.setup();

    const trigger = document.createElement("button");
    trigger.textContent = "Open Modal";
    document.body.appendChild(trigger);
    trigger.focus();

    render(<Modal />);

    const closeButtons = screen.getAllByRole("button", {
      name: /close modal/i,
    });

    await user.click(closeButtons[0]);

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("closes modal with Escape key", async () => {
    const user = userEvent.setup();
    render(<Modal />);

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(useAppStore.getState().modal).toBe(false);
    });
  });
});