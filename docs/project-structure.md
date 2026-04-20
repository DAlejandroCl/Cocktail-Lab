# 🗂 Project Structure — Cocktail Lab

```
Cocktail-Lab/
├── .github/
│   └── workflows/
│       └── ci.yml                       # CI pipeline: lint → build → test (5 stages)
│
├── api/
│   └── ai/
│       └── generate-recipe.ts           # Vercel Serverless Function
│                                        #   POST /api/ai/generate-recipe
│                                        #   Groq SDK (json_object mode) + Zod validation
│                                        #   TheCocktailDB image lookup by color slug
│                                        #   Retry: 429 backoff + parse error retry
│                                        #   Fallback: buildFallback() with smartMeasure()
│
├── docs/
│   ├── accessibility.md                 # Accessibility standards and audit methodology
│   ├── architecture.md                  # Full architectural breakdown + AI pipeline
│   ├── project-structure.md             # This file
│   ├── testing-strategy-summary.md      # Quick testing reference card
│   └── testing-strategy.md              # Detailed testing strategy per layer
│
├── src/
│   ├── components/
│   │   ├── DrinkCard.tsx                # Polymorphic card:
│   │   │                                #   - fullRecipe prop → openRecipeModal (no fetch)
│   │   │                                #   - ai-* id → openRecipeModal (no fetch)
│   │   │                                #   - standard → selectRecipe(id) (API fetch)
│   │   │                                #   Orange "AI" badge for AI-generated cards
│   │   ├── ErrorBoundary.tsx            # UI crash isolation with accessible fallback
│   │   ├── Header.tsx                   # Sticky navbar: AnimatedNav underline + Logo bounce
│   │   ├── HeroSection.tsx              # Full-height hero with:
│   │   │                                #   MeshGradient — two animated blend-mode blobs
│   │   │                                #   Ticker — 25 cocktail names, 50s scroll cycle
│   │   │                                #   Bubbles — 20 floating orbs (negative delay spawn)
│   │   │                                #   ScrollArrow — smooth-scroll CTA
│   │   │                                #   ::after fade — dissolves into page background
│   │   ├── Modal.tsx                    # Recipe detail overlay (HeadlessUI Dialog)
│   │   │                                #   Detects isAiRecipe (id starts with "ai-")
│   │   │                                #   Detects isAiCreation (id in aiRecipes[])
│   │   │                                #   My Creations: shows trash button (removeAiRecipe)
│   │   │                                #   Favorites: shows heart button (add/remove)
│   │   ├── Notification.tsx             # Global toast with auto-dismiss + hover-pause
│   │   ├── SearchForm.tsx               # Ingredient input + Listbox category + clear button
│   │   ├── SkeletonDrinkCard.tsx        # Animated loading placeholder (mirrors DrinkCard)
│   │   ├── SortSelector.tsx             # Generic pill-group <T extends string> sort selector
│   │   └── ThemeToggle.tsx              # Light / dark mode toggle → useThemeStore
│   │
│   ├── layouts/
│   │   └── Layout.tsx                   # Root shell: Header, Modal, Notification, ErrorBoundary
│   │                                    #   Renders Outlet for route content
│   │
│   ├── services/
│   │   └── recipeService.ts             # All TheCocktailDB API calls (native fetch + Zod)
│   │                                    #   getCategories()         → list.php?c=list
│   │                                    #   getRecipes(filters)     → search/filter endpoints
│   │                                    #   getBrowseRecipes(cats)  → parallel filter.php?c=
│   │                                    #   getRecipeById(id)       → lookup.php?i=
│   │
│   ├── stores/
│   │   ├── favoritesSlice.ts            # favorites: Record<string, RecipeDetail>
│   │   │                                # favoriteOrder: Record<string, number> timestamps
│   │   │                                # Both persisted to localStorage
│   │   ├── generateAISlice.ts           # AI recipe generation state:
│   │   │                                #   aiIngredients[], generatedRecipe, isGenerating
│   │   │                                #   aiRecipes[] (persisted — "My Creations")
│   │   │                                #   generateRecipe() → POST /api/ai/generate-recipe (no prior context)
│   │   │                                #   reCraftRecipe() → same endpoint + previousRecipe context
│   │   │                                #   saveAiRecipe(), removeAiRecipe()
│   │   ├── notificationSlice.ts         # Global toast queue (message, type, auto-dismiss)
│   │   ├── recipeSlice.ts               # Recipe search, browsing, loading, modal state
│   │   │                                #   searchRecipes() → getBrowseRecipes or getRecipes
│   │   │                                #   openRecipeModal(recipe) → no fetch (for AI recipes)
│   │   │                                #   selectRecipe(id) → API fetch + open modal
│   │   │                                #   hasSearched flag for first-run UX
│   │   ├── selectors.ts                 # All typed derived-state selectors (AppState → T)
│   │   │                                #   selectIsFavorite(id) → curried selector (reads !!state.favorites[id])
│   │   │                                #   selectIsAiRecipeSaved(id) → curried selector
│   │   │                                #   selectReCraftRecipe → action ref
│   │   │                                #   selectOpenRecipeModal → action ref
│   │   ├── useAppStore.ts               # Composed Zustand store:
│   │   │                                #   devtools + persist middleware
│   │   │                                #   partialize: favorites, favoriteOrder, aiRecipes
│   │   └── useThemeStore.ts             # Theme preference store with localStorage persist
│   │
│   ├── types/
│   │   └── index.ts                     # Domain types — all inferred from Zod:
│   │                                    #   Drink, RecipeDetail, SearchFilters, Category, …
│   │
│   ├── utils/
│   │   ├── recipes-schemas.ts           # Zod schemas for all TheCocktailDB API responses
│   │   └── sortRecipes.ts               # Pure sort functions + option types + SORT_OPTIONS
│   │                                    #   sortDrinks<T>(drinks, SortOption)
│   │                                    #   sortFavorites<T>(drinks, SortOptionFavorites, order)
│   │
│   ├── views/
│   │   ├── FavoritesPage.tsx            # Two sections:
│   │   │                                #   "My Favorites" — API/AI-favorited DrinkCards
│   │   │                                #   "My Creations" — AiCreationCard (local component)
│   │   │                                #   AiCreationCard: orange AI badge, trash button
│   │   │                                #   All cards open modal via openRecipeModal (no fetch)
│   │   │                                #   Heading hierarchy: h2 (My Favorites) → h3 (cards)
│   │   ├── GenerateAI.tsx               # AI ingredient list → generated cocktail recipe
│   │   │                                #   IngredientTag — removable chip with X button
│   │   │                                #   Autocomplete suggestions (keyboard navigable)
│   │   │                                #   GeneratingLoader — animated phases loader
│   │   │                                #   GeneratedRecipeCard — full recipe display
│   │   │                                #   Save Creation button → saveAiRecipe()
│   │   │                                #   Re-craft button → reCraftRecipe() (passes previousRecipe context)
│   │   └── IndexPage.tsx                # Home page:
│   │                                    #   HeroSection (full viewport)
│   │                                    #   ResultsHeader (count + sort)
│   │                                    #   DrinkGrid (local sub-component):
│   │                                    #     visibleCount + showSkeletons state
│   │                                    #     scroll listener → loadingRef guard
│   │                                    #     20 cards initial, +20 per scroll trigger
│   │                                    #     gridKey forces remount on data/sort change
│   │                                    #   ScrollToTop button (IntersectionObserver)
│   │                                    #   EmptyState (Browse All Recipes CTA)
│   │
│   ├── index.css                        # Tailwind v4 @theme + single @layer components block
│   │                                    #   CSS variables: brand palette, surface ramps, tokens
│   │                                    #   .hero-mesh: blend-mode animated gradient system
│   │                                    #   .hero-bubble-zone: overflow:hidden clip layer
│   │                                    #   .hero-full-height::after: bottom fade
│   │                                    #   .btn-brand: always white text
│   │                                    #   .ingredient-tag: orange pill (SearchForm + AI)
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
│   ├── e2e/                             # Playwright end-to-end tests (5 browsers)
│   │   ├── fixtures/
│   │   │   └── test-fixtures.ts         # Custom fixtures: AIGeneratorPage, FavoritesPage, etc.
│   │   ├── pages/                       # Page Object Models
│   │   │   ├── AIGeneratorPage.ts       # saveCreationButton, reCraftButton, locators
│   │   │   ├── FavoritesPage.ts         # drinkCards: matches both drink-title- and creation-title-
│   │   │   ├── HomePage.ts
│   │   │   └── RecipeModal.ts
│   │   ├── ai-generator.spec.ts         # AI Generator full flow: ingredient list → generate → save
│   │   ├── browse-and-favorite.spec.ts  # Browse, search, open modal, add/remove favorites
│   │   ├── navigation.spec.ts           # Routing, aria-current, keyboard navigation
│   │   └── search-flow.spec.ts          # Search by ingredient, category, modal interactions
│   │
│   ├── integration/                     # Vitest + MSW feature-level flows
│   │   ├── ErrorBoundary.test.tsx
│   │   ├── FavoritesFlow.test.tsx
│   │   ├── FavoritesPage.test.tsx
│   │   ├── GenerateAI.test.tsx          # Full generation flow: add ingredients → generate → save
│   │   ├── Header.test.tsx
│   │   ├── IndexPage.test.tsx
│   │   ├── Modal.test.tsx
│   │   └── Notification.test.tsx
│   │
│   ├── mocks/
│   │   ├── factories.ts                 # makeDrink, makeRecipeDetail, makeGeneratedRecipe
│   │   ├── handlers.ts                  # MSW request handlers + DEFAULT_AI_RECIPE_RESPONSE
│   │   └── server.ts                    # MSW server (setup/teardown in test-setup.ts)
│   │
│   ├── setup/
│   │   ├── jest-axe-setup.ts            # jest-axe custom matchers (toHaveNoViolations)
│   │   └── test-setup.ts                # global setup: cleanup, MSW reset, store reset
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
│       │   ├── generateAISlice.test.ts  # Tests user-friendly error messages
│       │   ├── notificationSlice.test.ts
│       │   ├── recipeSlice.test.ts
│       │   ├── selectors.test.ts        # mockState satisfies AppState (full type check)
│       │   └── useThemeStore.test.ts
│       ├── utils/
│       │   ├── recipes-schemas.test.ts
│       │   └── sortRecipes.test.ts
│       └── router.test.tsx
│
├── coverage/                            # Vitest coverage output (gitignored)
├── playwright-report/                   # Playwright HTML report (gitignored)
├── test-results/                        # Playwright test artifacts (gitignored)
│
├── .env.example                         # Template: GROQ_API_KEY (no Gemini/OpenAI needed)
├── .gitignore
├── .github/workflows/ci.yml
├── package.json
├── playwright.config.ts                 # 5 browsers, retries: 1 on CI, timeout: 30s
├── run-tests.mjs                        # Orchestrator: runs all 5 stages, prints summary table
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vercel.json                          # SPA rewrite rule + maxDuration for AI function
├── vite.config.ts
└── vitest.config.ts
```

---

## Key Files Quick Reference

| File | What it does |
|------|-------------|
| `api/ai/generate-recipe.ts` | Groq SDK + Zod: generates recipe from ingredients. Uses `json_object` mode (not `json_schema`) |
| `src/stores/recipeSlice.ts` | `openRecipeModal(recipe)` for AI recipes (no fetch), `selectRecipe(id)` for API recipes |
| `src/stores/generateAISlice.ts` | `generateRecipe()` → API → `mapToGeneratedRecipe()` → `strIngredient1..N` mapping |
| `src/stores/selectors.ts` | All `useAppStore` subscriptions — curried selectors for `selectIsFavorite` and `selectIsAiRecipeSaved`; includes `selectReCraftRecipe` |
| `src/components/DrinkCard.tsx` | Polymorphic: `fullRecipe` prop → local modal; otherwise → API fetch modal |
| `src/components/Modal.tsx` | Detects `isAiCreation` to show trash instead of heart button |
| `src/views/FavoritesPage.tsx` | Two sections: My Favorites (`drink-title-*`) + My Creations (`creation-title-*`) |
| `src/services/recipeService.ts` | `getBrowseRecipes` — parallel fetches, cap 12/category, dedupe, shuffle |
| `src/views/IndexPage.tsx` | `DrinkGrid` sub-component owns pagination; `gridKey` forces remount on data/sort change |
| `src/utils/sortRecipes.ts` | Pure sort functions — no store dependency, trivially testable |
| `src/index.css` | Single `@layer components` block — all custom classes, CSS variables, animations |
| `tests/e2e/pages/FavoritesPage.ts` | `drinkCards` locator matches both `drink-title-*` and `creation-title-*` articles |
| `vercel.json` | SPA rewrite: `/(.*) → /index.html`; AI function `maxDuration: 10` |
