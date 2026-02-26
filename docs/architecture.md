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

**Examples:**
- `HomeView` — Browse cocktails by category
- `SearchView` — Search cocktails by name or ingredient
- `DetailView` — Full recipe for a single cocktail
- `FavoritesView` — User's saved cocktails

### 2.2 Components (Reusable UI)

Located in `src/components/`

Components are pure, reusable UI building blocks. They receive data via props and emit events via callbacks. Components are **not** aware of the global store and do not call the API directly.

**Examples:**
- `CocktailCard` — Card with thumbnail, name, and favorites toggle
- `CocktailGrid` — Responsive grid layout for a list of cocktails
- `CategorySelector` — Horizontal scrollable category filter
- `SkeletonCard` — Loading placeholder
- `Notification` — Global toast notification
- `ErrorBoundary` — UI crash isolation

### 2.3 Store — Zustand Slice Pattern

Located in `src/store/`

The global state is composed from independent **slices**, each responsible for a distinct feature domain. The slices are merged into a single Zustand store using the Slice Pattern.

```
store/
├── index.ts              ← Composed store (merges all slices)
├── cocktailSlice.ts      ← Cocktail browsing & search state
├── favoritesSlice.ts     ← Favorites management + persistence
└── notificationSlice.ts  ← Global notification state
```

**Slice responsibilities:**
- State shape definition (typed with TypeScript)
- Actions / state mutation functions
- Async operations (API calls via Services)
- Side effects (localStorage persistence via `zustand/middleware/persist`)

**Why Slice Pattern?**
Each slice can be developed, tested, and reasoned about independently. Slices do not depend on each other's internals — they communicate only through the composed store interface.

### 2.4 Selectors Layer

Located in `src/selectors/`

Selectors are functions that derive computed state from the store. They are the **only** way components access global state.

```ts
// Example selector
export const selectFavoriteIds = (state: StoreState) =>
  state.favorites.map((f) => f.idDrink);
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

Located in `src/schemas/`

Zod schemas define the **expected shape** of every API response. They serve as a runtime contract between the external API and the application's type system.

```ts
// Example
const DrinkSchema = z.object({
  idDrink: z.string(),
  strDrink: z.string(),
  strDrinkThumb: z.string().url().nullable(),
  // ...
});
```

If TheCocktailDB returns an unexpected structure (the API is unreliable and inconsistent), Zod catches it before it can corrupt application state.

### 2.7 Domain Models (TypeScript Types)

Located in `src/types/`

Domain models are the application's internal representation of data. They are distinct from API response shapes, which are often inconsistently named or structured.

The transformation from API response → Domain model happens in the service layer, ensuring no raw API data leaks into the application.

```ts
// API response field   →   Domain model field
strDrink               →   name
strDrinkThumb          →   thumbnail
strInstructions        →   instructions
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
  Domain Transformation
  (API shape → typed model)
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

React Router DOM v6 is configured with a **layout-based** structure:

```
/                    →  HomeView       (browse by category)
/search              →  SearchView     (search by name/ingredient)
/cocktail/:id        →  DetailView     (recipe detail)
/favorites           →  FavoritesView  (saved cocktails)
*                    →  NotFoundView   (404 fallback)
```

All routes share a common `<RootLayout>` that renders the `<Header>`, `<Notification>`, and `<ErrorBoundary>`.

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

The CocktailDB API uses inconsistent, prefixed naming (`strDrink`, `idDrink`). Transforming to clean domain models in the service layer keeps the rest of the codebase decoupled from the API's quirks.

---

## 9. Folder Structure Reference

```
src/
├── components/       # Stateless reusable UI components
├── views/            # Route-level page components
├── store/            # Zustand store composition + slices
├── selectors/        # Derived state selectors
├── services/         # API communication (Axios + Zod)
├── schemas/          # Zod validation schemas
├── types/            # TypeScript domain models / interfaces
├── utils/            # Shared utility functions
├── hooks/            # Custom React hooks (if applicable)
├── router/           # React Router configuration
└── main.tsx          # Application entry point
```
