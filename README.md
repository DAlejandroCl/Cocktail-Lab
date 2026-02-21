# 🍹 Cocktail Lab

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://cocktail-lab-devacl.vercel.app)

A multi-page cocktail recipe application built with React + TypeScript and React Router DOM.
Browse and discover drink recipes by category or ingredient using the [TheCocktailDB API](https://www.thecocktaildb.com/api.php). Features modular state management with Zustand Slice Pattern, runtime validation with Zod, and a responsive design.

## 🚀 Live Demo

You can try the application here:

👉 https://cocktail-lab-devacl.vercel.app

---

## ✨ Features
- Multi-page navigation powered by React Router
- Browse cocktail recipes by category or ingredient
- Real-time data fetching from TheCocktailDB API
- Detailed recipe view with:
  - Drink name and image
  - Preparation instructions
  - Ingredients and measurements
- Favorites system with:
  - Persistent storage (localStorage)
  - Instant add/remove functionality
  - Derived favorites counter
- Global notification system for user feedback
- Global Error Boundary for UI crash isolation
- Optimized global state using:
  - Zustand Slice Pattern
  - Centralized typed selectors
  - Controlled subscriptions to prevent unnecessary re-renders
- Strong runtime validation using Zod
- Explicit API → Domain transformation layer
- Defensive null and edge-case handling for external API responses
- Loading states and graceful async error handling
- Fully responsive UI built with Tailwind CSS
- Animated UI elements for improved user experience

---

## 🛠 Tech Stack
- **React** (Functional Components + Hooks)
- **TypeScript**
- **Vite** (Lightning-fast development environment)
- **Zustand** (Modular state management with slices & persist middleware)
- **React Router DOM** (Client-side routing)
- **Axios** (HTTP client)
- **Zod** (Runtime schema validation)
- **Tailwind CSS** (Utility-first styling)
- **LocalStorage** (Selective persistence via Zustand middleware)

---

## 🧠 Architecture & Concepts
- Multi-page application powered by React Router with layout-based routing
- Modular state management using Zustand Slice Pattern
- Centralized typed selectors layer to optimize subscriptions and prevent unnecessary re-renders
- Global store composed via unified AppState typing
- Persistent state management using Zustand persist middleware (favorites stored selectively)
- Clean separation of concerns:
  - Slices → business logic & state mutations
  - Selectors → controlled and optimized state access
  - Services → API communication layer
- API logic fully encapsulated in a dedicated service layer
- Strong runtime validation with Zod
- Fully typed domain models with TypeScript
- Reusable, memoized UI components for performance optimization
- Scalable and extensible store architecture ready for future features

---

## 🗂 Project Structure
```txt
Cocktail-Lab/
├── .github/
│   └── workflows/
│       └── ci.yml                    
│
├── docs/
│   ├── architecture.md               
│   ├── testing-strategy.md           
│   └── accessibility.md              
│
├── src/
│   ├── components/
│   │   ├── DrinkCard.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Header.tsx
│   │   ├── Modal.tsx
│   │   ├── Notification.tsx
│   │   └── SkeletonDrinkCard.tsx
│   ├── layouts/
│   │   └── Layout.tsx
│   ├── services/
│   │   └── RecipeService.ts
│   ├── stores/
│   │   ├── favoritesSlice.ts
│   │   ├── notificationSlice.ts
│   │   ├── recipeSlice.ts
│   │   ├── selectors.ts
│   │   └── useAppStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── recipes-schemas.ts
│   ├── views/
│   │   ├── FavoritesPage.tsx
│   │   └── IndexPage.tsx
│   ├── router.tsx
│   ├── main.tsx
│   └── index.css
│
├── tests/                            
│   │
│   ├── unit/                         
│   │   ├── utils/
│   │   │   └── recipes-schemas.test.ts    
│   │   ├── services/
│   │   │   └── RecipeService.test.ts      
│   │   ├── stores/
│   │   │   ├── favoritesSlice.test.ts     
│   │   │   ├── recipeSlice.test.ts        
│   │   │   └── notificationSlice.test.ts  
│   │   └── components/
│   │       ├── DrinkCard.test.tsx         
│   │       ├── Modal.test.tsx             
│   │       ├── Notification.test.tsx      
│   │       ├── Header.test.tsx            
│   │       └── ErrorBoundary.test.tsx     
│   │
│   ├── integration/                  
│   │   ├── IndexPage.test.tsx             
│   │   ├── FavoritesPage.test.tsx         
│   │   └── FavoritesFlow.test.tsx         
│   │
│   ├── e2e/                          
│   │   ├── browse-and-favorite.spec.ts    
│   │   ├── search-flow.spec.ts            
│   │   └── navigation.spec.ts             
│   │
│   ├── accessibility/                
│   │   ├── DrinkCard.a11y.test.tsx        
│   │   ├── Modal.a11y.test.tsx            
│   │   └── Navigation.a11y.test.tsx       
│   │
│   ├── mocks/                        
│   │   ├── handlers.ts                    
│   │   ├── server.ts                      
│   │   └── factories.ts                   
│   │
│   └── setup/                        
│       ├── test-setup.ts                  
│       └── jest-axe-setup.ts              
│
├── coverage/                         
├── playwright-report/                
├── test-results/                     
│
├── vitest.config.ts                  
├── playwright.config.ts              
├── .gitignore                        
└── package.json                      
```

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

## 🎯 Usage

1. **Browse Recipes:** Select a category or enter an ingredient to search for cocktails
2. **View Details:** Click "View Recipe" to see full recipe information
3. **Save Favorites:** Add your favorite recipes to the favorites page for quick access
4. **Navigate:** Use the navigation menu to switch between browsing and favorites


## 📚 API Reference
This project uses:

- **Categories endpoint:** Get list of drink categories
- **Filter endpoint:** Search drinks by category or ingredient
- **Lookup endpoint:** Get detailed recipe information
- **Search endpoints:** Search drinks by name

## 📄 License

This project is for learning and portfolio purposes.