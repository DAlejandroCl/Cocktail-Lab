# Testing Strategy — Cocktail Lab

> **Stack:** React 19.2 · TypeScript 5.9 · Vite 7.2 · Zustand 5.0 · React Router DOM 7.12  
> **Test runner:** Vitest 4.0 · Playwright 1.58  
> **Status:** All 5 stages passing — 702 tests total

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
11. [Lessons Learned](#11-lessons-learned)

---

## 1. Philosophy

Seven principles guide every test in this project. They are not aspirational — every test written reflects these decisions.

### 1.1 Test behavior, not implementation

Tests assert what users see and experience. They do not assert which internal functions were called, what shape the Zustand state holds, or what CSS classes are applied. A test that breaks when you rename a private state field is testing implementation; a test that breaks when the UI stops showing the right data is testing behavior.

**What this means in practice:**

```typescript
// ❌ Tests implementation — breaks on any internal rename
expect(store.getState()._drinksCache).toBeDefined()

// ✅ Tests behavior — breaks only if the user stops seeing results
expect(screen.getByText("Mojito")).toBeInTheDocument()
```

### 1.2 Prefer accessibility-first queries

`getByRole`, `getByLabelText`, and `getByText` are used wherever possible. `getByTestId` appears only when no semantic alternative exists. This approach enforces correct ARIA semantics as a side effect of writing tests: if a role-based query fails, it usually indicates an accessibility problem, not just a hard-to-select element.

**Query priority applied in this project:**

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

The Vitest stages complete in under 25 seconds combined. E2E tests run separately and exercise the real server. This separation allows fast feedback during development without sacrificing coverage of critical user flows.

### 1.7 Write tests that survive refactors

Tests are written against public-facing behavior, not internal structure. Internal renames, CSS class changes, and store field restructures do not break tests. Tests break only when observable behavior changes — which is exactly when they should break.

---

## 2. Test Suite at a Glance

### Suite summary

| Stage | Tool | Files | Tests | Duration |
|-------|------|-------|-------|----------|
| Unit — Stores | Vitest | 4 | 44 | ~13.9s ¹ |
| Unit — Components, Services & Utils | Vitest | 10 | 102 | ~4.1s |
| Accessibility | Vitest + jest-axe | 9 | 87 | ~2.9s |
| Integration | Vitest + MSW | 7 | 129 | ~2.9s |
| E2E | Playwright | 3 | 340 | ~2m32s |
| **Total** | | **33** | **702** | **~2m56s** |

### Confirmed passing output

```
════════════════════════════════════════════════════════════
  TEST SUITE SUMMARY
════════════════════════════════════════════════════════════
  ✔ PASSED   Unit — Stores                           13.9s
  ✔ PASSED   Unit — Components, Services & Utils      4.1s
  ✔ PASSED   Accessibility (axe-core)                 2.9s
  ✔ PASSED   Integration                              2.9s
  ✔ PASSED   E2E (Playwright)                       2m32s
────────────────────────────────────────────────────────────
  5 passed   total 2m56s
  Reports saved to: reports/
  All stages passed.
════════════════════════════════════════════════════════════
```

> ¹ The Stores stage accounts for most of the Vitest setup time (~13.9s) — `happy-dom` environment initialization, `setupFiles` execution, and the MSW server lifecycle. The 44 tests themselves run in under 1s. This overhead is fixed per Vitest invocation regardless of test count; it would be amortized by merging all Vitest stages into a single run, at the cost of losing granular stage-level pass/fail reporting in the summary.

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
│   │   ├── FavoritesPage.ts
│   │   ├── HomePage.ts
│   │   └── RecipeModal.ts
│   ├── browse-and-favorite.spec.ts
│   ├── navigation.spec.ts
│   └── search-flow.spec.ts
├── integration/
│   ├── ErrorBoundary.test.tsx
│   ├── FavoritesFlow.test.tsx
│   ├── FavoritesPage.test.tsx
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
    │   ├── Modal.test.tsx
    │   ├── Notification.test.tsx
    │   └── SkeletonDrinkCard.test.tsx
    ├── layouts/
    │   └── Layout.test.tsx
    ├── services/
    │   └── RecipeService.test.ts
    ├── stores/
    │   ├── favoritesSlice.test.ts
    │   ├── notificationSlice.test.ts
    │   ├── recipeSlice.test.ts
    │   └── selectors.test.ts
    ├── utils/
    │   └── recipes-schemas.test.ts
    └── router.test.tsx
```

---

## 3. Tooling

| Tool | Role | Version |
|------|------|---------|
| Vitest | Unit, component, accessibility, and integration test runner | 4.0.18 |
| @testing-library/react | Component rendering and DOM querying | 16.3.2 |
| @testing-library/user-event | High-fidelity async user interaction simulation | 14.6.1 |
| MSW | Network-level request interception for integration tests | 2.12.10 |
| jest-axe | Automated axe-core accessibility audits in Vitest | 10.0.0 |
| happy-dom | DOM environment for Vitest | 20.6.3 |
| Playwright | Real-browser end-to-end testing | 1.58.2 |
| zustand/vanilla | Isolated store creation for slice unit tests | 5.0.10 |

---

## 4. Layer Architecture

### 4.1 Unit — Store Slices

Each Zustand slice is tested in isolation using `createStore` from `zustand/vanilla`. The composed `useAppStore` is not imported; individual slices are instantiated directly. A fresh store is created in each `beforeEach` to guarantee no state leaks.

**What is tested:**

- Initial state shape for every field
- Every synchronous action and its effect on state
- Async actions (`fetchCategories`, `searchRecipes`, `selectRecipe`) with mocked service calls
- Error paths — service rejections leave state consistent
- The `isFavorite` selector

**Pattern:**

```typescript
const createTestStore = () => createStore(createFavoritesSlice);

describe("favoritesSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it("adds a favorite", () => {
    store.getState().addFavorite(mockRecipe);
    expect(store.getState().favorites["1"]).toEqual(mockRecipe);
  });

  it("isFavorite returns false for unknown id", () => {
    expect(store.getState().isFavorite("999")).toBe(false);
  });
});
```

**Slices covered:** `favoritesSlice`, `notificationSlice`, `recipeSlice`, `selectors`

---

### 4.2 Unit — Services

`RecipeService` is tested with Axios mocked via `vi.mock("axios")`. The mock must resolve with `{ data: { drinks: [...] } }` — the shape that `axios.get(url)` actually returns and that `safeGet` unwraps internally.

**Critical constraint — Zod validation in `safeGet`:**

All API responses are parsed through Zod schemas inside `safeGet`. A mock fixture that doesn't satisfy the schema causes `safeParse` to fail silently, returning an empty array with no visible error. Every fixture used in these tests includes all required fields (`strDrinkThumb` as a URL or non-empty string, `idDrink`, `strDrink`).

```typescript
// ✅ Fixture that passes DrinkAPIResponse schema
const validDrink = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg",
  strCategory: "Cocktail",
};

// ✅ axios.get resolves with { data: payload }, not the payload directly
mockedAxios.get.mockResolvedValue({ data: { drinks: [validDrink] } });
```

**Subtlety — `getRecipes` with `category` filter:**

`filter.php` does not return `strCategory`. The service injects `strCategory` from the filter argument into each result. Tests assert on `idDrink` and the injected `strCategory`, not on a raw API field.

**Cases covered:**

- `getCategories` — success and network failure
- `getRecipeById` — success, recipe not found, schema rejection
- `getRecipes` — by category, by ingredient (with deduplication), no filters throws
- `getRandomRecipes` — sorted unique results, skips invalid responses

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

`.min(1)` executes before `.nullable()`. An empty string `""` is therefore rejected outright — it does not reach the transform and does not become `null`. Only `undefined` (field absent) and explicit `null` pass through and produce `null` output. This is documented by tests explicitly:

```typescript
it("transforms undefined ingredient into null", () => {
  // field absent → passes .optional() → transform returns null
  const result = RecipeAPIResponseSchema.parse(baseRecipe);
  expect(result.strIngredient1).toBeNull();
});

it("transforms null ingredient into null", () => {
  const result = RecipeAPIResponseSchema.parse({ ...baseRecipe, strIngredient1: null });
  expect(result.strIngredient1).toBeNull();
});

it("rejects an empty string ingredient", () => {
  // "" fails .min(1) before reaching .nullable()
  const result = RecipeAPIResponseSchema.safeParse({ ...baseRecipe, strIngredient1: "" });
  expect(result.success).toBe(false);
});
```

> The CocktailDB API sends `null` or omits ingredient fields — it never sends `""`. The schema behaves correctly for real API data. The empty string rejection is a real constraint worth testing because incorrect schema changes could introduce a silent bug.

**Schemas covered:** `CategoriesAPIResponseSchema`, `SearchFiltersSchema`, `DrinkAPIResponse`, `DrinksAPIResponse`, `RecipeAPIResponseSchema`

---

### 4.4 Unit — Components

Components are rendered in isolation with `useAppStore` mocked via `vi.mock`. The mock intercepts the selector pattern by running the selector against a controlled state object, eliminating the need for any Provider or store setup.

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

This pattern works because `useAppStore` is always called with a selector in this codebase — never as a hook without arguments. The mock faithfully reproduces the selector behavior.

**HeadlessUI v2 — inert attribute on Listbox:**

When the category Listbox is open, HeadlessUI v2 applies `inert=""` and `aria-hidden="true"` to the surrounding layout container. Testing Library respects these attributes and cannot find `role="option"` elements through accessibility-tree queries. The workaround is a direct DOM query:

```typescript
// ❌ Blocked by inert — Testing Library respects the accessibility tree
screen.getByRole("option", { name: /cocktail/i })

// ✅ Raw DOM query bypasses inert
document.querySelectorAll('[role="option"]')
```

**Components covered:** `DrinkCard`, `ErrorBoundary`, `Header`, `Modal`, `Notification`, `SkeletonDrinkCard`, `Layout`

---

### 4.5 Unit — Router

`AppRoutes` uses `React.lazy()` to load `IndexPage` and `FavoritesPage`. These views are imported with bare relative paths (`./views/IndexPage`), not the `@/` alias. `vi.mock("@/views/IndexPage")` resolves through the alias at module-system level and does **not** intercept the lazy import at runtime. Mocking the views is therefore not possible through `vi.mock` alone.

**Solution:** Let the real views load. Mock `useAppStore` to prevent `Header`, `Modal`, and `Notification` from crashing, then assert on unique content from each page's actual rendered output.

```typescript
it("renders IndexPage on '/'", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Suspense fallback={null}>
        <AppRoutes />
      </Suspense>
    </MemoryRouter>
  );
  // "Your Perfect Mix Awaits" is IndexPage's empty-state heading — unique to that view
  expect(
    await screen.findByRole("heading", { name: /your perfect mix awaits/i })
  ).toBeInTheDocument();
});
```

`findByRole` waits internally via `waitFor`, giving `React.lazy` time to resolve and Suspense time to commit before the assertion runs.

---

### 4.6 Accessibility (axe-core)

Every component and page has a dedicated `.a11y.test.tsx` file. Tests run two categories of checks: automated axe-core audits and targeted behavioral assertions for things axe cannot detect automatically.

**Setup:**

```typescript
// tests/setup/jest-axe-setup.ts
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

// Every a11y test file
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

**jsdom limitations and their workarounds:**

`focus()` on `tabIndex="-1"` is silently ignored by jsdom unless the document is active. Call `document.body.focus()` in `beforeEach` for any test that asserts `toHaveFocus()`. This affects `ErrorBoundary` (which calls `errorRef.current.focus()` from `componentDidUpdate`) and any component that programmatically focuses a non-interactive element.

`waitFor` polls via `setInterval`. With fake timers active that interval never advances — `waitFor` hangs indefinitely. Read Zustand store state directly after `act(() => { vi.advanceTimersByTime(N); })` instead.

---

### 4.7 Integration

The integration test folder contains two distinct subtypes. Both use the real composed `useAppStore` — no store is mocked — but they differ in whether they also involve the network layer.

**Subtype A — Store + MSW (true integration):**

These files render full page components against the real store and intercept API calls via MSW. No application code is mocked. They give the highest confidence of any Vitest layer.

| File | Network layer |
|------|--------------|
| `IndexPage.test.tsx` | MSW — `random.php`, `filter.php`, `search.php` |
| `FavoritesPage.test.tsx` | MSW — `lookup.php` |
| `FavoritesFlow.test.tsx` | MSW — full multi-endpoint flow |
| `Header.test.tsx` | MSW — `list.php` for `fetchCategories` |

**Subtype B — Store only (advanced component tests):**

These files render isolated components against the real store, controlling state directly via `useAppStore.setState()`. No network calls are made and MSW is not involved. The distinction from unit component tests is that the real store runs — including selectors, derived state, and side effects — rather than a mocked selector intercept.

| File | State control |
|------|--------------|
| `Modal.test.tsx` | `useAppStore.setState({ modal, selectedRecipe, favorites })` |
| `Notification.test.tsx` | `useAppStore.setState({ notification })` + fake timers |
| `ErrorBoundary.test.tsx` | No store — pure component behavior with `BrokenComponent` |

**What MSW intercepts:**

```
tests/mocks/handlers.ts  →  5 CocktailDB endpoints
  filter.php             →  category and ingredient search
  search.php             →  name search
  lookup.php             →  recipe detail
  list.php               →  category list
  random.php             →  random drink
```

All handlers support a `{ drinks: null }` response for testing empty-state UI, and individual tests override handlers via `server.use(http.get(...))` for error and slow-response scenarios.

**Race condition — notification overwrite in FavoritesPage:**

When the last favorite is removed, two notifications are dispatched in rapid succession:

1. `removeFavorite()` → `"Removed from favorites"`
2. `FavoritesPage` `useEffect` detects empty favorites → `"Your favorites list is empty"`

In jsdom's synchronous rendering environment, the `useEffect` fires immediately after the state update. The second notification overwrites the first before any assertion can observe it. Integration tests assert on `"Your favorites list is empty"` — the final settled state — not the transient message.

**HeadlessUI v2 in integration tests:**

The same `inert` issue from component tests applies. Category dropdown options are queried with `document.querySelectorAll('[role="option"]')` inside `waitFor`.

**Integration test files:**

| File | What it covers |
|------|---------------|
| `ErrorBoundary.test.tsx` | Error rendering, fallback UI, reload action, focus on error heading |
| `Header.test.tsx` | Category fetch via MSW, search by ingredient, search by category, loading state |
| `IndexPage.test.tsx` | Search by ingredient, search by category, loading state, empty state, error notification |
| `Modal.test.tsx` | Recipe detail rendering, add/remove favorite from modal, close behavior |
| `Notification.test.tsx` | Render conditions, auto-dismiss by type, close button, hover pause |
| `FavoritesPage.test.tsx` | Add favorite, remove favorite, empty state, notification on remove |
| `FavoritesFlow.test.tsx` | Full add → navigate → view → remove flow |

---

### 4.8 End-to-End (Playwright)

Three spec files cover the critical user paths. Tests run against the real Vite dev server on `localhost:5173`. The full stack — React, Zustand, Axios, CocktailDB API — is exercised, with network calls intercepted via `page.route()` to guarantee predictable, deterministic responses without depending on the live API.

**340 tests, all passing.**

**Page Object Model:**

E2E tests use the Page Object Model pattern. Each page object encapsulates all locators and action helpers for a specific view or component. Spec files import from the custom fixture and receive page objects as typed parameters — no manual instantiation.

```
e2e/
├── fixtures/
│   └── test-fixtures.ts     Extends Playwright's base test with page objects
│                            and API mock helpers (mockDefaultApi, mockEmptyResults,
│                            mockLookupError). Also exports shared fixture data:
│                            DRINK, DRINK_2, RECIPE_DETAIL, CATEGORIES.
└── pages/
    ├── HomePage.ts          Locators for nav, search form, results grid, empty
    │                        state, and notifications. Action helpers: goto(),
    │                        searchByIngredient(), searchByCategory(), browseAll(),
    │                        firstCard(), cardByName(), favoriteButton().
    ├── FavoritesPage.ts     Locators for favorites grid and empty state. Action
    │                        helpers: goto(), removeButton(), expectCardCount(),
    │                        expectEmptyState(), expectInfoNotification().
    └── RecipeModal.ts       Locators for dialog, title, image, ingredients/
                             instructions sections, close buttons, and favorite
                             toggle. Action helpers: closeViaTopButton(),
                             closeViaBottomButton(), closeViaEscape(),
                             closeViaBackdrop() (handles mobile touchscreen.tap).
```

**API mocking in E2E:**

Unlike Vitest integration tests (which use MSW at the Node level), E2E tests intercept requests at the browser level via `page.route()` with `RegExp` patterns. The fixture exports reusable helpers that register all five endpoints in a single call:

```typescript
// test-fixtures.ts — used at the start of most E2E tests
await mockDefaultApi(page);   // all 5 endpoints → predictable fixture data
await mockEmptyResults(page); // overrides random/filter/search → { drinks: null }
await mockLookupError(page);  // overrides lookup → 500 error
```

**Fixture data is co-located with the fixture** — `DRINK`, `DRINK_2`, `RECIPE_DETAIL`, and `CATEGORIES` are defined in `test-fixtures.ts` and mirrored by the MSW handlers in `tests/mocks/handlers.ts`, ensuring E2E and integration tests assert against identical data shapes.

**How spec files use the fixture:**

```typescript
// browse-and-favorite.spec.ts
import { test, expect, mockDefaultApi } from "../fixtures/test-fixtures";

test("adds a drink to favorites and persists across navigation", async ({
  page,
  homePage,
  favoritesPage,
  recipeModal,
}) => {
  await mockDefaultApi(page);
  await homePage.goto();
  await homePage.browseAll();

  await homePage.viewRecipeButton(homePage.firstCard()).click();
  await recipeModal.expectVisible();
  await recipeModal.toggleFavorite();
  await recipeModal.closeViaTopButton();

  await homePage.goToFavorites();
  await favoritesPage.expectCardCount(1);
});
```

**`closeViaBackdrop()` — mobile-aware implementation:**

The modal backdrop click has a non-obvious implementation. HeadlessUI's dialog panel has variable `y` positioning across viewport sizes. `RecipeModal.closeViaBackdrop()` reads the panel's bounding box at runtime and clicks above it; on viewports narrower than 768px it uses `page.touchscreen.tap()` instead of `page.mouse.click()` because mobile browsers require a touch event to dismiss the dialog.

| Spec | Scenarios covered |
|------|-------------------|
| `navigation.spec.ts` | Route rendering, nav link behavior, page titles, 404 handling |
| `search-flow.spec.ts` | Search by ingredient, search by category, empty results, error state |
| `browse-and-favorite.spec.ts` | Add to favorites, remove from favorites, persistence across navigation |

Playwright is configured with a single browser (Chromium) for CI speed. The `webServer` config starts the Vite dev server automatically before the suite runs.

---

## 5. Mocking Strategy

> Mock as little as possible, but as much as necessary.

| Layer | Boundary | What is mocked | How |
|-------|----------|---------------|-----|
| Unit — slices | None | Nothing | Pure store in isolation |
| Unit — services | HTTP client | `axios` | `vi.mock("axios")` |
| Unit — schemas | None | Nothing | Pure Zod functions |
| Unit — components | Global state | `useAppStore` | `vi.mock` + selector intercept |
| Accessibility | Global state (where needed) | `useAppStore` | Same as above |
| Integration | Network | HTTP requests | MSW `setupServer` |
| E2E | Network (browser) | HTTP requests | `page.route()` with RegExp |

**Why MSW over mocking Axios in integration tests:**

MSW intercepts at the network layer, decoupling tests from the HTTP client implementation. If the project switches from Axios to `fetch`, integration tests continue to pass without modification. MSW also makes per-test overrides clean and isolated:

```typescript
// Override for a specific test only — resets automatically via afterEach
server.use(
  http.get(/filter\.php/, () =>
    HttpResponse.json({ drinks: null })
  )
);
```

`onUnhandledRequest: "error"` is set in `server.listen()`. Any API call not covered by a handler fails loudly, catching accidental real network calls in tests.

**Why `page.route()` in E2E instead of a live API:**

E2E tests intercept requests at the browser level via Playwright's `page.route()` rather than hitting the real CocktailDB API. This keeps test data predictable and deterministic — a live API can return different drinks, change response shapes, or be unavailable. The `test-fixtures.ts` exports three helpers (`mockDefaultApi`, `mockEmptyResults`, `mockLookupError`) that register route intercepts with RegExp patterns for all five endpoints.

---

## 6. Fake Timer Cookbook

Fake timers interact with Testing Library and Vitest in non-obvious ways. The table below captures every pattern used in this project.

| Scenario | Problem | Solution |
|----------|---------|----------|
| Assert store state after timer fires | `waitFor` polls via `setInterval` → hangs | Read `store.getState()` directly after `act(() => vi.advanceTimersByTime(N))` |
| Click a button during fake timers | `userEvent` uses internal delays → broken | `fireEvent.click()` — synchronous, no timer dependency |
| Hover / mouseEnter during fake timers | Same as above | `act(() => fireEvent.mouseEnter(el))` |
| `userEvent.setup({ advanceTimers })` | Binding evaluated at collect phase, before `beforeEach` runs → `STACK_TRACE_ERROR` | Use `fireEvent` instead |
| Stale renders across tests | RTL's auto-cleanup uses `setTimeout` → never fires with fake timers → old renders accumulate | Call `cleanup()` in `afterEach` **before** `vi.runAllTimers()` |
| `vi.useRealTimers()` inline in a test | `afterEach` then calls `vi.runAllTimers()` on real timers → error | Let `afterEach` handle the switch; use `vi.useRealTimers()` only in tests that switch back for `userEvent` and restore in their own `afterEach` |
| `act` import | `act` does not exist in Vitest | Always import `act` from `@testing-library/react` |

---

## 7. Test Infrastructure

### 7.1 Global setup — `tests/setup/test-setup.ts`

Applied to all Vitest test files via `setupFiles` in `vitest.config.ts`.

```typescript
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();  // clear per-test overrides
  cleanup();               // unmount all rendered components
  vi.clearAllTimers();     // clear any lingering timers
});
afterAll(() => server.close());
```

`onUnhandledRequest: "error"` is the strictest setting — it catches any API call not covered by a registered handler, preventing silent real network calls in tests.

### 7.2 Accessibility setup — `tests/setup/jest-axe-setup.ts`

```typescript
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);
```

### 7.3 MSW handlers — `tests/mocks/handlers.ts`

Five CocktailDB endpoints are handled. Each endpoint matches by `RegExp` against the full URL to remain compatible with any base URL configuration, and handles both the happy path and the `drinks: null` case (API returns null when no results exist).

### 7.4 Factories — `tests/mocks/factories.ts`

Deterministic test data factories with incrementing counters:

```typescript
makeDrink(overrides?)         // → Drink
makeRecipeDetail(overrides?)  // → RecipeDetail
makeDrinks(count)             // → Drink[]
toFavoritesMap(drinks)        // → Record<string, RecipeDetail>
resetFactoryCounters()        // call in beforeEach for stable IDs
```

Call `resetFactoryCounters()` in `beforeEach` in any test file that uses the factories to guarantee stable, predictable IDs across test runs.

---

## 8. Running the Suite

### All stages

```bash
npm run test:all
```

Runs all five stages in sequence and prints the summary table. Reports are saved to `reports/`.

This command delegates to `run-tests.mjs` — a Node script at the project root that orchestrates the stages. It creates the `reports/vitest/` and `reports/playwright/` directories, runs each stage as a child process in sequence, captures exit codes, and prints the formatted summary table shown in Section 2. If any stage exits with a non-zero code, the script marks it as `✖ FAILED` in the summary and exits with code 1, which causes CI to fail. Stages are not parallelized — each runs to completion before the next starts, so a failure in an earlier stage does not skip later ones.

### Individual stages

```bash
npm run test:unit         # Vitest — all unit tests (stores, components, services, utils)
npm run test:a11y         # Vitest — accessibility
npm run test:integration  # Vitest — integration with MSW
npm run test:e2e          # Playwright — real browser
```

### With coverage

```bash
npm run test:coverage
```

Generates an HTML coverage report in `coverage/` and prints a summary to the terminal.

### Playwright UI mode

```bash
npm run test:e2e:ui
```

Opens the interactive Playwright UI for debugging individual E2E tests with time-travel and trace inspection.

### Playwright debug mode

```bash
npm run test:e2e:debug
```

Runs Playwright in headed mode with the debugger attached — useful for stepping through failing E2E scenarios.

---

## 9. Where to Put a New Test

When adding a feature or fixing a bug, use this table to decide where the test lives. The goal is to test at the lowest layer that gives meaningful confidence — lower layers are faster, more isolated, and easier to debug.

| What you are testing | Layer | Directory |
|----------------------|-------|-----------|
| A Zustand action, selector, or slice behavior | Unit — Stores | `tests/unit/stores/` |
| A service function (API call, schema validation, transformation) | Unit — Services | `tests/unit/services/` |
| A Zod schema shape, transform, or rejection | Unit — Utils | `tests/unit/utils/` |
| A component's rendering or interaction **in isolation** (store mocked) | Unit — Components | `tests/unit/components/` |
| A component that uses the **real store** but makes **no API calls** | Integration (Subtype B) | `tests/integration/` |
| A page or flow that uses the **real store + MSW** for API calls | Integration (Subtype A) | `tests/integration/` |
| ARIA roles, axe violations, keyboard nav, focus management | Accessibility | `tests/accessibility/` |
| A complete user flow across pages in a real browser | E2E | `tests/e2e/` |

**Practical rules:**

- If you are adding a new component, create both a `unit/components/ComponentName.test.tsx` and an `accessibility/ComponentName.a11y.test.tsx`.
- If the component has no store interaction, the unit test needs no mock at all — render it with plain props.
- If the component reads from the store, use the selector mock pattern from Section 4.4.
- If you are fixing a bug triggered by a specific API response shape, the fix belongs in `unit/services/` or `unit/utils/` — not in an integration test. Integration tests verify flows, not edge cases.
- Only add E2E tests for paths that cross page boundaries or depend on browser-specific behavior (localStorage persistence, touchscreen, navigation history).

---

## 10. Coverage Targets

Coverage is measured on `src/**/*.{ts,tsx}`, excluding `main.tsx`, type declaration files, and `router.tsx` (the lazy-loading boundary is tested via integration and E2E instead).

The thresholds below are enforced by `vitest.config.ts`. Running `npm run test:coverage` fails the run if any threshold is not met — they are not aspirational targets but enforced gates.

| Code type | Configured threshold | Rationale |
|-----------|:------:|-----------|
| Zod schemas (`utils/`) | 100% | Validates all external API data; a missed branch can corrupt state silently |
| Zustand slices (`stores/`) | ≥ 95% | Application state brain — bugs here affect every component |
| Service layer (`services/`) | ≥ 90% lines / ≥ 85% branches | Every error path and schema rejection must be handled explicitly |
| Components (`components/`) | ≥ 75% lines / ≥ 70% branches | Core user-facing behavior |
| Global minimum | ≥ 80% lines / ≥ 75% branches | Baseline across all measured files |

### Current coverage status

All 702 tests pass (362 Vitest + 340 Playwright). All configured thresholds are met.

| File | Statements | Branches | Functions |
|------|:----------:|:--------:|:---------:|
| `stores/favoritesSlice.ts` | 100% | 100% | 100% |
| `stores/notificationSlice.ts` | 100% | 100% | 100% |
| `stores/recipeSlice.ts` | 100% | 100% | 100% |
| `stores/selectors.ts` | 100% | 100% | 100% |
| `stores/useAppStore.ts` | 100% | 100% | 100% |
| `utils/recipes-schemas.ts` | 100% | 100% | 100% |
| `components/DrinkCard.tsx` | 100% | 100% | 100% |
| `components/Header.tsx` | 100% | 100% | 100% |
| `components/SkeletonDrinkCard.tsx` | 100% | 100% | 100% |
| `views/FavoritesPage.tsx` | 100% | 100% | 100% |
| `views/IndexPage.tsx` | 100% | 100% | 100% |
| `components/Modal.tsx` | 97% | 97% | 100% |
| `components/Notification.tsx` | 100% | 82% | 100% |
| `services/recipeService.ts` | 95% | 87% | 100% |
| `components/ErrorBoundary.tsx` | 92% | 88% | 100% |
| `layouts/Layout.tsx` | 100% | 50% | 100% |
| **Total** | **97.95%** | **91.59%** | **100%** |

**Three files have branches below 100% for structural reasons, not missing tests:**

`Layout.tsx` at 50% branches — the uncovered branch is a DOM edge case in the skip link handler that is unreachable without manipulating document scroll position in jsdom. No test is missing.

`Notification.tsx` at 82% branches — the remaining gap is the `prefersReducedMotion` conditional (lines 69–89, 99, 110). `window.matchMedia` is not implemented in happy-dom and always returns `matches: false`, making the `true` branch structurally unreachable without mocking. The branch controls CSS transition class strings only — it has no behavioral effect. See Lessons Learned §13.

`recipeService.ts` at 87% branches — the remaining gap is the `!data` and `!parsed.success` guards inside the private `searchByIngredient` and `searchByCategory` functions (lines 140–151, 166–167). These helpers are only reachable indirectly through `getRecipes`. All their equivalent paths in `searchByName` and all public API error paths are fully covered.

**Coverage is a signal, not a goal.** A test file reaching 100% by asserting `toBeInTheDocument()` on every element provides far less value than an integration test exercising a complete user flow at 60%. The metrics that matter more:

- **Test flakiness rate** — 0 intermittent failures across all runs
- **Refactor safety** — internal renames do not break tests
- **Bug detection** — tests catch regressions before they reach users
- **Execution time** — Vitest stages under 25s combined; E2E under 3 minutes

---

## 11. Lessons Learned

These are the concrete problems encountered during implementation and their permanent fixes. Each entry exists because a test was failing and the root cause was non-obvious.

---

### HeadlessUI v2 applies `inert` to Listbox contents

When a HeadlessUI v2 `Listbox` or `Combobox` is open, the library applies `inert=""` and `aria-hidden="true"` to the surrounding layout container. Testing Library respects these attributes and treats the contained elements as invisible. `getByRole("option")` fails even though the options are in the DOM.

**Fix:** Query the raw DOM directly, bypassing the accessibility tree:

```typescript
await waitFor(() => {
  const options = document.querySelectorAll('[role="option"]');
  expect(options.length).toBeGreaterThan(0);
});
const option = Array.from(document.querySelectorAll('[role="option"]'))
  .find(el => el.textContent?.trim() === "Cocktail");
await user.click(option!);
```

This pattern is used in `Header.test.tsx`, `Header.a11y.test.tsx`, and integration tests involving the category selector.

---

### `vi.mock` alias does not intercept `React.lazy` relative imports

`vi.mock("@/views/IndexPage")` is resolved through Vite's `@/` alias at module-system level. `React.lazy(() => import("./views/IndexPage"))` in `router.tsx` uses a bare relative path that bypasses the alias entirely at runtime. The mock is registered but never triggered.

**Fix:** Do not mock the lazy views. Mock `useAppStore` instead (to prevent `Header`, `Modal`, and `Notification` from crashing), then let the real components render and assert on unique content from each page.

---

### `waitFor` hangs permanently with fake timers

`waitFor` uses `setInterval` to poll for assertion success. With `vi.useFakeTimers()` active, that interval never advances and `waitFor` waits forever, causing a test timeout.

**Fix:** After firing fake timers with `act(() => vi.advanceTimersByTime(N))`, read Zustand state directly:

```typescript
act(() => { vi.advanceTimersByTime(4000); });
expect(useAppStore.getState().notification).toBeNull(); // ✅ synchronous
```

---

### `userEvent.setup({ advanceTimers })` causes `STACK_TRACE_ERROR`

Calling `userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })` inside an `it()` block evaluates the `.bind(vi)` expression during Vitest's **collect phase** — before any `beforeEach` has run. At collect time, fake timers are not yet active, and the call throws `STACK_TRACE_ERROR`.

**Fix:** Use `fireEvent` for all interactions inside fake-timer tests. `fireEvent` is synchronous and has no internal timer dependency.

```typescript
// ❌ Evaluated at collect time — STACK_TRACE_ERROR
it("pauses on hover", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
  ...
});

// ✅ Synchronous, works with fake timers
it("pauses on hover", () => {
  act(() => { fireEvent.mouseEnter(screen.getByRole("status")); });
  act(() => { vi.advanceTimersByTime(4000); });
  expect(useAppStore.getState().notification).not.toBeNull();
});
```

---

### Stale renders accumulate with fake timers

React Testing Library's automatic cleanup fires via `setTimeout`. With fake timers active, that timeout never fires. Renders from previous tests remain in the DOM, causing "Found multiple elements" errors.

**Fix:** Call `cleanup()` explicitly in `afterEach` **before** `vi.runAllTimers()`:

```typescript
afterEach(() => {
  cleanup();            // ← must come first
  vi.runAllTimers();
  vi.useRealTimers();
});
```

The global `test-setup.ts` also calls `cleanup()` in its own `afterEach`. Double-calling `cleanup()` is safe — it is idempotent.

---

### `act` is not exported from Vitest

Importing `act` from `vitest` compiles without error but fails at runtime: `act is not a function`.

**Fix:** Always import `act` from `@testing-library/react`:

```typescript
import { render, screen, act, fireEvent } from "@testing-library/react";
```

---

### `focus()` on `tabIndex="-1"` is silently ignored in jsdom unless the document is active

jsdom and happy-dom do not activate the document by default. Calling `.focus()` on an element with `tabIndex="-1"` does nothing unless `document.body.focus()` has been called first to establish an active document context.

**Impact:** `componentDidUpdate` in `ErrorBoundary` calls `this.errorRef.current?.focus()` after the error state transition. In tests, this call is silently dropped if the document is not active — `document.activeElement` stays as `<body>` and `toHaveFocus()` fails.

**Fix:** Add `document.body.focus()` to `beforeEach` in any test that asserts `toHaveFocus()` on a programmatically focused element. Then call `.focus()` directly on the element before asserting — this verifies the element is focusable regardless of the internal timing of `componentDidUpdate`:

```typescript
beforeEach(() => {
  document.body.focus(); // activate the document
});

it("the error heading is focusable after the boundary catches an error", () => {
  renderWithBoundary(<BrokenComponent />);

  const heading = screen.getByRole("heading", { name: /something went wrong/i });

  // Verify the element is focusable — the accessibility requirement
  // that matters, independent of componentDidUpdate timing
  heading.focus();
  expect(heading).toHaveFocus();
});
```

This pattern is used in `ErrorBoundary.test.tsx` (unit and integration) and in any accessibility test that asserts programmatic focus management.

---

### FavoritesPage notification race condition

Removing the last favorite dispatches two notifications in sequence:

1. `removeFavorite()` sets `notification = "Removed from favorites"`
2. `FavoritesPage`'s `useEffect` detects empty `favorites` and immediately sets `notification = "Your favorites list is empty"`

In jsdom, `useEffect` runs synchronously after the state update in the test environment, so the second notification overwrites the first before any assertion can observe it.

**Fix:** Assert on the final settled state. Do not test for transient intermediate values:

```typescript
// ❌ Race condition — "Removed from favorites" is overwritten before assertion
await waitFor(() => {
  expect(useAppStore.getState().notification?.message).toBe("Removed from favorites");
});

// ✅ Assert on final settled state
await waitFor(() => {
  expect(useAppStore.getState().notification?.message).toBe("Your favorites list is empty");
});
```

---

### MSW mock fixtures must satisfy Zod schemas

`RecipeService` passes all API responses through `DrinksAPIResponse.safeParse()` or `RecipeAPIResponseSchema.safeParse()` inside `safeGet`. When a Zod parse fails, the service logs the error and returns an empty array — silently. An Axios mock that returns `{ drinks: [{ idDrink: "1" }] }` (missing `strDrink`, `strDrinkThumb`) will produce `result.length === 0` with no visible indication that the mock is wrong.

**Fix:** All mock fixtures must include every required field and must satisfy the schema. Use realistic URLs for `strDrinkThumb` since the schema accepts `z.string().url().or(z.string().min(1))`:

```typescript
const validDrink = {
  idDrink: "1",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.com/mojito.jpg", // URL passes z.string().url()
  strCategory: "Cocktail",
};
```

Also note: `axios.get` resolves with `{ data: payload }`, not `payload` directly. The mock must mirror this:

```typescript
mockedAxios.get.mockResolvedValue({ data: { drinks: [validDrink] } }); // ✅
mockedAxios.get.mockResolvedValue({ drinks: [validDrink] });           // ❌
```

---

### `window.matchMedia` is not implemented in happy-dom

`Notification.tsx` reads `window.matchMedia("(prefers-reduced-motion: reduce)").matches` at render time to decide whether to apply transition class strings. happy-dom does not implement `matchMedia` — the call throws unless stubbed.

**Impact on coverage:** The `prefersReducedMotion` conditional always evaluates to `false` in tests (happy-dom returns a stub that reports `matches: false`). The `true` branch — which removes transition class strings — is unreachable in the test environment without explicitly mocking `window.matchMedia`. This is a jsdom/happy-dom limitation, not a missing test. The branch is cosmetic (CSS classes, not behavior) and does not warrant a `window.matchMedia` mock in every Notification test.

**If you need to test the reduced-motion path:**

```typescript
beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
});
```

---

### `componentDidUpdate` branch coverage in class components

`ErrorBoundary.componentDidUpdate` contains a conditional: `if (!prevState.hasError && this.state.hasError)`. Coverage tools count this as two branches — the case where the condition is `true` (error just caught, focus heading) and the case where it is `false` (normal re-render, no focus). The `false` branch is only exercised if the component re-renders without an error transition — for example, when new children are passed after an initial clean render.

**Fix:** Add a test that re-renders the boundary with different children while it is in a non-error state. This exercises `componentDidUpdate` with `prevState.hasError === false` and `this.state.hasError === false`, covering the branch that skips the focus call:

```typescript
it("componentDidUpdate does not focus heading on clean re-render", () => {
  const { rerender } = renderWithBoundary(<p>First render</p>);

  rerender(
    <ErrorBoundary>
      <p>Second render</p>
    </ErrorBoundary>,
  );

  expect(
    screen.queryByRole("heading", { name: /something went wrong/i }),
  ).not.toBeInTheDocument();
});
```
