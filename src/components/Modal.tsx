import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useAppStore } from "../stores/useAppStore";
import {
  selectModal,
  selectCloseModal,
  selectSelectedRecipe,
  selectAddFavorite,
  selectRemoveFavorite,
  selectSetNotification,
  selectIsFavorite,
} from "../stores/selectors";

/* ─────────────────────────────────────────────────────────────
   INGREDIENT ROW
───────────────────────────────────────────────────────────── */

function IngredientRow({
  ingredient,
  measure,
}: {
  ingredient: string;
  measure: string | null | undefined;
}) {
  return (
    <li
      className="flex items-center justify-between px-4 py-3 gap-4"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {ingredient}
      </span>
      <span
        className="text-sm font-bold shrink-0"
        style={{ color: "var(--color-brand)" }}
      >
        {measure?.trim() || "–"}
      </span>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP ROW
───────────────────────────────────────────────────────────── */

function StepRow({
  step,
  index,
}: {
  step: string;
  index: number;
}) {
  return (
    <li className="flex gap-4">
      <span
        className="flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
        aria-hidden="true"
        style={
          index === 0
            ? {
                background: "var(--color-brand)",
                color: "#ffffff",
              }
            : {
                background: "rgba(242, 127, 13, 0.12)",
                border: "1px solid rgba(242, 127, 13, 0.3)",
                color: "var(--color-brand)",
              }
        }
      >
        {index + 1}
      </span>
      <p
        className="text-sm leading-relaxed pt-0.5"
        style={{ color: "var(--text-secondary)" }}
      >
        {step}
      </p>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN MODAL
───────────────────────────────────────────────────────────── */

export default function Modal() {
  const modal = useAppStore(selectModal);
  const closeModal = useAppStore(selectCloseModal);
  const selectedRecipe = useAppStore(selectSelectedRecipe);
  const addFavorite = useAppStore(selectAddFavorite);
  const removeFavorite = useAppStore(selectRemoveFavorite);
  const setNotification = useAppStore(selectSetNotification);

  const [isAnimating, setIsAnimating] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const recipeId = selectedRecipe?.idDrink ?? "";
  const isFavorite = useAppStore(selectIsFavorite(recipeId));

  if (!modal || !selectedRecipe) return null;

  const handleFavoriteClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
    if (isFavorite) {
      removeFavorite(recipeId);
      setNotification("Removed from favorites", "info");
    } else {
      addFavorite(selectedRecipe);
      setNotification("Added to favorites", "success");
    }
  };

  const ingredients = Array.from({ length: 15 }, (_, i) => {
    const n = i + 1;
    const ingredient =
      selectedRecipe[`strIngredient${n}` as keyof typeof selectedRecipe];
    const measure =
      selectedRecipe[`strMeasure${n}` as keyof typeof selectedRecipe];
    return ingredient && String(ingredient).trim()
      ? { ingredient: String(ingredient), measure: measure as string | null }
      : null;
  }).filter(Boolean) as { ingredient: string; measure: string | null }[];

  const steps = selectedRecipe.strInstructions
    ? selectedRecipe.strInstructions
        .split(/\.\s+/)
        .filter((s) => s.trim().length > 0)
        .map((s) => s.trim() + (s.endsWith(".") ? "" : "."))
    : [];

  return (
    <Transition appear show={modal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-200"
        onClose={closeModal}
        initialFocus={closeButtonRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0"
            aria-hidden="true"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(10px)",
            }}
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full sm:max-w-lg relative flex flex-col overflow-hidden sm:rounded-2xl"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-card)",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
                  maxHeight: "94vh",
                }}
              >
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeModal}
                  className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#ffffff",
                  }}
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-4 h-4" aria-hidden="true" />
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <img
                      src={selectedRecipe.strDrinkThumb}
                      alt={`${selectedRecipe.strDrink} cocktail`}
                      className="w-full h-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
                      }}
                    />

                    {selectedRecipe.strCategory && (
                      <span
                        className="absolute bottom-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{
                          background: "var(--color-brand)",
                          color: "#ffffff",
                        }}
                      >
                        {selectedRecipe.strCategory}
                      </span>
                    )}
                  </div>

                  <div className="px-6 py-6 space-y-8 pb-32">
                    <div>
                      <Dialog.Title
                        as="h2"
                        className="font-serif text-3xl font-bold leading-tight"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {selectedRecipe.strDrink}
                      </Dialog.Title>
                      <p
                        className="text-sm italic mt-1.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        A carefully crafted cocktail for the discerning palate.
                      </p>
                    </div>

                    <section aria-labelledby="modal-ingredients-heading">
                      <h3
                        id="modal-ingredients-heading"
                        className="text-base font-bold mb-4 flex items-center gap-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <svg
                          className="w-4 h-4"
                          style={{ color: "var(--color-brand)" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Ingredients
                      </h3>

                      <ul
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: "var(--bg-subtle)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {ingredients.map(({ ingredient, measure }) => (
                          <IngredientRow
                            key={ingredient}
                            ingredient={ingredient}
                            measure={measure}
                          />
                        ))}
                      </ul>
                    </section>

                    {steps.length > 0 && (
                      <section aria-labelledby="modal-instructions-heading">
                        <h3
                          id="modal-instructions-heading"
                          className="text-base font-bold mb-4 flex items-center gap-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <svg
                            className="w-4 h-4"
                            style={{ color: "var(--color-brand)" }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          Instructions
                        </h3>

                        <ol className="space-y-5">
                          {steps.map((step, i) => (
                            <StepRow key={i} step={step} index={i} />
                          ))}
                        </ol>
                      </section>
                    )}
                  </div>
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-4"
                  style={{
                    background: "var(--bg-overlay)",
                    backdropFilter: "blur(16px)",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-brand flex-1 h-12 rounded-xl"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handleFavoriteClick}
                    aria-pressed={isFavorite}
                    aria-label={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                    className={`favorite-btn w-12 h-12 rounded-xl ${isFavorite ? "is-active" : ""} ${isAnimating ? "scale-110" : ""}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isFavorite ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={isFavorite ? 0 : 2}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
