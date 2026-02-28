import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "@/stores/useAppStore";
import Modal from "@/components/Modal";
import { makeRecipeDetail } from "../mocks/factories";
import type { RecipeDetail } from "@/types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function renderModal() {
  return render(
    <MemoryRouter>
      <Modal />
    </MemoryRouter>,
  );
}

function openModalWith(recipe: RecipeDetail) {
  useAppStore.setState({
    modal: true,
    selectedRecipe: recipe,
    favorites: {},
    notification: null,
  });
}

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  useAppStore.setState({
    modal: false,
    selectedRecipe: null,
    favorites: {},
    notification: null,
  });
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("Modal — Integration", () => {

  describe("conditional rendering", () => {
    it("renders nothing when modal is closed", () => {
      renderModal();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders nothing when modal is open but selectedRecipe is null", () => {
      useAppStore.setState({ modal: true, selectedRecipe: null });

      renderModal();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders the dialog when modal is open and selectedRecipe exists", () => {
      const recipe = makeRecipeDetail({ strDrink: "Mojito" });
      openModalWith(recipe);

      renderModal();

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("content rendering", () => {
    it("displays the cocktail name as the dialog title", () => {
      const recipe = makeRecipeDetail({ strDrink: "Blue Lagoon" });
      openModalWith(recipe);

      renderModal();

      expect(
        screen.getByRole("heading", { name: /blue lagoon/i }),
      ).toBeInTheDocument();
    });

    it("displays the cocktail image with descriptive alt text", () => {
      const recipe = makeRecipeDetail({
        strDrink: "Margarita",
        strDrinkThumb: "https://image.com/margarita.jpg",
      });
      openModalWith(recipe);

      renderModal();

      const img = screen.getByAltText(/image of margarita cocktail/i);
      expect(img).toHaveAttribute("src", "https://image.com/margarita.jpg");
    });

    it("renders the Ingredients section heading", () => {
      const recipe = makeRecipeDetail();
      openModalWith(recipe);

      renderModal();

      expect(
        screen.getByRole("heading", { name: /ingredients/i }),
      ).toBeInTheDocument();
    });

    it("renders the Instructions section heading", () => {
      const recipe = makeRecipeDetail();
      openModalWith(recipe);

      renderModal();

      expect(
        screen.getByRole("heading", { name: /instructions/i }),
      ).toBeInTheDocument();
    });

    it("renders non-null ingredients as list items", () => {
      const recipe = makeRecipeDetail({
        strIngredient1: "Rum",
        strIngredient2: "Lime",
        strIngredient3: null,
      });
      openModalWith(recipe);

      renderModal();

      expect(screen.getByText("Rum")).toBeInTheDocument();
      expect(screen.getByText("Lime")).toBeInTheDocument();
    });

    it("renders instruction steps as a numbered list", () => {
      const recipe = makeRecipeDetail({
        strInstructions: "Shake well. Strain into glass. Garnish with lime.",
      });
      openModalWith(recipe);

      renderModal();

      const steps = screen.getAllByRole("listitem");
      expect(steps.length).toBeGreaterThanOrEqual(3);
    });

    it("renders a dash for ingredients without a measure", () => {
      const recipe = makeRecipeDetail({
        strIngredient1: "Salt",
        strMeasure1: null,
        strIngredient2: null,
      });
      openModalWith(recipe);

      renderModal();

      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });

  describe("close behavior", () => {
    it("closes the modal when the top-right close button is clicked", async () => {
      const user = userEvent.setup();
      const recipe = makeRecipeDetail();
      openModalWith(recipe);

      renderModal();

      const [topCloseButton] = screen.getAllByRole("button", {
        name: /close modal/i,
      });

      await user.click(topCloseButton);

      await waitFor(() => {
        expect(useAppStore.getState().modal).toBe(false);
        expect(useAppStore.getState().selectedRecipe).toBeNull();
      });
    });

    it("closes the modal when the bottom Close button is clicked", async () => {
      const user = userEvent.setup();
      const recipe = makeRecipeDetail();
      openModalWith(recipe);

      renderModal();

      const closeButtons = screen.getAllByRole("button", {
        name: /close modal/i,
      });

      await user.click(closeButtons[closeButtons.length - 1]);

      await waitFor(() => {
        expect(useAppStore.getState().modal).toBe(false);
        expect(useAppStore.getState().selectedRecipe).toBeNull();
      });
    });
  });

  describe("favorite toggle", () => {
    it("adds the recipe to favorites when the heart button is clicked and it is not a favorite", async () => {
      const user = userEvent.setup();
      const recipe = makeRecipeDetail({ strDrink: "Mojito" });
      openModalWith(recipe);

      renderModal();

      await user.click(
        screen.getByRole("button", { name: /add to favorites/i }),
      );

      await waitFor(() => {
        expect(useAppStore.getState().favorites[recipe.idDrink]).toBeDefined();
      });
    });

    it("dispatches a success notification when added to favorites", async () => {
      const user = userEvent.setup();
      const recipe = makeRecipeDetail();
      openModalWith(recipe);

      renderModal();

      await user.click(
        screen.getByRole("button", { name: /add to favorites/i }),
      );

      await waitFor(() => {
        expect(useAppStore.getState().notification).toEqual({
          message: "Added to favorites",
          type: "success",
        });
      });
    });

    it("removes the recipe from favorites when the heart button is clicked and it is already a favorite", async () => {
      const user = userEvent.setup();
      const recipe = makeRecipeDetail();

      useAppStore.setState({
        modal: true,
        selectedRecipe: recipe,
        favorites: { [recipe.idDrink]: recipe },
        notification: null,
      });

      renderModal();

      await user.click(
        screen.getByRole("button", { name: /remove from favorites/i }),
      );

      await waitFor(() => {
        expect(useAppStore.getState().favorites[recipe.idDrink]).toBeUndefined();
      });
    });

    it("dispatches an info notification when removed from favorites", async () => {
      const user = userEvent.setup();
      const recipe = makeRecipeDetail();

      useAppStore.setState({
        modal: true,
        selectedRecipe: recipe,
        favorites: { [recipe.idDrink]: recipe },
        notification: null,
      });

      renderModal();

      await user.click(
        screen.getByRole("button", { name: /remove from favorites/i }),
      );

      await waitFor(() => {
        expect(useAppStore.getState().notification).toEqual({
          message: "Removed from favorites",
          type: "info",
        });
      });
    });

    it("shows aria-pressed=true on the heart button when the recipe is a favorite", () => {
      const recipe = makeRecipeDetail();

      useAppStore.setState({
        modal: true,
        selectedRecipe: recipe,
        favorites: { [recipe.idDrink]: recipe },
        notification: null,
      });

      renderModal();

      expect(
        screen.getByRole("button", { name: /remove from favorites/i }),
      ).toHaveAttribute("aria-pressed", "true");
    });

    it("shows aria-pressed=false on the heart button when the recipe is not a favorite", () => {
      const recipe = makeRecipeDetail();
      openModalWith(recipe);

      renderModal();

      expect(
        screen.getByRole("button", { name: /add to favorites/i }),
      ).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("accessibility", () => {
    it("the dialog is present with the correct role", () => {
      const recipe = makeRecipeDetail({ strDrink: "Cosmopolitan" });
      openModalWith(recipe);

      renderModal();

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("the close buttons have accessible aria-labels", () => {
      const recipe = makeRecipeDetail();
      openModalWith(recipe);

      renderModal();

      const closeButtons = screen.getAllByRole("button", { name: /close modal/i });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("the cocktail name heading has id=modal-title", () => {
      const recipe = makeRecipeDetail({ strDrink: "Negroni" });
      openModalWith(recipe);

      renderModal();

      expect(
        screen.getByRole("heading", { name: /negroni/i }),
      ).toHaveAttribute("id", "modal-title");
    });

    it("ingredients section is labelled by its heading", () => {
      const recipe = makeRecipeDetail();
      openModalWith(recipe);

      renderModal();

      const heading = screen.getByRole("heading", { name: /ingredients/i });
      expect(heading).toHaveAttribute("id", "ingredients-heading");
      expect(heading.closest("section")).toHaveAttribute(
        "aria-labelledby",
        "ingredients-heading",
      );
    });

    it("instructions section is labelled by its heading", () => {
      const recipe = makeRecipeDetail();
      openModalWith(recipe);

      renderModal();

      const heading = screen.getByRole("heading", { name: /instructions/i });
      expect(heading).toHaveAttribute("id", "instructions-heading");
      expect(heading.closest("section")).toHaveAttribute(
        "aria-labelledby",
        "instructions-heading",
      );
    });
  });
});
