import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import Modal from "@/components/Modal";
import { useAppStore } from "@/stores/useAppStore";
import { makeRecipeDetail } from "../mocks/factories";

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  const recipe = makeRecipeDetail({ strDrink: "Mojito" });

  useAppStore.setState({
    modal: true,
    selectedRecipe: recipe,
    favorites: {},
    notification: null,
  });
});

afterEach(() => {
  document.body.querySelectorAll("button").forEach((btn) => {
    if (!btn.closest("[data-testid]")) btn.remove();
  });
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("Modal — Accessibility", () => {

  it("has no accessibility violations", async () => {
    const { container } = render(<Modal />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders a dialog with the correct role", () => {
    render(<Modal />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("dialog title heading has id=modal-title", () => {
    render(<Modal />);

    expect(
      screen.getByRole("heading", { name: /mojito/i }),
    ).toHaveAttribute("id", "modal-title");
  });

  it("ingredients section is labelled by its heading", () => {
    render(<Modal />);

    const heading = screen.getByRole("heading", { name: /ingredients/i });
    expect(heading).toHaveAttribute("id", "ingredients-heading");
    expect(heading.closest("section")).toHaveAttribute(
      "aria-labelledby",
      "ingredients-heading",
    );
  });

  it("instructions section is labelled by its heading", () => {
    render(<Modal />);

    const heading = screen.getByRole("heading", { name: /instructions/i });
    expect(heading).toHaveAttribute("id", "instructions-heading");
    expect(heading.closest("section")).toHaveAttribute(
      "aria-labelledby",
      "instructions-heading",
    );
  });

  it("sets initial focus inside the modal on open (headlessui initialFocus)", async () => {
    render(<Modal />);

    const [firstCloseButton] = screen.getAllByRole("button", {
      name: /close modal/i,
    });

    await waitFor(() => {
      expect(firstCloseButton).toHaveFocus();
    });
  });

  it("keeps focus within the modal when tabbing", async () => {
    const user = userEvent.setup();

    render(<Modal />);

    const dialog = screen.getByRole("dialog");

    await user.tab();

    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("restores focus to the previously focused element when closed", async () => {
    const user = userEvent.setup();

    const trigger = document.createElement("button");
    trigger.textContent = "Open Modal";
    document.body.appendChild(trigger);
    trigger.focus();

    render(<Modal />);

    const [firstCloseButton] = screen.getAllByRole("button", {
      name: /close modal/i,
    });

    await user.click(firstCloseButton);

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("closes the modal when Escape is pressed", async () => {
    const user = userEvent.setup();

    render(<Modal />);

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(useAppStore.getState().modal).toBe(false);
    });
  });

  it("all close buttons have accessible aria-labels", () => {
    render(<Modal />);

    const closeButtons = screen.getAllByRole("button", { name: /close modal/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });
});
