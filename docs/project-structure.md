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
│   │   ├── DrinkCard.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Header.tsx
│   │   ├── Modal.tsx
│   │   ├── Notification.tsx
│   │   └── SkeletonDrinkCard.tsx
│   │
│   ├── layouts/
│   │   └── Layout.tsx
│   │
│   ├── services/
│   │   └── RecipeService.ts
│   │
│   ├── stores/
│   │   ├── favoritesSlice.ts
│   │   ├── notificationSlice.ts
│   │   ├── recipeSlice.ts
│   │   ├── selectors.ts
│   │   └── useAppStore.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   └── recipes-schemas.ts
│   │
│   ├── views/
│   │   ├── FavoritesPage.tsx
│   │   └── IndexPage.tsx
│   │
│   ├── index.css
│   ├── main.tsx
│   └── router.tsx
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
│   │   ├── browse-and-favorite.spec.ts
│   │   ├── navigation.spec.ts
│   │   └── search-flow.spec.ts
│   │
│   ├── integration/
│   │   ├── FavoritesFlow.test.tsx
│   │   ├── FavoritesPage.test.tsx
│   │   └── IndexPage.test.tsx
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
│       │   └── layout.test.ts
│       │
│       ├── services/
│       │   └── RecipeService.test.ts
│       │
│       ├── stores/
│       │   ├── favoritesSlice.test.ts
│       │   ├── notificationSlice.test.ts
│       │   ├── recipeSlice.test.ts
│       │   └── selectors.test.tsx
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
└── vitest.config.ts
```