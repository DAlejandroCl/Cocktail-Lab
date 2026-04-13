# 🍹 Cocktail Lab

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://cocktail-lab-devacl.vercel.app)
[![CI](https://github.com/DAlejandroCl/Cocktail-Lab/actions/workflows/ci.yml/badge.svg)](https://github.com/DAlejandroCl/Cocktail-Lab/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Tested with Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18?logo=vitest)](https://vitest.dev/)
[![E2E Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright)](https://playwright.dev/)

Multi-page cocktail recipe application built with **React 19 + TypeScript** and **React Router DOM 7**.

Originally developed as a React course project focused on multi-page routing and Zustand's Slice Pattern, the application progressively evolved to incorporate a fully custom design system, modular component architecture, runtime API validation with Zod, client-side sorting, an animated hero section, an AI-powered recipe generator powered by Groq + Llama 3.3, and a comprehensive multi-layer testing strategy (1003 tests across 5 stages).

The app consumes the public [TheCocktailDB API](https://www.thecocktaildb.com/api.php) for recipe browsing and the [Groq API](https://console.groq.com) for AI recipe generation.

---

## 🚀 Live Demo

👉 [https://cocktail-lab-devacl.vercel.app](https://cocktail-lab-devacl.vercel.app)

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🧠 Architecture Overview](#-architecture-overview)
- [🗂 Project Structure](#-project-structure)
- [⚙️ Installation & Local Setup](#️-installation--local-setup)
- [🤖 AI Generator Setup](#-ai-generator-setup)
- [🧪 Run Tests](#-run-tests)
- [📚 API Reference](#-api-reference)
- [📚 Documentation](#-documentation)
- [📄 License](#-license)

---

## ✨ Features

### 🎨 Hero Section
- Full-height hero with animated **mesh gradient background** — two morphing blobs (orange and blue) using `mix-blend-mode` for both light and dark themes
- Floating **bubble layer** clipped to the hero zone with negative animation delays for organic distributed spawn
- Horizontal **ticker strip** with 25 cocktail names scrolling continuously
- Smooth **fade transition** at the bottom edge that dissolves into the page background

### 🔎 Recipe Exploration
- **Search by ingredient** and/or **category** — combined or independent filters
- **Browse All Recipes** — fetches all available categories in parallel via `filter.php?c=`, takes up to 12 drinks per category, shuffles the result, and paginates the grid progressively (20 cards at a time via scroll listener)
- Auto-scroll to results grid after a successful search
- `Showing X of Y recipes` counter that updates as the user scrolls

### 📊 Sorting
- Results grid: sort by **Default**, **A → Z**, **Z → A**, or **Category**
- Favorites: sort by **Recently Added** (default), **A → Z**, **Z → A**, or **Category**
- Recently-added order persists across sessions via `favoriteOrder` timestamps

### 📖 Detailed Recipe View
- Drink name, thumbnail, category badge
- Ingredients with measurements in a clean list
- Step-by-step preparation instructions parsed from the raw text
- Modal overlay — no page navigation required

### ❤️ Favorites System
- Add / remove drinks with a single click from the card or the modal
- Persistent storage via Zustand `persist` middleware (localStorage)
- Recently-added order tracked with timestamps in a parallel `favoriteOrder` record

### 🤖 AI Recipe Generator
- Compose a list of ingredients you have at home and generate a custom cocktail recipe
- Powered by **Groq API** (llama-3.3-70b-versatile) via a Vercel Serverless Function
- JSON Object Mode for reliable structured responses without `json_schema` constraints
- Zod validation on the server before the recipe reaches the client
- **"Don Aurelio"** system persona — 50-year master mixologist with creative naming and professional technique
- Recipe card with image (fetched from TheCocktailDB by visual color match), ingredients, and step-by-step instructions
- **Save Creation** — save any AI recipe to "My Creations" on the Favorites page
- **Re-craft** — regenerate a new recipe with the same ingredient list
- Ingredient autocomplete with keyboard navigation (arrow keys, Enter, Escape)

### 🎨 UI & Experience
- Custom design system with **light / dark mode** (persisted via `useThemeStore`)
- Sticky navbar with animated sliding underline indicator and logo letter-bounce animation
- Responsive layout — mobile-first, tested across all breakpoints and 5 browser engines
- Skeleton loading states (20 placeholders during initial fetch)
- Global notification toasts with auto-dismiss and hover-pause
- `prefers-reduced-motion` support — reactive hook that responds to OS preference changes mid-session
- Accessible semantic markup targeting **WCAG 2.1 AA**
- `<Suspense>` fallback spinner on all lazy-loaded routes — no blank screens during navigation
- 404 page with branded design for any unknown URL

---

## 🛠 Tech Stack

| Tool | Purpose | Version |
|------|---------|---------| 
| ⚛️ **React** | Component-based UI | 19.2 |
| 🔷 **TypeScript** | Static typing throughout | 5.9 |
| ⚡ **Vite** | Dev server + production builds | 7.2 |
| 🗂 **React Router DOM** | Multi-page routing with lazy loading | 7.12 |
| 🧠 **Zustand** | Global state — Slice Pattern | 5.0 |
| 💾 **Zustand Persist** | Favorites + AI creations persistence | — |
| 🌐 **fetch** | Native HTTP client for TheCocktailDB API | built-in |
| 🛡 **Zod** | Runtime API response validation | 4.3 |
| 🤖 **Groq SDK** | AI recipe generation (llama-3.3-70b) | 1.1 |
| 🎨 **Tailwind CSS v4** | Utility-first styling + `@layer components` | 4.1 |
| 🧩 **HeadlessUI** | Accessible Listbox + Dialog components | 2.2 |
| 🧪 **Vitest** | Unit and integration testing | 4.0 |
| 🧩 **Testing Library** | React component testing utilities | 16.3 |
| 🎭 **MSW** | API mocking for integration tests | 2.12 |
| 🧭 **Playwright** | End-to-end browser tests (5 engines) | 1.58 |
| ♿ **jest-axe** | Automated accessibility audits | 10.0 |
| ☁️ **Vercel** | Hosting + Serverless Functions | — |

---

## 🧠 Architecture Overview

```
Views → Components → Store (Zustand Slices) → Selectors → Services → Zod Schemas → Domain Types
                          ↑
                   utils/sortRecipes.ts
                   (pure client-side sort)

AI path:
GenerateAI view → generateAISlice → /api/ai/generate-recipe (Vercel Function)
                                          ↓
                                    Groq SDK (json_object mode)
                                          ↓
                                    Zod validation
                                          ↓
                                    TheCocktailDB image lookup
```

- **Views** — Route-level pages (`IndexPage`, `FavoritesPage`, `GenerateAI`, `NotFoundPage`)
- **Components** — Reusable UI (`HeroSection`, `SearchForm`, `SortSelector`, `DrinkCard`, `GeneratedRecipeCard`, `Header`, `Modal`, …)
- **Store** — Zustand slices: `recipeSlice`, `favoritesSlice`, `notificationSlice`, `generateAISlice`, `useThemeStore`
- **Selectors** — Centralized typed derived-state functions (prevents unnecessary re-renders)
- **Sort utilities** — Pure functions in `utils/sortRecipes.ts`, applied at render time via `useMemo`
- **Services** — Native `fetch` HTTP calls with Zod-validated responses
- **Schemas** — Zod runtime contracts for all TheCocktailDB API responses
- **Domain types** — TypeScript types inferred from Zod schemas via `z.infer<>`, always in sync
- **API** — Vercel Serverless Function (`api/ai/generate-recipe.ts`) using Groq SDK natively

📄 Full breakdown → [`docs/architecture.md`](docs/architecture.md)

---

## 🧪 Testing Strategy

| Layer | Tool | Tests |
|-------|------|:-----:|
| **Unit — Stores** | Vitest | 104 |
| **Unit — Components, Services & Utils** | Vitest + Testing Library | 172 |
| **Accessibility** | Vitest + jest-axe | 82 |
| **Integration** | Vitest + MSW | 145 |
| **E2E** | Playwright (5 browsers) | 500 |
| **Total** | | **1003** |

📄 Full strategy → [`docs/testing-strategy.md`](docs/testing-strategy.md)

---

## 🗂 Project Structure

```
src/
├── components/    # Header, HeroSection, SearchForm, SortSelector, DrinkCard,
│                  # GeneratedRecipeCard, Modal, Notification, …
├── layouts/       # Layout.tsx (root shell: Header + Modal + Notification + ErrorBoundary)
├── views/         # IndexPage, FavoritesPage, GenerateAI, NotFoundPage
├── stores/        # Zustand slices + selectors + theme store
├── services/      # recipeService.ts (native fetch + Zod)
├── utils/         # recipes-schemas.ts · sortRecipes.ts
├── types/         # Domain types (inferred from Zod)
└── index.css      # Tailwind v4 @theme + @layer components design system

api/
└── ai/
    └── generate-recipe.ts   # Vercel Serverless Function (Groq SDK + Zod)
```

📄 Complete tree → [`docs/project-structure.md`](docs/project-structure.md)

---

## ⚙️ Installation & Local Setup

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/DAlejandroCl/Cocktail-Lab.git

# 2. Navigate to the project directory
cd Cocktail-Lab

# 3. Install dependencies
npm install

# 4. Set up environment variables (see AI Generator Setup below)
cp .env.example .env

# 5. Start the development server
npm run dev
```

Open your browser at: `http://localhost:5173`

> The TheCocktailDB API does not require authentication — the app works without any `.env` configuration for recipe browsing. The AI Generator requires a Groq API key.

---

## 🤖 AI Generator Setup

The AI Generator uses the [Groq API](https://console.groq.com) via a Vercel Serverless Function. To use it locally:

1. **Get a free Groq API key** at [console.groq.com/keys](https://console.groq.com/keys)

2. **Add it to your `.env` file:**
   ```bash
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
   ```

3. **Run the dev server with Vercel CLI** (required for serverless functions locally):
   ```bash
   npm install -g vercel
   vercel dev
   ```
   This serves both the Vite frontend and the `api/` functions at `http://localhost:3000`.

   > **Note:** `npm run dev` (plain Vite) runs the frontend only. The Generate Recipe button will fail without `vercel dev` since `/api/ai/generate-recipe` won't be available.

4. **For production** (Vercel deployment): add `GROQ_API_KEY` in your Vercel project settings under **Settings → Environment Variables**, then redeploy.

### How the AI endpoint works

```
POST /api/ai/generate-recipe
Body: { "ingredients": ["Vodka", "Lime juice", "Mint"] }

Validation: 1–15 ingredients, each string under 100 characters

Flow:
  1. Groq SDK → llama-3.3-70b-versatile (json_object response format)
  2. JSON.parse() + Zod safeParse() validation
  3. TheCocktailDB image lookup by visual color slug
  4. Returns: { recipe: { strDrink, strDrinkThumb, strCategory, strInstructions, ingredients[] } }
```

> `json_schema` response format is **not** used because `llama-3.3-70b-versatile` does not support it on Groq. `json_object` mode guarantees valid JSON; Zod provides schema enforcement.

---

## 🧪 Run Tests

```bash
# All 5 stages in sequence (recommended)
npm run test:all

# Individual stages
npm run test:unit         # Unit tests (stores, components, services, utils)
npm run test:a11y         # Accessibility audits (axe-core)
npm run test:integration  # Integration tests with MSW
npm run test:e2e          # Playwright E2E (5 browsers)

# Coverage report
npm run test:coverage

# Watch mode (during development)
npm run test

# Playwright interactive UI / debug
npm run test:e2e:ui
npm run test:e2e:debug
```

---

## 📚 API Reference

### TheCocktailDB (public, no auth required)

| Endpoint | Used for |
|----------|----------|
| `list.php?c=list` | Fetch all available categories |
| `filter.php?c=` | Drinks by category (Browse All: parallel per-category) |
| `filter.php?i=` | Drinks by ingredient |
| `search.php?s=` | Drinks by name |
| `lookup.php?i=` | Full recipe detail by drink ID |

All responses are validated with Zod schemas before entering the store. `getBrowseRecipes` calls `filter.php?c=` for each category in parallel, caps at 12 per category, deduplicates, and Fisher-Yates shuffles for variety.

### Groq (AI Generator — requires API key)

| Endpoint | Used for |
|----------|----------|
| `POST /api/ai/generate-recipe` | Generate a cocktail recipe from an ingredient list |

Internally uses `groq.chat.completions.create` with `response_format: { type: "json_object" }` and `model: "llama-3.3-70b-versatile"`.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`docs/architecture.md`](docs/architecture.md) | Full architectural breakdown with data flow and AI pipeline |
| [`docs/project-structure.md`](docs/project-structure.md) | Complete annotated file tree |
| [`docs/testing-strategy.md`](docs/testing-strategy.md) | Detailed testing strategy per layer |
| [`docs/testing-strategy-summary.md`](docs/testing-strategy-summary.md) | Quick testing reference card |
| [`docs/accessibility.md`](docs/accessibility.md) | Accessibility standards and audit methodology |

---

## 📄 License

This project is for **learning and portfolio purposes**.  
Feel free to explore the code, but please do not use it commercially.
