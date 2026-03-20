import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRef } from "react";
import { MemoryRouter } from "react-router-dom";
import SearchForm from "@/components/SearchForm";
import { useAppStore } from "@/stores/useAppStore";

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

function renderForm(
  overrides: Partial<React.ComponentProps<typeof SearchForm>> = {},
) {
  return render(
    <MemoryRouter>
      <SearchForm
        categories={["Cocktail", "Shot", "Beer"]}
        isLoading={false}
        onSubmit={vi.fn()}
        {...overrides}
      />
    </MemoryRouter>,
  );
}

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

beforeEach(() => {
  useAppStore.setState({ notification: null });
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("SearchForm", () => {

  // ── Structure ───────────────────────────────────────────────────────────

  describe("structure", () => {
    it("renders a form with role='search'", () => {
      renderForm();
      expect(screen.getByRole("search")).toBeInTheDocument();
    });

    it("renders the ingredient text input", () => {
      renderForm();
      expect(
        screen.getByPlaceholderText(/search by ingredient/i),
      ).toBeInTheDocument();
    });

    it("renders the category Listbox button defaulting to 'All Categories'", () => {
      renderForm();
      expect(
        screen.getByRole("button", { name: /all categories/i }),
      ).toBeInTheDocument();
    });

    it("renders the Search button", () => {
      renderForm();
      expect(
        screen.getByRole("button", { name: /^search$/i }),
      ).toBeInTheDocument();
    });

    it("renders the Clear button", () => {
      renderForm();
      expect(
        screen.getByRole("button", { name: /clear search filters/i }),
      ).toBeInTheDocument();
    });

    it("has aria-busy=false when not loading", () => {
      renderForm();
      expect(screen.getByRole("search")).toHaveAttribute("aria-busy", "false");
    });

    it("has aria-busy=true when isLoading=true", () => {
      renderForm({ isLoading: true });
      expect(screen.getByRole("search")).toHaveAttribute("aria-busy", "true");
    });
  });

  // ── Submission ──────────────────────────────────────────────────────────

  describe("form submission", () => {
    it("calls onSubmit with ingredient when filled and submitted", async () => {
      const user     = userEvent.setup();
      const onSubmit = vi.fn();
      renderForm({ onSubmit });

      await user.type(
        screen.getByPlaceholderText(/search by ingredient/i),
        "Rum",
      );
      await user.click(screen.getByRole("button", { name: /^search$/i }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ ingredient: "Rum" }),
      );
    });

    it("shows an error notification when submitted with no filters", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(screen.getByRole("button", { name: /^search$/i }));

      expect(useAppStore.getState().notification).toEqual(
        expect.objectContaining({ type: "error" }),
      );
    });

    it("does not call onSubmit when submitted with no filters", async () => {
      const user     = userEvent.setup();
      const onSubmit = vi.fn();
      renderForm({ onSubmit });

      await user.click(screen.getByRole("button", { name: /^search$/i }));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // ── Clear button ────────────────────────────────────────────────────────

  describe("Clear button", () => {
    it("is disabled when no filters are set", () => {
      renderForm();
      expect(
        screen.getByRole("button", { name: /clear search filters/i }),
      ).toBeDisabled();
    });

    it("is enabled after typing in the ingredient input", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(
        screen.getByPlaceholderText(/search by ingredient/i),
        "Gin",
      );

      expect(
        screen.getByRole("button", { name: /clear search filters/i }),
      ).not.toBeDisabled();
    });

    it("clears the ingredient input when clicked", async () => {
      const user  = userEvent.setup();
      renderForm();
      const input = screen.getByPlaceholderText(/search by ingredient/i);

      await user.type(input, "Rum");
      await user.click(
        screen.getByRole("button", { name: /clear search filters/i }),
      );

      expect(input).toHaveValue("");
    });
  });

  // ── Category dropdown ───────────────────────────────────────────────────
  //
  // HeadlessUI v2 applies the `inert` attribute to the Listbox panel's outer
  // container while the popup is open, which removes its descendants from the
  // accessibility tree.  Queries via screen.getByRole() therefore fail.
  // Workaround: query the DOM directly with document.querySelectorAll and
  // wait for the elements to appear, mirroring the pattern already used in
  // Header.test.tsx for the same HeadlessUI version.

  describe("category dropdown", () => {
    it("opens the listbox when the category button is clicked", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(
        screen.getByRole("button", { name: /all categories/i }),
      );

      // Wait for at least one [role="option"] to appear in the DOM
      await waitFor(() => {
        const options = document.querySelectorAll('[role="option"]');
        expect(options.length).toBeGreaterThan(0);
      });
    });

    it("lists all passed categories as options", async () => {
      const user = userEvent.setup();
      renderForm({ categories: ["Cocktail", "Shot"] });

      await user.click(
        screen.getByRole("button", { name: /all categories/i }),
      );

      await waitFor(() => {
        const options = document.querySelectorAll('[role="option"]');
        expect(options.length).toBeGreaterThan(0);
      });

      const optionTexts = Array.from(
        document.querySelectorAll('[role="option"]'),
      ).map((el) => el.textContent?.trim());

      expect(optionTexts).toContain("Cocktail");
      expect(optionTexts).toContain("Shot");
    });

    it("selecting a category enables the Clear button", async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(
        screen.getByRole("button", { name: /all categories/i }),
      );

      // Wait for options to appear in the DOM, then click via direct DOM query
      await waitFor(() => {
        const options = document.querySelectorAll('[role="option"]');
        expect(options.length).toBeGreaterThan(0);
      });

      const cocktailOption = Array.from(
        document.querySelectorAll('[role="option"]'),
      ).find((el) => el.textContent?.trim() === "Cocktail")!;

      await user.click(cocktailOption);

      expect(
        screen.getByRole("button", { name: /clear search filters/i }),
      ).not.toBeDisabled();
    });
  });

  // ── Scroll on submit ────────────────────────────────────────────────────

  describe("scroll behaviour", () => {
    it("calls scrollIntoView on resultsRef after successful submit", async () => {
      const user       = userEvent.setup();
      const onSubmit   = vi.fn();
      const resultsRef = createRef<HTMLElement>() as React.MutableRefObject<HTMLElement>;
      const mockScroll = vi.fn();
      const el         = document.createElement("section");
      el.scrollIntoView = mockScroll;
      resultsRef.current = el;

      render(
        <MemoryRouter>
          <SearchForm
            categories={["Cocktail"]}
            isLoading={false}
            onSubmit={onSubmit}
            resultsRef={resultsRef}
          />
        </MemoryRouter>,
      );

      await user.type(
        screen.getByPlaceholderText(/search by ingredient/i),
        "Rum",
      );
      await user.click(screen.getByRole("button", { name: /^search$/i }));

      expect(mockScroll).toHaveBeenCalledWith({
        behavior: "smooth",
        block:    "start",
      });
    });
  });
});
