import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppStore } from "../stores/useAppStore";

export default function Header() {
  const location = useLocation();
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [searchFilters, setSearchFilters] = useState({
    ingredient: "",
    category: "",
  });

  const isHome = useMemo(() => {
    return location.pathname === "/";
  }, [location.pathname]);

  const fetchCategories = useAppStore((state) => state.fetchCategories);
  const categories = useAppStore((state) => state.categories);
  const searchRecipes = useAppStore((state) => state.searchRecipes);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchFilters.ingredient && !searchFilters.category) {
      console.warn("Please provide at least one filter");
      return;
    }

    console.log("Searching with filters:", searchFilters);
    searchRecipes(searchFilters);
  };

  return (
    <header className="bg-slate-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center group select-none my-4">
            <img
              src="/logo_dav.png"
              alt="Cocktail Lab logo"
              className="h-30 w-30 md:h-20 md:w-30 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-white font-bold transition-transform duration-200 group-hover:scale-105">
              Cocktail<span className="text-orange-400 font-bold"> Lab</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-white font-semibold border-b-2 border-orange-400 pb-1"
                  : "text-slate-300 font-medium hover:text-white transition"
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive
                  ? "text-white font-semibold border-b-2 border-orange-400 pb-1"
                  : "text-slate-300 font-medium hover:text-white transition"
              }
            >
              Favorites
            </NavLink>
          </nav>
        </div>
      </div>

      {isHome && (
        <>
          <section className="bg-slate-100">
            <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
              <div className="grid gap-8 md:gap-12 md:grid-cols-2 items-center">
                <div className="max-w-lg order-2 md:order-1 text-center md:text-left">
                  <h1 className="text-3xl font-extrabold text-slate-800 leading-tight uppercase sm:text-4xl">
                    Discover the best cocktail recipes
                  </h1>

                  <p className="mt-4 md:mt-6 text-slate-600 leading-relaxed">
                    Cocktail Lab is your place to discover, mix and save cocktail
                    recipes by name, ingredients or category.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="max-w-lg w-full bg-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl space-y-4 md:space-y-6 order-1 md:order-2 mx-auto"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="ingredient"
                      className="block text-slate-200 uppercase text-sm font-bold tracking-wide"
                    >
                      Name or ingredients
                    </label>
                    <input
                      type="text"
                      id="ingredient"
                      name="ingredient"
                      value={searchFilters.ingredient}
                      onChange={handleChange}
                      placeholder="Vodka, Gin, Margarita..."
                      className="w-full rounded-lg bg-slate-800 text-white placeholder-slate-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <div className="relative">
                    <label className="block my-2 text-slate-200 uppercase text-sm font-bold tracking-wide">
                      Category
                    </label>

                    <button
                      type="button"
                      onClick={() => setCategoryOpen((prev) => !prev)}
                      className="w-full rounded-lg bg-slate-800 text-white px-4 py-3 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <span
                        className={
                          searchFilters.category
                            ? "text-white"
                            : "text-slate-400"
                        }
                      >
                        {searchFilters.category || "Select a category"}
                      </span>
                      <span
                        className={`transition-transform ${
                          categoryOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {categoryOpen && (
                      <ul className="absolute z-10 mt-2 w-full rounded-lg bg-slate-800 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                        {categories.map((item) => (
                          <li
                            key={item.strCategory}
                            onClick={() => {
                              setSearchFilters((prev) => ({
                                ...prev,
                                category: item.strCategory,
                              }));
                              setCategoryOpen(false);
                            }}
                            className="px-4 py-3 text-white cursor-pointer hover:bg-orange-400 transition"
                          >
                            {item.strCategory}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-orange-400 hover:bg-orange-500 text-white py-3 font-medium transition-all duration-200 hover:scale-[1.02]"
                  >
                    Search Recipes
                  </button>
                </form>
              </div>
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
        </>
      )}
    </header>
  );
}