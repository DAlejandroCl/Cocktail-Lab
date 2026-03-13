## 🗂 Project Structure
```
Cocktail-Lab/
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docs/
│   ├── accessibility.md
│   ├── architecture.md
│   ├── project-structure.md
│   ├── testing-strategy-summary.md
│   └── testing-strategy.md
│
├── src/
│   ├── components/
│   │   ├── DrinkCard.tsx          # Drink card with image, category badge, favorites toggle
│   │   ├── ErrorBoundary.tsx      # UI crash isolation with accessible fallback
│   │   ├── Header.tsx             # Sticky navbar with AnimatedNav underline and Logo
│   │   ├── HeroSection.tsx        # Full-height hero with SearchForm and scroll arrow
│   │   ├── Modal.tsx              # Recipe detail overlay (ingredients + instructions)
│   │   ├── Notification.tsx       # Global toast with auto-dismiss
│   │   ├── SearchForm.tsx         # Search by ingredient + category dropdown + clear button
│   │   ├── SkeletonDrinkCard.tsx  # Loading placeholder for the drink grid
│   │   ├── SortSelector.tsx       # Generic pill-group sort selector
│   │   └── ThemeToggle.tsx        # Light / dark mode toggle
│   │
│   ├── layouts/
│   │   └── Layout.tsx             # Root shell: Header, Modal, Notification, ErrorBoundary
│   │
│   ├── services/
│   │   └── recipeService.ts       # Axios HTTP client + Zod-validated API calls
│   │
│   ├── stores/
│   │   ├── favoritesSlice.ts      # Favorites map + favoriteOrder timestamps + persistence
│   │   ├── generateAISlice.ts     # AI recipe generation state
│   │   ├── notificationSlice.ts   # Global toast queue
│   │   ├── recipeSlice.ts         # Recipe browsing, search, loading, modal state
│   │   ├── selectors.ts           # Typed derived-state selectors
│   │   ├── useAppStore.ts         # Composed Zustand store (all slices merged)
│   │   └── useThemeStore.ts       # Theme preference store (light/dark)
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript domain types (inferred from Zod schemas)
│   │
│   ├── utils/
│   │   ├── recipes-schemas.ts     # Zod schemas for all API responses
│   │   └── sortRecipes.ts         # Pure sort functions + SortOption / SortOptionFavorites types
│   │
│   ├── views/
│   │   ├── FavoritesPage.tsx      # Saved cocktails with sort selector
│   │   ├── GenerateAI.tsx         # AI-powered cocktail generator
│   │   └── IndexPage.tsx          # Home: HeroSection + results grid + sort + scroll-to-top
│   │
│   ├── index.css                  # Global styles (Tailwind v4 @theme + @layer components)
│   ├── main.tsx                   # Application entry point
│   └── router.tsx                 # BrowserRouter + lazy-loaded route definitions
│
├── tests/
│   ├── accessibility/
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
│   ├── e2e/
│   │   ├── fixtures/
│   │   │   └── test-fixtures.ts
│   │   ├── pages/
│   │   │   ├── AIGeneratorPage.ts
│   │   │   ├── FavoritesPage.ts
│   │   │   ├── HomePage.ts
│   │   │   └── RecipeModal.ts
│   │   ├── ai-generator.spec.ts
│   │   ├── browse-and-favorite.spec.ts
│   │   ├── navigation.spec.ts
│   │   └── search-flow.spec.ts
│   │
│   ├── integration/
│   │   ├── ErrorBoundary.test.tsx
│   │   ├── FavoritesFlow.test.tsx
│   │   ├── FavoritesPage.test.tsx
│   │   ├── GenerateAI.test.tsx
│   │   ├── Header.test.tsx
│   │   ├── IndexPage.test.tsx
│   │   ├── Modal.test.tsx
│   │   └── Notification.test.tsx
│   │
│   ├── mocks/
│   │   ├── factories.ts
│   │   ├── handlers.ts
│   │   └── server.ts
│   │
│   ├── setup/
│   │   ├── jest-axe-setup.ts
│   │   └── test-setup.ts
│   │
│   └── unit/
│       ├── components/
│       │   ├── DrinkCard.test.tsx
│       │   ├── ErrorBoundary.test.tsx
│       │   ├── Header.test.tsx
│       │   ├── Modal.test.tsx
│       │   ├── Notification.test.tsx
│       │   └── SkeletonDrinkCard.test.tsx
│       │
│       ├── layouts/
│       │   └── Layout.test.tsx
│       │
│       ├── services/
│       │   └── RecipeService.test.ts
│       │
│       ├── stores/
│       │   ├── favoritesSlice.test.ts
│       │   ├── generateAISlice.test.ts
│       │   ├── notificationSlice.test.ts
│       │   ├── recipeSlice.test.ts
│       │   └── selectors.test.ts
│       │
│       ├── utils/
│       │   └── recipes-schemas.test.ts
│       │
│       └── router.test.tsx
│
├── coverage/
├── playwright-report/
├── test-results/
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
