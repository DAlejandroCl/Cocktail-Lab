import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/Header";

// ─────────────────────────────────────────────
// Render helper
// ─────────────────────────────────────────────

function renderHeader(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("Header", () => {

  // ── Logo ──────────────────────────────────────────────────────────────

  it("renders the logo link pointing to /", () => {
    renderHeader();

    // The Logo renders a <Link to="/"> — it is the first link in the header
    const logoLink = screen.getAllByRole("link", { name: /cocktail/i })[0];
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");
  });

  // ── Navigation links ──────────────────────────────────────────────────
  //
  // Header renders two AnimatedNav instances (desktop + mobile) from the same
  // route config, so every destination appears twice in the DOM.
  // Use getAllByRole to accept both occurrences.

  it("renders navigation links to Home, Favorites and AI Generator", () => {
    renderHeader();

    // Desktop nav uses full labels; mobile nav uses abbreviated ones.
    // getAllByRole with a broad pattern captures both — just assert at least one.
    expect(screen.getAllByRole("link", { name: /home/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("link", { name: /favorites/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("link", { name: /ai/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("does not render a search form", () => {
    // The search form lives in HeroSection / IndexPage, not in Header.
    renderHeader();
    expect(screen.queryByRole("search")).not.toBeInTheDocument();
  });

  // ── Theme toggle ──────────────────────────────────────────────────────

  it("renders the theme toggle button", () => {
    renderHeader();

    // ThemeToggle renders a button — verify it exists without coupling to its label
    // (label depends on current theme state).
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  // ── Active link state ─────────────────────────────────────────────────

  it("marks the Home link as active on the / route", () => {
    renderHeader("/");

    const homeLinks = screen.getAllByRole("link", { name: /^home$/i });
    // At least one desktop Home link should carry the active class
    const activeHome = homeLinks.find((el) =>
      el.classList.contains("nav-link--active"),
    );
    expect(activeHome).toBeDefined();
  });

  it("marks the Favorites link as active on the /favorites route", () => {
    renderHeader("/favorites");

    const favLinks = screen.getAllByRole("link", { name: /^favorites$/i });
    const activeFav = favLinks.find((el) =>
      el.classList.contains("nav-link--active"),
    );
    expect(activeFav).toBeDefined();
  });

  // ── Semantic structure ────────────────────────────────────────────────

  it("renders inside a <header> element", () => {
    const { container } = renderHeader();
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("applies the bordered modifier class on non-home routes", () => {
    const { container } = renderHeader("/favorites");
    expect(container.querySelector(".site-header--bordered")).toBeInTheDocument();
  });

  it("does not apply the bordered modifier class on the home route", () => {
    const { container } = renderHeader("/");
    expect(container.querySelector(".site-header--bordered")).not.toBeInTheDocument();
  });
});
