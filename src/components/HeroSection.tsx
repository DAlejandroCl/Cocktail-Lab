import { useRef } from "react";
import SearchForm from "./SearchForm";
import type { SearchFilters } from "./SearchForm";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

interface HeroSectionProps {
  categories: string[];
  isLoading: boolean;
  onSubmit: (filters: SearchFilters) => void;
  resultsRef: React.RefObject<HTMLElement | null>;
}

/* ─────────────────────────────────────────────────────────────
   SCROLL ARROW — animated indicator that triggers auto-scroll
───────────────────────────────────────────────────────────── */

function ScrollArrow({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Scroll to results"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 group"
      style={{ zIndex: 10 }}
    >
      <span
        className="text-xs font-semibold uppercase tracking-widest transition-colors duration-200"
        style={{
          color: "var(--text-muted)",
          letterSpacing: "0.12em",
        }}
      >
        Explore
      </span>

      {/* Animated chevrons — staggered fade-bounce */}
      <span className="flex flex-col items-center" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            className="w-5 h-5 -mt-1 transition-colors duration-200"
            style={{
              color: "var(--color-brand)",
              opacity: 0.3 + i * 0.3,
              animation: `scroll-bounce 1.6s ease-in-out ${i * 0.18}s infinite`,
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        ))}
      </span>

      <style>{`
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(5px); }
        }
      `}</style>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO SECTION
   - Full viewport height (100dvh with 100vh fallback)
   - Navbar is sticky at top (h-16 = 64px), hero fills remaining space
   - Contains: ambient glow, heading copy, SearchForm, ScrollArrow
───────────────────────────────────────────────────────────── */

export default function HeroSection({
  categories,
  isLoading,
  onSubmit,
  resultsRef,
}: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);

  const handleScrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={heroRef}
      className="relative flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 hero-full-height"
      style={{
        minHeight: "calc(100vh - 64px)",
      }}
      aria-label="Search cocktails"
    >
      {/* ── Ambient glow — decorative ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {/* Top-center warm glow */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(800px, 120vw)",
            height: "400px",
            background:
              "radial-gradient(ellipse, rgba(242, 127, 13, 0.08) 0%, transparent 65%)",
            borderRadius: "9999px",
          }}
        />
        {/* Bottom subtle glow */}
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(600px, 100vw)",
            height: "200px",
            background:
              "radial-gradient(ellipse, rgba(242, 127, 13, 0.04) 0%, transparent 70%)",
            borderRadius: "9999px",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div
        className="relative w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-16"
        style={{ zIndex: 1 }}
      >
        {/* Heading */}
        <h1
          className="font-serif leading-tight animate-fade-up"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            color: "var(--text-primary)",
            animationDelay: "0.05s",
          }}
        >
          Find Your{" "}
          <em
            className="not-italic text-brand"
            style={{ fontStyle: "italic" }}
          >
            Perfect Mix
          </em>
        </h1>

        {/* Subtext */}
        <p
          className="text-sm sm:text-base font-normal max-w-md leading-relaxed animate-fade-up"
          style={{
            color: "var(--text-secondary)",
            animationDelay: "0.12s",
          }}
        >
          From timeless classics to bold new creations — discover your next
          signature drink.
        </p>

        {/* Search form */}
        <div
          className="w-full animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <SearchForm
            categories={categories}
            isLoading={isLoading}
            onSubmit={onSubmit}
            resultsRef={resultsRef}
          />
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <ScrollArrow onClick={handleScrollToResults} />
    </section>
  );
}
