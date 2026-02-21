import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import Modal from "@/components/Modal";
import type { AppState } from "@/stores/useAppStore";
import type { RecipeDetail } from "@/types";

vi.mock("@/stores/useAppStore", () => ({
  useAppStore: vi.fn(),
}));

import { useAppStore } from "@/stores/useAppStore";

/* -------------------- Mocks -------------------- */

const mockCloseModal = vi.fn();
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();
const mockSetNotification = vi.fn();

const mockRecipe: RecipeDetail = {
  idDrink: "123",
  strDrink: "Mojito",
  strDrinkThumb: "https://image.jpg",
  strInstructions: "Add ice. Pour rum. Stir well.",
  strCategory: "Cocktail",

  strIngredient1: "Rum",
  strIngredient2: "Mint",
  strIngredient3: "Lime",
  strIngredient4: null,
  strIngredient5: null,
  strIngredient6: null,
  strIngredient7: null,
  strIngredient8: null,
  strIngredient9: null,
  strIngredient10: null,
  strIngredient11: null,
  strIngredient12: null,
  strIngredient13: null,
  strIngredient14: null,
  strIngredient15: null,

  strMeasure1: "2 oz",
  strMeasure2: "5 leaves",
  strMeasure3: "1 slice",
  strMeasure4: null,
  strMeasure5: null,
  strMeasure6: null,
  strMeasure7: null,
  strMeasure8: null,
  strMeasure9: null,
  strMeasure10: null,
  strMeasure11: null,
  strMeasure12: null,
  strMeasure13: null,
  strMeasure14: null,
  strMeasure15: null,
};

function setupStore(overrides?: Partial<AppState>) {
  const mockedUseAppStore = useAppStore as unknown as Mock;

  const baseState: Partial<AppState> = {
    modal: true,
    selectedRecipe: mockRecipe,
    closeModal: mockCloseModal,
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
    setNotification: mockSetNotification,
    favorites: {},
  };

  mockedUseAppStore.mockImplementation(
    (selector: (state: AppState) => unknown) =>
      selector({ ...baseState, ...overrides } as AppState),
  );
}

/* -------------------- Tests -------------------- */

describe("Modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStore();
  });

  it("does not render if modal is false", () => {
    setupStore({ modal: false });

    const { container } = render(<Modal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders recipe title and image", () => {
    render(<Modal />);

    expect(screen.getByText("Mojito")).toBeInTheDocument();
    expect(
      screen.getByAltText("Image of Mojito cocktail"),
    ).toBeInTheDocument();
  });

  it("renders ingredients correctly", () => {
    render(<Modal />);

    expect(screen.getByText("Rum")).toBeInTheDocument();
    expect(screen.getByText("2 oz")).toBeInTheDocument();

    expect(screen.getByText("Mint")).toBeInTheDocument();
    expect(screen.getByText("5 leaves")).toBeInTheDocument();
  });

  it("renders instructions split into steps", () => {
    render(<Modal />);

    expect(screen.getByText("Add ice.")).toBeInTheDocument();
    expect(screen.getByText("Pour rum.")).toBeInTheDocument();
    expect(screen.getByText("Stir well.")).toBeInTheDocument();
  });

  it("calls closeModal when Close button is clicked", () => {
    render(<Modal />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(mockCloseModal).toHaveBeenCalled();
  });

  it("adds favorite when not already favorite", () => {
    render(<Modal />);

    const favButton = screen.getByRole("button", {
      name: /add to favorites/i,
    });

    fireEvent.click(favButton);

    expect(mockAddFavorite).toHaveBeenCalledWith(mockRecipe);
    expect(mockSetNotification).toHaveBeenCalledWith(
      "Added to favorites",
      "success",
    );
  });

  it("removes favorite when already favorite", () => {
    setupStore({
      favorites: { "123": mockRecipe },
    });

    render(<Modal />);

    const favButton = screen.getByRole("button", {
      name: /remove from favorites/i,
    });

    fireEvent.click(favButton);

    expect(mockRemoveFavorite).toHaveBeenCalledWith("123");
    expect(mockSetNotification).toHaveBeenCalledWith(
      "Removed from favorites",
      "info",
    );
  });
});