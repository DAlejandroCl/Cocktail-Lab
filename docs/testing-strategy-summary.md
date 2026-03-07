# 📋 Testing Strategy — Quick Reference

> **702 tests · 5 stages · all passing**  
> Full details → [`docs/testing-strategy.md`](testing-strategy.md)

---

## Suite at a Glance

| Stage | Tool | Files | Tests | Duration |
|-------|------|:-----:|:-----:|:--------:|
| Unit — Stores | Vitest | 4 | 44 | ~13.9s |
| Unit — Components, Services & Utils | Vitest | 10 | 102 | ~4.1s |
| Accessibility | Vitest + jest-axe | 9 | 87 | ~2.9s |
| Integration | Vitest + MSW | 7 | 129 | ~2.9s |
| E2E | Playwright | 3 | 340 | ~2m32s |
| **Total** | | **33** | **702** | **~2m56s** |

```
npm run test:all   →  runs all 5 stages in sequence, prints this table
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
| Unit — slices | Nothing | Pure store in isolation (`zustand/vanilla`) |
| Unit — services | HTTP client | `vi.mock("axios")` |
| Unit — schemas | Nothing | Pure Zod functions |
| Unit — components | Global state | `vi.mock` + selector intercept pattern |
| Accessibility | Global state (where needed) | Same as components |
| Integration | Network | MSW `setupServer` — Node level |
| E2E | Network | `page.route()` — browser level |

---

## Coverage

Thresholds enforced by `vitest.config.ts` — `npm run test:coverage` fails if any is not met.

| Scope | Threshold | Actual |
|-------|:---------:|:------:|
| Zod schemas (`utils/`) | 100% | **100%** |
| Zustand slices (`stores/`) | ≥ 95% | **100%** |
| Service layer (`services/`) | ≥ 90% stmts / ≥ 85% branches | **95% / 87%** |
| Components (`components/`) | ≥ 75% stmts / ≥ 70% branches | **97.6% avg** |
| Global minimum | ≥ 80% stmts / ≥ 75% branches | **97.95% / 91.59%** |

Three files have branches below 100% for structural reasons — not missing tests:

- **`Layout.tsx` (50% branches)** — skip link DOM edge case unreachable in jsdom without scroll position manipulation
- **`Notification.tsx` (82% branches)** — `prefersReducedMotion` branch; `window.matchMedia` not implemented in happy-dom; affects CSS classes only
- **`recipeService.ts` (87% branches)** — `!data`/`!parsed.success` guards in private helpers reachable only through `getRecipes`; equivalent paths in public API fully covered

---

## Accessibility Testing

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

---

## npm Scripts

```bash
# Full suite
npm run test:all          # all 5 stages + summary table
npm run test:all:bail     # stop on first stage failure
npm run test:ci           # CI=true + bail (used in GitHub Actions)

# Individual stages
npm run test:unit         # unit tests (stores, components, services, utils)
npm run test:a11y         # accessibility audits (axe-core)
npm run test:integration  # integration tests with MSW
npm run test:e2e          # Playwright — real Chromium

# Coverage
npm run test:coverage     # enforces thresholds; HTML report → coverage/

# Development
npm run test              # Vitest watch mode
npm run test:e2e:ui       # Playwright interactive UI
npm run test:e2e:debug    # Playwright headed + debugger
```

---

## Key Implementation Notes

**HeadlessUI v2 `inert` on open Listbox** — when the category dropdown is open, HeadlessUI applies `inert=""` to the surrounding layout container. Testing Library cannot find `[role="option"]` through the accessibility tree. Workaround: `document.querySelectorAll('[role="option"]')` directly.

**`waitFor` + fake timers** — `waitFor` polls via `setInterval`, which never advances with fake timers active. After `act(() => vi.advanceTimersByTime(N))`, read `useAppStore.getState()` directly instead.

**`userEvent.setup({ advanceTimers })`** — the `.bind(vi)` expression is evaluated at collect phase before `beforeEach` runs, throwing `STACK_TRACE_ERROR`. Use `fireEvent` for all interactions inside fake-timer tests.

**`vi.mock` + `React.lazy`** — `vi.mock("@/views/IndexPage")` does not intercept `lazy(() => import("./views/IndexPage"))` — the alias is resolved differently at runtime. Solution: let the real views load and mock `useAppStore` instead.

**MSW fixtures must satisfy Zod** — `RecipeService` passes all responses through `safeGet`, which runs Zod schemas. A fixture missing required fields causes `safeParse` to fail silently, returning an empty array with no error. Every mock fixture includes `idDrink`, `strDrink`, and `strDrinkThumb` as a valid URL.

**`act` import** — `act` does not exist in Vitest. Always import from `@testing-library/react`.
