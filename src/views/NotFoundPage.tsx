import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="text-center max-w-sm">

        {/* Icon */}
        <div
          className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "rgba(242, 127, 13, 0.1)", border: "1px solid rgba(242, 127, 13, 0.2)" }}
          aria-hidden="true"
        >
          <svg
            className="w-9 h-9"
            style={{ color: "var(--color-brand)" }}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.75 3.75H14.25M3.75 3.75H20.25L17.25 12.75C16.5 15 14.25 16.5 12 16.5C9.75 16.5 7.5 15 6.75 12.75L3.75 3.75Z" />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 16.5V20.25M8.25 20.25H15.75" />
          </svg>
        </div>

        {/* Heading */}
        <p
          className="text-6xl font-bold font-serif mb-2"
          style={{ color: "var(--color-brand)" }}
          aria-hidden="true"
        >
          404
        </p>
        <h1
          className="text-xl font-bold uppercase tracking-tighter mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Recipe Not Found
        </h1>
        <p
          className="text-sm mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          Looks like this cocktail doesn't exist in our bar. Head back home and discover something delicious.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn-brand h-11 px-6 rounded-xl text-sm inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
          <Link
            to="/ai"
            className="btn-ghost h-11 px-6 rounded-xl text-sm inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a1 1 0 011 1v1.268l1.098-.634a1 1 0 011 1.732L10 5.732V7h1.268l.634-1.098a1 1 0 011.732 1L12.268 8l1.366.098a1 1 0 010 1.732L12.268 10H11v1.268l1.098.634a1 1 0 01-1 1.732L10 12.268V11H8.732l-.634 1.098a1 1 0 01-1.732-1L7.732 10H7v-.732l-1.098.634a1 1 0 01-1-1.732L6.268 8 4.902 7.902a1 1 0 010-1.732L6.268 7H7V5.732L5.902 5.098a1 1 0 011-1.732L8 3.97V2a1 1 0 011-1z" />
            </svg>
            Try AI Generator
          </Link>
        </div>

      </div>
    </main>
  );
}
