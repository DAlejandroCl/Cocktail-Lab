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
          <div key={i} className="flex justify-between items-center p-4">
            <span className="text-white/80 font-medium">{ingredient}</span>
            <span className="text-primary font-bold text-lg">
              {measure && measure.trim() ? measure : "-"}
            </span>
          </div>
        );
      }
    }
    return ingredients;
  };

  const renderInstructions = () => {
    if (!selectedRecipe.strInstructions) return null;
    
    const steps = selectedRecipe.strInstructions
      .split(/\.\s+/)
      .filter(step => step.trim().length > 0)
      .map(step => step.trim() + (step.endsWith('.') ? '' : '.'));

    return steps.map((step, index) => (
      <div key={index} className="flex gap-4">
        <div 
          className={`flex-none w-8 h-8 rounded-full ${
            index === 0 
              ? 'bg-primary text-navy-deep' 
              : 'bg-primary/20 border border-primary/30 text-primary'
          } flex items-center justify-center text-sm font-bold`}
        >
          {index + 1}
        </div>
        <p className="text-white/70 text-sm leading-relaxed pt-1">{step}</p>
      </div>
    ));
  };

  return (
    <>
      <Transition appear show={modal} as={Fragment}>
        <Dialog as="div" className="relative z-[200]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
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
                  className="w-full max-w-lg sm:rounded-[2rem] overflow-hidden flex flex-col max-h-[94vh] shadow-2xl relative"
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <div className="flex h-8 w-full items-center justify-center sm:hidden">
                    <div className="h-1.5 w-12 rounded-full bg-white/30"></div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white border border-white/20 hover:bg-black/50 active:scale-95 transition-all"
                    aria-label="Close modal"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-4 py-2 sm:px-6 sm:pt-6">
                      <div className="w-full relative overflow-hidden rounded-2xl aspect-[4/3] shadow-2xl border border-white/10">
                        <img
                          alt={selectedRecipe.strDrink}
                          className="absolute inset-0 w-full h-full object-cover"
                          src={selectedRecipe.strDrinkThumb}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                    </div>

                    <div className="px-6 py-6 space-y-8 pb-32">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {selectedRecipe.strCategory && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary text-navy-deep text-[10px] font-bold uppercase tracking-widest shadow-lg">
                              {selectedRecipe.strCategory}
                            </span>
                          )}
                        </div>
                        <Dialog.Title
                          as="h1"
                          className="text-white font-serif text-4xl leading-tight tracking-tight"
                        >
                          {selectedRecipe.strDrink}
                        </Dialog.Title>
                        <p className="text-white/60 text-base italic">
                          A carefully crafted cocktail for the discerning palate.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <h3 className="text-white text-xl font-bold tracking-tight">Ingredients</h3>
                        </div>
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
                          {renderIngredients()}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <h3 className="text-white text-xl font-bold tracking-tight">Instructions</h3>
                        </div>
                        <div className="space-y-6">
                          {renderInstructions()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 flex gap-4"
                    style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)'
                    }}
                  >
                    <button 
                      onClick={closeModal}
                      className="flex-1 h-14 bg-primary hover:bg-orange-500 text-navy-deep font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                      Close
                    </button>
                    <button className="w-14 h-14 bg-slate-800 hover:bg-slate-700 border border-white/20 text-white hover:text-primary rounded-2xl flex items-center justify-center active:scale-[0.98] transition-all shadow-md">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
