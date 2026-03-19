# 🗂 Project Structure — Cocktail Lab

```
Cocktail-Lab/
├── .github/
│   └── workflows/
│       └── ci.yml                       # CI pipeline (lint + test on push)
│
├── docs/
│   ├── accessibility.md                 # Accessibility standards and audit results
│   ├── architecture.md                  # Full architectural breakdown
│   ├── project-structure.md             # This file
│   ├── testing-strategy-summary.md      # Quick testing reference
│   └── testing-strategy.md              # Detailed testing strategy per layer
│
├── src/
│   ├── components/
│   │   ├── DrinkCard.tsx                # Card: thumbnail, category badge, favorites toggle
│   │   ├── ErrorBoundary.tsx            # UI crash isolation with accessible fallback
│   │   ├── Header.tsx                   # Sticky navbar: AnimatedNav underline + Logo bounce
│   │   ├── HeroSection.tsx              # Full-height hero with:
│   │   │                                #   MeshGradient — two animated blend-mode blobs
│   │   │                                #   Ticker — 25 cocktail names, 50s scroll cycle
│   │   │                                #   Bubbles — 20 floating orbs (negative delay spawn)
│   │   │                                #   ScrollArrow — smooth-scroll CTA
│   │   │                                #   ::after fade — dissolves into page background
│   │   ├── Modal.tsx                    # Recipe detail overlay (HeadlessUI Dialog)
│   │   ├── Notification.tsx             # Global toast with auto-dismiss + hover-pause
│   │   ├── SearchForm.tsx               # Ingredient input + Listbox category + clear button
│   │   ├── SkeletonDrinkCard.tsx        # Animated loading placeholder
│   │   ├── SortSelector.tsx             # Generic pill-group <T extends string> sort selector
│   │   └── ThemeToggle.tsx              # Light / dark mode toggle → useThemeStore
│   │
│   ├── layouts/
│   │   └── Layout.tsx                   # Root shell: Header, Modal, Notification, ErrorBoundary
│   │
│   ├── services/
│   │   └── recipeService.ts             # All API calls (Axios + Zod validation)
│   │                                    #   getCategories()         → list.php?c=list
│   │                                    #   getRecipes(filters)     → search/filter endpoints
│   │                                    #   getBrowseRecipes(cats)  → parallel filter.php?c= per category
│   │                                    #   getRecipeById(id)       → lookup.php?i=
│   │
│   ├── stores/
│   │   ├── favoritesSlice.ts            # favorites map + favoriteOrder timestamps + persist
│   │   ├── generateAISlice.ts           # AI recipe generation state
│   │   ├── notificationSlice.ts         # Global toast queue
│   │   ├── recipeSlice.ts               # Recipe search, browsing, loading, modal state
│   │   │                                #   searchRecipes() routes to getRecipes or getBrowseRecipes
│   │   │                                #   hasSearched flag for first-run UX
│   │   ├── selectors.ts                 # All typed derived-state selectors (AppState → T)
│   │   ├── useAppStore.ts               # Composed Zustand store (all slices + persist)
│   │   └── useThemeStore.ts             # Theme preference store with localStorage persist
│   │
│   ├── types/
│   │   └── index.ts                     # Domain types — all inferred from Zod via z.infer<>
│   │                                    #   Drink, RecipeDetail, SearchFilters, Category, …
│   │
│   ├── utils/
│   │   ├── recipes-schemas.ts           # Zod schemas for all TheCocktailDB API responses
│   │   └── sortRecipes.ts               # Pure sort functions + option types + SORT_OPTIONS config
│   │                                    #   sortDrinks<T>(drinks, SortOption)
│   │                                    #   sortFavorites<T>(drinks, SortOptionFavorites, FavoriteOrder)
│   │
│   ├── views/
│   │   ├── FavoritesPage.tsx            # Saved cocktails: SortSelector + DrinkCard grid + Modal
│   │   ├── GenerateAI.tsx               # AI ingredient list → generated cocktail recipe
│   │   └── IndexPage.tsx                # Home page:
│   │                                    #   HeroSection (full viewport)
│   │                                    #   ResultsHeader (count + sort)
│   │                                    #   DrinkGrid (local sub-component):
│   │                                    #     - visibleCount + showSkeletons state
│   │                                    #     - scroll listener → loadingRef guard
│   │                                    #     - 20 cards initial, +20 per scroll trigger
│   │                                    #     - gridKey forces remount on data/sort change
│   │                                    #   ScrollToTop button (IntersectionObserver)
│   │                                    #   EmptyState (Browse All Recipes CTA)
│   │
│   ├── index.css                        # Tailwind v4 @theme + single @layer components block
│   │                                    #   CSS variables: brand palette, surface ramps, tokens
│   │                                    #   --grid-bg: neutral bg-base for results section
│   │                                    #   .hero-mesh: blend-mode animated gradient system
│   │                                    #   .hero-bubble-zone: overflow:hidden clip layer
│   │                                    #   .hero-full-height::after: bottom fade to bg-base
│   │                                    #   .scroll-arrow / .scroll-to-top: shared orange circle
│   │                                    #   .btn-brand: always white text
│   │                                    #   prefers-reduced-motion: disables all animations
│   ├── main.tsx                         # Application entry point (React.StrictMode)
│   └── router.tsx                       # BrowserRouter + lazy-loaded route definitions
│
├── tests/
│   ├── accessibility/                   # jest-axe automated WCAG audits per component
│   │   ├── DrinkCard.a11y.test.tsx
│   │   ├── ErrorBoundary.a11y.test.tsx
│   │   ├── FavoritesPage.a11y.test.tsx
│   │   ├── Header.a11y.test.tsx
│   │   ├── IndexPage.a11y.test.tsx
│   │   ├── Modal.a11y.test.tsx
│   │   ├── Navigation.a11y.test.tsx
│   │   ├── Notification.a11y.test.tsx
│   │   └── SkeletonDrinkCard.a11y.test.tsx
│   │
│   ├── e2e/                             # Playwright end-to-end tests (Chromium)
│   │   ├── fixtures/
│   │   │   └── test-fixtures.ts
│   │   ├── pages/                       # Page Object Models
│   │   │   ├── AIGeneratorPage.ts
│   │   │   ├── FavoritesPage.ts
│   │   │   ├── HomePage.ts
│   │   │   └── RecipeModal.ts
│   │   ├── ai-generator.spec.ts
│   │   ├── browse-and-favorite.spec.ts
│   │   ├── navigation.spec.ts
│   │   └── search-flow.spec.ts
│   │
│   ├── integration/                     # Vitest + MSW feature-level flows
│   │   ├── ErrorBoundary.test.tsx
│   │   ├── FavoritesFlow.test.tsx
│   │   ├── FavoritesPage.test.tsx
│   │   ├── GenerateAI.test.tsx
│   │   ├── Header.test.tsx
│   │   ├── IndexPage.test.tsx
│   │   ├── Modal.test.tsx
│   │   └── Notification.test.tsx
│   │
│   ├── mocks/                           # MSW request handlers + factories
│   │   ├── factories.ts
│   │   ├── handlers.ts
│   │   └── server.ts
│   │
│   ├── setup/
│   │   ├── jest-axe-setup.ts            # jest-axe custom matchers
│   │   └── test-setup.ts                # global test setup (cleanup, mocks)
│   │
│   └── unit/                            # Vitest unit tests
│       ├── components/
│       │   ├── DrinkCard.test.tsx
│       │   ├── ErrorBoundary.test.tsx
│       │   ├── Header.test.tsx
│       │   ├── Modal.test.tsx
│       │   ├── Notification.test.tsx
│       │   └── SkeletonDrinkCard.test.tsx
│       ├── layouts/
│       │   └── Layout.test.tsx
│       ├── services/
│       │   └── RecipeService.test.ts
│       ├── stores/
│       │   ├── favoritesSlice.test.ts
│       │   ├── generateAISlice.test.ts
│       │   ├── notificationSlice.test.ts
│       │   ├── recipeSlice.test.ts
│       │   └── selectors.test.ts
│       ├── utils/
│       │   └── recipes-schemas.test.ts
│       └── router.test.tsx
│
├── coverage/                            # Vitest coverage output (gitignored)
├── playwright-report/                   # Playwright HTML report (gitignored)
├── test-results/                        # Playwright test artifacts (gitignored)
│
├── .gitignore
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---

## Key Files Quick Reference

| File | What it does |
|------|-------------|
| `src/stores/recipeSlice.ts` | Routes `searchRecipes()` to `getBrowseRecipes` (empty filters) or `getRecipes` (with filters) |
| `src/services/recipeService.ts` | `getBrowseRecipes` — parallel category fetches, cap 12/category, dedupe, shuffle |
| `src/views/IndexPage.tsx` | `DrinkGrid` sub-component owns pagination; `gridKey` forces remount on data/sort change |
| `src/components/HeroSection.tsx` | `MeshGradient` + `Ticker` + `Bubbles` + `ScrollArrow` composed in a flex-col section |
| `src/utils/sortRecipes.ts` | Pure sort functions — `sortDrinks` and `sortFavorites` — no store dependency |
| `src/stores/selectors.ts` | All `useAppStore` subscriptions go through typed selectors here |
| `src/index.css` | Single `@layer components` block — all custom classes, CSS variables, animations |
