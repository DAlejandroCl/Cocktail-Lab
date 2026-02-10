import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppStore } from "../stores/useAppStore";

export default function Header() {
  const location = useLocation();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

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
  const drinks = useAppStore((state) => state.drinks);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (drinks.drinks.length > 0 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 2.5);
    }
  }, [drinks.drinks.length]);

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

    searchRecipes(searchFilters);
  };

  return (
    <>
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-10">
            <Link
              to="/"
              className="flex items-center gap-2 group cursor-pointer select-none"
            >
              <span className="text-2xl font-bold tracking-tight text-white transition-transform duration-200 group-hover:scale-125">
                Cocktail<span className="text-primary font-bold"> Lab</span>
              </span>
            </Link>

            <nav className="flex items-center gap-10">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-sm font-semibold text-white uppercase tracking-widest border-b-2 border-primary pb-1"
                    : "text-sm font-semibold text-white/70 hover:text-primary transition-colors uppercase tracking-widest"
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  isActive
                    ? "text-sm font-semibold text-white uppercase tracking-widest border-b-2 border-primary pb-1"
                    : "text-sm font-semibold text-white/70 hover:text-primary transition-colors uppercase tracking-widest"
                }
              >
                Favorites
              </NavLink>
            </nav>
          </div>
        </div>

        {isHome && (
          <>
            <div className="min-h-[calc(100vh-110px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-40">
              <div className="max-w-7xl w-full">
                <section className="text-center mb-24">
                  <h1 className="font-serif text-5xl md:text-7xl text-white mb-10 leading-tight">
                    Discover Your Next <br />
                    <span className="italic text-primary">Signature Drink</span>
                  </h1>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                    From timeless classics to bold new mixes. Explore,
                    experiment, and create signature drinks by ingredient or
                    category worth remembering.
                  </p>
                </section>

                <section className="relative z-[100] mt-12">
                  <form onSubmit={handleSubmit}>
                    <div className="glass-panel p-3 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-2xl">
                      <div className="flex-1 w-full relative">
                        <svg
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <input
                          type="text"
                          id="ingredient"
                          name="ingredient"
                          value={searchFilters.ingredient}
                          onChange={handleChange}
                          placeholder="Search by ingredients (e.g. Gin, Lime, Mint)"
                          className="w-full bg-transparent border-none focus:ring-0 text-white pl-12 h-14 placeholder:text-slate-500"
                        />
                      </div>

                      <div className="w-px h-8 bg-white/10 hidden md:block"></div>

                      <div className="w-full md:w-64 relative">
                        <button
                          type="button"
                          onClick={() => setCategoryOpen((prev) => !prev)}
                          className="w-full bg-transparent border-none focus:ring-0 text-slate-300 h-14 flex items-center justify-between px-4"
                        >
                          <span
                            className={
                              searchFilters.category
                                ? "text-white"
                                : "text-slate-500"
                            }
                          >
                            {searchFilters.category || "All Categories"}
                          </span>
                          <svg
                            className={`w-5 h-5 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {categoryOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-[110]"
                              onClick={() => setCategoryOpen(false)}
                            />

                            <ul className="absolute top-full mt-2 w-full rounded-lg bg-slate-900/98 backdrop-blur-xl shadow-2xl overflow-hidden border border-primary/30 max-h-[300px] overflow-y-auto z-[120]">
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
                                  className="px-4 py-3 text-white cursor-pointer hover:bg-primary hover:text-navy-deep transition font-medium"
                                >
                                  {item.strCategory}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="button-primary w-full md:w-auto px-10 h-14 bg-primary text-navy-deep font-bold rounded-xl shadow-lg shadow-primary/20 cursor-pointer hover:scale-[1.02] transition-transform"
                      >
                        Search
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          </>
        )}
      </header>

      {isHome && <div ref={resultsRef} className="h-0" />}
    </>
  );
}
