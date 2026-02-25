# 🍹 Cocktail Lab

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://cocktail-lab-devacl.vercel.app)

A multi-page cocktail recipe application built with **React + TypeScript** and **React Router DOM**.

Originally developed as part of a React course project focused on multi-page routing and Zustand's Slice Pattern, the application progressively evolved to incorporate improved styling, modular architecture, runtime validation, and a comprehensive multi-layer testing strategy.

The app consumes the public [TheCocktailDB API](https://www.thecocktaildb.com/api.php) to allow users to browse, search, and manage cocktail recipes in a structured and scalable way.

---

## 🚀 Live Demo

You can try the application here:

👉 https://cocktail-lab-devacl.vercel.app

---

## ✨ Core Features

This application is designed to demonstrate real-world frontend engineering practices while maintaining a clean and user-friendly experience.

#### 🔎 Recipe Exploration
- Browse cocktails by **category**
- Search drinks by **ingredient or name**
- Real-time API fetching with loading states
- Resilient data handling for unreliable API responses

#### 📖 Detailed Recipe View
- Drink name and thumbnail
- Ingredients with measurements
- Preparation instructions
- Explicit API → Domain transformation layer

#### ❤️ Favorites System
- Add / remove drinks instantly
- Persistent storage using Zustand `persist` middleware
- Derived favorites counter
- Optimized re-rendering using centralized selectors

#### 🔔 User Feedback & Stability
- Global notification system
- Graceful async error handling
- Global Error Boundary for UI crash isolation

#### 🎨 UI & Experience
- Fully responsive layout
- Skeleton loading states
- Accessible semantic markup
- Tailwind-based utility-first styling
- Subtle UI animations

---

## 🛠 Tech Stack

Each tool in this project was selected with a clear purpose:

- **⚛️ React** - Component-based UI architecture using functional components and hooks.
- **🔷 TypeScript** - Strong static typing across components, store, services, and domain models.
- **⚡ Vite** - Fast development server and optimized production builds.
- **🗂 React Router DOM** - Multi-page routing with layout-based structure.
- **🧠 Zustand** - Global state management using the **Slice Pattern** and controlled subscriptions.
- **💾 Zustand Persist Middleware** - Selective persistence of the favorites slice using `localStorage`.
- **🌐 Axios** - Promise-based HTTP client for API communication.
- **🛡 Zod** - Runtime schema validation to ensure API response integrity.
- **🎨 Tailwind CSS** - Utility-first CSS framework for responsive and scalable styling.
- **🧪 Vitest** - Unit and integration testing framework optimized for Vite.
- **🧩 Testing Library** - User-centric testing utilities for React components.
- **🧭 Playwright** - End-to-end testing to validate real browser flows.
- **♿ jest-axe** - Automated accessibility validation integrated into component and page tests.

---

## 🧠 Architecture Overview

This project follows a modular and layered architecture designed to keep responsibilities clearly separated.

At a high level:

- **Views** → Page-level components  
- **Components** → Reusable UI building blocks  
- **Store (Zustand slices)** → Business logic & state mutations  
- **Selectors layer** → Optimized and controlled state access  
- **Services** → API communication  
- **Schemas (Zod)** → Runtime validation layer  
- **Domain models** → Fully typed transformations from API data  

The global store is composed using the **Zustand Slice Pattern**, allowing independent features to scale without tightly coupling state logic.

For a full architectural breakdown:

📄 See → [`docs/architecture.md`](./docs/architecture.md)

---

## 🧪 Testing Strategy

This project implements a complete multi-layer testing approach to validate both logic and user experience:

- **Unit Tests** → Pure logic, slices, services, utilities  
- **Component Tests** → UI behavior in isolation  
- **Integration Tests** → Feature-level behavior  
- **E2E Tests** → Real user flows in the browser (Playwright)  
- **Accessibility Tests** → Automated semantic validation (jest-axe)  

The tests are structured by responsibility and isolated using mocks and MSW where appropriate.

📄 Summary → [`docs/testing-strategy-summary.md`](./docs/testing-strategy-summary.md)  
📄 Full Strategy → [`docs/testing-strategy.md`](./docs/testing-strategy.md)  
📄 Accessibility Details → [`docs/accessibility.md`](./docs/accessibility.md)

---

## 🗂 Project Structure

To keep this README concise, the complete organized project tree is documented here:

📄 [`docs/project-structure.md`](./docs/project-structure.md)

---

## ⚙️ Installation & Local Setup

1. Clone the repository:

```bash
git clone https://github.com/DAlejandroCl/Cocktail-Lab.git
```

2. Navigate to the project directory:
```bash
cd Cocktail-Lab
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server
```bash
npm run dev
```

5. Open your browser and visit:
```txt
http://localhost:5173
```

---

## 🧪 Run Tests

1. Unit & Integration
```bash
npm run test
```

2. Coverage
```bash
npm run test:coverage
```

3. E2E (Playwright)
```bash
npm run test:e2e
```

---

## 🎯 Engineering Focus

Key engineering principles applied:

- Clear separation of concerns across views, components, store, and services
- Modular state architecture using Zustand Slice Pattern
- Centralized typed selectors to prevent unnecessary re-renders
- Runtime validation of external API responses using Zod
- Explicit API → Domain transformation layer
- Strong TypeScript typing across the entire codebase
- Defensive handling of nullable and edge-case API responses
- Multi-layer testing strategy (unit, integration, e2e, accessibility)

The goal is to demonstrate structured frontend architecture and reliability-focused development practices.

---

## 📚 API Reference

This project consumes data from the public **TheCocktailDB API**.

Endpoints used:

- **Categories endpoint**: Retrieves the list of available drink categories.
- **Filter endpoint**: Fetches drinks filtered by category or ingredient.
- **Lookup endpoint**: Retrieves detailed recipe information by drink ID.
- **Search endpoint**: Searches drinks by name.

All API responses are validated using Zod schemas before being transformed into typed domain models and stored in the global state.

---

## 📄 License

This project is for learning and portfolio purposes.