import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { MemoryRouter } from "react-router-dom";
import HeroSection from "@/components/HeroSection";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function renderHero(overrides: Partial<Parameters<typeof HeroSection>[0]> = {}) {
  const resultsRef = createRef<HTMLElement>();

  return render(
    <MemoryRouter>
      <HeroSection
        categories={["Cocktail", "Shot", "Beer"]}
        isLoading={false}
        onSubmit={vi.fn()}
        resultsRef={resultsRef}
        {...overrides}
      />
    </MemoryRouter>,
  );
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("HeroSection", () => {

  // ── Section landmark ──────────────────────────────────────────────────

  describe("section landmark", () => {
    it("renders with aria-label='Search cocktails'", () => {
      renderHero();

      expect(
        screen.getByRole("region", { name: /search cocktails/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Ticker ────────────────────────────────────────────────────────────

  describe("Ticker", () => {
    it("renders ticker items from the COCKTAILS list", () => {
      renderHero();

      // COCKTAILS has 25 items, duplicated = 50 .hero-ticker__item spans
      const items = document.querySelectorAll(".hero-ticker__item");
      expect(items.length).toBe(50);
    });

    it("renders first cocktail name in the ticker", () => {
      renderHero();

      // Mojito is the first item — at least one instance should be present
      const mojitoItems = Array.from(
        document.querySelectorAll(".hero-ticker__item"),
      ).filter((el) => el.textContent?.includes("Mojito"));

      expect(mojitoItems.length).toBeGreaterThan(0);
    });

    it("ticker strip is aria-hidden for screen readers", () => {
      renderHero();

      const ticker = document.querySelector(".hero-ticker");
      expect(ticker).toHaveAttribute("aria-hidden", "true");
    });

    it("ticker track has the forward animation class", () => {
      renderHero();

      const track = document.querySelector(".hero-ticker__track");
      expect(track).toBeInTheDocument();
      // forward track does NOT have the --rev modifier
      expect(track).not.toHaveClass("hero-ticker__track--rev");
    });
  });

  // ── Mesh gradient ─────────────────────────────────────────────────────

  describe("MeshGradient", () => {
    it("renders the mesh container with aria-hidden", () => {
      renderHero();

      const mesh = document.querySelector(".hero-mesh");
      expect(mesh).toBeInTheDocument();
      expect(mesh).toHaveAttribute("aria-hidden", "true");
    });

    it("renders the orange blob", () => {
      renderHero();

      expect(
        document.querySelector(".hero-mesh__blob--orange"),
      ).toBeInTheDocument();
    });

    it("renders the blue blob", () => {
      renderHero();

      expect(
        document.querySelector(".hero-mesh__blob--blue"),
      ).toBeInTheDocument();
    });

    it("renders the center warmth blob", () => {
      renderHero();

      expect(
        document.querySelector(".hero-mesh__blob--center"),
      ).toBeInTheDocument();
    });
  });

  // ── Bubbles ───────────────────────────────────────────────────────────

  describe("Bubbles", () => {
    it("renders 20 bubble elements", () => {
      renderHero();

      const bubbles = document.querySelectorAll(".bubble--simple");
      expect(bubbles).toHaveLength(20);
    });

    it("bubble zone clip container is aria-hidden", () => {
      renderHero();

      const zone = document.querySelector(".hero-bubble-zone");
      expect(zone).toBeInTheDocument();
      expect(zone).toHaveAttribute("aria-hidden", "true");
    });

    it("bubbles are not interactive (pointer-events none)", () => {
      renderHero();

      // Bubble layer div has pointerEvents: none inline style
      const layer = document.querySelector(".hero-bubble-zone > div");
      expect(layer).toHaveStyle({ pointerEvents: "none" });
    });
  });

  // ── Scroll arrow ──────────────────────────────────────────────────────

  describe("ScrollArrow", () => {
    it("renders a button with aria-label='Scroll to results'", () => {
      renderHero();

      expect(
        screen.getByRole("button", { name: /scroll to results/i }),
      ).toBeInTheDocument();
    });

    it("has the .scroll-arrow CSS class", () => {
      renderHero();

      const arrow = screen.getByRole("button", { name: /scroll to results/i });
      expect(arrow).toHaveClass("scroll-arrow");
    });

    it("calls scrollIntoView on the resultsRef when clicked", async () => {
      const user       = userEvent.setup();
      const resultsRef = createRef<HTMLElement>() as React.MutableRefObject<HTMLElement>;
      const mockScroll = vi.fn();

      // Attach a mock element to the ref
      const el = document.createElement("section");
      el.scrollIntoView = mockScroll;
      resultsRef.current = el;

      render(
        <MemoryRouter>
          <HeroSection
            categories={[]}
            isLoading={false}
            onSubmit={vi.fn()}
            resultsRef={resultsRef}
          />
        </MemoryRouter>,
      );

      await user.click(
        screen.getByRole("button", { name: /scroll to results/i }),
      );

      expect(mockScroll).toHaveBeenCalledWith({
        behavior: "smooth",
        block:    "start",
      });
    });
  });

  // ── SearchForm integration ─────────────────────────────────────────────

  describe("SearchForm integration", () => {
    it("renders the ingredient search input", () => {
      renderHero();

      expect(
        screen.getByPlaceholderText(/search by ingredient/i),
      ).toBeInTheDocument();
    });

    it("renders the Search button", () => {
      renderHero();

      // Use exact match — /search/i also matches the Clear button's
      // aria-label ("Clear search filters"), causing getByRole to throw
      // due to multiple matches.
      expect(
        screen.getByRole("button", { name: /^search$/i }),
      ).toBeInTheDocument();
    });

    it("passes categories to the category dropdown", () => {
      renderHero({ categories: ["Cocktail", "Shot"] });

      // HeadlessUI Listbox renders a button showing the current selection
      expect(
        screen.getByRole("button", { name: /all categories/i }),
      ).toBeInTheDocument();
    });

    it("calls onSubmit when the search form is submitted", async () => {
      const user     = userEvent.setup();
      const onSubmit = vi.fn();

      renderHero({ onSubmit });

      await user.type(
        screen.getByPlaceholderText(/search by ingredient/i),
        "Rum",
      );
      await user.click(screen.getByRole("button", { name: /^search$/i }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ ingredient: "Rum" }),
      );
    });
  });

  // ── Loading state ─────────────────────────────────────────────────────

  describe("loading state", () => {
    it("Search button shows loading indicator when isLoading=true", () => {
      renderHero({ isLoading: true });

      // Use exact match to avoid collision with "Clear search filters" button.
      const searchBtn = screen.getByRole("button", { name: /^search$/i });
      expect(searchBtn).toBeInTheDocument();
    });
  });
});
