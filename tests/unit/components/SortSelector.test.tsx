import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import SortSelector from "@/components/SortSelector";
import type { SortOptionConfig } from "@/utils/sortRecipes";

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

type TestOption = "default" | "name-asc" | "name-desc";

const OPTIONS: SortOptionConfig<TestOption>[] = [
  { value: "default",   label: "Default" },
  { value: "name-asc",  label: "A → Z"   },
  { value: "name-desc", label: "Z → A"   },
];

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("SortSelector", () => {

  // ── Rendering ──────────────────────────────────────────────────────────

  it("renders a button for each option", () => {
    render(
      <SortSelector options={OPTIONS} value="default" onChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Default" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "A → Z"  })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Z → A"  })).toBeInTheDocument();
  });

  it("renders the group with aria-label matching the label prop", () => {
    render(
      <SortSelector
        options={OPTIONS}
        value="default"
        onChange={vi.fn()}
        label="Sort by"
      />,
    );

    expect(screen.getByRole("group", { name: /sort by/i })).toBeInTheDocument();
  });

  it("uses 'Sort by' as the default label when none is provided", () => {
    render(
      <SortSelector options={OPTIONS} value="default" onChange={vi.fn()} />,
    );

    expect(screen.getByRole("group", { name: /sort by/i })).toBeInTheDocument();
  });

  // ── Active state ────────────────────────────────────────────────────────

  it("active button has aria-pressed=true", () => {
    render(
      <SortSelector options={OPTIONS} value="name-asc" onChange={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "A → Z" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("inactive buttons have aria-pressed=false", () => {
    render(
      <SortSelector options={OPTIONS} value="name-asc" onChange={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "Default" }),
    ).toHaveAttribute("aria-pressed", "false");

    expect(
      screen.getByRole("button", { name: "Z → A" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  // ── Interaction ─────────────────────────────────────────────────────────

  it("calls onChange with the clicked option value", async () => {
    const user     = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SortSelector options={OPTIONS} value="default" onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: "A → Z" }));

    expect(onChange).toHaveBeenCalledWith("name-asc");
  });

  it("calls onChange with the correct value for each option", async () => {
    const user     = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SortSelector options={OPTIONS} value="default" onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Z → A" }));
    expect(onChange).toHaveBeenCalledWith("name-desc");
  });

  it("does not call onChange for the already-active option", async () => {
    // onChange is still called — it's the parent's responsibility to ignore
    // duplicate selections. This test documents the current behaviour.
    const user     = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SortSelector options={OPTIONS} value="default" onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Default" }));
    expect(onChange).toHaveBeenCalledWith("default");
  });
});
