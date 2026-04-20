# 📋 Testing Strategy — Quick Reference

> **1003 tests · 5 stages · all passing · CI green ✅**  
> Full details → [`docs/testing-strategy.md`](testing-strategy.md)

---

## Suite at a Glance

| Stage | Tool | Files | Tests |
|-------|------|:-----:|:-----:|
| Unit — Stores | Vitest | 6 | 104 |
| Unit — Components, Services & Utils | Vitest + Testing Library | 15 | 172 |
| Accessibility | Vitest + jest-axe | 9 | 82 |
| Integration | Vitest + MSW | 8 | 145 |
| E2E | Playwright (5 browsers) | 4 | 500 |
| **Total** | | **42** | **1003** |

```bash
npm run test:all   # all 5 stages in sequence
npm run test:ci    # same with --bail
```

---

## Philosophy (7 Principles)

1. **Test behavior, not implementation** — assert what users see, not internal state shape or CSS classes
2. **Accessibility-first queries** — `getByRole` → `getByLabelText` → `getByText`; `getByTestId` as last resort
3. **Avoid testing internal state** — `store.getState()` only when no observable UI equivalent exists
4. **Make tests deterministic** — fake timers controlled per test, MSW reset after every test, fresh store per test
5. **Scale mocking to the layer** — each layer has a defined mocking boundary; nothing is mocked below it
6. **Balance speed against confidence** — Vitest stages under 25s; E2E separate to keep dev feedback fast
7. **Write tests that survive refactors** — tests break when behavior changes, not when internals are renamed

---

## Mocking Strategy

| Layer | What is mocked | How |
|-------|---------------|-----|
| Unit — Stores | Nothing | Pure vanilla store |
| Unit — Services | `fetch` | `vi.spyOn(globalThis, "fetch")` + `vi.restoreAllMocks()` |
| Unit — Components | `useAppStore` | `vi.mock` + selector intercept |
| Accessibility | `useAppStore` (where needed) | Same as above |
| Integration | HTTP requests | MSW `setupServer` |
| E2E | HTTP requests (browser) | `page.route()` with RegExp |

---

## Layer Summary

### Unit — Stores
Tests each Zustand slice in isolation via `createStore` from `zustand/vanilla`. Covers all actions, initial state, and error paths. `selectors.test.ts` uses `mockState satisfies AppState` for compile-time type coverage.

**Slices:** `favoritesSlice`, `generateAISlice`, `notificationSlice`, `recipeSlice`, `selectors`, `useThemeStore`

### Unit — Components
`vi.mock("@/stores/useAppStore")` + selector intercept pattern. Tests assert visible output and accessible behavior only. No CSS or className assertions. Use `favorites: { [id]: recipe }` to control favorite state — `isFavorite` no longer exists on `AppState`.

**Components:** `DrinkCard`, `ErrorBoundary`, `Header`, `HeroSection`, `Modal`, `Notification`, `SearchForm`, `SkeletonDrinkCard`, `SortSelector`, `ThemeToggle`, `Layout`

### Accessibility
`jest-axe` audits on every component and full page. Catches: missing labels, heading hierarchy violations, invalid ARIA. `FavoritesPage` enforces `h2 My Favorites → h3 My Creations → h3 card titles`.

### Integration
Real Zustand store (reset in `beforeEach`). MSW intercepts all HTTP. Tests full user flows including the AI Generator: add ingredients → generate → save creation → verify in store.

**Files:** `ErrorBoundary`, `FavoritesFlow`, `FavoritesPage`, `GenerateAI`, `Header`, `IndexPage`, `Modal`, `Notification`

### E2E (Playwright)
5 browser engines: Chromium, Firefox, WebKit, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 13). 1 retry on CI. Page Object Models in `tests/e2e/pages/`. API mocked via `page.route()`.

**Specs:** `navigation`, `search-flow`, `browse-and-favorite`, `ai-generator`

---

## Running the Suite

```bash
npm run test:all          # all stages
npm run test:unit         # stores + components + services + utils
npm run test:a11y         # accessibility audits
npm run test:integration  # integration with MSW
npm run test:e2e          # Playwright (5 browsers)
npm run test              # Vitest watch mode
npm run test:e2e:ui       # Playwright interactive UI
npm run test:coverage     # coverage report
```

---

## Where to Put a New Test

| What you're testing | Where |
|--------------------|-------|
| Zustand slice action | `tests/unit/stores/{slice}.test.ts` |
| New selector | `tests/unit/stores/selectors.test.ts` (add to `mockState`) |
| React component behavior | `tests/unit/components/{Component}.test.tsx` |
| Component accessibility | `tests/accessibility/{Component}.a11y.test.tsx` |
| Multi-component user flow | `tests/integration/{Feature}.test.tsx` |
| New E2E user journey | `tests/e2e/{feature}.spec.ts` + page object if needed |

---

## Key Invariants

These contracts must be maintained when changing production code:

| Invariant | Where enforced |
|-----------|---------------|
| `selectors.test.ts` `mockState` must `satisfies AppState` — any new slice action must be added here | `selectors.test.ts` compile-time |
| `generateAISlice` error messages are exact strings — tests assert `toBe(...)` not `toMatch(...)` | `generateAISlice.test.ts` |
| `FavoritesPage` heading order: `h2` (My Favorites) → `h3` (My Creations) | `FavoritesPage.a11y.test.tsx` |
| `drinkCards` E2E locator matches both `drink-title-*` AND `creation-title-*` articles | `tests/e2e/pages/FavoritesPage.ts` |
| `expectResultsVisible()` uses `{ timeout: 10_000 }` (Firefox flakiness fix) | `tests/e2e/pages/HomePage.ts` |
| `isFavorite` does not exist on `AppState` — use `favorites: { [id]: recipe }` in mocks | All component/integration test mocks |
| `reCraftRecipe: vi.fn()` must be in `selectors.test.ts` `mockState` — added to `AiRecipeSliceType` | `selectors.test.ts` compile-time |
