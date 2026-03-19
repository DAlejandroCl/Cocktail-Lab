# 🏗️ Architecture — Cocktail Lab

## Overview

Cocktail Lab follows a **modular, layered architecture** designed to keep responsibilities clearly separated and allow each feature to scale independently. It is a multi-page SPA built with React + TypeScript, structured around unidirectional data flow and a composed global state using Zustand's Slice Pattern.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                      Browser                        │
│                                                     │
│  ┌─────────┐    ┌──────────────────────────────┐    │
│  │  React  │    │        React Router DOM      │    │
│  │  Root   │──▶│   Layout / Route Definition  │    │
│  └─────────┘    └──────────────────────────────┘    │
│                         │                           │
│                 ┌────────▼────────┐                 │
│                 │     Views       │  (pages/routes) │
│                 └────────┬────────┘                 │
│                          │                          │
│                 ┌────────▼────────┐                 │
│                 │   Components    │  (UI building   │
│                 │   (reusable)    │   blocks)       │
│                 └────────┬────────┘                 │
│                          │                          │
│          ┌───────────────┼───────────────┐          │
│          ▼               ▼               ▼          │
│   ┌─────────────┐  ┌──────────┐  ┌───────────────┐  │
│   │  Selectors  │  │  Store   │  │   Services    │  │
│   │  (derived   │  │ (Zustand │  │   (Axios +    │  │
│   │   state)    │  │  Slices) │  │    Zod)       │  │
│   └─────────────┘  └──────────┘  └───────────────┘  │
│                          │               │          │
│                   ┌──────▼──────┐  ┌────▼────────┐  │
│                   │  Domain     │  │  API (TheCo-│  │
│                   │  Models     │  │ cktailDB)   │  │
│                   │  (TypeScript│  └─────────────┘  │
│                   │   types)    │                   │
│                   └─────────────┘                   │
└─────────────────────────────────────────────────────┘
```

---

## 2. Layers Explained

### 2.1 Views (Page-Level Components)

Located in `src/views/`

Views are route-level components. Each view corresponds to a URL route defined in the React Router DOM configuration. Views are responsible for:

- Composing the layout using smaller components
- Triggering initial data fetches (via store actions)
- Reading page-level state from selectors
- Managing local presentation state (sort option, visibleCount)

Views do **not** contain business logic or direct API calls.

**Views in this project:**

- `IndexPage` — Home page. Renders `HeroSection` above a `DrinkGrid` component. Manages sort state, infinite scroll pagination (`visibleCount` + scroll listener), and auto-scroll to results after a successful search. `DrinkGrid` is a local sub-component that owns pagination and shows skeleton placeholders while loading more.
- `FavoritesPage` — Saved cocktails with `SortSelector` (defaults to recently-added order). Opens recipe detail via Modal.
- `GenerateAI` — AI-powered cocktail generator that composes a recipe from a user-supplied ingredient list.

### 2.2 Components (Reusable UI)

Located in `src/components/`

Components are reusable UI building blocks. They receive data via props and emit events via callbacks. Components are **not** aware of the global store unless they need to dispatch a local action (e.g. `DrinkCard` dispatching to the favorites slice).

**Components in this project:**

- `Header` — Sticky navbar with `AnimatedNav` (sliding underline indicator using `requestAnimationFrame` + `geometryRef`) and `Logo` (letter-bounce animation on hover via CSS keyframes with staggered delays).
- `HeroSection` — Full-viewport-height section with five sub-systems:
  - `MeshGradient` — Two morphing blobs with `filter: blur` and `mix-blend-mode: multiply` (light) / `screen` (dark) that create an animated ambient background. Orange blob left, blue blob right, desynced animation durations (14s / 17s).
  - `Ticker` — Single horizontal strip of 25 cocktail names scrolling at 50s/cycle. Items are duplicated internally for a seamless seamless loop. Runs forward direction only (one ticker, top position).
  - `Bubbles` — 20 orbs with negative `animation-delay` values so they spawn distributed across the hero on load rather than all at the bottom. Clipped by `.hero-bubble-zone` (`overflow: hidden`, `top: 37px`, `bottom: 0`).
  - `ScrollArrow` — Centered circle button that smooth-scrolls to the results section.
  - Hero fade — CSS `::after` pseudo-element (100px, `linear-gradient to bottom`) that dissolves the mesh gradient into the page background.
- `SearchForm` — Ingredient text input + HeadlessUI `Listbox` category dropdown + clear button. Accepts a `resultsRef` to scroll to results on successful submit.
- `SortSelector` — Generic pill-group component, typed with `<T extends string>` to work with both `SortOption` and `SortOptionFavorites`.
- `DrinkCard` — Card with thumbnail, category badge, and favorites toggle.
- `Modal` — Recipe detail overlay (HeadlessUI `Dialog`) with ingredients, step-by-step instructions, and favorites action.
- `Notification` — Global toast with auto-dismiss and hover-pause behavior.
- `SkeletonDrinkCard` — Animated loading placeholder that mirrors the `DrinkCard` layout.
- `ErrorBoundary` — UI crash isolation with accessible fallback and focus management.
- `ThemeToggle` — Light/dark mode toggle connected to `useThemeStore`.

### 2.3 Store — Zustand Slice Pattern

Located in `src/stores/`

The global state is composed from independent **slices**, each responsible for a distinct feature domain. The slices are merged into a single Zustand store using the Slice Pattern.

```
stores/
├── useAppStore.ts        ← Composed store (merges all slices, applies persist middleware)
├── recipeSlice.ts        ← Recipe browsing, search, loading and modal state
├── favoritesSlice.ts     ← Favorites map + favoriteOrder timestamps + localStorage persistence
├── notificationSlice.ts  ← Global notification state
├── generateAISlice.ts    ← AI recipe generation state
├── useThemeStore.ts      ← Theme preference (light/dark) with localStorage persistence
└── selectors.ts          ← Derived state selectors (co-located with store)
```

**`recipeSlice` — key behaviors:**

- `searchRecipes(filters)` — when called with empty filters (`{ category: "", ingredient: "" }`) it calls `getBrowseRecipes(categories)` from the service layer. Otherwise it calls `getRecipes(filters)` with the user's search criteria.
- `hasSearched` — boolean that tracks whether any search has been submitted in the current session.
- No `isBrowsing` flag — the distinction between browse and filtered search is handled at the view level by checking whether filters are empty.

**`favoritesSlice` — key behaviors:**

- `favorites` — a `Record<string, RecipeDetail>` map for O(1) lookups.
- `favoriteOrder` — a parallel `Record<string, number>` of Unix timestamps. Kept separate from `RecipeDetail` so the domain model (inferred from Zod) stays unmodified.
- Both are persisted to `localStorage` via `zustand/middleware/persist`.

### 2.4 Selectors Layer

Located in `src/stores/selectors.ts`

Selectors are typed functions that derive computed state from the store. Components call `useAppStore` with a selector to subscribe only to the data they need.

```ts
export const selectDrinks          = (s: AppState) => s.drinks;
export const selectFavoritesMap    = (s: AppState) => s.favorites;
export const selectFavoriteOrder   = (s: AppState) => s.favoriteOrder;
export const selectHasSearched     = (s: AppState) => s.hasSearched;
export const selectIsFavorite      = (id: string) => (s: AppState) => !!s.favorites[id];
```

### 2.5 Sort Layer

Located in `src/utils/sortRecipes.ts`

Client-side sort logic lives outside the store as **pure functions**. Sort is a presentation concern, not a business concern.

```ts
sortDrinks<T>(drinks: T[], option: SortOption): T[]
sortFavorites<T>(drinks: T[], option: SortOptionFavorites, order: FavoriteOrder): T[]
```

`sortFavorites` receives the `favoriteOrder` record from the store to sort by timestamp.

### 2.6 Services Layer

Located in `src/services/recipeService.ts`

Services handle all HTTP communication. They use **Axios** and validate all responses through **Zod schemas**.

**Key functions:**

- `getCategories()` — fetches `list.php?c=list`, returns `string[]`
- `getRecipes(filters)` — routes to `searchByName`, `searchByIngredient`, `searchByCategory`, or a combination, deduplicates, and optionally enriches with categories via `getRecipeById`
- `getBrowseRecipes(categories)` — parallel `filter.php?c=` calls for every category, caps at 12 per category, deduplicates, Fisher-Yates shuffles. This is the engine behind Browse All Recipes.
- `getRecipeById(id)` — `lookup.php?i=` for full recipe detail
- `deduplicate(drinks)` — internal utility that uses a `Map<idDrink, Drink>` to remove duplicates across search results

### 2.7 Schemas (Zod)

Located in `src/utils/recipes-schemas.ts`

Zod schemas define the **expected shape** of every API response. TypeScript domain types in `src/types/index.ts` are inferred directly from these schemas using `z.infer<>`.

### 2.8 Domain Models (TypeScript Types)

Located in `src/types/index.ts`

Domain types are inferred directly from Zod schemas — never written manually.

```ts
export type Drink        = z.infer<typeof DrinkAPIResponse>;
export type RecipeDetail = z.infer<typeof RecipeAPIResponseSchema>;
```

---

## 3. Data Flow (Unidirectional)

```
User Interaction
      │
      ▼
  Component
  (dispatches action via selector/store binding)
      │
      ▼
  Zustand Slice Action
  (may call a Service)
      │
      ▼
  Service
  (calls API via Axios)
      │
      ▼
  Zod Schema Validation
  (validates response)
      │
      ▼
  Store State Update
      │
      ▼
  Selector (derived state)
      │
      ▼
  Component Re-render
```

---

## 4. Routing Architecture

React Router DOM v7 with **layout-based** structure. All three views are lazy-loaded with `React.lazy()`.

```
/            →  IndexPage      (hero + search + drink grid)
/favorites   →  FavoritesPage  (saved cocktails with sort)
/ai          →  GenerateAI     (AI recipe generator)
```

Recipe detail renders as a `<Modal>` overlay — there is no `/cocktail/:id` route. All routes share `<Layout>` which renders `<Header>`, `<Modal>`, `<Notification>`, and `<ErrorBoundary>`.

---

## 5. Infinite Scroll Architecture

The drink grid uses a **scroll event listener** approach (not `IntersectionObserver`) because the data is already in memory and the listener approach gives more precise control.

```
IndexPage
  ├── sortedDrinks = useMemo(sortDrinks(drinks, sortOption))
  ├── gridKey = `${ids.join(",")}-${sortOption}`   ← forces DrinkGrid remount on new data/sort
  └── DrinkGrid (key={gridKey})
        ├── visibleCount (useState, starts at 20)
        ├── showSkeletons (useState)
        ├── scroll listener → getBoundingClientRect().bottom <= window.innerHeight + 300
        │     loadingRef prevents concurrent fires
        │     setShowSkeletons(true) → requestAnimationFrame → setVisibleCount(+20) → setShowSkeletons(false)
        └── renders sortedDrinks.slice(0, visibleCount) + skeletons if showSkeletons
```

The `gridKey` pattern forces `DrinkGrid` to unmount and remount whenever the dataset or sort changes, automatically resetting `visibleCount` to 20 without any `useEffect` cascade.

---

## 6. Hero Section Architecture

```
HeroSection
  ├── MeshGradient         — two animated blobs, mix-blend-mode per theme
  ├── Ticker               — 25 cocktails × 2 (duplicated for loop), 50s cycle
  ├── hero-bubble-zone     — overflow:hidden clip layer (top: 37px, bottom: 0)
  │     └── Bubbles        — 20 orbs with negative animation-delay, no interaction
  ├── Content div (z-index: 3)
  │     ├── heading
  │     ├── subtext
  │     └── SearchForm
  ├── ScrollArrow          — flex justify-center, py-6 spacing
  └── ::after pseudo       — 100px fade to --bg-base at bottom edge
```

---

## 7. State Persistence

Two stores use Zustand's `persist` middleware with `localStorage`:

- **favoritesSlice** — persists `favorites` and `favoriteOrder`. Both restored on page load.
- **useThemeStore** — persists `theme` (`"light"` | `"dark"`). Applied as a class on `<html>` via `useEffect`.

---

## 8. Client-Side Sort Architecture

Sort state is local `useState` in each view — never persisted or stored globally.

```
View (useState: sortOption)
      │
      ▼
sortDrinks / sortFavorites   ← pure function from utils/sortRecipes.ts
      │
      ▼
useMemo(sorted array)        ← recalculated only when drinks or sortOption changes
      │
      ▼
gridKey changes → DrinkGrid remounts → visibleCount resets to 20
```

---

## 9. Design System (CSS)

Located in `src/index.css`

Built on **Tailwind CSS v4** with a custom `@layer components` block. All custom classes are in a single `@layer components` block (multiple separate blocks cause cascade issues in Tailwind v4 dev mode).

**Key CSS variables defined in `:root` and `:root.dark`:**

- `--color-brand`, `--color-brand-light`, `--color-brand-dark` — orange palette
- `--color-surface-dark-*` — dark theme surface ramp
- `--color-ink-*` — text color ramp
- `--bg-base`, `--bg-card`, `--bg-overlay` — semantic background tokens
- `--grid-bg` — neutral background for the results section (plain `--bg-base`, no gradient)
- `--shadow-brand`, `--shadow-card` — shadow tokens
- `--ease-out-soft`, `--ease-out-smooth` — easing tokens

**Notable component classes:**
- `.hero-mesh` — `mix-blend-mode: multiply` (light) / `screen` (dark)
- `.hero-bubble-zone` — `overflow: hidden` clip for bubbles
- `.hero-full-height::after` — fade at hero bottom edge
- `.scroll-arrow`, `.scroll-to-top` — shared orange circle system
- `.btn-brand` — always `color: #ffffff` regardless of theme
- `.page-gradient-bg` — simple `background: var(--bg-base)` wrapper

---

## 10. Error Handling Strategy

| Layer | Error Handling |
|-------|----------------|
| **Service** | `safeGet` wraps Axios in try/catch; Zod `safeParse` used for validation — no throws |
| **Store slice** | try/catch wraps async actions; errors dispatched to notification slice |
| **Notification slice** | Centralized toast queue |
| **React** | `<ErrorBoundary>` at root level catches rendering errors |

---

## 11. Key Design Decisions

**Why `getBrowseRecipes` instead of a random endpoint?**
The free TheCocktailDB API has a `/random.php` endpoint but it returns one random drink per call. With 150 parallel calls, duplicates reduce the effective count to 6-20 unique drinks — non-deterministic and inconsistent. `getBrowseRecipes` instead fetches each category's full list via `filter.php?c=`, caps at 12 per category, deduplicates, and shuffles. This gives a consistent ~130 drinks every time.

**Why sort outside the store?**
Sort is a presentation concern. Keeping it as a pure utility function + local `useState` avoids polluting the store with transient UI state and makes the sort functions trivially testable.

**Why `favoriteOrder` as a parallel Record?**
`RecipeDetail` is inferred from a Zod schema. Adding `addedAt` to it would require modifying the schema and stripping the field before any API comparison. A parallel `Record<string, number>` keeps the domain model pure.

**Why `gridKey` for pagination reset instead of `useEffect`?**
Setting state in a `useEffect` body causes cascading renders (linter warning). Setting state during render with a ref comparison is also disallowed. The `key` prop pattern is the React-idiomatic solution — changing the key unmounts and remounts the child, resetting all its local state cleanly.

**Why a scroll listener instead of `IntersectionObserver` for infinite scroll?**
With data already in memory, `IntersectionObserver` fires immediately on mount (the sentinel is within the viewport before any cards are rendered), causing all batches to load at once. A scroll listener with `getBoundingClientRect()` gives explicit control and avoids this timing issue.
