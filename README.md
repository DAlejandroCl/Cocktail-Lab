# 🍹 Cocktail Lab

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://cocktail-lab-ecru.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Tested with Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18?logo=vitest)](https://vitest.dev/)
[![E2E Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright)](https://playwright.dev/)

Multi-page cocktail recipe application built with **React + TypeScript** and **React Router DOM**.

Originally developed as part of a React course project focused on multi-page routing and Zustand's Slice Pattern, the application progressively evolved to incorporate a fully custom design system, modular component architecture, runtime API validation, client-side sort, and a comprehensive multi-layer testing strategy.

The app consumes the public [TheCocktailDB API](https://www.thecocktaildb.com/api.php) to allow users to browse, search, and manage cocktail recipes.

---

## 🚀 Live Demo

👉 [https://cocktail-lab-devacl.vercel.app](https://cocktail-lab-devacl.vercel.app)

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🧠 Architecture Overview](#-architecture-overview)
- [🗂 Project Structure](#-project-structure)
- [⚙️ Installation](#️-installation--local-setup)
- [🧪 Run Tests](#-run-tests)
- [📚 API Reference](#-api-reference)
- [📚 Documentation](#-documentation)
- [📄 License](#-license)

---

## ✨ Features

### 🔎 Recipe Exploration
- Full-height hero section with **search by ingredient** and **category dropdown**
- Combined ingredient + category filter
- Clear button to reset search filters
- Auto-scroll to results grid after a successful search
- Scroll-to-top button that appears when browsing results

### 📊 Sorting
- Results grid: sort by default, A→Z, Z→A, or Category
- Favorites: sort by recently added (default), A→Z, Z→A, or Category
- Recently-added order persists across sessions via `favoriteOrder` timestamps

### 📖 Detailed Recipe View
- Drink name, thumbnail, category badge
- Ingredients with measurements
- Step-by-step preparation instructions
- Modal overlay — no page navigation required

### ❤️ Favorites System
- Add / remove drinks with a single click
- Persistent storage via Zustand `persist` middleware
- Recently-added order tracked with timestamps

### 🤖 AI Generator
- Compose a custom cocktail recipe from a user-supplied ingredient list

### 🎨 UI & Experience
- Custom design system with light/dark mode (persisted)
- Sticky navbar with animated sliding underline and logo hover animation
- Responsive layout (mobile-first)
- Skeleton loading states
- Global notification toasts
- Accessible semantic markup (WCAG 2.1 AA)

---

## 🛠 Tech Stack

| Tool | Purpose | Version |
|------|---------|---------| 
| ⚛️ **React** | Component-based UI | 19.2 |
| 🔷 **TypeScript** | Static typing throughout | 5.9 |
| ⚡ **Vite** | Dev server + production builds | 7.2 |
| 🗂 **React Router DOM** | Multi-page routing with lazy loading | 7.12 |
| 🧠 **Zustand** | Global state — Slice Pattern | 5.0 |
| 💾 **Zustand Persist** | Favorites + theme persistence | — |
| 🌐 **Axios** | HTTP client for API calls | 1.13 |
| 🛡 **Zod** | Runtime API response validation | 4.3 |
| 🎨 **Tailwind CSS v4** | Utility-first styling + `@layer components` | 4.1 |
| 🧩 **HeadlessUI** | Accessible Listbox dropdown | 2.2 |
| 🧪 **Vitest** | Unit and integration testing | 4.0 |
| 🧩 **Testing Library** | React component testing | 16.3 |
| 🧭 **Playwright** | End-to-end browser tests | 1.58 |
| 🎭 **MSW** | API mocking for integration tests | 2.12 |
| ♿ **jest-axe** | Automated accessibility audits | 10.0 |

---

## 🧠 Architecture Overview

```
Views → Components → Store (Zustand Slices) → Selectors → Services → Zod Schemas → Domain Models
                          ↑
                   utils/sortRecipes.ts
                   (pure client-side sort)
```

- **Views** — Route-level pages (`IndexPage`, `FavoritesPage`, `GenerateAI`)
- **Components** — Reusable UI (`HeroSection`, `SearchForm`, `SortSelector`, `DrinkCard`, `Header`, `Modal`, …)
- **Store** — Zustand slices: `recipeSlice`, `favoritesSlice` (with `favoriteOrder`), `notificationSlice`, `generateAISlice`, `useThemeStore`
- **Selectors** — Centralized typed derived-state functions (prevents unnecessary re-renders)
- **Sort utilities** — Pure functions in `utils/sortRecipes.ts`, applied at render time via `useMemo` in each view
- **Services** — Axios HTTP calls with Zod-validated responses
- **Schemas** — Zod runtime contracts for all API responses
- **Domain models** — TypeScript types inferred from Zod schemas via `z.infer<>`, always in sync

📄 Full breakdown → [`docs/architecture.md`](docs/architecture.md)

---

## 🧪 Testing Strategy

| Layer | Tool | Focus |
|-------|------|-------|
| **Unit — Stores** | Vitest | Slices, actions, selectors |
| **Unit — Components, Services & Utils** | Vitest + Testing Library | UI behavior, services, schemas |
| **Accessibility** | Vitest + jest-axe | Automated WCAG audits per component |
| **Integration** | Vitest + MSW | Feature-level flows with real store |
| **E2E** | Playwright | Real user flows in Chromium |

📄 Full strategy → [`docs/testing-strategy.md`](docs/testing-strategy.md)

---

## 🗂 Project Structure

```
src/
├── components/    # Header, HeroSection, SearchForm, SortSelector, DrinkCard, Modal, …
├── layouts/       # Layout.tsx (root shell)
├── views/         # IndexPage, FavoritesPage, GenerateAI
├── stores/        # Zustand slices + selectors + theme store
├── services/      # recipeService.ts (Axios + Zod)
├── utils/         # recipes-schemas.ts · sortRecipes.ts
├── types/         # Domain types (inferred from Zod)
└── index.css      # Tailwind v4 @theme + @layer components design system
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

# 4. Start the development server
npm run dev
```

Open your browser at: `http://localhost:5173`

---

## 🌐 Environment Variables

This project uses the public TheCocktailDB API which does not require authentication. No `.env` file is needed for local development.

---

## 🧪 Run Tests

```bash
# All 5 stages in sequence
npm run test:all

# Individual stages
npm run test:unit         # Unit tests (stores, components, services, utils)
npm run test:a11y         # Accessibility audits (axe-core)
npm run test:integration  # Integration tests with MSW
npm run test:e2e          # Playwright E2E tests

# Coverage report
npm run test:coverage

# Watch mode
npm run test

# Playwright interactive UI / debug
npm run test:e2e:ui
npm run test:e2e:debug
```

---

## 📚 API Reference

This project consumes the public **[TheCocktailDB API](https://www.thecocktaildb.com/api.php)**.

| Endpoint type | Description |
|---------------|-------------|
| **Categories** | List of available drink categories |
| **Filter** | Drinks filtered by category or ingredient |
| **Lookup** | Full recipe detail by drink ID |
| **Search** | Drinks by name |

All responses are validated with Zod schemas before entering the store.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`docs/architecture.md`](docs/architecture.md) | Full architectural breakdown with diagrams |
| [`docs/project-structure.md`](docs/project-structure.md) | Complete file tree with descriptions |
| [`docs/testing-strategy.md`](docs/testing-strategy.md) | Detailed testing strategy per layer |
| [`docs/testing-strategy-summary.md`](docs/testing-strategy-summary.md) | Quick testing reference |
| [`docs/accessibility.md`](docs/accessibility.md) | Accessibility standards and audit results |

---

## 📄 License

This project is for **learning and portfolio purposes**.  
Feel free to explore the code, but please do not use it commercially.
