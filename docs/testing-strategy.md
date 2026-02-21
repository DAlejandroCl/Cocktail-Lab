# 🧪 COCKTAIL LAB - ESTRATEGIA COMPLETA DE TESTING

> **Documentación Profesional de Testing**  
> Autor: DevACL | Proyecto: Cocktail Lab  
> Stack: React 19 + TypeScript + Vite + Zustand + Tailwind  

---

## 📚 TABLA DE CONTENIDOS

### PARTE 1: FUNDAMENTOS
1. [Testing Philosophy](#testing-philosophy)
2. [Coverage Strategy](#coverage-strategy)
3. [Mocking Strategy](#mocking-strategy)
4. [Accessibility Testing](#accessibility-testing)
5. [Continuous Integration](#continuous-integration)

### PARTE 2: IMPLEMENTACIÓN
6. [Librerías de Testing](#librerías-de-testing)
7. [Configuración Inicial](#configuración-inicial)
8. [Estrategia por Fases](#estrategia-por-fases)
9. [Ejemplos Prácticos](#ejemplos-prácticos)
10. [CI/CD Pipeline](#cicd-pipeline)

---

# PARTE 1: FUNDAMENTOS

## 🎯 TESTING PHILOSOPHY

### **Principios Fundamentales**

> "The more your tests resemble the way your software is used, the more confidence they can give you." - Kent C. Dodds

#### **1. Test Behavior, Not Implementation** 🎭

**❌ ANTIPATTERN:**
```typescript
// Testing implementation details (FRÁGIL)
test('should update state correctly', () => {
  const { result } = renderHook(() => useAppStore())
  expect(result.current.drinks).toEqual([])
  expect(result.current._internalCache).toBeDefined() // ❌
})
```

**✅ PATTERN:**
```typescript
// Testing user-visible behavior (ROBUSTO)
test('should display drinks after search', async () => {
  render(<IndexPage />)
  await userEvent.selectOptions(
    screen.getByLabelText(/category/i), 
    'Cocktail'
  )
  await waitFor(() => {
    expect(screen.getByText('Margarita')).toBeInTheDocument()
  })
})
```

**¿Por qué?**
- Implementation changes frequently
- Behavior tests survive refactors
- Tests document what users care about
- Zustand → Redux? Tests still pass ✅

---

#### **2. Prefer Accessibility-First Queries** ♿

**Query Priority (Best → Worst):**

```typescript
// 🥇 GOLD - Accessible to everyone
getByRole('button', { name: /submit/i })
getByLabelText('Email address')
getByPlaceholderText('Enter email')
getByText('Welcome back')

// 🥈 SILVER - Semantic
getByAltText('Profile picture')
getByTitle('Close dialog')

// 🥉 BRONZE - Last resort only
getByTestId('submit-btn') // Solo si no hay otra opción
```

**Cocktail Lab Examples:**

```typescript
// ❌ BAD
const btn = screen.getByTestId('favorite-btn')

// ✅ GOOD
const btn = screen.getByRole('button', {
  name: /add margarita to favorites/i
})

// ✅ BEST - Enforces accessibility
const btn = screen.getByLabelText(/add to favorites/i)
```

**Why?**
- By-role queries enforce ARIA best practices
- If test fails, likely an a11y issue exists
- Screen reader users rely on roles
- test-id adds no user value

---

#### **3. Avoid Testing Internal State** 🚫

**❌ ANTIPATTERN:**
```typescript
test('should set loading to true', () => {
  const { result } = renderHook(() => useDrinks())
  act(() => result.current.fetchDrinks())
  expect(result.current.loading).toBe(true) // ❌ Internal
})
```

**✅ PATTERN:**
```typescript
test('should show spinner while fetching', async () => {
  render(<DrinkList />)
  await userEvent.click(screen.getByRole('button', { name: /search/i }))
  
  expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
  
  await waitFor(() => {
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
```

**Why?**
- Users don't see internal state
- They see loading spinners, error messages
- Internal state = fragile tests
- Change state structure? Tests break ❌

---

#### **4. Write Tests That Give Confidence** 💪

**HIGH Value Tests (Write these):**
```typescript
✅ User can add/remove favorites
✅ Modal closes on Escape key
✅ Search by ingredient works
✅ Data persists after reload
✅ Error shown when API fails
✅ Loading state appears during fetch
```

**LOW Value Tests (Avoid these):**
```typescript
❌ Component renders without error
❌ Props passed correctly
❌ Function called with correct args
❌ Initial state is expected
❌ CSS classes applied
```

**Why?**
- Tests should fail when important things break
- Not when implementation details change
- 100% coverage ≠ 0% bugs
- Better 80% of critical things than 100% of trivial

---

#### **5. Test Like a User** 👤

**User Flow:**
```
See → Interact → Verify Result
```

**Example:**
```typescript
test('user can save favorite drink', async () => {
  const user = userEvent.setup()
  render(<DrinkCard drink={mockDrink} />)
  
  // 1. User SEES drink name
  expect(screen.getByText('Margarita')).toBeInTheDocument()
  
  // 2. User CLICKS heart icon
  await user.click(screen.getByLabelText(/add to favorites/i))
  
  // 3. User SEES confirmation
  expect(screen.getByLabelText(/remove from favorites/i))
    .toBeInTheDocument()
})
```

---

#### **6. Make Tests Maintainable** 🛠️

**Use Test Helpers:**
```typescript
// ✅ DRY with factories
const renderDrinkCard = (props = {}) => {
  const defaults = { drink: createMockDrink(), ...props }
  return render(<DrinkCard {...defaults} />)
}

// ✅ Reusable queries
const getDrinkCard = () => screen.getByRole('article')
const getFavoriteBtn = () => screen.getByLabelText(/favorite/i)

// ✅ Descriptive assertions
const expectDrinkVisible = (name) => {
  expect(screen.getByText(name)).toBeInTheDocument()
}
```

---

#### **7. Balance Speed vs Confidence** ⚖️

**Testing Pyramid:**
```
       /\
      /E2E\      ← 10% Slow, high confidence
     /------\
    /Integration\ ← 20% Medium speed
   /------------\
  /  Unit Tests  \ ← 70% Fast, focused
 /________________\
```

**For Cocktail Lab:**
- **70% Unit** - Utils, schemas, stores, services
- **20% Integration** - Components + stores, pages
- **10% E2E** - Critical paths only

**Why?**
- Unit tests < 1ms each ⚡
- E2E tests 2-5 seconds each 🐌
- Want fast feedback during development
- E2E for critical paths, unit for details

---

### 📋 Testing Checklist

Before writing a test, ask:

- [ ] Am I testing behavior or implementation?
- [ ] Did I use accessible queries (role, label, text)?
- [ ] Will this test fail if the feature breaks?
- [ ] Will this test pass if I refactor?
- [ ] Would a real user notice this bug?
- [ ] Is this test worth maintaining?

**If "no" to 2+, reconsider the test.**

---


## 📊 COVERAGE STRATEGY

### **Philosophy: Coverage ≠ Quality**

> "100% coverage doesn't mean 0% bugs. It means 100% of code was executed, not tested well."

**Coverage Measures:**
- ✅ Lines of code executed
- ❌ NOT if you test edge cases
- ❌ NOT if assertions are meaningful
- ❌ NOT if you only test happy paths

---

### **Coverage Targets by Code Type**

#### **TIER 1 - CRITICAL (95-100% coverage mandatory)**

```
┌────────────────────┬─────────┬──────────────────────┐
│ Type               │ Target  │ Why                  │
├────────────────────┼─────────┼──────────────────────┤
│ Pure utils         │ 100%    │ No side effects,     │
│                    │         │ easy to test all     │
├────────────────────┼─────────┼──────────────────────┤
│ Zod schemas        │ 100%    │ Validate external    │
│                    │         │ API, prevent crashes │
├────────────────────┼─────────┼──────────────────────┤
│ Custom hooks       │ 95%     │ Reusable logic       │
│                    │         │ used everywhere      │
├────────────────────┼─────────┼──────────────────────┤
│ Service layer      │ 90%     │ Entry point for      │
│ (RecipeService)    │         │ all data             │
├────────────────────┼─────────┼──────────────────────┤
│ Store slices       │ 95%     │ App brain, bugs      │
│ (Zustand)          │         │ affect entire UI     │
└────────────────────┴─────────┴──────────────────────┘
```

**Example:**
```typescript
// recipes-schemas.ts → 100% coverage
describe('RecipeSchema', () => {
  it('validates complete recipe')
  it('validates recipe with null ingredients')
  it('validates missing measurements')
  it('rejects invalid types')
  it('rejects missing required fields')
  it('handles strIngredient1-15')
  it('handles strMeasure1-15')
  // ALL cases covered
})
```

---

#### **TIER 2 - IMPORTANT (80-90% expected)**

```
┌────────────────────┬─────────┬──────────────────────┐
│ Type               │ Target  │ Why                  │
├────────────────────┼─────────┼──────────────────────┤
│ Critical           │ 85%     │ Main user UI         │
│ components         │         │                      │
├────────────────────┼─────────┼──────────────────────┤
│ Pages/Views        │ 80%     │ Component            │
│                    │         │ orchestration        │
└────────────────────┴─────────┴──────────────────────┘
```

**What NOT to test:**
```typescript
// ❌ DON'T test
- CSS classes (className='bg-blue-500')
- Props drilling
- Animation details
- Internal hook implementation

// ✅ DO test
- User behavior (click, type)
- Visible states (loading, error, success)
- Accessibility (aria-labels, keyboard nav)
- Store integration
- Edge cases (empty data, errors)
```

---

#### **TIER 3 - PRESENTATIONAL (60-75% acceptable)**

```
┌────────────────────┬─────────┬──────────────────────┐
│ Type               │ Target  │ Why                  │
├────────────────────┼─────────┼──────────────────────┤
│ Simple UI          │ 60-75%  │ Mostly               │
│ components         │         │ presentational       │
├────────────────────┼─────────┼──────────────────────┤
│ Skeleton loaders   │ 50%     │ Just verify          │
│                    │         │ they render          │
└────────────────────┴─────────┴──────────────────────┘
```

**Professional Take:**
> "Don't obsess over 100% coverage on trivial UI. Time better spent on integration tests."

---

### **Mandatory Test Coverage Areas**

#### **MUST HAVE - Non-negotiable:**

```typescript
✅ 1. External data validation (Zod schemas)
    → recipes-schemas.ts: 100%
    → Prevents crashes from API changes

✅ 2. Service layer (RecipeService.ts)
    → 90%+
    → All error handling
    → Rate limiting
    → Malformed responses

✅ 3. State management (Zustand slices)
    → 95%+
    → favoritesSlice: localStorage persistence
    → recipeSlice: API calls + errors
    → notificationSlice: show/hide logic

✅ 4. Critical User Paths (E2E)
    → Add/remove favorites
    → Search by category/ingredient
    → Modal open/close
    → Page navigation
```

---

### **Coverage Configuration**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'src/mocks/**',
        'src/types/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.d.ts',
        'src/router.tsx'
      ],
      
      // Global thresholds
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      
      // Per-file thresholds
      perFile: true,
      
      // Critical files = strict thresholds
      thresholds: {
        '**/*.schema.ts': {
          lines: 100,
          functions: 100,
          branches: 100
        },
        'src/services/**/*.ts': {
          lines: 90,
          functions: 90,
          branches: 85
        },
        'src/stores/**/*.ts': {
          lines: 95,
          functions: 95,
          branches: 90
        },
        'src/components/**/*.tsx': {
          lines: 75,
          functions: 75,
          branches: 70
        }
      }
    }
  }
})
```

---

### **Metrics That Matter MORE Than Coverage**

```
1. Mutation Testing Score
   → Do tests detect introduced bugs?
   → Use Stryker to verify

2. Test Execution Time
   → Do tests run in < 5 seconds?
   → Fast feedback loop

3. Test Flakiness Rate
   → 0% intermittent failures?
   → Deterministic tests

4. Bug Escape Rate
   → How many bugs reach production?
   → Tests fail before deploy

5. Refactor Safety
   → Can you refactor fearlessly?
   → Tests survive internal changes
```

---


## 🎭 MOCKING STRATEGY

### **Philosophy**

> "Mock as little as possible, but as much as necessary."

**Core Principle:**
- ❌ Don't mock everything "just in case"
- ✅ Mock only what you don't control (external APIs, timers, randomness)
- ✅ Use real implementations whenever possible

---

### **Multi-Layer Strategy**

```
┌──────────────────────────────────────────┐
│         TESTING LAYERS                   │
├──────────────────────────────────────────┤
│                                          │
│ Unit Tests      → NO mocks (pure)       │
│ Component       → Mock stores + hooks   │
│ Integration     → Mock API with MSW     │
│ E2E Tests       → Mock external only    │
│                                          │
└──────────────────────────────────────────┘
```

---

### **LAYER 1: Unit Tests - NO MOCKING**

**Pure functions need no mocks:**

```typescript
// ✅ NO MOCKS - Direct test
import { RecipeSchema } from '../utils/recipes-schemas'

test('validates valid recipe', () => {
  const valid = {
    idDrink: '1',
    strDrink: 'Margarita',
    // ... more fields
  }
  
  const result = RecipeSchema.safeParse(valid)
  expect(result.success).toBe(true)
})
```

**Why NO mocks?**
- Pure functions (input → output)
- No side effects
- Ultra-fast tests
- More confidence in real code

---

### **LAYER 2: Component Tests - MOCK STORES**

**Mock global state only:**

```typescript
import { vi } from 'vitest'
import { useAppStore } from '@/stores/useAppStore'

vi.mock('@/stores/useAppStore')

test('calls addFavorite when clicked', async () => {
  const mockAdd = vi.fn()
  
  vi.mocked(useAppStore).mockImplementation((selector) => {
    const store = {
      addFavorite: mockAdd,
      isFavorite: () => false,
      selectRecipe: vi.fn(),
      removeFavorite: vi.fn()
    }
    return selector ? selector(store) : store
  })
  
  const user = userEvent.setup()
  render(<DrinkCard drink={mockDrink} />)
  
  await user.click(screen.getByLabelText(/add to favorites/i))
  
  expect(mockAdd).toHaveBeenCalledWith(mockDrink)
})
```

**What to mock:**
- ✅ Zustand stores
- ✅ React Router hooks
- ❌ NOT component logic
- ❌ NOT child components

---

### **LAYER 3: Integration Tests - MSW** ⭐

**Why MSW > fetch mocks:**

```typescript
// ❌ ANTIPATTERN
vi.mock('axios', () => ({
  get: vi.fn(() => Promise.resolve({ data: mock }))
}))
// Problems:
// - Coupled to implementation
// - axios → fetch? Breaks
// - Doesn't test real requests
// - Can't test network errors realistically
```

```typescript
// ✅ PATTERN - MSW intercepts at network level
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('*/filter.php', () => {
    return HttpResponse.json({
      drinks: [mockDrink1, mockDrink2]
    })
  })
)

// Advantages:
// ✅ Works with axios, fetch, ANY HTTP client
// ✅ Intercepts at service worker level
// ✅ Same code for tests AND development
// ✅ Easy to simulate network errors
```

---

### **MSW Setup for Cocktail Lab**

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw'

const BASE = 'https://www.thecocktaildb.com/api/json/v1/1'

export const handlers = [
  // Happy path
  http.get(`${BASE}/filter.php`, ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('c')
    
    if (category === 'Cocktail') {
      return HttpResponse.json({
        drinks: [
          { idDrink: '1', strDrink: 'Margarita', strDrinkThumb: 'url' }
        ]
      })
    }
    return HttpResponse.json({ drinks: null })
  })
]

// Error handlers
export const errorHandlers = {
  serverError: http.get(`${BASE}/*`, () =>
    HttpResponse.json({ error: 'Server Error' }, { status: 500 })
  ),
  
  rateLimit: http.get(`${BASE}/*`, () =>
    HttpResponse.json({ error: 'Too Many Requests' }, { status: 429 })
  ),
  
  timeout: http.get(`${BASE}/*`, async () => {
    await delay('infinite')
  }),
  
  malformed: http.get(`${BASE}/*`, () =>
    new HttpResponse('Not JSON', {
      headers: { 'Content-Type': 'application/json' }
    })
  )
}
```

**Usage in tests:**

```typescript
import { server } from '@/mocks/server'
import { errorHandlers } from '@/mocks/handlers'

test('handles 500 error', async () => {
  server.use(errorHandlers.serverError)
  
  await expect(
    RecipeService.getRecipes({ category: 'Cocktail' })
  ).rejects.toThrow()
})
```

---

### **LAYER 4: E2E Tests - MINIMAL MOCKING**

**As close to production as possible:**

```typescript
// e2e/favorites.spec.ts
test('persists favorites across sessions', async ({ page, context }) => {
  // ✅ NO mock API in E2E (use real or staging)
  // ✅ Only mock auth or 3rd party if needed
  
  await page.goto('/')
  await page.selectOption('select[name="category"]', 'Cocktail')
  await page.click('article:first-child button[aria-label*="Add"]')
  
  // Verify localStorage (real browser feature)
  const storage = await context.storageState()
  const favs = storage.origins[0]?.localStorage?.find(
    item => item.name === 'cocktail-lab-favorites'
  )
  
  expect(favs).toBeDefined()
})
```

**When to mock in E2E:**
- ✅ Third-party APIs (Stripe, Auth0)
- ✅ Email services
- ❌ NOT your own API
- ❌ NOT localStorage, sessionStorage

---

### **Mock Factories**

```typescript
// src/test/factories.ts
import { faker } from '@faker-js/faker'

export const createMockDrink = (overrides = {}) => ({
  idDrink: faker.string.uuid(),
  strDrink: faker.commerce.productName(),
  strDrinkThumb: faker.image.url(),
  strCategory: faker.helpers.arrayElement(['Cocktail', 'Shot']),
  ...overrides
})

// Usage
const drink = createMockDrink({ strDrink: 'Custom Name' })
const drinks = Array.from({ length: 10 }, () => createMockDrink())
```

---

### **Mocking Summary**

```
┌─────────────┬──────────────┬─────────────┐
│ Test Type   │ What to Mock │ How         │
├─────────────┼──────────────┼─────────────┤
│ Unit        │ Nothing      │ -           │
│ Component   │ Stores       │ vi.mock()   │
│ Integration │ API          │ MSW         │
│ E2E         │ External     │ Playwright  │
└─────────────┴──────────────┴─────────────┘
```

---


## ♿ ACCESSIBILITY TESTING

### **Why Accessibility Testing Matters**

> "Accessibility is not a feature, it's a fundamental requirement."

**Statistics:**
- 15% of world population has some form of disability
- 98% of websites fail WCAG 2.0 compliance
- Lawsuits for inaccessible sites increasing 20% yearly
- Good a11y = better UX for everyone

---

### **WCAG 2.1 Level AA Compliance**

**Our Target for Cocktail Lab:**
- ✅ **Level A** - Must have (basic accessibility)
- ✅ **Level AA** - Should have (recommended)
- ⭐ **Level AAA** - Nice to have (enhanced)

---

### **Testing Keyboard Navigation** ⌨️

**All interactive elements must be keyboard accessible:**

```typescript
// src/components/__tests__/DrinkCard.a11y.test.tsx
describe('DrinkCard - Keyboard Navigation', () => {
  test('can navigate with Tab key', async () => {
    const user = userEvent.setup()
    render(<DrinkCard drink={mockDrink} />)
    
    // Tab to "View Recipe" button
    await user.tab()
    expect(screen.getByRole('button', { name: /view recipe/i }))
      .toHaveFocus()
    
    // Tab to favorite button
    await user.tab()
    expect(screen.getByRole('button', { name: /favorite/i }))
      .toHaveFocus()
    
    // Shift+Tab goes back
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: /view recipe/i }))
      .toHaveFocus()
  })
  
  test('can activate with Enter key', async () => {
    const user = userEvent.setup()
    const mockSelect = vi.fn()
    
    render(<DrinkCard drink={mockDrink} onSelect={mockSelect} />)
    
    await user.tab()
    await user.keyboard('{Enter}')
    
    expect(mockSelect).toHaveBeenCalled()
  })
  
  test('can activate with Space key', async () => {
    const user = userEvent.setup()
    render(<DrinkCard drink={mockDrink} />)
    
    await user.tab() // Focus first button
    await user.keyboard(' ') // Space
    
    // Should trigger button action
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})
```

---

### **Testing Focus Management** 🎯

**Modal/Dialog Focus Trapping:**

```typescript
describe('Modal - Focus Management', () => {
  test('traps focus inside modal', async () => {
    const user = userEvent.setup()
    render(<Modal />)
    
    const closeBtn = screen.getByRole('button', { name: /close/i })
    const favoriteBtn = screen.getByRole('button', { name: /favorite/i })
    
    // Focus should be on modal initially
    expect(closeBtn).toHaveFocus()
    
    // Tab should cycle within modal
    await user.tab()
    expect(favoriteBtn).toHaveFocus()
    
    await user.tab()
    expect(closeBtn).toHaveFocus() // Back to start
    
    // Shouldn't escape modal
    const outsideElement = document.querySelector('header')
    expect(outsideElement).not.toHaveFocus()
  })
  
  test('returns focus to trigger when closed', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button id="trigger">Open Modal</button>
        <Modal />
      </>
    )
    
    const trigger = screen.getByText('Open Modal')
    await user.click(trigger)
    
    // Modal opens
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Close modal
    await user.keyboard('{Escape}')
    
    // Focus returns to trigger
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })
  
  test('focuses first focusable element on open', async () => {
    render(<Modal />)
    
    // Should auto-focus close button
    expect(screen.getByRole('button', { name: /close/i }))
      .toHaveFocus()
  })
})
```

---

### **Testing ARIA Live Regions** 📢

**For dynamic content updates:**

```typescript
describe('Notification - ARIA Live', () => {
  test('announces notification to screen readers', async () => {
    render(<App />)
    
    // Trigger notification
    await userEvent.click(screen.getByRole('button', { name: /add/i }))
    
    // Verify aria-live region
    const liveRegion = screen.getByRole('status')
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    expect(liveRegion).toHaveTextContent(/added to favorites/i)
  })
  
  test('uses assertive for errors', async () => {
    server.use(errorHandlers.serverError)
    render(<IndexPage />)
    
    await userEvent.selectOptions(
      screen.getByLabelText(/category/i),
      'Cocktail'
    )
    
    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
      expect(alert).toHaveTextContent(/error/i)
    })
  })
})
```

---

### **Automated Accessibility Testing with Axe**

```typescript
// src/test/a11y-helpers.ts
import { configureAxe } from 'jest-axe'

export const axe = configureAxe({
  rules: {
    // Enable all WCAG 2.1 Level AA rules
    'color-contrast': { enabled: true },
    'valid-aria-role': { enabled: true },
    'aria-required-attr': { enabled: true },
    'button-name': { enabled: true },
    'link-name': { enabled: true }
  }
})

// Usage in tests
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

describe('DrinkCard - Accessibility', () => {
  test('has no a11y violations', async () => {
    const { container } = render(<DrinkCard drink={mockDrink} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

---

### **Testing Screen Reader Announcements**

```typescript
describe('Screen Reader Support', () => {
  test('announces page changes', async () => {
    render(<App />)
    
    // Navigate to favorites
    await userEvent.click(screen.getByRole('link', { name: /favorites/i }))
    
    // Verify live region announces page
    const liveRegion = screen.getByRole('status', { hidden: true })
    expect(liveRegion).toHaveTextContent(/favorites page/i)
  })
  
  test('announces search results count', async () => {
    render(<IndexPage />)
    
    await userEvent.selectOptions(
      screen.getByLabelText(/category/i),
      'Cocktail'
    )
    
    await waitFor(() => {
      const status = screen.getByRole('status')
      expect(status).toHaveTextContent(/2 results found/i)
    })
  })
})
```

---

### **Color Contrast Testing** 🎨

**Manual Testing (Document in README):**

```markdown
## Accessibility Checklist

### Color Contrast (WCAG AA)
- [ ] Text < 18pt: 4.5:1 ratio minimum
- [ ] Text ≥ 18pt: 3:1 ratio minimum
- [ ] Interactive elements: 3:1 ratio minimum

### Tested Combinations:
✅ Primary button (#F97316) on white (#FFFFFF) = 3.1:1 ✓
✅ Body text (#1F2937) on white (#FFFFFF) = 14.4:1 ✓
✅ Link blue (#3B82F6) on white (#FFFFFF) = 4.6:1 ✓
```

**Automated with Playwright:**

```typescript
// e2e/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('should not have WCAG 2.1 Level AA violations', async ({ page }) => {
  await page.goto('/')
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  
  expect(results.violations).toEqual([])
})

test('verifies color contrast', async ({ page }) => {
  await page.goto('/')
  
  const results = await new AxeBuilder({ page })
    .withTags(['cat.color'])
    .analyze()
  
  expect(results.violations).toEqual([])
})
```

---

### **Accessibility Testing Checklist**

```typescript
// Before merging PR, verify:

✅ KEYBOARD NAVIGATION
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/dropdowns

✅ FOCUS MANAGEMENT
- [ ] Visible focus indicators (outline/ring)
- [ ] Focus trapped in modals
- [ ] Focus returns to trigger after close
- [ ] Skip links for main content

✅ SCREEN READERS
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have accessible names
- [ ] Landmarks (nav, main, aside)
- [ ] ARIA roles where semantic HTML can't

✅ ARIA ATTRIBUTES
- [ ] aria-label for icon-only buttons
- [ ] aria-live for dynamic content
- [ ] aria-pressed for toggle buttons
- [ ] aria-expanded for dropdowns
- [ ] aria-hidden for decorative icons

✅ COLOR & CONTRAST
- [ ] Text meets 4.5:1 ratio (AA)
- [ ] Interactive elements 3:1 ratio
- [ ] Don't rely on color alone
- [ ] Focus indicators visible

✅ MOTION & ANIMATION
- [ ] Respect prefers-reduced-motion
- [ ] No auto-playing content
- [ ] Pause/stop controls available
```

---

### **Best Practices for Cocktail Lab**

```typescript
// ✅ GOOD - Semantic HTML
<button onClick={handleClick}>
  Add to Favorites
</button>

// ❌ BAD - Div as button
<div onClick={handleClick}>
  Add to Favorites
</div>

// ✅ GOOD - Descriptive labels
<button aria-label="Add Margarita to favorites">
  <HeartIcon />
</button>

// ❌ BAD - Generic label
<button aria-label="Heart">
  <HeartIcon />
</button>

// ✅ GOOD - Form labels
<label htmlFor="ingredient">
  Search by ingredient
  <input id="ingredient" name="ingredient" />
</label>

// ❌ BAD - No label
<input placeholder="Search by ingredient" />

// ✅ GOOD - Live region
<div role="status" aria-live="polite">
  {message}
</div>

// ❌ BAD - Just render text
<div>{message}</div>
```

---


## 🔄 CONTINUOUS INTEGRATION

### **CI/CD Philosophy**

> "Tests that don't run automatically are tests that don't prevent bugs."

**Goals:**
- ✅ Tests run on every PR
- ✅ Build fails if coverage drops
- ✅ E2E runs on preview deployments
- ✅ No merge without passing tests

---

### **GitHub Actions Workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Linting & Type Checking
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Type check
        run: npx tsc --noEmit
  
  # Job 2: Unit & Integration Tests
  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Check coverage thresholds
        run: |
          # Fail if coverage < 80%
          node scripts/check-coverage.js
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true
      
      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
          title: 'Test Coverage Report'
  
  # Job 3: Build
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Check build size
        run: |
          # Fail if bundle > 500KB
          node scripts/check-bundle-size.js
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
          retention-days: 7
  
  # Job 4: E2E Tests (on preview)
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
      
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
          retention-days: 7
  
  # Job 5: Accessibility Tests
  a11y:
    name: Accessibility Tests
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run accessibility tests
        run: npm run test:a11y
      
      - name: Comment PR with a11y results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(
              fs.readFileSync('./a11y-results.json', 'utf8')
            );
            
            const violations = results.violations || [];
            
            if (violations.length > 0) {
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: `⚠️ **${violations.length} Accessibility Violations Found**\n\n${violations.map(v => `- ${v.id}: ${v.description}`).join('\n')}`
              });
            }

# Job 6: Performance Budget
  performance:
    name: Performance Budget
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Download build
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Audit bundle size
        run: npx bundlesize
      
      - name: Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun --config=lighthouserc.json

# Branch protection
  # All jobs must pass before merge
```

---

### **Supporting Scripts**

```javascript
// scripts/check-coverage.js
const fs = require('fs');
const path = require('path');

const coverageFile = path.join(__dirname, '../coverage/coverage-summary.json');
const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));

const { total } = coverage;

const thresholds = {
  lines: 80,
  statements: 80,
  functions: 80,
  branches: 75
};

let failed = false;

Object.keys(thresholds).forEach(key => {
  const actual = total[key].pct;
  const required = thresholds[key];
  
  if (actual < required) {
    console.error(`❌ ${key}: ${actual}% < ${required}%`);
    failed = true;
  } else {
    console.log(`✅ ${key}: ${actual}% >= ${required}%`);
  }
});

if (failed) {
  console.error('\n❌ Coverage thresholds not met');
  process.exit(1);
} else {
  console.log('\n✅ All coverage thresholds met');
}
```

```javascript
// scripts/check-bundle-size.js
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const maxSize = 500 * 1024; // 500KB

function getDirectorySize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  });
  
  return size;
}

const bundleSize = getDirectorySize(distPath);
const sizeMB = (bundleSize / 1024 / 1024).toFixed(2);
const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);

console.log(`Bundle size: ${sizeMB} MB`);
console.log(`Max allowed: ${maxSizeMB} MB`);

if (bundleSize > maxSize) {
  console.error(`❌ Bundle too large: ${sizeMB} MB > ${maxSizeMB} MB`);
  process.exit(1);
} else {
  console.log(`✅ Bundle size OK`);
}
```

---

### **Vercel Deployment with E2E**

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        id: deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
      
      - name: Comment PR with preview URL
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployed to: ${{ steps.deploy.outputs.preview-url }}`
            });
      
      - name: Run E2E on preview
        run: |
          npm ci
          npx playwright install --with-deps
          PREVIEW_URL=${{ steps.deploy.outputs.preview-url }} npm run test:e2e
```

---

### **Lighthouse CI Configuration**

```javascript
// lighthouserc.json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

### **Bundle Size Monitoring**

```json
// .bundlesizerc.json
{
  "files": [
    {
      "path": "./dist/**/*.js",
      "maxSize": "300 KB",
      "compression": "gzip"
    },
    {
      "path": "./dist/**/*.css",
      "maxSize": "50 KB",
      "compression": "gzip"
    }
  ]
}
```

---

### **Branch Protection Rules**

```yaml
# GitHub Settings → Branches → Add Rule

Branch name pattern: main

✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale approvals
  ✅ Require review from Code Owners

✅ Require status checks to pass before merging
  Required checks:
    - lint
    - test
    - build
    - e2e
    - a11y
    - performance

✅ Require conversation resolution before merging

✅ Do not allow bypassing the above settings
```

---

### **Pre-commit Hooks**

```bash
# Install Husky
npm install -D husky lint-staged

# Initialize Husky
npx husky init
```

```javascript
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

### **Commit Message Linting**

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code restructure
        'test',     // Tests
        'chore',    // Maintenance
        'perf',     // Performance
        'ci',       // CI changes
        'build',    // Build system
        'revert'    // Revert commit
      ]
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always']
  }
}
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

**Example valid commits:**
```
feat: add favorites filter functionality
fix: resolve modal focus trap issue
test: add e2e tests for search flow
docs: update testing strategy documentation
```

---

### **Automated Dependency Updates**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "your-username"
    labels:
      - "dependencies"
    commit-message:
      prefix: "chore"
      prefix-development: "chore"
    ignore:
      # Major version updates need manual review
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
```

---

### **Slack/Discord Notifications**

```yaml
# Add to .github/workflows/ci.yml

- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "❌ CI Failed on ${{ github.repository }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Branch:* ${{ github.ref }}\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}"
            }
          }
        ]
      }
```

---

### **Test Results Dashboard**

```yaml
# Add to workflows
- name: Publish test results
  uses: EnricoMi/publish-unit-test-result-action@v2
  if: always()
  with:
    files: |
      coverage/junit.xml
      playwright-report/results.xml
```

---

### **CI/CD Best Practices**

```
✅ DO:
- Run tests in parallel when possible
- Cache dependencies (npm ci with cache)
- Fail fast (stop on first error)
- Comment PR with results
- Upload artifacts for debugging
- Monitor test execution time
- Track flaky tests

❌ DON'T:
- Run E2E on every commit (too slow)
- Mock everything in CI
- Ignore intermittent failures
- Skip tests to "go faster"
- Leave broken tests
- Commit without running tests locally
```

---

### **Monitoring Test Health**

```javascript
// scripts/test-health.js
const { execSync } = require('child_process');

// Track test execution time
const start = Date.now();
execSync('npm test', { stdio: 'inherit' });
const duration = Date.now() - start;

const maxDuration = 30000; // 30 seconds

if (duration > maxDuration) {
  console.warn(`⚠️ Tests taking too long: ${duration}ms > ${maxDuration}ms`);
  // Consider optimizing or parallelizing
}

// Track flaky tests (run 10 times)
let failures = 0;
for (let i = 0; i < 10; i++) {
  try {
    execSync('npm test', { stdio: 'ignore' });
  } catch (e) {
    failures++;
  }
}

if (failures > 0 && failures < 10) {
  console.error(`❌ Flaky tests detected: ${failures}/10 runs failed`);
  process.exit(1);
}
```

---

### **CI Success Metrics**

```
TARGET METRICS:

⏱️ CI Pipeline Duration
   - Lint + Test: < 2 minutes
   - Build: < 1 minute
   - E2E: < 5 minutes
   - Total: < 10 minutes

📊 Coverage
   - Overall: > 80%
   - Critical files: > 90%
   - New code: > 85%

🎯 Success Rate
   - Main branch: 100% passing
   - PR builds: > 95% passing
   - Flaky test rate: < 1%

🚀 Deploy Frequency
   - Staging: Multiple times/day
   - Production: Daily
   - Rollback time: < 5 minutes
```

---

