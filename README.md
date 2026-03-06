# 🍹 Cocktail Lab

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://cocktail-lab-ecru.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Tested with Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18?logo=vitest)](https://vitest.dev/)
[![E2E Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright)](https://playwright.dev/)

Multi-page cocktail recipe application built with **React + TypeScript** and **React Router DOM**.

Originally developed as part of a React course project focused on multi-page routing and Zustand's Slice Pattern, the application progressively evolved to incorporate improved styling, modular architecture, runtime validation, and a comprehensive multi-layer testing strategy.

The app consumes the public [TheCocktailDB API](https://www.thecocktaildb.com/api.php) to allow users to browse, search, and manage cocktail recipes in a structured and scalable way.

---

## 🚀 Live Demo

👉 [https://cocktail-lab-devacl.vercel.app](https://cocktail-lab-devacl.vercel.app)

---

## 📋 Table of Contents

- [🍹 Cocktail Lab](#-cocktail-lab)
  - [🚀 Live Demo](#-live-demo)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Core Features](#-core-features)
    - [🔎 Recipe Exploration](#-recipe-exploration)
    - [📖 Detailed Recipe View](#-detailed-recipe-view)
    - [❤️ Favorites System](#️-favorites-system)
    - [🔔 User Feedback \& Stability](#-user-feedback--stability)
    - [🎨 UI \& Experience](#-ui--experience)
  - [🛠 Tech Stack](#-tech-stack)
  - [🧠 Architecture Overview](#-architecture-overview)
  - [🧪 Testing Strategy](#-testing-strategy)
  - [🗂 Project Structure](#-project-structure)
  - [⚙️ Installation \& Local Setup](#️-installation--local-setup)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [🌐 Environment Variables](#-environment-variables)
  - [🧪 Run Tests](#-run-tests)
  - [🎯 Engineering Focus](#-engineering-focus)
  - [📚 API Reference](#-api-reference)
  - [📚 Documentation](#-documentation)
  - [📄 License](#-license)

---

## ✨ Core Features

### 🔎 Recipe Exploration
- Browse cocktails by **category**
- Search drinks by **ingredient or name**
- Real-time API fetching with loading states
- Resilient data handling for unreliable API responses

### 📖 Detailed Recipe View
- Drink name and thumbnail
- Ingredients with measurements
- Preparation instructions
- Modal overlay — no page navigation required

### ❤️ Favorites System
- Add / remove drinks instantly
- Persistent storage using Zustand `persist` middleware
- Derived favorites counter
- Optimized re-rendering using centralized selectors

### 🔔 User Feedback & Stability
- Global notification system
- Graceful async error handling
- Global Error Boundary for UI crash isolation

### 🎨 UI & Experience
- Fully responsive layout (mobile-first)
- Skeleton loading states
- Accessible semantic markup (WCAG 2.1 AA)
- Tailwind-based utility-first styling
- Subtle UI animations

---

## 🛠 Tech Stack

| Tool | Purpose | Version |
|------|---------|---------|
| ⚛️ **React** | Component-based UI with functional components and hooks | 19.2 |
| 🔷 **TypeScript** | Static typing across components, store, services, and domain models | 5.9 |
| ⚡ **Vite** | Fast development server and optimized production builds | 7.2 |
| 🗂 **React Router DOM** | Multi-page routing with layout-based structure | 7.12 |
| 🧠 **Zustand** | Global state management using the Slice Pattern | 5.0 |
| 💾 **Zustand Persist** | Selective persistence of favorites via `localStorage` | - |
| 🌐 **Axios** | Promise-based HTTP client for API communication | 1.13 |
| 🛡 **Zod** | Runtime schema validation to ensure API response integrity | 4.3 |
| 🎨 **Tailwind CSS** | Utility-first CSS framework for responsive styling | 4.1 |
| 🧪 **Vitest** | Unit and integration testing optimized for Vite | 4.0 |
| 🧩 **Testing Library** | User-centric testing utilities for React components | 16.3 |
| 🧭 **Playwright** | End-to-end testing for real browser flows | 1.58 |
| 🎭 **MSW** | API mocking for integration tests | 2.12 |
| ♿ **jest-axe** | Automated accessibility validation in component tests | 10.0 |

---

## 🧠 Architecture Overview

This project follows a modular and layered architecture designed to keep responsibilities clearly separated:

```
Views → Components → Store (Zustand Slices) → Selectors → Services → Zod Schemas → Domain Models
```

- **Views** — Page-level components tied to routes
- **Components** — Reusable UI building blocks
- **Store (Zustand slices)** — Business logic and state mutations
- **Selectors layer** — Optimized and controlled state access (prevents unnecessary re-renders)
- **Services** — API communication via Axios
- **Schemas (Zod)** — Runtime validation layer for external API responses
- **Domain models** — TypeScript types inferred directly from Zod schemas via `z.infer<>`, always in sync with runtime validation

The global store is composed using the **Zustand Slice Pattern**, allowing independent features to scale without tightly coupling state logic.

📄 Full breakdown → [`docs/architecture.md`](docs/architecture.md)

---

## 🧪 Testing Strategy

A complete multi-layer testing approach to validate both logic and user experience:

| Layer | Tool | Tests | Duration | Focus |
|-------|------|:-----:|:--------:|-------|
| **Unit — Stores** | Vitest | 44 | ~7.9s | Slices, actions, selectors |
| **Unit — Components, Services & Utils** | Vitest + Testing Library | 102 | ~3.9s | UI behavior, services, schemas |
| **Accessibility** | Vitest + jest-axe | 87 | ~2.6s | Automated WCAG audits per component |
| **Integration** | Vitest + MSW | 129 | ~2.8s | Feature-level flows with real store |
| **E2E** | Playwright | 340 | ~2m24s | Real user flows in Chromium |
| **Total** | | **702** | **~2m41s** | **All 5 stages passing** |

📄 Testing strategy summary → [`docs/testing-strategy-summary.md`](docs/testing-strategy-summary.md)  
📄 Full strategy → [`docs/testing-strategy.md`](docs/testing-strategy.md)  
📄 Accessibility details → [`docs/accessibility.md`](docs/accessibility.md)

---

## 🗂 Project Structure

```
Cocktail-Lab/
├── src/
│   ├── components/       # Reusable UI components
│   ├── layouts/          # Shared page layout (Layout.tsx)
│   ├── views/            # Page-level components (IndexPage, FavoritesPage)
│   ├── stores/           # Zustand slices, selectors, and store composition
│   ├── services/         # API communication layer (Axios + Zod)
│   ├── utils/            # Zod schemas and shared utilities
│   ├── types/            # TypeScript domain models
│   └── router.tsx        # React Router configuration
├── tests/
│   ├── unit/             # Pure logic tests
│   ├── integration/      # Feature-level tests with MSW
│   ├── e2e/              # Playwright end-to-end tests
│   └── accessibility/    # Automated axe-core accessibility audits
├── docs/                 # Architecture, testing strategy, accessibility docs
├── .github/workflows/    # CI/CD pipelines
├── vitest.config.ts
└── playwright.config.ts
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

> If you want to use a premium API key for extended endpoints, create a `.env` file at the root:
> ```
> VITE_COCKTAIL_API_KEY=your_api_key_here
> ```

---

## 🧪 Run Tests

```bash
# All 5 stages in sequence — prints the summary table
npm run test:all

# Individual stages
npm run test:unit         # Unit tests (stores, components, services, utils)
npm run test:a11y         # Accessibility audits (axe-core)
npm run test:integration  # Integration tests with MSW
npm run test:e2e          # Playwright E2E tests

# Coverage report (enforces configured thresholds)
npm run test:coverage

# Watch mode during development
npm run test

# Playwright interactive UI / debug
npm run test:e2e:ui
npm run test:e2e:debug
```

---

## 🎯 Engineering Focus

Key engineering principles applied throughout this project:

- **Separation of concerns** across views, components, store, and services
- **Modular state architecture** using Zustand Slice Pattern
- **Centralized typed selectors** to prevent unnecessary re-renders
- **Runtime validation** of external API responses using Zod
- **Explicit API → Domain transformation** layer
- **Strong TypeScript typing** across the entire codebase
- **Defensive handling** of nullable and edge-case API responses
- **Multi-layer testing strategy** (unit, integration, e2e, accessibility)
- **WCAG 2.1 AA accessibility** compliance with automated checks

---

## 📚 API Reference

This project consumes data from the public **[TheCocktailDB API](https://www.thecocktaildb.com/api.php)**.

| Endpoint type | Description |
|---------------|-------------|
| **Categories** | Retrieves the list of available drink categories |
| **Filter** | Fetches drinks filtered by category or ingredient |
| **Lookup** | Retrieves detailed recipe information by drink ID |
| **Search** | Searches drinks by name |

All API responses are validated using Zod schemas before being transformed into typed domain models and stored in the global state.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`docs/architecture.md`](docs/architecture.md) | Full architectural breakdown with diagrams |
| [`docs/testing-strategy.md`](docs/testing-strategy.md) | Detailed testing strategy per layer |
| [`docs/testing-strategy-summary.md`](docs/testing-strategy-summary.md) | Quick testing reference |
| [`docs/accessibility.md`](docs/accessibility.md) | Accessibility standards, decisions, and audit results |
| [`docs/project-structure.md`](docs/project-structure.md) | Full project file tree |

---

## 📄 License

This project is for **learning and portfolio purposes**.  
Feel free to explore the code, but please do not use it commercially.
