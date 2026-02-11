# 🍹 Cocktail Lab

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://cocktail-lab-devacl.vercel.app)

A multi-page cocktail recipe application built with React + TypeScript and React Router DOM.
Browse and discover drink recipes by category or ingredient using the [TheCocktailDB API](https://www.thecocktaildb.com/api.php). Features modular state management with Zustand Slice Pattern, runtime validation with Zod, and a responsive design.

## 🚀 Live Demo

You can try the application here:

👉 https://cocktail-lab-devacl.vercel.app

---

## ✨ Features
- Multi-page navigation with React Router DOM
- Browse recipes by category or ingredient
- Real-time data from TheCocktailDB API
- Display:
  - Drink name and image
  - Recipe details
  - Ingredients and measurements
- Favorites system to save preferred recipes
- Input validation with Zod schemas
- Modular state management using Zustand Slice Pattern
- Responsive UI with Tailwind CSS
- Loading states and error handling

---

## 🛠 Tech Stack
- **React** (Functional Components)
- **TypeScript**
- **Vite**
- **Axios** for HTTP requests
- **Zod** for schema validation
- **Zustand** for state management
- **React Router DOM** for routing
- **Tailwind CSS**

---

## 🧠 Architecture & Concepts
- Multi-page application with client-side routing
- Zustand Slice Pattern for modular state management
- Separate slices for recipes and favorites
- API logic encapsulated in service layer
- Strong runtime and compile-time validation using Zod
- Reusable UI components
- Type-safe API responses

---

## 🗂 Project Structure
```txt
src/
├── components/
│   ├── DrinkCard.tsx
│   ├── Header.tsx
│   ├── Modal.tsx
│   ├── Notification.tsx
│   └── SkeletonDrinkCard.tsx
├── layouts/
│   └── Layout.tsx
├── services/
│   └── RecipeService.ts
├── stores/
│   ├── favoritesSlice.ts
│   ├── notificationSlice.ts
│   ├── recipeSlice.ts
│   └── useAppStore.ts
├── types/
│   └── index.ts
├── utils/
│   └── recipes-schemas.ts
├── views/
│   ├── FavoritesPage.tsx
│   └── IndexPage.tsx
├── router.tsx
├── main.tsx
└── index.css
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