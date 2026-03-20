import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SkeletonDrinkCard from "@/components/SkeletonDrinkCard";

describe("SkeletonDrinkCard Unit Tests", () => {
  it("renders without crashing", () => {
    const { container } = render(<SkeletonDrinkCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    const { container } = render(<SkeletonDrinkCard />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper).toHaveAttribute("role", "presentation");
  });

  it("has animation class applied", () => {
    const { container } = render(<SkeletonDrinkCard />);
    const wrapper = container.firstChild as HTMLElement;

    // SkeletonDrinkCard applies animate-pulse to internal shimmer elements,
    // not to the outer wrapper div. Query any descendant with the class.
    const animatedEl = wrapper.querySelector(".animate-pulse");
    expect(animatedEl).not.toBeNull();
  });

  it("renders correct structural sections", () => {
    const { container } = render(<SkeletonDrinkCard />);

    const wrapper = container.firstChild as HTMLElement;

    const divs = wrapper.querySelectorAll("div");

    // The component renders 5 descendant divs (image placeholder + content
    // wrapper + 3 shimmer lines). Use >= to avoid brittleness if more are added.
    expect(divs.length).toBeGreaterThanOrEqual(5);
  });
});
