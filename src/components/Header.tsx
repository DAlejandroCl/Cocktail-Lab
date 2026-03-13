import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

/* ─────────────────────────────────────────────────────────────
   NAV LINKS CONFIG
───────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { to: "/",          label: "Home",         end: true  },
  { to: "/favorites", label: "Favorites",    end: false },
  { to: "/ai",        label: "AI Generator", end: false },
] as const;

const NAV_LINKS_MOBILE = [
  { to: "/",          label: "Home", end: true  },
  { to: "/favorites", label: "Favs", end: false },
  { to: "/ai",        label: "AI",   end: false },
] as const;

/* ─────────────────────────────────────────────────────────────
   ANIMATED NAV
   Underline geometry lives in useState — never in refs.
   useEffect reads refs inside its callback (allowed) and
   calls setState there. No ref access during render at all.
───────────────────────────────────────────────────────────── */

interface AnimatedNavProps {
  links: typeof NAV_LINKS | typeof NAV_LINKS_MOBILE;
  className?: string;
}

function AnimatedNav({ links, className = "" }: AnimatedNavProps) {
  const location  = useLocation();
  const navRef    = useRef<HTMLDivElement>(null);
  const linkRefs  = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [underline, setUnderline] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    // All ref access lives inside the effect callback — never during render
    const rafId = requestAnimationFrame(() => {
      const nav = navRef.current;
      if (!nav) return;

      const activeLink = links.find((l) =>
        l.end
          ? location.pathname === l.to
          : location.pathname.startsWith(l.to),
      );

      if (!activeLink) {
        setUnderline(null);
        return;
      }

      const activeEl = linkRefs.current.get(activeLink.to);
      if (!activeEl) return;

      const navRect    = nav.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      setUnderline({
        left:  activeRect.left - navRect.left,
        width: activeRect.width,
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [location.pathname, links]);

  return (
    <div ref={navRef} className={`nav-animated ${className}`}>
      {links.map((link) => {
        const isActive = link.end
          ? location.pathname === link.to
          : location.pathname.startsWith(link.to);

        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            ref={(el) => {
              if (el) linkRefs.current.set(link.to, el);
              else linkRefs.current.delete(link.to);
            }}
            className={isActive ? "nav-link nav-link--active" : "nav-link"}
          >
            {link.label}
          </NavLink>
        );
      })}

      {/* Underline: position comes from useState, never from refs */}
      {underline && (
        <span
          className="nav-underline"
          style={{ left: underline.left, width: underline.width }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LOGO
   "Lab" letters animate one by one on hover via CSS classes.
   The parent link handles scale on click.
   All styles live in index.css — zero inline styles here.
───────────────────────────────────────────────────────────── */

function Logo() {
  return (
    <Link to="/" className="logo-link">
      <span className="logo-cocktail">Cocktail</span>
      <span className="logo-lab" aria-label="Lab">
        <span className="logo-lab__letter" data-letter="L" aria-hidden="true">L</span>
        <span className="logo-lab__letter" data-letter="a" aria-hidden="true">a</span>
        <span className="logo-lab__letter" data-letter="b" aria-hidden="true">b</span>
      </span>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   HEADER
───────────────────────────────────────────────────────────── */

export default function Header() {
  const location = useLocation();
  const isHome   = location.pathname === "/";

  return (
    <header className={isHome ? "site-header" : "site-header site-header--bordered"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Logo />

          <AnimatedNav links={NAV_LINKS} className="hidden md:flex gap-8" />

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AnimatedNav links={NAV_LINKS_MOBILE} className="flex md:hidden gap-5" />
          </div>

        </div>
      </div>
    </header>
  );
}
