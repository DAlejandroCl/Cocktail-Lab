import type { Drink } from "../types";
import type { FavoriteOrder } from "../stores/favoritesSlice";

/* ─────────────────────────────────────────────────────────────
   SORT OPTIONS
───────────────────────────────────────────────────────────── */

export type SortOption =
  | "default"
  | "name-asc"
  | "name-desc"
  | "category-asc";

export type SortOptionFavorites =
  | "recently-added"
  | "name-asc"
  | "name-desc"
  | "category-asc";

export interface SortOptionConfig<T extends string> {
  value: T;
  label: string;
}

export const SORT_OPTIONS: SortOptionConfig<SortOption>[] = [
  { value: "default",       label: "Default"    },
  { value: "name-asc",      label: "A → Z"      },
  { value: "name-desc",     label: "Z → A"      },
  { value: "category-asc",  label: "Category"   },
];

export const SORT_OPTIONS_FAVORITES: SortOptionConfig<SortOptionFavorites>[] = [
  { value: "recently-added", label: "Recent"   },
  { value: "name-asc",       label: "A → Z"    },
  { value: "name-desc",      label: "Z → A"    },
  { value: "category-asc",   label: "Category" },
];

/* ─────────────────────────────────────────────────────────────
   SORT FUNCTION
───────────────────────────────────────────────────────────── */

export function sortDrinks<T extends Drink>(
  drinks: T[],
  option: SortOption,
): T[] {
  const sorted = [...drinks];

  switch (option) {
    case "name-asc":
      return sorted.sort((a, b) =>
        a.strDrink.localeCompare(b.strDrink),
      );
    case "name-desc":
      return sorted.sort((a, b) =>
        b.strDrink.localeCompare(a.strDrink),
      );
    case "category-asc":
      return sorted.sort((a, b) => {
        const catA = a.strCategory ?? "";
        const catB = b.strCategory ?? "";
        return catA.localeCompare(catB) || a.strDrink.localeCompare(b.strDrink);
      });
    case "default":
    default:
      return sorted;
  }
}

/* ─────────────────────────────────────────────────────────────
   SORT FUNCTION — Favorites variant
───────────────────────────────────────────────────────────── */

export function sortFavorites<T extends Drink>(
  drinks: T[],
  option: SortOptionFavorites,
  order: FavoriteOrder,
): T[] {
  const sorted = [...drinks];

  switch (option) {
    case "recently-added":
      return sorted.sort(
        (a, b) => (order[b.idDrink] ?? 0) - (order[a.idDrink] ?? 0),
      );
    case "name-asc":
      return sorted.sort((a, b) =>
        a.strDrink.localeCompare(b.strDrink),
      );
    case "name-desc":
      return sorted.sort((a, b) =>
        b.strDrink.localeCompare(a.strDrink),
      );
    case "category-asc":
      return sorted.sort((a, b) => {
        const catA = a.strCategory ?? "";
        const catB = b.strCategory ?? "";
        return catA.localeCompare(catB) || a.strDrink.localeCompare(b.strDrink);
      });
    default:
      return sorted;
  }
}
