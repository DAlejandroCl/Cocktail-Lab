import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import SkeletonDrinkCard from "@/components/SkeletonDrinkCard";

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("Loading State — Accessibility Integration", () => {

  it("transitions aria-busy from true to false correctly", async () => {
    const { container, rerender } = render(
      <div aria-busy="true" data-testid="results-container">
        <SkeletonDrinkCard />
        <SkeletonDrinkCard />
      </div>,
    );

    const containerEl = screen.getByTestId("results-container");
    expect(containerEl).toHaveAttribute("aria-busy", "true");

    rerender(
      <div aria-busy="false" data-testid="results-container">
        <div>Loaded content</div>
      </div>,
    );

    expect(containerEl).toHaveAttribute("aria-busy", "false");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("does not announce skeletons in a live region while loading", () => {
    render(
      <>
        <div
          aria-live="polite"
          aria-atomic="true"
          data-testid="live-region"
        />

        <div aria-busy="true">
          <SkeletonDrinkCard />
          <SkeletonDrinkCard />
        </div>
      </>,
    );

    expect(screen.getByTestId("live-region").textContent).toBe("");
  });

  it("announces result count only after loading completes", () => {
    const { rerender } = render(
      <>
        <div
          aria-live="polite"
          aria-atomic="true"
          data-testid="live-region"
        />

        <div aria-busy="true">
          <SkeletonDrinkCard />
        </div>
      </>,
    );

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion.textContent).toBe("");

    rerender(
      <>
        <div
          aria-live="polite"
          aria-atomic="true"
          data-testid="live-region"
        >
          3 results found
        </div>

        <div aria-busy="false">
          <div>Drink 1</div>
          <div>Drink 2</div>
          <div>Drink 3</div>
        </div>
      </>,
    );

    expect(liveRegion.textContent).toMatch(/3 results/i);
  });

  it("skeletons remain aria-hidden during loading", () => {
    const { container } = render(
      <div aria-busy="true">
        <SkeletonDrinkCard />
        <SkeletonDrinkCard />
      </div>,
    );

    const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenElements.length).toBeGreaterThan(0);
  });

  it("has no accessibility violations during loading", async () => {
    const { container } = render(
      <>
        <div aria-live="polite" aria-atomic="true" />
        <div aria-busy="true">
          <SkeletonDrinkCard />
        </div>
      </>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations after load completes", async () => {
    const { container, rerender } = render(
      <>
        <div aria-live="polite" aria-atomic="true" />
        <div aria-busy="true">
          <SkeletonDrinkCard />
        </div>
      </>,
    );

    rerender(
      <>
        <div aria-live="polite" aria-atomic="true">
          1 result found
        </div>
        <div aria-busy="false">
          <div>Drink 1</div>
        </div>
      </>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
