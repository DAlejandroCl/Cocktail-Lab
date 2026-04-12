import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./layouts/Layout";

// All views lazy-loaded — chunks load only when the route is first visited.
// Suspense provides a skeleton fallback so users never see a blank screen.
const IndexPage    = lazy(() => import("./views/IndexPage"));
const FavoritesPage = lazy(() => import("./views/FavoritesPage"));
const GenerateAI   = lazy(() => import("./views/GenerateAI"));
const NotFoundPage = lazy(() => import("./views/NotFoundPage"));

/* ─────────────────────────────────────────────────────────────
   PAGE SKELETON
   Shown by Suspense while a lazy chunk is loading.
   Matches the page background so the transition is seamless.
───────────────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading page" aria-live="polite"
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-brand)", borderTopColor: "transparent" }}
          aria-hidden="true"
        />
        <p className="text-xs font-medium tracking-widest uppercase animate-pulse"
          style={{ color: "var(--text-muted)" }}>
          Loading…
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROUTES
───────────────────────────────────────────────────────────── */

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index           element={<IndexPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="ai"        element={<GenerateAI />} />
          {/* Catch-all: any unknown URL renders the 404 page */}
          <Route path="*"         element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
