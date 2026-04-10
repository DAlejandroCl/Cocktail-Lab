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
│                 │   Components    │  (UI blocks)    │
│                 └────────┬────────┘                 │
│                          │                          │
│          ┌───────────────┼───────────────┐          │
│          ▼               ▼               ▼          │
│   ┌─────────────┐  ┌──────────┐  ┌───────────────┐  │
│   │  Selectors  │  │  Store   │  │   Services    │  │
│   │  (derived   │  │ (Zustand │  │  (Axios+Zod)  │  │
│   │   state)    │  │  Slices) │  └───────┬───────┘  │
│   └─────────────┘  └──────────┘          │          │
│                                   ┌──────▼──────┐   │
│                                   │ TheCocktail │   │
│                                   │    DB API   │   │
│                                   └─────────────┘   │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │           AI Generator Pipeline               │  │
│  │                                               │  │
│  │  GenerateAI view → generateAISlice            │  │
│  │       → POST /api/ai/generate-recipe          │  │
│  │           → Groq SDK (json_object mode)       │  │
│  │               → Zod validation               │  │
│  │                   → CocktailDB image lookup  │  │
│  └───────────────────────────────────────────────┘  │
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

- `IndexPage` — Home page. Renders `HeroSection` above a `DrinkGrid` local sub-component. Manages sort state, infinite scroll pagination (`visibleCount` + scroll listener), and auto-scroll to results after a successful search.
- `FavoritesPage` — Two sections: "My Favorites" (API/AI-favorited drinks) and "My Creations" (AI-generated recipes saved via Save Creation). Both sections share a `SortSelector` and open recipe detail via `Modal` or a local modal via `openRecipeModal`.
- `GenerateAI` — AI-powered cocktail generator. Manages an ingredient list, autocomplete suggestions, triggers the AI generation flow, and renders the `GeneratedRecipeCard`.

### 2.2 Components (Reusable UI)

Located in `src/components/`

Components receive data via props and emit events via callbacks. They are **not** aware of the global store unless they need to dispatch a local action (e.g. `DrinkCard` dispatching to the favorites slice).

**Components in this project:**

- `Header` — Sticky navbar with `AnimatedNav` (sliding underline indicator) and `Logo` (letter-bounce animation on hover).
- `HeroSection` — Full-viewport-height section with five sub-systems: `MeshGradient` (animated blend-mode blobs), `Ticker` (25 cocktail names, 50s cycle), `Bubbles` (20 floating orbs with distributed spawn), `ScrollArrow` (smooth-scroll CTA), and a CSS `::after` fade at the bottom edge.
- `SearchForm` — Ingredient text input + HeadlessUI `Listbox` category dropdown + clear button.
- `SortSelector` — Generic pill-group component typed with `<T extends string>` to work with both `SortOption` and `SortOptionFavorites`.
- `DrinkCard` — Polymorphic card: if a `fullRecipe` prop is provided (or the ID starts with `ai-`), clicking View Recipe opens the modal locally without a network fetch. Otherwise it calls `selectRecipe(id)` to fetch from the API.
- `Modal` — Recipe detail overlay (HeadlessUI `Dialog`). Detects AI-crafted recipes and shows a trash button (remove from My Creations) instead of the heart button.
- `Notification` — Global toast with auto-dismiss and hover-pause behavior.
- `SkeletonDrinkCard` — Animated loading placeholder that mirrors the `DrinkCard` layout.
- `ErrorBoundary` — UI crash isolation with accessible fallback and focus management.
- `ThemeToggle` — Light/dark mode toggle connected to `useThemeStore`.

### 2.3 Store — Zustand Slice Pattern

Located in `src/stores/`

The global state is composed from independent **slices**, each responsible for a distinct feature domain.

```
stores/
├── useAppStore.ts        ← Composed store (merges all slices, applies persist + devtools)
├── recipeSlice.ts        ← Recipe browsing, search, loading and modal state
├── favoritesSlice.ts     ← Favorites map + favoriteOrder timestamps + localStorage persistence
├── notificationSlice.ts  ← Global notification state
├── generateAISlice.ts    ← AI recipe generation state + saved creations
├── useThemeStore.ts      ← Theme preference (light/dark) with localStorage persistence
└── selectors.ts          ← Derived state selectors (co-located with store)
```

**Persistence strategy:**

Only three state keys are persisted to `localStorage` via `partialize`:
```ts
partialize: (state) => ({
  favorites: state.favorites,       // Record<string, RecipeDetail>
  favoriteOrder: state.favoriteOrder, // Record<string, number> timestamps
  aiRecipes: state.aiRecipes,       // GeneratedRecipe[]
})
```

Volatile state (`isLoading`, `generatedRecipe`, `isGenerating`, etc.) is intentionally excluded.

**`recipeSlice` — key behaviors:**

- `searchRecipes(filters)` — routes to `getBrowseRecipes` (empty filters) or `getRecipes` (with filters)
- `openRecipeModal(recipe)` — opens the modal with a local `RecipeDetail` object without any API fetch. Used for AI-created recipes that don't exist in TheCocktailDB.
- `hasSearched` — boolean that tracks whether any search has been submitted in the current session

**`generateAISlice` — key behaviors:**

- `generateRecipe()` — calls `POST /api/ai/generate-recipe` with the current `aiIngredients`, maps the response to a `GeneratedRecipe` shape
- `saveAiRecipe(recipe)` — prepends to `aiRecipes[]` (persisted). No duplicates (checked by `idDrink`)
- `removeAiRecipe(recipeId)` — removes from `aiRecipes[]`
- `generateRecipe` maps raw API ingredients to `strIngredient1..N` / `strMeasure1..N` fields so `GeneratedRecipe` extends `RecipeDetail` directly and can be used anywhere `RecipeDetail` is expected

### 2.4 Selectors Layer

Located in `src/stores/selectors.ts`

All `useAppStore` subscriptions go through typed selectors. Components subscribe only to the data they need, avoiding unnecessary re-renders.

```ts
// Simple selectors
export const selectDrinks         = (s: AppState) => s.drinks;
export const selectFavoritesMap   = (s: AppState) => s.favorites;
export const selectOpenRecipeModal = (s: AppState) => s.openRecipeModal;

// Curried selector (factory pattern)
export const selectIsFavorite     = (id: string) => (s: AppState) => !!s.favorites[id];
export const selectIsAiRecipeSaved = (id: string) => (s: AppState) =>
  s.aiRecipes.some((r) => r.idDrink === id);
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

Services handle all HTTP communication with TheCocktailDB. They use **Axios** and validate all responses through **Zod schemas**.

**Key functions:**

- `getCategories()` — `list.php?c=list`, returns `string[]`
- `getRecipes(filters)` — routes to `searchByName`, `searchByIngredient`, `searchByCategory`, or a combination, deduplicates, optionally enriches with categories
- `getBrowseRecipes(categories)` — parallel `filter.php?c=` calls per category, cap 12/category, deduplicate, Fisher-Yates shuffle
- `getRecipeById(id)` — `lookup.php?i=` for full recipe detail
- `deduplicate(drinks)` — uses a `Map<idDrink, Drink>` internally

### 2.7 Schemas (Zod)

Located in `src/utils/recipes-schemas.ts`

Zod schemas define the expected shape of every TheCocktailDB API response. TypeScript domain types are inferred from these schemas using `z.infer<>` — never written manually.

### 2.8 Domain Types

Located in `src/types/index.ts`

```ts
export type Drink        = z.infer<typeof DrinkAPIResponse>;
export type RecipeDetail = z.infer<typeof RecipeAPIResponseSchema>;
```

---

## 3. AI Generator Pipeline

The AI Generator is the most complex feature. It spans client, server, and two external APIs.

```
User adds ingredients to the list
        │
        ▼
generateAISlice.generateRecipe()
        │
        ▼
POST /api/ai/generate-recipe           ← Vercel Serverless Function
        │
        ├── groq.chat.completions.create({
        │     model: "llama-3.3-70b-versatile",
        │     response_format: { type: "json_object" },
        │     messages: [system: SYSTEM_PROMPT, user: ingredients]
        │   })
        │
        ├── JSON.parse(rawContent)     ← strip accidental backticks
        │
        ├── RecipeSchema.safeParse()   ← Zod validation
        │
        └── resolveImageFromCocktailDB(imageSlug)
                  │
                  ▼
          search.php?s={slug}    ← finds visually similar drink
                  │
                  ▼
          { recipe: { strDrink, strDrinkThumb, strCategory, strInstructions, ingredients[] } }
                  │
                  ▼
        generateAISlice.mapToGeneratedRecipe()
                  │
                  ├── idDrink: `ai-${Date.now()}-${random}`
                  ├── strIngredient1..N / strMeasure1..N  ← mapped from ingredients[]
                  ├── isAIGenerated: true
                  ├── generatedAt: ISO string
                  └── userIngredients: string[]   ← original user input
```

**Why `json_object` mode instead of `json_schema`?**

`llama-3.3-70b-versatile` on Groq does not support `json_schema` response format — only `openai/gpt-oss-*` models do. Attempting to use it causes a 400 error. `json_object` mode guarantees valid JSON output; Zod `safeParse` provides schema enforcement on the server side.

**Why the Groq SDK directly instead of `@ai-sdk/groq`?**

The Vercel AI SDK v6 `Output.object({ schema })` internally sends `response_format: { type: "json_schema" }`, which is incompatible with `llama-3.3-70b-versatile`. The Groq SDK native client gives direct control over `response_format`, which is necessary for this model.

**Retry strategy:**

- Rate limit (429) → exponential backoff, up to 2 retries (1.5s → 3s)
- JSON parse error or Zod validation failure → 1 retry
- Any other unrecoverable error → `buildFallback()` returns a static recipe using `smartMeasure()` for correct units

---

## 4. Data Flow (Unidirectional)

```
User Interaction
      │
      ▼
  Component
  (dispatches action via selector)
      │
      ▼
  Zustand Slice Action
  (may call a Service or the AI API function)
      │
      ▼
  Service / API
  (HTTP call via Axios or fetch)
      │
      ▼
  Zod Schema Validation
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

## 5. Routing Architecture

React Router DOM v7 with **layout-based** structure. `IndexPage` and `FavoritesPage` are lazy-loaded with `React.lazy()`.

```
/            →  IndexPage      (hero + search + drink grid)
/favorites   →  FavoritesPage  (My Favorites + My Creations with sort)
/ai          →  GenerateAI     (AI ingredient list + recipe generator)
```

Recipe detail renders as a `<Modal>` overlay — there is no `/cocktail/:id` route. All routes share `<Layout>` which renders `<Header>`, `<Modal>`, `<Notification>`, and `<ErrorBoundary>`.

A `vercel.json` SPA rewrite rule redirects all non-asset, non-API requests to `index.html`, preventing 404s on page refresh.

---

## 6. Infinite Scroll Architecture

```
IndexPage
  ├── sortedDrinks = useMemo(sortDrinks(drinks, sortOption))
  ├── gridKey = `${ids.join(",")}-${sortOption}`   ← forces DrinkGrid remount
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

## 7. State Persistence

Three stores use Zustand's `persist` middleware:

- **`useAppStore` (partialize)** — persists `favorites`, `favoriteOrder`, `aiRecipes`
- **`useThemeStore`** — persists `theme` (`"light"` | `"dark"`), applied as a class on `<html>`

---

## 8. Design System (CSS)

Located in `src/index.css`

Built on **Tailwind CSS v4** with a custom `@layer components` block. All custom classes are in a single `@layer components` block (multiple separate blocks cause cascade issues in Tailwind v4 dev mode).

**Key CSS variables:**

- `--color-brand`, `--color-brand-light`, `--color-brand-dark` — orange palette
- `--bg-base`, `--bg-card`, `--bg-overlay` — semantic background tokens
- `--shadow-brand`, `--shadow-card` — shadow tokens
- `--ease-out-soft`, `--ease-out-smooth` — easing tokens

**Notable component classes:**
- `.hero-mesh` — `mix-blend-mode: multiply` (light) / `screen` (dark)
- `.btn-brand` — always `color: #ffffff` regardless of theme
- `.ingredient-tag` — orange pill used in both `SearchForm` and `GenerateAI`

---

## 9. Error Handling Strategy

| Layer | Error Handling |
|-------|----------------|
| **Service** | Zod `safeParse` used for validation; Axios errors caught in slice actions |
| **Store slice** | try/catch wraps async actions; errors dispatched as user-friendly messages |
| **AI API function** | Retry logic for 429 + parse errors; `buildFallback()` as last resort |
| **Notification slice** | Centralized toast queue with auto-dismiss |
| **React** | `<ErrorBoundary>` at root level catches rendering errors |

---

## 10. Key Design Decisions

**Why `getBrowseRecipes` instead of `/random.php`?**
`/random.php` returns one drink per call — with 150 parallel calls, duplicates reduce effective unique drinks to 6-20. `getBrowseRecipes` fetches each category's full list, caps at 12/category, deduplicates, and shuffles. Consistent ~130 unique drinks every time.

**Why sort outside the store?**
Sort is a presentation concern. A pure utility function + local `useState` avoids polluting the store with transient UI state and makes the functions trivially testable.

**Why `favoriteOrder` as a parallel Record?**
`RecipeDetail` is inferred from a Zod schema. Adding `addedAt` to it would require schema modification. A parallel `Record<string, number>` keeps the domain model pure.

**Why `gridKey` for pagination reset instead of `useEffect`?**
Setting state in a `useEffect` body causes cascading renders. The `key` prop pattern is the React-idiomatic solution — changing the key unmounts and remounts the child, resetting all local state cleanly.

**Why a scroll listener instead of `IntersectionObserver` for infinite scroll?**
With data already in memory, `IntersectionObserver` fires immediately on mount (the sentinel is within the viewport before any cards render), causing all batches to load at once. A scroll listener with `getBoundingClientRect()` gives explicit control.

**Why `openRecipeModal` in `recipeSlice`?**
AI-created recipes have IDs like `ai-1234567-abc` that don't exist in TheCocktailDB. Calling `selectRecipe(id)` would result in a 404. `openRecipeModal(recipe)` bypasses the fetch entirely and sets `selectedRecipe` directly from the already-hydrated `GeneratedRecipe` object.

**Why Groq SDK native instead of `@ai-sdk/groq` + `Output.object`?**
The Vercel AI SDK v6 `Output.object({ schema })` internally sends `response_format: { type: "json_schema" }`, which `llama-3.3-70b-versatile` does not support on Groq (400 error). The native SDK allows `response_format: { type: "json_object" }`, which is supported.
