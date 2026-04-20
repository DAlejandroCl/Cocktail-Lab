# Testing Strategy — Cocktail Lab

> **Stack:** React 19.2 · TypeScript 5.9 · Vite 7.2 · Zustand 5.0 · React Router DOM 7.12  
> **Test runner:** Vitest 4.0 · Playwright 1.58  
> **Status:** All 5 stages passing — 1003 tests total

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Test Suite at a Glance](#2-test-suite-at-a-glance)
3. [Tooling](#3-tooling)
4. [Layer Architecture](#4-layer-architecture)
   - 4.1 [Unit — Store Slices](#41-unit--store-slices)
   - 4.2 [Unit — Services](#42-unit--services)
   - 4.3 [Unit — Zod Schemas](#43-unit--zod-schemas)
   - 4.4 [Unit — Components](#44-unit--components)
   - 4.5 [Unit — Router](#45-unit--router)
   - 4.6 [Accessibility (axe-core)](#46-accessibility-axe-core)
   - 4.7 [Integration](#47-integration)
   - 4.8 [End-to-End (Playwright)](#48-end-to-end-playwright)
5. [Mocking Strategy](#5-mocking-strategy)
6. [Fake Timer Cookbook](#6-fake-timer-cookbook)
7. [Test Infrastructure](#7-test-infrastructure)
8. [Running the Suite](#8-running-the-suite)
9. [Where to Put a New Test](#9-where-to-put-a-new-test)
10. [Coverage Targets](#10-coverage-targets)
11. [Key Invariants](#11-key-invariants)
12. [Lessons Learned](#12-lessons-learned)

---

## 1. Philosophy

Seven principles guide every test in this project. They are not aspirational — every test written reflects these decisions.

### 1.1 Test behavior, not implementation

Tests assert what users see and experience. They do not assert which internal functions were called, what shape the Zustand state holds, or what CSS classes are applied. A test that breaks when you rename a private state field is testing implementation; a test that breaks when the UI stops showing the right data is testing behavior.

```typescript
// ❌ Tests implementation — breaks on any internal rename
expect(store.getState()._drinksCache).toBeDefined()

// ✅ Tests behavior — breaks only if the user stops seeing results
expect(screen.getByText("Mojito")).toBeInTheDocument()
```

### 1.2 Prefer accessibility-first queries

`getByRole`, `getByLabelText`, and `getByText` are used wherever possible. `getByTestId` appears only when no semantic alternative exists. This approach enforces correct ARIA semantics as a side effect of writing tests: if a role-based query fails, it usually indicates an accessibility problem, not just a hard-to-select element.

| Priority | Query | Used for |
|----------|-------|----------|
| 1st | `getByRole` | Buttons, inputs, links, headings |
| 2nd | `getByLabelText` | Form inputs with labels |
| 3rd | `getByText` / `getByPlaceholderText` | Visible content |
| Last resort | `getByTestId` | Elements with no accessible role |

### 1.3 Avoid testing internal state

Zustand store shape is validated in slice unit tests. Component and integration tests verify observable output only. `useAppStore.getState()` appears in integration tests solely to verify that a user action produced a state change with no visible UI equivalent (e.g., notification cleared after timeout).

### 1.4 Make tests deterministic

- Fake timers are controlled explicitly with `vi.useFakeTimers()` in `beforeEach` and `vi.useRealTimers()` in `afterEach`
- `fireEvent` replaces `userEvent` inside any test that activates fake timers
- MSW resets after every test via `server.resetHandlers()` in the global `afterEach`
- A fresh Zustand store is created in each `beforeEach` for slice unit tests

### 1.5 Scale mocking to the layer

Each test layer has a defined mocking boundary. Nothing is mocked below that boundary. See [Section 5](#5-mocking-strategy) for the full breakdown.

### 1.6 Balance speed against confidence

The Vitest stages complete in under 25 seconds combined. E2E tests run separately and exercise the real browser stack. This separation allows fast feedback during development without sacrificing coverage of critical user flows.

### 1.7 Write tests that survive refactors

Tests are written against public-facing behavior, not internal structure. Internal renames, CSS class changes, and store field restructures do not break tests. Tests break only when observable behavior changes — which is exactly when they should break.

---

## 2. Test Suite at a Glance

| Stage | Tool | Files | Tests |
|-------|------|:-----:|:-----:|
| Unit — Stores | Vitest | 6 | 104 |
| Unit — Components, Services & Utils | Vitest + Testing Library | 15 | 172 |
| Accessibility | Vitest + jest-axe | 9 | 82 |
| Integration | Vitest + MSW | 8 | 145 |
| E2E | Playwright (5 browsers) | 4 | 500 |
| **Total** | | **42** | **1003** |

```bash
npm run test:all   # runs all 5 stages in sequence, prints this table
npm run test:ci    # same with --bail (stops on first failure)
```

### File tree

```
tests/
├── accessibility/
│   ├── DrinkCard.a11y.test.tsx
│   ├── ErrorBoundary.a11y.test.tsx
│   ├── FavoritesPage.a11y.test.tsx
│   ├── Header.a11y.test.tsx
│   ├── IndexPage.a11y.test.tsx
│   ├── Modal.a11y.test.tsx
│   ├── Navigation.a11y.test.tsx
│   ├── Notification.a11y.test.tsx
│   └── SkeletonDrinkCard.a11y.test.tsx
├── e2e/
│   ├── fixtures/
│   │   └── test-fixtures.ts
│   ├── pages/
│   │   ├── AIGeneratorPage.ts
│   │   ├── FavoritesPage.ts
│   │   ├── HomePage.ts
│   │   └── RecipeModal.ts
│   ├── ai-generator.spec.ts
│   ├── browse-and-favorite.spec.ts
│   ├── navigation.spec.ts
│   └── search-flow.spec.ts
├── integration/
│   ├── ErrorBoundary.test.tsx
│   ├── FavoritesFlow.test.tsx
│   ├── FavoritesPage.test.tsx
│   ├── GenerateAI.test.tsx
│   ├── Header.test.tsx
│   ├── IndexPage.test.tsx
│   ├── Modal.test.tsx
│   └── Notification.test.tsx
├── mocks/
│   ├── factories.ts
│   ├── handlers.ts
│   └── server.ts
├── setup/
│   ├── jest-axe-setup.ts
│   └── test-setup.ts
└── unit/
    ├── components/
    │   ├── DrinkCard.test.tsx
    │   ├── ErrorBoundary.test.tsx
    │   ├── Header.test.tsx
    │   ├── HeroSection.test.tsx
    │   ├── Modal.test.tsx
    │   ├── Notification.test.tsx
    │   ├── SearchForm.test.tsx
    │   ├── SkeletonDrinkCard.test.tsx
    │   ├── SortSelector.test.tsx
    │   └── ThemeToggle.test.tsx
    ├── layouts/
    │   └── Layout.test.tsx
    ├── services/
    │   └── RecipeService.test.ts
    ├── stores/
    │   ├── favoritesSlice.test.ts
    │   ├── generateAISlice.test.ts
    │   ├── notificationSlice.test.ts
    │   ├── recipeSlice.test.ts
    │   ├── selectors.test.ts
    │   └── useThemeStore.test.ts
    ├── utils/
    │   ├── recipes-schemas.test.ts
    │   └── sortRecipes.test.ts
    └── router.test.tsx
```

---

## 3. Tooling

| Tool | Role | Version |
|------|------|---------| 
| Vitest | Unit, component, accessibility, and integration test runner | 4.0 |
| @testing-library/react | Component rendering and DOM querying | 16.3 |
| @testing-library/user-event | High-fidelity async user interaction simulation | 14.6 |
| MSW | Network-level request interception for integration tests | 2.12 |
| jest-axe | Automated axe-core accessibility audits in Vitest | 10.0 |
| happy-dom | DOM environment for Vitest | 20.6 |
| Playwright | Real-browser end-to-end testing (5 engines) | 1.58 |
| zustand/vanilla | Isolated store creation for slice unit tests | 5.0 |

---

## 4. Layer Architecture

### 4.1 Unit — Store Slices

Each Zustand slice is tested in isolation using `createStore` from `zustand/vanilla`. The composed `useAppStore` is not imported; individual slices are instantiated directly. A fresh store is created in each `beforeEach` to guarantee no state leaks.

**What is tested:**

- Initial state shape for every field
- Every synchronous action and its effect on state
- Async actions (`fetchCategories`, `searchRecipes`, `selectRecipe`, `generateRecipe`) with mocked service calls
- Error paths — service rejections leave state consistent and set user-friendly error messages
- Selector correctness (`selectIsFavorite`, `selectIsAiRecipeSaved`)

**Pattern:**

```typescript
const createTestStore = () => createStore(createFavoritesSlice);

describe("favoritesSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => { store = createTestStore(); });

  it("adds a favorite", () => {
    store.getState().addFavorite(mockRecipe);
    expect(store.getState().favorites["1"]).toEqual(mockRecipe);
  });
});
```

**Slices covered:** `favoritesSlice`, `generateAISlice`, `notificationSlice`, `recipeSlice`, `selectors`, `useThemeStore`

> **Note on `isFavorite`:** The `isFavorite(id)` method was removed from `FavoritesSliceType` in a refactor. All tests now check `!!store.getState().favorites[id]` directly. The `selectIsFavorite(id)` selector in `selectors.ts` provides the same functionality for components.

**Error message invariant for `generateAISlice`:**

The slice converts raw API errors into two specific user-friendly strings. Tests assert exact strings — do not change these without updating the tests:

```typescript
// Network errors:
"Network error. Check your connection and try again."

// All other errors:
"Failed to generate recipe. Please try again."
```

---

### 4.2 Unit — Services

`RecipeService` is tested with `vi.spyOn(globalThis, "fetch")`. The mock resolves with a `Response`-compatible object that includes `ok`, `status`, and `json()`.

**Critical constraint — Zod validation in `safeGet`:**

All API responses are parsed through Zod schemas inside `safeGet`. A mock fixture that doesn't satisfy the schema causes `safeParse` to fail silently, returning an empty array. Every fixture used in these tests includes all required fields (`strDrinkThumb` as a URL, `idDrink`, `strDrink`).

```typescript
// Helper used throughout RecipeService.test.ts
function makeFetchResponse(data: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => data,
  } as Response;
}

function mockFetchOnce(data: unknown, ok = true) {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(makeFetchResponse(data, ok));
}
```

**Key difference from previous Axios-based tests:** The `safeGet` helper now checks `response.ok` before calling `.json()`. Tests for error cases use `makeFetchResponse({}, false)` (ok = false) instead of `mockResolvedValue(null)`.

**Cases covered:**

- `getCategories` — success, network failure, not-ok response, schema rejection
- `getRecipeById` — success, recipe not found, schema rejection, network error
- `getRecipes` — by category, by ingredient (with deduplication and enrichment), combined filters, no filters throws
- `getBrowseRecipes` — parallel fetches, 12/category cap, deduplication, Fisher-Yates shuffle

---

### 4.3 Unit — Zod Schemas

Schemas are tested directly against the Zod API with no mocks.

**`nullableString` behavior:**

```typescript
const nullableString = z
  .string()
  .trim()
  .min(1)        // ← runs BEFORE .nullable()
  .nullable()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : null));
```

`.min(1)` executes before `.nullable()`. An empty string `""` is rejected outright — it does not become `null`. Only `undefined` (field absent) and explicit `null` pass through and produce `null` output.

**Schemas covered:** `CategoriesAPIResponseSchema`, `SearchFiltersSchema`, `DrinkAPIResponse`, `DrinksAPIResponse`, `RecipeAPIResponseSchema`

---

### 4.4 Unit — Components

Components are rendered in isolation with `useAppStore` mocked via `vi.mock`. The mock intercepts the selector pattern by running the selector against a controlled state object.

**The selector mock pattern:**

```typescript
vi.mock("@/stores/useAppStore", () => ({ useAppStore: vi.fn() }));

function setupStore(overrides?: Partial<AppState>) {
  (useAppStore as unknown as Mock).mockImplementation(
    (selector: (state: AppState) => unknown) =>
      selector({ ...baseState, ...overrides } as AppState),
  );
}
```

> **Note:** `isFavorite` was removed from `AppState`. Do not include it in `baseState` mock objects — it will cause TS2561 errors. Use `favorites: {}` or `favorites: { "id": recipe }` to control the favorite state. The `selectIsFavorite(id)` selector reads `!!state.favorites[id]` directly.

**HeadlessUI v2 — inert attribute on Listbox:**

When the category Listbox is open, HeadlessUI v2 applies `inert=""` and `aria-hidden="true"` to the surrounding layout container. Testing Library respects these attributes and cannot find `role="option"` elements. The workaround is a direct DOM query:

```typescript
// ❌ Blocked by inert
screen.getByRole("option", { name: /cocktail/i })

// ✅ Raw DOM query bypasses inert
document.querySelectorAll('[role="option"]')
```

**Components covered:** `DrinkCard`, `ErrorBoundary`, `Header`, `HeroSection`, `Modal`, `Notification`, `SearchForm`, `SkeletonDrinkCard`, `SortSelector`, `ThemeToggle`, `Layout`

---

### 4.5 Unit — Router

`AppRoutes` uses `React.lazy()` for all four views. Since `router.tsx` now includes its own `<Suspense fallback={<PageSkeleton />}>`, tests do **not** wrap `<AppRoutes />` in an additional `<Suspense>` — it would be redundant.

`vi.mock("@/views/IndexPage")` does not intercept `React.lazy(() => import("./views/IndexPage"))` because lazy imports use bare relative paths at runtime. The fix is to let the real views load and assert on unique content.

```typescript
it("renders IndexPage on '/'", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AppRoutes />
    </MemoryRouter>
  );
  expect(
    await screen.findByRole("heading", { name: /your perfect mix awaits/i })
  ).toBeInTheDocument();
});

it("renders NotFoundPage on an unknown route", async () => {
  render(
    <MemoryRouter initialEntries={["/this-does-not-exist"]}>
      <AppRoutes />
    </MemoryRouter>
  );
  expect(
    await screen.findByRole("heading", { name: /recipe not found/i })
  ).toBeInTheDocument();
});
```

The store mock must include `openRecipeModal: vi.fn()` — it is required by `RecipesSliceType` and consumed by `Layout` and `DrinkCard`.

---

### 4.6 Accessibility (axe-core)

Every component and page has a dedicated `.a11y.test.tsx` file. Tests run automated axe-core audits and targeted behavioral assertions for things axe cannot detect.

```typescript
it("has no axe violations", async () => {
  const { container } = render(<Component />);
  expect(await axe(container)).toHaveNoViolations();
});
```

**Coverage per component:**

| Component | axe audit | ARIA roles | Keyboard nav | Focus management |
|-----------|:---------:|:----------:|:------------:|:----------------:|
| DrinkCard | ✓ | ✓ | ✓ | — |
| ErrorBoundary | ✓ | ✓ | — | ✓ |
| FavoritesPage | ✓ | ✓ | — | — |
| Header | ✓ | ✓ | ✓ | ✓ |
| IndexPage | ✓ | ✓ | — | — |
| Layout | ✓ | ✓ | — | ✓ skip link |
| Modal | ✓ | ✓ | ✓ | ✓ |
| Navigation | ✓ | ✓ | ✓ | — |
| Notification | ✓ | ✓ | ✓ | — |
| SkeletonDrinkCard | ✓ | ✓ | — | — |

**FavoritesPage heading hierarchy invariant:**

The axe audit enforces a strict heading order: `h2` (My Favorites) → `h3` (My Creations) → `h3` (individual card titles). Any change to this hierarchy breaks the `FavoritesPage.a11y.test.tsx` audit.

---

### 4.7 Integration

The integration folder contains two subtypes. Both use the real composed `useAppStore` — no store is mocked.

**Subtype A — Store + MSW (true integration):**

Full page components rendered against the real store with MSW intercepting API calls.

| File | Network layer |
|------|--------------|
| `IndexPage.test.tsx` | MSW — `filter.php`, `search.php`, `lookup.php` |
| `FavoritesPage.test.tsx` | MSW — `lookup.php` |
| `FavoritesFlow.test.tsx` | MSW — full multi-endpoint flow |
| `Header.test.tsx` | MSW — `list.php` for `fetchCategories` |
| `GenerateAI.test.tsx` | MSW — `POST /api/ai/generate-recipe` |

**Subtype B — Store only:**

Isolated components against the real store, controlling state via `useAppStore.setState()`.

| File | State control |
|------|--------------|
| `Modal.test.tsx` | `useAppStore.setState({ modal, selectedRecipe, favorites })` |
| `Notification.test.tsx` | `useAppStore.setState({ notification })` + fake timers |
| `ErrorBoundary.test.tsx` | No store — pure component behavior |

**`GenerateAI.test.tsx` — AI Generator integration tests:**

The AI Generator flow is tested with MSW intercepting the Vercel serverless function endpoint. The handler at `POST /api/ai/generate-recipe` returns a fixture recipe. Key scenarios covered:

- Ingredient add/remove via the autocomplete input
- Generate button triggers the API call and renders the recipe card
- "Save Creation" button calls `saveAiRecipe()` and disables after saving
- "Re-craft" button calls `reCraftRecipe()` which passes the previous recipe as context, generating a conscious variation (different flavour profile, new balancing ingredient, adjusted technique)
- Error state renders the error banner when the API returns a failure

**What MSW intercepts:**

```
tests/mocks/handlers.ts  →  TheCocktailDB + AI API
  filter.php             →  category and ingredient search
  search.php             →  name search
  lookup.php             →  recipe detail
  list.php               →  category list
  POST /api/ai/...       →  AI recipe generation
```

**FavoritesPage heading hierarchy — test invariant:**

`FavoritesPage.test.tsx` and `FavoritesPage.a11y.test.tsx` assert on heading levels `h2` (My Favorites) and `h3` (My Creations). The `drinkCards` locator in the E2E page object covers both `aria-labelledby="drink-title-*"` and `aria-labelledby="creation-title-*"` to match cards from both sections.

---

### 4.8 End-to-End (Playwright)

Four spec files cover the critical user paths. Tests run against the Vite dev server on `localhost:5173`. Network calls are intercepted via `page.route()` for predictable, deterministic responses.

**500 tests: 100 scenarios × 5 browser engines (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari).**

**Page Object Models:**

```
e2e/pages/
├── AIGeneratorPage.ts   Locators: ingredient input, suggestions, generate button,
│                        saveCreationButton, reCraftButton, recipeCard, errorBanner.
│                        Actions: addIngredient(), generateRecipe(), saveCreation().
├── FavoritesPage.ts     Locators: drinkCards (matches both drink-title-* and
│                        creation-title-* articles), emptyState, removeButtons.
│                        Note: { timeout: 10_000 } on expectResultsVisible() for Firefox.
├── HomePage.ts          Locators: nav, search form, results grid, empty state,
│                        notifications. Actions: goto(), searchByIngredient(),
│                        searchByCategory(), browseAll(), firstCard().
└── RecipeModal.ts       Locators: dialog, title, image, ingredients/instructions,
                         close buttons, favorite toggle.
                         closeViaBackdrop() uses touchscreen.tap() on mobile viewports.
```

**API mocking helpers (test-fixtures.ts):**

```typescript
await mockDefaultApi(page);    // all endpoints → predictable fixture data
await mockEmptyResults(page);  // overrides search → { drinks: null }
await mockLookupError(page);   // overrides lookup → 500 error
await mockAIRecipe(page);      // overrides POST /api/ai/... → fixture recipe
```

**Spec files:**

| Spec | Scenarios |
|------|-----------|
| `navigation.spec.ts` | Route rendering, nav links, 404 page, aria-current |
| `search-flow.spec.ts` | Search by ingredient, by category, empty results, error state |
| `browse-and-favorite.spec.ts` | Add/remove favorites, persistence across navigation |
| `ai-generator.spec.ts` | Full ingredient → generate → save → view in Favorites flow |

---

## 5. Mocking Strategy

> Mock as little as possible, but as much as necessary.

| Layer | What is mocked | How |
|-------|---------------|-----|
| Unit — slices | Nothing | Pure store in isolation |
| Unit — services | `fetch` | `vi.spyOn(globalThis, "fetch")` + `vi.restoreAllMocks()` |
| Unit — schemas | Nothing | Pure Zod functions |
| Unit — components | `useAppStore` | `vi.mock` + selector intercept pattern |
| Accessibility | `useAppStore` (where needed) | Same as above |
| Integration | HTTP requests | MSW `setupServer` |
| E2E | HTTP requests (browser) | `page.route()` with RegExp |

**Why `vi.spyOn(fetch)` over `vi.mock("axios")` in service tests:**

The service was migrated from Axios to native `fetch`. `vi.spyOn(globalThis, "fetch")` is used with `vi.restoreAllMocks()` in `beforeEach` — this ensures spies are reset between tests without leaking across the suite. The `makeFetchResponse()` helper builds a `Response`-compatible object that mirrors the real `fetch` API.

**Why MSW over mocking `fetch` in integration tests:**

MSW intercepts at the network layer, decoupling tests from the HTTP client implementation. Integration tests pass unchanged regardless of whether the service uses `fetch`, Axios, or any other client. `onUnhandledRequest: "error"` is set globally — any API call not covered by a handler fails loudly.

---

## 6. Fake Timer Cookbook

| Scenario | Problem | Solution |
|----------|---------|----------|
| Assert store state after timer fires | `waitFor` polls via `setInterval` → hangs | Read `store.getState()` directly after `act(() => vi.advanceTimersByTime(N))` |
| Click a button during fake timers | `userEvent` uses internal delays → broken | `fireEvent.click()` — synchronous |
| Hover / mouseEnter during fake timers | Same as above | `act(() => fireEvent.mouseEnter(el))` |
| `userEvent.setup({ advanceTimers })` | Binding evaluated at collect phase → `STACK_TRACE_ERROR` | Use `fireEvent` instead |
| Stale renders across tests | RTL auto-cleanup uses `setTimeout` → never fires | Call `cleanup()` in `afterEach` **before** `vi.runAllTimers()` |
| `act` import | `act` does not exist in Vitest | Always import from `@testing-library/react` |

---

## 7. Test Infrastructure

### 7.1 Global setup — `tests/setup/test-setup.ts`

```typescript
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();  // clear per-test overrides
  cleanup();               // unmount all rendered components
  vi.clearAllTimers();     // clear any lingering timers
});
afterAll(() => server.close());
```

### 7.2 Accessibility setup — `tests/setup/jest-axe-setup.ts`

```typescript
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);
```

### 7.3 MSW handlers — `tests/mocks/handlers.ts`

Six endpoints are handled: five TheCocktailDB endpoints plus the AI recipe generation endpoint. Each matches by `RegExp` against the full URL. The AI handler returns `DEFAULT_AI_RECIPE_RESPONSE` — a fixture that mirrors the shape returned by the real Vercel function.

### 7.4 Factories — `tests/mocks/factories.ts`

```typescript
makeDrink(overrides?)         // → Drink
makeRecipeDetail(overrides?)  // → RecipeDetail
makeGeneratedRecipe(overrides?) // → GeneratedRecipe
makeDrinks(count)             // → Drink[]
toFavoritesMap(drinks)        // → Record<string, RecipeDetail>
resetFactoryCounters()        // call in beforeEach for stable IDs
```

---

## 8. Running the Suite

```bash
# All stages (recommended)
npm run test:all

# Individual stages
npm run test:unit         # stores + components + services + utils
npm run test:a11y         # accessibility audits
npm run test:integration  # integration with MSW
npm run test:e2e          # Playwright (5 browsers)

# Development
npm run test              # Vitest watch mode
npm run test:e2e:ui       # Playwright interactive UI
npm run test:e2e:debug    # Playwright debug mode

# Coverage
npm run test:coverage
```

---

## 9. Where to Put a New Test

| What you are testing | Layer | Directory |
|----------------------|-------|-----------|
| A Zustand action, selector, or slice behavior | Unit — Stores | `tests/unit/stores/` |
| A service function (API call, schema validation) | Unit — Services | `tests/unit/services/` |
| A Zod schema shape, transform, or rejection | Unit — Utils | `tests/unit/utils/` |
| A component in isolation (store mocked) | Unit — Components | `tests/unit/components/` |
| A component that uses the real store, no API calls | Integration (Subtype B) | `tests/integration/` |
| A page or flow with real store + MSW | Integration (Subtype A) | `tests/integration/` |
| ARIA roles, axe violations, keyboard nav, focus | Accessibility | `tests/accessibility/` |
| A complete user flow in a real browser | E2E | `tests/e2e/` |

**Practical rules:**

- New component → create both `unit/components/Component.test.tsx` and `accessibility/Component.a11y.test.tsx`
- New slice action → add to the slice's `.test.ts` and add the action to `selectors.test.ts` `mockState`
- Any new action added to a slice **must** be added to `selectors.test.ts` `mockState` — it uses `satisfies AppState` which enforces the type at compile time
- Bug triggered by a specific API response shape → `unit/services/` or `unit/utils/`, not integration
- Only add E2E tests for paths that cross page boundaries or depend on browser-specific behavior

---

## 10. Coverage Targets

Coverage is measured on `src/**/*.{ts,tsx}`, excluding `main.tsx` and type declaration files.

| Code type | Threshold |
|-----------|:---------:|
| Zod schemas (`utils/`) | 100% |
| Zustand slices (`stores/`) | ≥ 95% |
| Service layer (`services/`) | ≥ 90% lines / ≥ 85% branches |
| Components (`components/`) | ≥ 75% lines / ≥ 70% branches |
| Global minimum | ≥ 80% lines / ≥ 75% branches |

**Three files have branches below 100% for structural reasons:**

`Layout.tsx` — uncovered branch is a DOM edge case in the skip link handler unreachable in jsdom.

`Notification.tsx` — the `prefersReducedMotion` conditional's `true` branch is unreachable because happy-dom does not implement `window.matchMedia`. The hook correctly uses `useState` + `addEventListener("change")` in production, but the `true` branch (reduced motion active) cannot be exercised without mocking `matchMedia`. The branch controls CSS transition class strings only — no behavioral effect.

`recipeService.ts` — remaining gap is the `!parsed.success` guards inside private helper functions only reachable indirectly. All equivalent public API paths are covered.

---

## 11. Key Invariants

These are the contracts that **must** be maintained when changing code, to prevent test failures:

**`selectors.test.ts` mockState must satisfy `AppState`**
Any new action added to a slice must be added to the `mockState` object in `selectors.test.ts`. The `satisfies AppState` assertion enforces the full type at compile time and will cause TS errors across all selector tests if any field is missing.

**`generateAISlice` error messages are exact strings**
`generateAISlice.test.ts` asserts exact user-facing error message strings. Do not change the error messages in `generateAISlice.ts` without updating the corresponding test assertions.

**`FavoritesPage` heading hierarchy: `h2` → `h3`**
`FavoritesPage.a11y.test.tsx` enforces that "My Favorites" is `h2` and "My Creations" is `h3`. axe-core fails on any heading order violation.

**`drinkCards` locator covers both sections**
`tests/e2e/pages/FavoritesPage.ts` `drinkCards` must match both `aria-labelledby="drink-title-*"` (favorited API drinks) and `aria-labelledby="creation-title-*"` (AI creations). A selector that only matches one prefix breaks the Favorites E2E tests.

**`expectResultsVisible()` uses `{ timeout: 10_000 }`**
`tests/e2e/pages/HomePage.ts` uses a 10-second timeout on result visibility assertions. This was added specifically to prevent Firefox flakiness. Do not reduce this timeout.

**`isFavorite` does not exist on `AppState`**
The `isFavorite(id)` method was removed from `FavoritesSliceType`. Do not re-add it as a property to any mock `AppState` object in tests — use `favorites: { [id]: recipe }` to control favorite state, and rely on `selectIsFavorite(id)` for component-level checks.

**`reCraftRecipe: vi.fn()` must be in `selectors.test.ts` mockState**
`reCraftRecipe` was added to `AiRecipeSliceType`. The `mockState` uses `satisfies AppState` which enforces the full type at compile time — omitting any slice action causes TS1360 errors across all selector tests.

---

## 12. Lessons Learned

### HeadlessUI v2 applies `inert` to Listbox contents

When a HeadlessUI v2 `Listbox` is open, the library applies `inert=""` and `aria-hidden="true"` to the surrounding layout container. Testing Library respects these attributes and treats contained elements as invisible. `getByRole("option")` fails even though the options are in the DOM.

**Fix:** Query the raw DOM directly:

```typescript
await waitFor(() => {
  const options = document.querySelectorAll('[role="option"]');
  expect(options.length).toBeGreaterThan(0);
});
const option = Array.from(document.querySelectorAll('[role="option"]'))
  .find(el => el.textContent?.trim() === "Cocktail");
await user.click(option!);
```

---

### `vi.mock` alias does not intercept `React.lazy` relative imports

`vi.mock("@/views/IndexPage")` resolves through the alias at module-system level. `React.lazy(() => import("./views/IndexPage"))` uses a bare relative path at runtime and bypasses the alias. The mock is registered but never triggered.

**Fix:** Do not mock lazy views. Mock `useAppStore` to prevent crashes, then assert on unique content from each page's real output.

---

### `waitFor` hangs permanently with fake timers

`waitFor` uses `setInterval` to poll for assertion success. With `vi.useFakeTimers()` active, that interval never advances.

**Fix:** Read Zustand state directly after advancing timers:

```typescript
act(() => { vi.advanceTimersByTime(4000); });
expect(useAppStore.getState().notification).toBeNull(); // ✅ synchronous
```

---

### `userEvent.setup({ advanceTimers })` causes `STACK_TRACE_ERROR`

Calling `userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })` inside an `it()` block evaluates `.bind(vi)` during Vitest's collect phase, before `beforeEach` has run.

**Fix:** Use `fireEvent` for all interactions inside fake-timer tests.

---

### Stale renders accumulate with fake timers

RTL's automatic cleanup fires via `setTimeout`. With fake timers active, cleanup never runs, and renders from previous tests remain in the DOM.

**Fix:**

```typescript
afterEach(() => {
  cleanup();           // ← must come first
  vi.runAllTimers();
  vi.useRealTimers();
});
```

---

### `act` is not exported from Vitest

**Fix:** Always import `act` from `@testing-library/react`.

---

### `focus()` on `tabIndex="-1"` is silently ignored in jsdom

jsdom does not activate the document by default. Calling `.focus()` on an element with `tabIndex="-1"` does nothing unless `document.body.focus()` has been called first.

**Fix:**

```typescript
beforeEach(() => {
  document.body.focus(); // activate the document
});
```

---

### FavoritesPage notification race condition

Removing the last favorite dispatches two notifications in rapid succession. In jsdom, the `useEffect` fires synchronously after state update, overwriting the first notification immediately.

**Fix:** Assert on the final settled state (`"Your favorites list is empty"`), not the transient first message.

---

### MSW mock fixtures must satisfy Zod schemas

`safeGet` runs all responses through `safeParse`. A fixture missing `strDrink` or `strDrinkThumb` causes a silent empty-array return with no test error. Always use complete fixtures:

```typescript
const validDrink = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strCategory: "Cocktail",
};
```

---

### `window.matchMedia` is not implemented in happy-dom

`Notification.tsx` now uses a `usePrefersReducedMotion()` hook that calls `window.matchMedia` once in a `useState` initializer and subscribes to `"change"` events. happy-dom does not implement `matchMedia`, so the hook always returns `false` in tests. The `true` branch (reduced motion active) is structurally unreachable without mocking. This branch controls CSS transition class strings only and does not affect behavior.

**If you need to test the reduced-motion path:**

```typescript
beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
});
```
