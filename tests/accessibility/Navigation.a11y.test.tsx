import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Layout from "@/layouts/Layout";

expect.extend(toHaveNoViolations);

/* -------------------------------------------------- */
/* Helper renderer with router context               */
/* -------------------------------------------------- */

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={<div>Home Page</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

/* -------------------------------------------------- */
/*                     Tests                          */
/* -------------------------------------------------- */

describe("Layout Accessibility", () => {
  /* ---------------- Automated ---------------- */

  it("should have no accessibility violations", async () => {
    const { container } = renderWithRouter();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  /* ---------------- Landmarks ---------------- */

  it("renders a main landmark", () => {
    renderWithRouter();

    const main = screen.getByRole("main");

    expect(main).toBeInTheDocument();
  });

  it("renders only one main landmark", () => {
    renderWithRouter();

    const mains = screen.getAllByRole("main");

    expect(mains).toHaveLength(1);
  });

  /* ---------------- Skip Link ---------------- */

  it("renders skip link", () => {
    renderWithRouter();

    const skipLink = screen.getByRole("link", {
      name: /skip to main content/i,
    });

    expect(skipLink).toBeInTheDocument();
  });

  it("skip link moves focus to main content", async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const skipLink = screen.getByRole("link", {
      name: /skip to main content/i,
    });

    await user.tab();
    expect(skipLink).toHaveFocus();

    await user.keyboard("{Enter}");

    const main = screen.getByRole("main");

    expect(main).toHaveFocus();
  });

  /* ---------------- Structure ---------------- */

  it("main has correct id for skip link", () => {
    renderWithRouter();

    const main = screen.getByRole("main");

    expect(main).toHaveAttribute("id", "main-content");
  });
});