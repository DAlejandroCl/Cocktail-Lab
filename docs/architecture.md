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
│  │  Root   │──▶│   Layout / Route Definition  │     │
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

Views do **not** contain business logic or direct API calls.

**Views in this project:**
- `IndexPage` — Browse and search cocktails by category or ingredient; opens recipe detail as a Modal overlay
- `FavoritesPage` — Saved cocktails with remove action and detail access via Modal

### 2.2 Components (Reusable UI)

Located in `src/components/`

Components are pure, reusable UI building blocks. They receive data via props and emit events via callbacks. Components are **not** aware of the global store and do not call the API directly.

**Components in this project:**
- `DrinkCard` — Card with thumbnail, name, category, and favorites toggle
- `Header` — Navigation bar with search input and HeadlessUI category selector
- `Modal` — Recipe detail overlay with ingredients, instructions, and favorites action
- `Notification` — Global toast with auto-dismiss and hover-pause behavior
- `SkeletonDrinkCard` — Loading placeholder for the drink grid
- `ErrorBoundary` — UI crash isolation with accessible fallback and focus management

### 2.3 Store — Zustand Slice Pattern

Located in `src/stores/`

The global state is composed from independent **slices**, each responsible for a distinct feature domain. The slices are merged into a single Zustand store using the Slice Pattern.

```
stores/
├── useAppStore.ts        ← Composed store (merges all slices, applies persist middleware)
├── recipeSlice.ts        ← Recipe browsing, search, loading and error state
├── favoritesSlice.ts     ← Favorites management + localStorage persistence
├── notificationSlice.ts  ← Global notification state
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
// Example selector
export const selectFavoriteCount = (state: AppState) =>
  Object.keys(state.favorites).length;
```

**Benefits:**
- Components subscribe only to the data they need (prevents unnecessary re-renders)
- Business derivations are centralized and testable in isolation
- Decouples component code from store shape

### 2.5 Services Layer

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

### 2.6 Schemas (Zod)

Located in `src/utils/recipes-schemas.ts`

Zod schemas define the **expected shape** of every API response. They serve as a runtime contract between the external API and the application's type system. TypeScript domain types in `src/types/index.ts` are inferred directly from these schemas using `z.infer<>`.

```ts
// Example — DrinkAPIResponse schema
const DrinkAPIResponse = z.object({
  idDrink: z.string(),
  strDrink: z.string(),
  strDrinkThumb: z.string().url().or(z.string().min(1)),
  strCategory: z.string().optional(),
});
```

If TheCocktailDB returns an unexpected structure (the API is unreliable and inconsistent), Zod catches it before it can corrupt application state.

### 2.7 Domain Models (TypeScript Types)

Located in `src/types/index.ts`

Domain types are inferred directly from Zod schemas using `z.infer<>`. This means the runtime validation layer and the static type system are always in sync — there is no separate type definition to maintain.

```ts
// Types derived from schemas — never written manually
export type Drink       = z.infer<typeof DrinkAPIResponse>;
export type RecipeDetail = z.infer<typeof RecipeAPIResponseSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
```

The API uses `strDrink`, `idDrink`, `strIngredient1`…`strIngredient15` naming. These field names are preserved inside the typed domain objects — transformation happens at the UI layer when displaying data, not at the model boundary.

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

React Router DOM v7 is configured with a **layout-based** structure. Both views are lazy-loaded with `React.lazy()`, which gives automatic code splitting and suspense boundaries.

```tsx
// src/router.tsx
const IndexPage    = lazy(() => import("./views/IndexPage"));
const FavoritesPage = lazy(() => import("./views/FavoritesPage"));

<Route element={<Layout />}>
  <Route index    element={<IndexPage />} />
  <Route path="favorites" element={<FavoritesPage />} />
</Route>
```

```
/            →  IndexPage      (browse by category, search by ingredient or name)
/favorites   →  FavoritesPage  (saved cocktails)
```

Recipe detail is rendered as a `<Modal>` overlay on top of the current route — there is no separate `/cocktail/:id` page. All routes share the `<Layout>` shell which renders `<Header>`, `<Modal>`, `<Notification>`, and wraps everything in `<ErrorBoundary>`.

---

## 5. State Persistence

The **favorites slice** uses Zustand's `persist` middleware with `localStorage` as the storage adapter. Only the favorites data is persisted — category/search state resets between sessions.

```ts
// Simplified persist configuration
const useFavoritesSlice = persist(
  (set, get) => ({ /* slice */ }),
  {
    name: 'cocktail-lab-favorites',
    partialize: (state) => ({ favorites: state.favorites }),
  }
);
```

---

## 6. Error Handling Strategy

| Layer | Error Handling |
|-------|---------------|
| **Service** | Axios errors caught, Zod validation errors caught, typed errors thrown |
| **Store slice** | try/catch wraps async actions, errors dispatched to notification slice |
| **Notification slice** | Centralized toast queue — components read from it |
| **React** | `<ErrorBoundary>` at the root level catches rendering errors and shows a fallback UI |

---

## 7. Testing Architecture

The architecture is designed to be testable at every layer:

| Layer | Test Type | Isolation |
|-------|-----------|-----------|
| Domain models / Zod schemas | Unit | None (pure functions) |
| Zustand slices | Unit | Store created fresh per test |
| Services | Unit | Axios mocked |
| Selectors | Unit | Pure functions, no mocks |
| Components | Component / Integration | Store provided via wrapper, API mocked |
| Views | Integration | Full store + MSW (Mock Service Worker) |
| User flows | E2E (Playwright) | Real browser, real dev server |

📄 Full testing strategy → [`docs/testing-strategy.md`](testing-strategy.md)

---

## 8. Key Design Decisions

### Why Zustand over Redux?

Zustand provides a minimal API with less boilerplate while still supporting the Slice Pattern for modular state. For a project of this size, Redux would add significant overhead without meaningful benefit.

### Why Zod for validation?

TheCocktailDB is a free public API with inconsistent response structures (fields that should be strings can be `null`, ingredient fields are numbered `strIngredient1`…`strIngredient15`, etc.). Zod catches these inconsistencies at runtime rather than letting them silently corrupt state.

### Why a Selectors layer?

Without centralized selectors, each component would independently subscribe to store fields, leading to duplication and risk of redundant re-renders. The selector layer acts as a contract between store shape and component consumption.

### Why a separate Domain model from API shape?

The CocktailDB API uses inconsistent, prefixed naming (`strDrink`, `idDrink`, `strIngredient1`…`strIngredient15`). Rather than manually remapping these fields, domain types are inferred directly from Zod schemas via `z.infer<>`. This keeps the runtime validation layer and the static type system permanently in sync — there is no separate type definition to maintain or drift from the API shape. The component layer handles display-time formatting (e.g. filtering out null ingredient slots) rather than doing it at parse time.

---

## 9. Folder Structure Reference

```
src/
├── components/       # Reusable UI components (DrinkCard, Header, Modal, etc.)
├── layouts/          # Shared page shell (Layout.tsx — renders Header, Modal, Notification, ErrorBoundary)
├── views/            # Route-level pages (IndexPage, FavoritesPage)
├── stores/           # Zustand slices, composed store, and selectors
├── services/         # API communication (RecipeService — Axios + safeGet + Zod)
├── utils/            # Zod schemas (recipes-schemas.ts)
├── types/            # TypeScript domain types (inferred from Zod schemas)
├── router.tsx        # BrowserRouter + lazy-loaded route definitions
├── main.tsx          # Application entry point
└── index.css         # Global styles (Tailwind base)
```
