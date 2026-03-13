import { useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

/* ─────────────────────────────────────────────────────────────
   NAV LINK STYLES
───────────────────────────────────────────────────────────── */

function navLinkClass(isActive: boolean): string {
  const base =
    "text-xs font-bold uppercase tracking-widest transition-colors duration-200 pb-0.5";
  return isActive
    ? `${base} text-brand border-b-2 border-brand`
    : `${base} text-[var(--text-secondary)] hover:text-[var(--text-primary)]`;
}

/* ─────────────────────────────────────────────────────────────
   HEADER — Sticky navbar only.
───────────────────────────────────────────────────────────── */

export default function Header() {
  const location = useLocation();

  const isHome = useMemo(
    () => location.pathname === "/",
    [location.pathname],
  );

  return (
    <header
      style={{
        background: "var(--bg-overlay)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderBottom: isHome ? "none" : "1px solid var(--border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link
            to="/"
            className="flex items-center gap-2 group select-none shrink-0"
          >
            <span
              className="text-xl font-serif font-bold tracking-tight transition-opacity duration-200 group-hover:opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              Cocktail
              <span className="text-brand font-serif italic"> Lab</span>
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main navigation"
          >
            <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
              Home
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => navLinkClass(isActive)}>
              Favorites
            </NavLink>
            <NavLink to="/ai" className={({ isActive }) => navLinkClass(isActive)}>
              AI Generator
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <nav
              className="flex md:hidden items-center gap-5"
              aria-label="Mobile navigation"
            >
              <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
                Home
              </NavLink>
              <NavLink to="/favorites" className={({ isActive }) => navLinkClass(isActive)}>
                Favs
              </NavLink>
              <NavLink to="/ai" className={({ isActive }) => navLinkClass(isActive)}>
                AI
              </NavLink>
            </nav>
          </div>

        </div>
      </div>
    </header>
  );
}
