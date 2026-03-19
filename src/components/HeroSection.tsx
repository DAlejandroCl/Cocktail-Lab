import { useRef } from "react";
import SearchForm from "./SearchForm";
import type { SearchFilters } from "./SearchForm";

interface HeroSectionProps {
  categories: string[];
  isLoading: boolean;
  onSubmit: (filters: SearchFilters) => void;
  resultsRef: React.RefObject<HTMLElement | null>;
}

/* ─────────────────────────────────────────────────────────────
   TICKER
───────────────────────────────────────────────────────────── */

const COCKTAILS = [
  "Mojito", "Negroni", "Margarita", "Old Fashioned", "Daiquiri",
  "Cosmopolitan", "Aperol Spritz", "Gin & Tonic", "Espresso Martini", "Manhattan",
  "Whiskey Sour", "Tom Collins", "Paloma", "Dark & Stormy", "Penicillin",
  "Bramble", "French 75", "Clover Club", "Aviation", "Last Word",
  "Bee's Knees", "Paper Plane", "Naked & Famous", "Jungle Bird", "Trinidad Sour",
];

function Ticker({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="hero-ticker" aria-hidden="true">
      <div className={`hero-ticker__track${reverse ? " hero-ticker__track--rev" : ""}`}>
        {doubled.map((item, i) => (
          <span key={i} className="hero-ticker__item">
            {item}<span className="hero-ticker__dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LAVA LAMP BACKGROUND
   Two organic blobs — orange left, blue right — that morph and
   drift slowly to create the lava lamp effect.
───────────────────────────────────────────────────────────── */

function MeshGradient() {
  return (
    <div aria-hidden="true" className="hero-mesh">
      <div className="hero-mesh__blob hero-mesh__blob--orange" />
      <div className="hero-mesh__blob hero-mesh__blob--blue" />
      <div className="hero-mesh__blob hero-mesh__blob--center" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BUBBLES — simple rising orbs, no interaction
───────────────────────────────────────────────────────────── */

const BUBBLE_CONFIG = [
  { w: 48, l: "5%",  dur: 9,    del: -3,   d: 6  },
  { w: 32, l: "10%", dur: 12,   del: -8,   d: -4 },
  { w: 64, l: "16%", dur: 14,   del: -5,   d: 9  },
  { w: 30, l: "22%", dur: 8,    del: -2,   d: 3  },
  { w: 44, l: "28%", dur: 11,   del: -9,   d: -7 },
  { w: 36, l: "34%", dur: 13,   del: -4,   d: 5  },
  { w: 58, l: "40%", dur: 16,   del: -11,  d: -8 },
  { w: 30, l: "46%", dur: 9,    del: -6,   d: 4  },
  { w: 46, l: "52%", dur: 12,   del: -1,   d: 6  },
  { w: 60, l: "58%", dur: 17,   del: -13,  d: -9 },
  { w: 30, l: "64%", dur: 10,   del: -7,   d: 3  },
  { w: 42, l: "70%", dur: 14,   del: -3,   d: -5 },
  { w: 54, l: "76%", dur: 15,   del: -10,  d: 7  },
  { w: 34, l: "82%", dur: 10,   del: -5,   d: -4 },
  { w: 38, l: "88%", dur: 12,   del: -8,   d: 5  },
  { w: 30, l: "94%", dur: 8,    del: -2,   d: -3 },
  { w: 44, l: "3%",  dur: 18,   del: -14,  d: 8  },
  { w: 56, l: "48%", dur: 20,   del: -16,  d: -6 },
  { w: 36, l: "91%", dur: 16,   del: -9,   d: 6  },
  { w: 32, l: "37%", dur: 10,   del: -4,   d: -3 },
] as const;

function Bubbles() {
  return (
    <div aria-hidden="true" className="absolute inset-0" style={{ zIndex: 1, pointerEvents: "none" }}>
      {BUBBLE_CONFIG.map((cfg, i) => (
        <div
          key={i}
          className="bubble bubble--simple"
          style={{
            width:             cfg.w,
            height:            cfg.w,
            left:              cfg.l,
            bottom:            0,
            animationDuration: `${cfg.dur}s`,
            animationDelay:    `${cfg.del}s`,
            ["--d" as string]: `${cfg.d}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCROLL ARROW
───────────────────────────────────────────────────────────── */

function ScrollArrow({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Scroll to results" className="scroll-arrow">
      <span className="scroll-arrow__label">Explore</span>
      <span className="flex flex-col items-center" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <svg key={i} className={`scroll-arrow__chevron scroll-arrow__chevron--${i}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        ))}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────────────────────── */

export default function HeroSection({ categories, isLoading, onSubmit, resultsRef }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);

  const handleScrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={heroRef}
      className="hero-full-height relative flex flex-col"
      aria-label="Search cocktails"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      {/* ── Mesh gradient background ── */}
      <MeshGradient />

      {/* ── Top ticker ── */}
      <Ticker items={COCKTAILS} />

      {/* ── Bubble clip zone — clipped between tickers ── */}
      <div className="hero-bubble-zone" aria-hidden="true">
        <Bubbles />
      </div>

      {/* ── Main content ── */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8"
        style={{ zIndex: 3 }}
      >
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-12">
          <h1
            className="font-serif leading-tight animate-fade-up"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", color: "var(--text-primary)", animationDelay: "0.05s" }}
          >
            Find Your{" "}
            <em className="not-italic text-brand" style={{ fontStyle: "italic" }}>Perfect Mix</em>
          </h1>

          <p
            className="text-sm sm:text-base font-normal max-w-md leading-relaxed animate-fade-up"
            style={{ color: "var(--text-secondary)", animationDelay: "0.12s" }}
          >
            From timeless classics to bold new creations — discover your next signature drink.
          </p>

          <div className="w-full animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <SearchForm categories={categories} isLoading={isLoading} onSubmit={onSubmit} resultsRef={resultsRef} />
          </div>
        </div>
      </div>

      {/* ── Scroll arrow ── */}
      <div className="flex justify-center py-6" style={{ zIndex: 3 }}>
        <ScrollArrow onClick={handleScrollToResults} />
      </div>
    </section>
  );
}
