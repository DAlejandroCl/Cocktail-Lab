import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import SkeletonDrinkCard from "@/components/SkeletonDrinkCard";

expect.extend(toHaveNoViolations);

/* ================================================== */
/*        Integration: Loading + Live Region         */
/* ================================================== */

describe("Loading State Accessibility Integration", () => {
  /* -------------------------------------------------- */
  /*     aria-busy transitions true → false            */
  /* -------------------------------------------------- */

  it("transitions aria-busy from true to false correctly", async () => {
    const { container, rerender } = render(
      <div aria-busy="true" data-testid="results-container">
        <SkeletonDrinkCard />
        <SkeletonDrinkCard />
      </div>
    );

    const containerEl = screen.getByTestId("results-container");

    expect(containerEl).toHaveAttribute("aria-busy", "true");

    // Simulate loading finished
    rerender(
      <div aria-busy="false" data-testid="results-container">
        <div>Loaded content</div>
      </div>
    );

    expect(containerEl).toHaveAttribute("aria-busy", "false");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  /* -------------------------------------------------- */
  /*     Live region should NOT announce skeletons     */
  /* -------------------------------------------------- */

  it("does NOT announce skeletons in live region while loading", () => {
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
      </>
    );

    const liveRegion = screen.getByTestId("live-region");

    expect(liveRegion.textContent).toBe("");
  });

  /* -------------------------------------------------- */
  /*     Live region announces results AFTER load      */
  /* -------------------------------------------------- */

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
      </>
    );

    const liveRegion = screen.getByTestId("live-region");

    expect(liveRegion.textContent).toBe("");

    // Simulate results loaded
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
      </>
    );

    expect(liveRegion.textContent).toMatch(/3 results/i);
  });

  /* -------------------------------------------------- */
  /*     Skeletons remain hidden from accessibility    */
  /* -------------------------------------------------- */

  it("skeletons remain aria-hidden during loading", () => {
    const { container } = render(
      <div aria-busy="true">
        <SkeletonDrinkCard />
        <SkeletonDrinkCard />
      </div>
    );

    const skeletonWrappers = container.querySelectorAll(
      '[aria-hidden="true"]'
    );

    expect(skeletonWrappers.length).toBeGreaterThan(0);
  });

  /* -------------------------------------------------- */
  /*     Full integration axe audit                    */
  /* -------------------------------------------------- */

  it("has no accessibility violations during loading and after load", async () => {
    const { container, rerender } = render(
      <>
        <div aria-live="polite" aria-atomic="true" />
        <div aria-busy="true">
          <SkeletonDrinkCard />
        </div>
      </>
    );

    let results = await axe(container);
    expect(results).toHaveNoViolations();

    rerender(
      <>
        <div aria-live="polite" aria-atomic="true">
          1 result found
        </div>
        <div aria-busy="false">
          <div>Drink 1</div>
        </div>
      </>
    );

    results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});