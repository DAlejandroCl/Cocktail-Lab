# 🏗️ Architecture — Cocktail Lab

## Overview

Cocktail Lab follows a **modular, layered architecture** designed to keep responsibilities clearly separated and allow each feature to scale independently. The project is a single-page application (SPA) built with React + TypeScript, structured around a unidirectional data flow and a composed global state using Zustand's Slice Pattern.

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
- Managing local presentation state (e.g. active sort option)

Views do **not** contain business logic or direct API calls.

**Views in this project:**
- `IndexPage` — Home page. Renders `HeroSection` (full-height with `SearchForm`) above a results grid. Manages sort state, scroll-to-top visibility, and auto-scroll to results after a successful search.
- `FavoritesPage` — Saved cocktails with `SortSelector` (defaults to recently-added order). Opens recipe detail via Modal.
- `GenerateAI` — AI-powered cocktail generator that composes a recipe from a user-supplied ingredient list.

### 2.2 Components (Reusable UI)

Located in `src/components/`

Components are reusable UI building blocks. They receive data via props and emit events via callbacks. Components are **not** aware of the global store unless they need to dispatch a local action (e.g. `DrinkCard` dispatching to the favorites slice).

**Components in this project:**
- `Header` — Sticky navbar with `AnimatedNav` (sliding underline indicator) and `Logo` (letter-bounce animation on hover).
- `HeroSection` — Full-viewport-height section containing `SearchForm` and a scroll-down arrow that smooth-scrolls to the results grid.
- `SearchForm` — Ingredient text input + HeadlessUI `Listbox` category dropdown + clear button. Accepts a `resultsRef` to scroll to results on successful submit.
- `SortSelector` — Generic pill-group component, typed with a generic `<T extends string>` to work with both `SortOption` and `SortOptionFavorites`.
- `DrinkCard` — Card with thumbnail, category badge, and favorites toggle. Lazy-loads full `RecipeDetail` on first favorite.
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

**Slice responsibilities:**
- State shape definition (typed with TypeScript)
- Actions / state mutation functions
- Async operations (API calls via Services)
- Side effects (localStorage persistence via `zustand/middleware/persist`)

**Why Slice Pattern?**
Each slice can be developed, tested, and reasoned about independently. Slices do not depend on each other's internals — they communicate only through the composed store interface.

### 2.4 Selectors Layer

Located in `src/stores/selectors.ts` (co-located with the store)

Selectors are typed functions that derive computed state from the store. Components call `useAppStore` with a selector to subscribe only to the data they need, preventing unnecessary re-renders.

```ts
// Example selectors
export const selectDrinks         = (s: AppState) => s.drinks;
export const selectFavoritesMap   = (s: AppState) => s.favorites;
export const selectFavoriteOrder  = (s: AppState) => s.favoriteOrder;
export const selectIsFavorite     = (id: string) => (s: AppState) => !!s.favorites[id];
```

**Benefits:**
- Components subscribe only to the data they need (prevents unnecessary re-renders)
- Business derivations are centralized and testable in isolation
- Decouples component code from store shape

### 2.5 Sort Layer

Located in `src/utils/sortRecipes.ts`

Client-side sort logic lives outside the store as **pure functions**. This is intentional — sort is a presentation concern, not a business concern. The store's `recipeSlice` applies its own default alphabetical sort on filtered results; the `sortRecipes` utility layer is an additional on-top transform applied at render time.

```ts
// Two variants — share the same generic constraint (T extends Drink)
sortDrinks<T>(drinks: T[], option: SortOption): T[]
sortFavorites<T>(drinks: T[], option: SortOptionFavorites, order: FavoriteOrder): T[]
```

`sortFavorites` receives the `favoriteOrder` record from the store to sort by timestamp. The `recently-added` option sorts descending by timestamp so the most recently added favorite appears first.

### 2.6 Services Layer

Located in `src/services/`

Services are responsible for all HTTP communication with the TheCocktailDB API. They use **Axios** as the HTTP client and validate all responses through **Zod schemas** before returning data.

```ts
// Data flow in a service function
API Response (raw JSON)
    → Zod schema validation (runtime guard)
    → Domain model transformation
    → Typed data returned to the store
```

Services throw typed errors on validation failure, which the store catches and routes to the notification slice.

### 2.7 Schemas (Zod)

Located in `src/utils/recipes-schemas.ts`

Zod schemas define the **expected shape** of every API response. They serve as a runtime contract between the external API and the application's type system. TypeScript domain types in `src/types/index.ts` are inferred directly from these schemas using `z.infer<>`.

If TheCocktailDB returns an unexpected structure (the API is unreliable and inconsistent), Zod catches it before it can corrupt application state.

### 2.8 Domain Models (TypeScript Types)

Located in `src/types/index.ts`

Domain types are inferred directly from Zod schemas using `z.infer<>`. This means the runtime validation layer and the static type system are always in sync — there is no separate type definition to maintain.

```ts
// Types derived from schemas — never written manually
export type Drink        = z.infer<typeof DrinkAPIResponse>;
export type RecipeDetail = z.infer<typeof RecipeAPIResponseSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
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

React Router DOM v7 is configured with a **layout-based** structure. All three views are lazy-loaded with `React.lazy()`, which gives automatic code splitting and suspense boundaries.

```
/            →  IndexPage      (hero + search + drink grid)
/favorites   →  FavoritesPage  (saved cocktails with sort)
/ai          →  GenerateAI     (AI recipe generator)
```

Recipe detail is rendered as a `<Modal>` overlay on top of the current route — there is no separate `/cocktail/:id` page. All routes share the `<Layout>` shell which renders `<Header>`, `<Modal>`, `<Notification>`, and wraps everything in `<ErrorBoundary>`.

---

## 5. State Persistence

Two stores use Zustand's `persist` middleware with `localStorage`:

- **favoritesSlice** — persists `favorites` (the `RecipeDetail` map) and `favoriteOrder` (the timestamp record). Both are restored on page load so the recently-added sort order survives browser sessions.
- **useThemeStore** — persists the `theme` preference (`"light"` | `"dark"`).

---

## 6. Client-Side Sort Architecture

Sort state lives locally in each view (`useState`) — it is never persisted or stored globally. This keeps the store lean and treats sort as what it is: a transient presentation preference.

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
Grid render
```

For `FavoritesPage`, `sortFavorites` additionally receives `favoriteOrder` from the store so it can sort by add timestamp.

---

## 7. Error Handling Strategy

| Layer | Error Handling |
|-------|---------------|
| **Service** | Axios errors caught, Zod validation errors caught, typed errors thrown |
| **Store slice** | try/catch wraps async actions, errors dispatched to notification slice |
| **Notification slice** | Centralized toast queue — components read from it |
| **React** | `<ErrorBoundary>` at the root level catches rendering errors and shows a fallback UI |

---

## 8. Key Design Decisions

### Why sort outside the store?
Sort is a presentation concern — it does not affect what data is fetched or stored, only how it is displayed. Keeping it as a pure utility function + local `useState` avoids polluting the store with transient UI state and makes the sort functions trivially testable in isolation.

### Why `favoriteOrder` as a parallel Record instead of annotating `RecipeDetail`?
`RecipeDetail` is inferred from a Zod schema. Adding a `addedAt` timestamp to it would require modifying the schema, which would then need to be stripped before any comparison or validation against the API. A parallel `Record<string, number>` keeps the domain model pure and the timestamp concern isolated in the slice.

### Why Zustand over Redux?
Zustand provides a minimal API with less boilerplate while still supporting the Slice Pattern for modular state. For a project of this size, Redux would add significant overhead without meaningful benefit.

### Why Zod for validation?
TheCocktailDB is a free public API with inconsistent response structures (fields that should be strings can be `null`, ingredient fields are numbered `strIngredient1`…`strIngredient15`, etc.). Zod catches these inconsistencies at runtime rather than letting them silently corrupt state.

### Why a Selectors layer?
Without centralized selectors, each component would independently subscribe to store fields, leading to duplication and risk of redundant re-renders. The selector layer acts as a contract between store shape and component consumption.

---

## 9. Folder Structure Reference

```
src/
├── components/       # Reusable UI (Header, HeroSection, SearchForm, SortSelector, DrinkCard, Modal, ...)
├── layouts/          # Shared page shell (Layout.tsx)
├── views/            # Route-level pages (IndexPage, FavoritesPage, GenerateAI)
├── stores/           # Zustand slices, composed store, selectors, theme store
├── services/         # API communication (Axios + Zod)
├── utils/            # Zod schemas + sortRecipes pure utilities
├── types/            # TypeScript domain types (inferred from Zod schemas)
├── router.tsx        # BrowserRouter + lazy-loaded route definitions
├── main.tsx          # Application entry point
└── index.css         # Global styles (Tailwind v4 @theme + @layer components)
```
