import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

      expect(screen.getByRole("link", { name: /^home$/i })).toBeInTheDocument();
    });

    it("renders the Favorites nav link", () => {
      renderHeader();

      expect(
        screen.getByRole("link", { name: /^favorites$/i }),
      ).toBeInTheDocument();
    });

    it("renders the navigation landmark with accessible label", () => {
      renderHeader();

      expect(
        screen.getByRole("navigation", { name: /main navigation/i }),
      ).toBeInTheDocument();
    });

    it("does not render the search form when NOT on home route", () => {
      renderHeader("/favorites");

      expect(screen.queryByRole("search")).not.toBeInTheDocument();
    });

    it("renders the search form when on the home route", () => {
      renderHeader("/");

      expect(screen.getByRole("search")).toBeInTheDocument();
    });
  });

  describe("search form", () => {
    it("renders the ingredient text input with a visually hidden label", () => {
      renderHeader();

      expect(
        screen.getByLabelText(/search cocktails by ingredient/i),
      ).toBeInTheDocument();
    });

    it("renders the Search submit button", () => {
      renderHeader();

      expect(
        screen.getByRole("button", { name: /^search$/i }),
      ).toBeInTheDocument();
    });

    it("ingredient input updates its value on typing", async () => {
      const user = userEvent.setup();

      renderHeader();

      const input = screen.getByLabelText(/search cocktails by ingredient/i);
      await user.type(input, "Gin");

      expect(input).toHaveValue("Gin");
    });

    it("submitting with an empty ingredient and no category shows an error notification", async () => {
      const user = userEvent.setup();

      renderHeader();

      await user.click(screen.getByRole("button", { name: /^search$/i }));

      await waitFor(() => {
        expect(useAppStore.getState().notification).toEqual({
          message: "Please enter an ingredient or select a category.",
          type: "error",
        });
      });
    });

    it("focuses the ingredient input after empty-submit validation error", async () => {
      const user = userEvent.setup();

      renderHeader();

      const input = screen.getByLabelText(/search cocktails by ingredient/i);

      await user.click(screen.getByRole("button", { name: /^search$/i }));

      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    it("triggers a search and sets hasSearched=true on valid ingredient submit", async () => {
      const user = userEvent.setup();

      renderHeader();

      await user.type(
        screen.getByLabelText(/search cocktails by ingredient/i),
        "Rum",
      );

      await user.click(screen.getByRole("button", { name: /^search$/i }));

      await waitFor(() => {
        expect(useAppStore.getState().hasSearched).toBe(true);
      });
    });

    it("the form has aria-busy=true while loading", () => {
      useAppStore.setState({ isLoading: true });

      renderHeader();

      expect(screen.getByRole("search")).toHaveAttribute("aria-busy", "true");
    });

    it("the form has aria-busy=false when not loading", () => {
      useAppStore.setState({ isLoading: false });

      renderHeader();

      expect(screen.getByRole("search")).toHaveAttribute("aria-busy", "false");
    });
  });

  describe("categories", () => {
    it("fetches categories on mount and populates the store", async () => {
      renderHeader();

      await waitFor(() => {
        expect(useAppStore.getState().categories).toContain("Cocktail");
      });
    });

    it("renders category options in the dropdown after the store is populated", async () => {
      const user = userEvent.setup();

      useAppStore.setState({
        categories: ["Cocktail", "Shot", "Beer"],
      });

      renderHeader();

      const trigger = screen.getByRole("button", { name: /all categories/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("option", { name: /cocktail/i })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: /shot/i })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: /beer/i })).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("the Search button is keyboard-focusable", () => {
      renderHeader();

      const btn = screen.getByRole("button", { name: /^search$/i });
      btn.focus();

      expect(btn).toHaveFocus();
    });

    it("the ingredient input is keyboard-focusable", () => {
      renderHeader();

      const input = screen.getByLabelText(/search cocktails by ingredient/i);
      input.focus();

      expect(input).toHaveFocus();
    });
  });
});
