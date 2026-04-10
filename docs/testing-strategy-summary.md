# 📋 Testing Strategy — Quick Reference

> **702 tests · 5 stages · all passing · CI green ✅**  
> Full details → [`docs/testing-strategy.md`](testing-strategy.md)

---

## Suite at a Glance

| Stage | Tool | Files | Tests | Duration |
|-------|------|:-----:|:-----:|:--------:|
| Unit — Stores | Vitest | 6 | 44 | ~2.6s |
| Unit — Components, Services & Utils | Vitest + Testing Library | 13 | 162 | ~6.9s |
| Accessibility | Vitest + jest-axe | 9 | 82 | ~6.2s |
| Integration | Vitest + MSW | 8 | 145 | ~7.1s |
| E2E | Playwright (5 browsers) | 4 | 269 | ~13m45s |
| **Total** | | **40** | **702** | **~14m** |

```bash
npm run test:all   # runs all 5 stages in sequence, prints this table
npm run test:ci    # same but with --bail (stops on first failure)
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
| Unit — Stores | Service layer (recipeService) | `vi.mock('@/services/recipeService')` |
| Unit — Components | Zustand store | `vi.mock('@/stores/useAppStore')` |
| Accessibility | Zustand store (real state via `setState`) | `useAppStore.setState(...)` |
| Integration | HTTP (TheCocktailDB + AI API) | MSW `server.use(http.post(...))` |
| E2E | HTTP (page-level route interception) | `page.route('**/api/**', ...)` |

---

## Layer Summary

### Unit — Stores
Tests each Zustand slice in isolation using `createStore` from `zustand/vanilla`. Verifies all actions, initial state, and edge cases. `selectors.test.ts` uses `mockState satisfies AppState` for compile-time type coverage.

### Unit — Components
`vi.mock('@/stores/useAppStore')` returns a selector-based mock. Tests assert visible output and accessible behavior (role queries, aria attributes). No CSS or className assertions.

### Accessibility
`jest-axe` audits run on every component and full page. Catches: missing labels, heading hierarchy violations, invalid ARIA, contrast issues. FavoritesPage tests verify `h2 My Favorites → h3 My Creations → h3 DrinkCard` heading order.

### Integration
MSW intercepts all HTTP. Real Zustand store (reset in `beforeEach`). Tests full user flows: search → results → open modal → add to favorites → notification appears.

**AI Generator integration tests:**
- `shows 'Save Creation' and 'Re-craft Recipe' buttons after generation`
- `saves the recipe to favorites via the store directly after generation`
- `saves the recipe to My Creations and disables the button`

### E2E (Playwright)
5 browser engines: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari. 1 retry on CI. Page Object Models in `tests/e2e/pages/`. API mocked via `page.route()` with `AI_RECIPE_RESPONSE` fixture.

**Key E2E flows:**
- Full ingredient → generate → save creation → navigate to Favorites → card visible
- Search by ingredient/category → results → open modal → add/remove favorite
- Keyboard navigation through the AI ingredient autocomplete
- Modal focus trap and Escape close behavior

---

## Running the Suite

```bash
# All stages
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

## Where to Put a New Test

| What you're testing | Where |
|--------------------|-------|
| Zustand slice action | `tests/unit/stores/{slice}.test.ts` |
| New selector | `tests/unit/stores/selectors.test.ts` (add to `mockState`) |
| React component behavior | `tests/unit/components/{Component}.test.tsx` |
| Component accessibility | `tests/accessibility/{Component}.a11y.test.tsx` |
| Multi-component user flow | `tests/integration/{Feature}.test.tsx` |
| New E2E user journey | `tests/e2e/{feature}.spec.ts` (+ page object if needed) |
| New page object locator | `tests/e2e/pages/{Page}.ts` |

---

## Key Invariants

- `selectors.test.ts` `mockState` must satisfy `AppState` — any new action added to a slice must be added here too
- Error messages in `generateAISlice.ts` are user-friendly strings — tests assert exact strings, not raw error messages
- `FavoritesPage` heading hierarchy: `h2` → `h3` — axe tests enforce this
- `drinkCards` locator in `FavoritesPage.ts` must match both `drink-title-*` AND `creation-title-*` articles
- `expectResultsVisible()` in `HomePage.ts` uses `{ timeout: 10_000 }` to prevent Firefox flakiness
