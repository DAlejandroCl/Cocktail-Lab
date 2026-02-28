import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Layout from "@/layouts/Layout";

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div>Home Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("Layout — Accessibility", () => {

  it("has no accessibility violations", async () => {
    const { container } = renderLayout();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders a main landmark", () => {
    renderLayout();

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders only one main landmark", () => {
    renderLayout();

    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("renders a skip link", () => {
    renderLayout();

    expect(
      screen.getByRole("link", { name: /skip to main content/i }),
    ).toBeInTheDocument();
  });

  it("skip link moves focus to main content on Enter", async () => {
    const user = userEvent.setup();

    renderLayout();

    const skipLink = screen.getByRole("link", { name: /skip to main content/i });

    await user.tab();
    expect(skipLink).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("main has id=main-content for the skip link target", () => {
    renderLayout();

    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });
});
