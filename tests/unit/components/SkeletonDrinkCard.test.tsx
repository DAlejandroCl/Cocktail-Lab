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

    expect(wrapper.className).toContain("animate-pulse");
  });

  it("renders correct structural sections", () => {
    const { container } = render(<SkeletonDrinkCard />);

    // Outer wrapper
    const wrapper = container.firstChild as HTMLElement;

    // Expect multiple div children representing structure
    const divs = wrapper.querySelectorAll("div");

    expect(divs.length).toBeGreaterThan(5);
  });

  it("matches snapshot", () => {
    const { container } = render(<SkeletonDrinkCard />);
    expect(container).toMatchSnapshot();
  });
});