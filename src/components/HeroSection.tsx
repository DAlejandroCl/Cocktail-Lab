import { useEffect, useRef } from "react";
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
   TICKER — infinite horizontal scroll strip
───────────────────────────────────────────────────────────── */

const COCKTAILS = [
  "Mojito", "Negroni", "Margarita", "Old Fashioned", "Daiquiri",
  "Cosmopolitan", "Aperol Spritz", "Gin & Tonic", "Espresso Martini", "Manhattan",
];

const INGREDIENTS = [
  "Gin", "Rum", "Vodka", "Tequila", "Whiskey",
  "Vermouth", "Campari", "Triple Sec", "Aperol", "Angostura",
];

interface TickerProps {
  items: string[];
  reverse?: boolean;
}

function Ticker({ items, reverse = false }: TickerProps) {
  // Duplicate for seamless loop
  const doubled = [...items, ...items];
  return (
    <div className="hero-ticker" aria-hidden="true">
      <div className={`hero-ticker__track${reverse ? " hero-ticker__track--rev" : ""}`}>
        {doubled.map((item, i) => (
          <span key={i} className="hero-ticker__item">
            {item}
            <span className="hero-ticker__dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BUBBLES — floating animated orbs with pop-on-click
───────────────────────────────────────────────────────────── */

const BUBBLE_CONFIG = [
  { w: 48, l: "5%",  dur: 6.5,  del: 0,   d: 6,  v: "fill"    },
  { w: 32, l: "10%", dur: 8,    del: 0.8, d: -4,  v: "outline" },
  { w: 64, l: "16%", dur: 10,   del: 2.2, d: 9,   v: "glow"    },
  { w: 30, l: "22%", dur: 5.8,  del: 0.3, d: 3,   v: "fill"    },
  { w: 44, l: "28%", dur: 7.5,  del: 3.1, d: -7,  v: "outline" },
  { w: 36, l: "34%", dur: 9,    del: 1.5, d: 5,   v: "fill"    },
  { w: 58, l: "40%", dur: 11,   del: 0.9, d: -8,  v: "glow"    },
  { w: 30, l: "46%", dur: 6,    del: 4,   d: 4,   v: "outline" },
  { w: 46, l: "52%", dur: 8.5,  del: 1.8, d: 6,   v: "fill"    },
  { w: 60, l: "58%", dur: 12,   del: 0.6, d: -9,  v: "glow"    },
  { w: 30, l: "64%", dur: 7,    del: 3.7, d: 3,   v: "outline" },
  { w: 42, l: "70%", dur: 9.5,  del: 2.5, d: -5,  v: "fill"    },
  { w: 54, l: "76%", dur: 10.5, del: 1.1, d: 7,   v: "glow"    },
  { w: 34, l: "82%", dur: 6.8,  del: 4.5, d: -4,  v: "outline" },
  { w: 38, l: "88%", dur: 8.2,  del: 2.9, d: 5,   v: "fill"    },
  { w: 30, l: "94%", dur: 5.5,  del: 1.4, d: -3,  v: "glow"    },
  { w: 44, l: "3%",  dur: 13,   del: 5.5, d: 8,   v: "fill"    },
  { w: 56, l: "48%", dur: 14,   del: 6,   d: -6,  v: "outline" },
  { w: 36, l: "91%", dur: 11.5, del: 3.3, d: 6,   v: "glow"    },
  { w: 32, l: "37%", dur: 7.2,  del: 5,   d: -3,  v: "fill"    },
] as const;

const FRAG_DIRS = [[-28,-38],[-14,-44],[0,-46],[14,-44],[28,-38],[38,-28],[44,-14],[-38,-28],[-44,-14],[-24,30],[24,30],[38,18]];

function Bubbles() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    function explode(bubble: HTMLElement) {
      const hero  = layer!.closest("section")!;
      const br    = bubble.getBoundingClientRect();
      const hr    = hero.getBoundingClientRect();
      const cx    = br.left - hr.left + br.width  / 2;
      const cy    = br.top  - hr.top  + br.height / 2;
      const r     = br.width / 2;

      // Expand ring
      const ring  = document.createElement("div");
      ring.className = "bubble-ring";
      ring.style.cssText = `left:${cx - r}px;top:${cy - r}px;width:${r * 2}px;height:${r * 2}px`;
      hero.appendChild(ring);
      setTimeout(() => ring.remove(), 450);

      // Fragments
      FRAG_DIRS.filter((_, i) => i % 2 === 0).forEach(([fx, fy], i) => {
        const f  = document.createElement("div");
        const sz = Math.random() * 5 + 3;
        const sc = 1 + Math.random() * 0.5;
        const du = (Math.random() * 0.15 + 0.35).toFixed(2);
        f.className = "bubble-frag";
        f.style.cssText = [
          `left:${cx - sz / 2}px`, `top:${cy - sz / 2}px`,
          `width:${sz}px`, `height:${sz}px`,
          `--fx:${(fx * sc).toFixed(0)}px`, `--fy:${(fy * sc).toFixed(0)}px`,
          `--dur:${du}s`, `animation-delay:${(i * 0.018).toFixed(3)}s`,
        ].join(";");
        hero.appendChild(f);
        setTimeout(() => f.remove(), 620);
      });

      // Fade out and respawn
      const { left, width, height } = bubble.style;
      const dur  = bubble.style.animationDuration;
      const cls  = [...bubble.classList].filter(c => c !== "bubble").join(" ");
      const d    = bubble.style.getPropertyValue("--d");

      bubble.style.transition = "opacity .1s";
      bubble.style.opacity    = "0";

      setTimeout(() => {
        bubble.remove();
        const nb = document.createElement("div");
        nb.className = `bubble ${cls}`;
        nb.style.cssText = `width:${width};height:${height};left:${left};bottom:0;animation-duration:${dur};animation-delay:${(Math.random() * 2.5).toFixed(1)}s`;
        nb.style.setProperty("--d", d);
        layer!.appendChild(nb);
        attachHandlers(nb);
      }, 340);
    }

    function attachHandlers(b: HTMLElement) {
      b.addEventListener("click",      () => explode(b));
      b.addEventListener("mouseenter", () => { b.style.transform = "scale(1.45)"; });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
    }

    layer.querySelectorAll<HTMLElement>(".bubble").forEach(attachHandlers);

    return () => {
      layer.querySelectorAll<HTMLElement>(".bubble").forEach(b => {
        b.replaceWith(b.cloneNode(true)); // remove listeners
      });
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {BUBBLE_CONFIG.map((cfg, i) => (
        <div
          key={i}
          className={`bubble bubble--${cfg.v}`}
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
    <button
      type="button"
      onClick={onClick}
      aria-label="Scroll to results"
      className="scroll-arrow"
    >
      <span className="scroll-arrow__label">Explore</span>
      <span className="flex flex-col items-center" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            className={`scroll-arrow__chevron scroll-arrow__chevron--${i}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
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
      className="hero-full-height relative flex flex-col overflow-hidden"
      aria-label="Search cocktails"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      {/* ── Dual asymmetric glow ── */}
      <div aria-hidden="true" className="hero-glow-a" />
      <div aria-hidden="true" className="hero-glow-b" />

      {/* ── Bubbles ── */}
      <Bubbles />

      {/* ── Top ticker ── */}
      <Ticker items={COCKTAILS} />

      {/* ── Main content ── */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8"
        style={{ zIndex: 2 }}
      >
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-12">
          <h1
            className="font-serif leading-tight animate-fade-up"
            style={{
              fontSize:       "clamp(2.4rem, 6vw, 4.5rem)",
              color:          "var(--text-primary)",
              animationDelay: "0.05s",
            }}
          >
            Find Your{" "}
            <em className="not-italic text-brand" style={{ fontStyle: "italic" }}>
              Perfect Mix
            </em>
          </h1>

          <p
            className="text-sm sm:text-base font-normal max-w-md leading-relaxed animate-fade-up"
            style={{ color: "var(--text-secondary)", animationDelay: "0.12s" }}
          >
            From timeless classics to bold new creations — discover your next
            signature drink.
          </p>

          <div className="w-full animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <SearchForm
              categories={categories}
              isLoading={isLoading}
              onSubmit={onSubmit}
              resultsRef={resultsRef}
            />
          </div>
        </div>
      </div>

      {/* ── Scroll arrow — centered between form and bottom ticker ── */}
      <div className="flex justify-center py-6" style={{ zIndex: 2 }}>
        <ScrollArrow onClick={handleScrollToResults} />
      </div>

      {/* ── Bottom ticker (reverse) ── */}
      <Ticker items={INGREDIENTS} reverse />
    </section>
  );
}
