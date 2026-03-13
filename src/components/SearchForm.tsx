import { useRef, useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useAppStore } from "../stores/useAppStore";
import { selectSetNotification } from "../stores/selectors";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

export interface SearchFilters {
  ingredient: string;
  category: string;
}

interface SearchFormProps {
  categories: string[];
  isLoading: boolean;
  onSubmit: (filters: SearchFilters) => void;
  /** When provided, a successful search will smooth-scroll to this element */
  resultsRef?: React.RefObject<HTMLElement | null>;
}

/* ─────────────────────────────────────────────────────────────
   CLEAR BUTTON
   State-driven fill animation — no imperative DOM manipulation.
   Fill layer is a real <span> controlled by hovered/pressed state.
───────────────────────────────────────────────────────────── */

function ClearButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isHovered = hovered && !disabled;
  const isPressed = pressed && !disabled;

  // Derive visual state
  const bg     = isHovered ? "#f27f0d" : "transparent";
  const border = isHovered ? "#f27f0d" : "rgba(242,127,13,0.35)";
  const shadow = isHovered && !isPressed ? "0 4px 16px rgba(242,127,13,0.3)" : "none";
  const iconColor = isHovered ? "#ffffff" : "#f27f0d";
  const scale  = isPressed ? "scale(0.93)" : "scale(1)";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Clear search filters"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        width:          "3rem",
        height:         "3rem",
        flexShrink:     0,
        borderRadius:   "0.75rem",
        border:         `1.5px solid ${border}`,
        background:     bg,
        cursor:         disabled ? "not-allowed" : "pointer",
        opacity:        disabled ? 0.35 : 1,
        boxShadow:      shadow,
        transform:      scale,
        transition:     "background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, transform 0.12s ease",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          position:       "relative",
          width:          "1.25rem",
          height:         "1.25rem",
          color:          iconColor,
          transition:     "color 0.18s ease",
        }}
      >
        <FunnelIcon style={{ width: "1.25rem", height: "1.25rem" }} />
        <XMarkIcon
          style={{
            position:    "absolute",
            bottom:      "-2px",
            right:       "-4px",
            width:       "0.75rem",
            height:      "0.75rem",
            strokeWidth: 3,
          }}
        />
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   SEARCH FORM
───────────────────────────────────────────────────────────── */

export default function SearchForm({
  categories,
  isLoading,
  onSubmit,
  resultsRef,
}: SearchFormProps) {
  const ingredientRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    ingredient: "",
    category: "",
  });
  const setNotification = useAppStore(selectSetNotification);

  const hasFilters = filters.ingredient.trim() !== "" || filters.category !== "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({ ingredient: "", category: "" });
    ingredientRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!filters.ingredient && !filters.category) {
      setNotification(
        "Please enter an ingredient or select a category.",
        "error",
      );
      ingredientRef.current?.focus();
      return;
    }
    onSubmit(filters);
    resultsRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <form onSubmit={handleSubmit} role="search" aria-busy={isLoading}>
      <div
        className="glass-panel rounded-2xl p-1.5 flex flex-col sm:flex-row items-stretch gap-1.5"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}
      >
        {/* ── Text input ── */}
        <div className="flex-1 relative flex items-center">
          <MagnifyingGlassIcon
            className="absolute left-4 w-4 h-4 pointer-events-none shrink-0"
            style={{ color: "var(--text-muted)" }}
            aria-hidden="true"
          />
          <label htmlFor="ingredient" className="sr-only">
            Search cocktails by ingredient
          </label>
          <input
            ref={ingredientRef}
            id="ingredient"
            name="ingredient"
            type="text"
            value={filters.ingredient}
            onChange={handleChange}
            placeholder="Search by ingredient (e.g. Gin, Rum, Lime)"
            className="search-input pl-11 pr-4 h-12 rounded-xl"
          />
        </div>

        {/* ── Divider ── */}
        <div
          className="hidden sm:block w-px self-stretch my-1.5"
          style={{ background: "var(--border-subtle)" }}
          aria-hidden="true"
        />

        {/* ── Category dropdown (custom Listbox) ── */}
        <div className="relative sm:w-48">
          <Listbox
            value={filters.category}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, category: value }))
            }
          >
            <Listbox.Button
              className="w-full h-12 flex items-center justify-between px-4 rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              style={{
                background: "transparent",
                color: filters.category
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
              }}
            >
              <span className="text-sm truncate">
                {filters.category || "All Categories"}
              </span>
              <ChevronDownIcon
                className="w-4 h-4 ml-2 shrink-0"
                style={{ color: "var(--text-muted)" }}
                aria-hidden="true"
              />
            </Listbox.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className="absolute mt-2 w-full rounded-xl overflow-hidden z-50 focus:outline-none custom-scrollbar"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                  maxHeight: "16rem",
                  overflowY: "auto",
                }}
              >
                <Listbox.Option value="" as={Fragment}>
                  {({ active }) => (
                    <li
                      className="px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors duration-100"
                      style={{
                        background: active ? "var(--color-brand)" : "transparent",
                        color: active ? "#ffffff" : "var(--text-secondary)",
                      }}
                    >
                      All Categories
                    </li>
                  )}
                </Listbox.Option>

                {categories.map((cat) => (
                  <Listbox.Option key={cat} value={cat} as={Fragment}>
                    {({ active }) => (
                      <li
                        className="px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors duration-100"
                        style={{
                          background: active ? "var(--color-brand)" : "transparent",
                          color: active ? "#ffffff" : "var(--text-primary)",
                        }}
                      >
                        {cat}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </Listbox>
        </div>

        {/* ── Divider (before action buttons) ── */}
        <div
          className="hidden sm:block w-px self-stretch my-1.5"
          style={{ background: "var(--border-subtle)" }}
          aria-hidden="true"
        />

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-brand h-12 px-6 sm:px-7 rounded-xl shrink-0"
        >
          <SparklesIcon className="w-4 h-4" aria-hidden="true" />
          Search
        </button>

        {/* ── Clear — always visible, disabled when no filters ── */}
        <ClearButton disabled={!hasFilters} onClick={handleClear} />
      </div>
    </form>
  );
}
