import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useRef } from "react";
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

  const renderIngredients = () => {
    const items = [];

    for (let i = 1; i <= 10; i++) {
      const ingredient =
        selectedRecipe[`strIngredient${i}` as keyof typeof selectedRecipe];

      const measure =
        selectedRecipe[`strMeasure${i}` as keyof typeof selectedRecipe];

      if (ingredient && ingredient.trim()) {
        items.push(
          <li
            key={i}
            className="grid grid-cols-[auto_minmax(120px,180px)] gap-4 p-4 items-start"
          >
            <span className="font-medium text-white/80 whitespace-nowrap">
              {ingredient}
            </span>

            <span className="text-primary font-semibold text-sm leading-tight text-right wrap-break-word">
              {measure && measure.trim() ? measure : "-"}
            </span>
          </li>,
        );
      }
    }

    return (
      <ul className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
        {items}
      </ul>
    );
  };

  const renderInstructions = () => {
    if (!selectedRecipe.strInstructions) return null;

    const steps = selectedRecipe.strInstructions
      .split(/\.\s+/)
      .filter((step) => step.trim().length > 0)
      .map((step) => step.trim() + (step.endsWith(".") ? "" : "."));

    return (
      <ol className="space-y-6">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4">
            <span
              aria-hidden="true"
              className={`flex-none w-8 h-8 rounded-full ${
                index === 0
                  ? "bg-primary text-navy-deep"
                  : "bg-primary/20 border border-primary/30 text-primary"
              } flex items-center justify-center text-sm font-bold`}
            >
              {index + 1}
            </span>

            <p className="text-white/70 text-sm leading-relaxed pt-1">{step}</p>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
              aria-hidden="true"
            />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-lg sm:rounded-4xl overflow-hidden flex flex-col max-h-[94vh] shadow-2xl relative"
                  aria-labelledby="modal-title"
                  aria-describedby="modal-description"
                  style={{
                    background: "rgba(15, 23, 42, 0.75)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={closeModal}
                    className="absolute top-4 right-4 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white border border-white/20 hover:bg-black/50 active:scale-95 transition-all"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-4 py-2 sm:px-6 sm:pt-6">
                      <div className="w-full relative overflow-hidden rounded-2xl aspect-4/3 shadow-2xl border border-white/10">
                        <img
                          alt={`Image of ${selectedRecipe.strDrink} cocktail`}
                          className="absolute inset-0 w-full h-full object-cover"
                          src={selectedRecipe.strDrinkThumb}
                        />
                        <div
                          className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    <div className="px-6 py-6 space-y-8 pb-32">
                      <div className="space-y-3">
                        <Dialog.Title
                          id="modal-title"
                          as="h1"
                          className="text-white font-serif text-4xl leading-tight tracking-tight"
                        >
                          {selectedRecipe.strDrink}
                        </Dialog.Title>

                        <Dialog.Description
                          id="modal-description"
                          as="p"
                          className="text-white/60 text-base italic"
                        >
                          A carefully crafted cocktail for the discerning
                          palate.
                        </Dialog.Description>
                      </div>

                      <section aria-labelledby="ingredients-heading">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <svg
                              className="w-5 h-5 text-primary"
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

                            <h3
                              id="ingredients-heading"
                              className="text-white text-xl font-bold tracking-tight"
                            >
                              Ingredients
                            </h3>
                          </div>

                          {renderIngredients()}
                        </div>
                      </section>

                      <section aria-labelledby="instructions-heading">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <svg
                              className="w-5 h-5 text-primary"
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

                            <h3
                              id="instructions-heading"
                              className="text-white text-xl font-bold tracking-tight"
                            >
                              Instructions
                            </h3>
                          </div>

                          {renderInstructions()}
                        </div>
                      </section>
                    </div>
                  </div>

                  <div
                    className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 flex gap-4"
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={closeModal}
                      className="button-primary flex-1 h-14 bg-primary text-navy-deep font-bold rounded-2xl shadow-lg shadow-primary/20"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={handleFavoriteClick}
                      aria-pressed={isFavorite}
                      aria-label={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      className={`favorite-button w-14 h-14 rounded-2xl border border-white/20 flex items-center justify-center shadow-md ${
                        isFavorite ? "is-active" : ""
                      } ${isAnimating ? "animate-heart-pop" : ""}`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill={isFavorite ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={2}
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fb923c;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}
