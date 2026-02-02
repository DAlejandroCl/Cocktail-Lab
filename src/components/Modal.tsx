import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAppStore } from "../stores/useAppStore";

export default function Modal() {
  const modal = useAppStore((state) => state.modal);
  const closeModal = useAppStore((state) => state.closeModal);
  const selectedRecipe = useAppStore((state) => state.selectedRecipe);

  const renderIngredients = () => {
    const ingredients = [];
    for (let i = 1; i <= 10; i++) {
      const ingredient = selectedRecipe[`strIngredient${i}` as keyof typeof selectedRecipe];
      const measure = selectedRecipe[`strMeasure${i}` as keyof typeof selectedRecipe];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push(
          <li key={i} className="py-2 px-4 bg-slate-100 rounded-lg">
            <span className="font-semibold text-slate-800">{ingredient}</span>
            {measure && measure.trim() && (
              <span className="text-slate-600"> - {measure}</span>
            )}
          </li>
        );
      }
    }
    return ingredients;
  };

  return (
    <>
      <Transition appear show={modal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-5xl max-h-[95vh] overflow-y-auto">
                  <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 md:top-4 md:right-4 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full p-2 transition shadow-lg z-20"
                    aria-label="Close modal"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-auto md:min-h-[500px]">
                      <img
                        src={selectedRecipe.strDrinkThumb}
                        alt={selectedRecipe.strDrink}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/20 to-transparent" />
                    </div>

                    <div className="p-6 md:p-8 overflow-y-auto">
                      <Dialog.Title as="h2" className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 md:mb-6 pr-12 md:pr-0">
                        {selectedRecipe.strDrink}
                      </Dialog.Title>

                      <div className="mb-6 md:mb-8">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <span className="text-orange-400">🍹</span>
                          Ingredients & Measures
                        </h3>
                        <ul className="space-y-2">
                          {renderIngredients()}
                        </ul>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <span className="text-orange-400">📝</span>
                          Instructions
                        </h3>
                        <p className="text-slate-700 text-sm md:text-base leading-relaxed bg-slate-50 p-4 md:p-6 rounded-lg">
                          {selectedRecipe.strInstructions}
                        </p>
                      </div>

                      <div className="flex justify-center mt-6 md:hidden">
                        <button
                          onClick={closeModal}
                          className="w-full px-8 py-3 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-md"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}