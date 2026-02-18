import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Listbox, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAppStore } from "../stores/useAppStore";

type SearchFilters = {
  ingredient: string;
  category: string;
};

export default function Header() {
  const location = useLocation();
  const resultsRef = useRef<HTMLDivElement>(null);
  const ingredientRef = useRef<HTMLInputElement>(null);

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
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
  const isLoading = useAppStore((state) => state.isLoading);
  const setNotification = useAppStore((state) => state.setNotification);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (drinks?.drinks?.length && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
      resultsRef.current.focus();
    }
  }, [drinks?.drinks?.length]);

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
      setNotification(
        "Please enter an ingredient or select a category.",
        "error",
      );

      ingredientRef.current?.focus();
      return;
    }

    searchRecipes(searchFilters);
  };

  return (
    <>
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-10">
            <Link to="/" className="flex items-center gap-2 group select-none">
              <span className="text-2xl font-bold tracking-tight text-white transition-transform duration-200 group-hover:scale-125">
                Cocktail
                <span className="text-primary font-bold"> Lab</span>
              </span>
            </Link>

            <nav
              className="flex items-center gap-10"
              aria-label="Main navigation"
            >
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
          <div className="min-h-[calc(100vh-110px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-40">
            <div className="max-w-7xl w-full">
              {/* HERO RESTAURADO */}
              <section className="text-center mb-24">
                <h1 className="font-serif text-5xl md:text-7xl text-white mb-10 leading-tight">
                  Discover Your Next <br />
                  <span className="italic text-primary">Signature Drink</span>
                </h1>

                <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                  From timeless classics to bold new mixes.
                </p>
              </section>

              {/* FORM */}
              <section className="relative z-50 mt-12">
                <form
                  onSubmit={handleSubmit}
                  role="search"
                  aria-busy={isLoading}
                >
                  <div className="glass-panel p-3 rounded-2xl flex flex-col md:flex-row items-center gap-3 md:gap-4 shadow-2xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/40">
                    {/* INPUT */}
                    <div className="flex-1 w-full relative md:pr-4 md:border-r md:border-white/10">
                      <label htmlFor="ingredient" className="sr-only">
                        Search cocktails by ingredient
                      </label>

                      <MagnifyingGlassIcon
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                        aria-hidden="true"
                      />

                      <input
                        ref={ingredientRef}
                        type="text"
                        id="ingredient"
                        name="ingredient"
                        value={searchFilters.ingredient}
                        onChange={handleChange}
                        placeholder="Search by ingredients (e.g. Gin, Lime, Mint)"
                        className="w-full bg-transparent text-white pl-12 h-14 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>

                    {/* DROPDOWN */}
                    <div className="w-full md:w-64 relative md:pl-4">
                      <Listbox
                        value={searchFilters.category}
                        onChange={(value) =>
                          setSearchFilters((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <div className="relative">
                          <Listbox.Button className="w-full bg-transparent text-slate-300 h-14 flex items-center justify-between px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
                            <span
                              className={
                                searchFilters.category
                                  ? "text-white"
                                  : "text-slate-400"
                              }
                            >
                              {searchFilters.category || "All Categories"}
                            </span>
                          </Listbox.Button>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-150"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute mt-2 w-full rounded-lg bg-slate-900/95 backdrop-blur-xl shadow-2xl border border-primary/30 max-h-72 overflow-y-auto z-50 focus:outline-none">
                              {categories.map((category) => (
                                <Listbox.Option
                                  key={category}
                                  value={category}
                                  className={({ active }) =>
                                    `px-4 py-3 cursor-pointer font-medium ${
                                      active
                                        ? "bg-primary text-navy-deep"
                                        : "text-white"
                                    }`
                                  }
                                >
                                  {category}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>

                    {/* BUTTON */}
                    <button
                      type="submit"
                      className="w-full md:w-auto md:ml-2 px-10 h-14 bg-primary text-navy-deep font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 hover:brightness-110 hover:shadow-primary/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        )}
      </header>

      {isHome && (
        <div
          ref={resultsRef}
          tabIndex={-1}
          aria-live="polite"
          className="h-0 outline-none"
        />
      )}
    </>
  );
}
