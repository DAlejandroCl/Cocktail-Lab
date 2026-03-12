/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import { server } from "../mocks/server";
import { useAppStore } from "../../src/stores/useAppStore";
import Layout from "../../src/layouts/Layout";
import GenerateAI from "../../src/views/GenerateAI";
import { DEFAULT_AI_RECIPE_RESPONSE } from "../mocks/handlers";

// ─────────────────────────────────────────────
// Render helper
// ─────────────────────────────────────────────

function renderGenerateAI() {
  return render(
    <MemoryRouter initialEntries={["/ai"]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"          element={<div />} />
          <Route path="/favorites" element={<div />} />
          <Route path="/ai"        element={<GenerateAI />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

// ─────────────────────────────────────────────
// Zustand store reset between tests
// ─────────────────────────────────────────────

beforeEach(() => {
  useAppStore.setState({
    aiIngredients:   [],
    generatedRecipe: null,
    isGenerating:    false,
    generationError: null,
    aiRecipes:       [],
  });
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("GenerateAI view", () => {

  // ── Rendering ────────────────────────────────────────────────────────────

  it("renders the page heading", () => {
    renderGenerateAI();
    expect(screen.getByRole("heading", { name: /ai recipe generator/i })).toBeInTheDocument();
  });

  it("renders the ingredient input", () => {
    renderGenerateAI();
    expect(screen.getByPlaceholderText(/search an ingredient/i)).toBeInTheDocument();
  });

  it("renders the Generate Recipe button disabled initially", () => {
    renderGenerateAI();
    expect(screen.getByRole("button", { name: /generate recipe/i })).toBeDisabled();
  });

  // ── Adding ingredients ────────────────────────────────────────────────────

  it("adds an ingredient by pressing Enter", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    const input = screen.getByPlaceholderText(/search an ingredient/i);
    await user.type(input, "Vodka{Enter}");

    expect(screen.getByText("Vodka")).toBeInTheDocument();
  });

  it("clears the input after adding an ingredient", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    const input = screen.getByPlaceholderText(/search an ingredient/i);
    await user.type(input, "Gin{Enter}");

    expect(input).toHaveValue("");
  });

  it("adds an ingredient via the + button", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    const input = screen.getByPlaceholderText(/search an ingredient/i);
    await user.type(input, "Rum");
    await user.click(screen.getByRole("button", { name: /add ingredient/i }));

    expect(screen.getByText("Rum")).toBeInTheDocument();
  });

  it("does not add a duplicate ingredient", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    const input = screen.getByPlaceholderText(/search an ingredient/i);
    await user.type(input, "Tequila{Enter}");
    await user.type(input, "tequila{Enter}");

    const tags = screen.getAllByText(/^tequila$/i);
    expect(tags).toHaveLength(1);
  });

  it("removes an ingredient tag", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    const input = screen.getByPlaceholderText(/search an ingredient/i);
    await user.type(input, "Mezcal{Enter}");

    await user.click(screen.getByRole("button", { name: /remove mezcal/i }));

    expect(screen.queryByText("Mezcal")).not.toBeInTheDocument();
  });

  it("clears all ingredients", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    const input = screen.getByPlaceholderText(/search an ingredient/i);
    await user.type(input, "Vodka{Enter}");
    await user.type(input, "Lime juice{Enter}");

    await user.click(screen.getByRole("button", { name: /clear all/i }));

    expect(screen.queryByText("Vodka")).not.toBeInTheDocument();
    expect(screen.queryByText("Lime juice")).not.toBeInTheDocument();
  });

  // ── Generate button state ─────────────────────────────────────────────────

  it("enables Generate Recipe after adding an ingredient", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    const input = screen.getByPlaceholderText(/search an ingredient/i);
    await user.type(input, "Bourbon{Enter}");

    expect(screen.getByRole("button", { name: /generate recipe/i })).toBeEnabled();
  });

  // ── Full generation flow ──────────────────────────────────────────────────

  it("shows the loading state while generating", async () => {
    server.use(
      http.post("/api/ai/generate-recipe", async () => {
        await new Promise((r) => setTimeout(r, 80));
        return HttpResponse.json(DEFAULT_AI_RECIPE_RESPONSE);
      }),
    );

    const user = userEvent.setup();
    renderGenerateAI();

    const input = screen.getByPlaceholderText(/search an ingredient/i);
    await user.type(input, "Vodka{Enter}");
    await user.click(screen.getByRole("button", { name: /generate recipe/i }));

    expect(screen.getByRole("status", { name: /generating recipe/i })).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.queryByRole("status", { name: /generating recipe/i }),
      ).not.toBeInTheDocument(),
    );
  });

  it("renders the generated recipe card after successful generation", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    const input = screen.getByPlaceholderText(/search an ingredient/i);
    await user.type(input, "Vodka{Enter}");
    await user.click(screen.getByRole("button", { name: /generate recipe/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("article", { name: /generated recipe/i }),
      ).toBeInTheDocument(),
    );

    const card = screen.getByRole("article", { name: /generated recipe/i });

    expect(within(card).getByText(DEFAULT_AI_RECIPE_RESPONSE.recipe.strDrink)).toBeInTheDocument();
    expect(within(card).getByText(/ai created/i)).toBeInTheDocument();
    expect(within(card).getByRole("region", { name: /ingredients/i })).toBeInTheDocument();
    expect(within(card).getByRole("region", { name: /instructions/i })).toBeInTheDocument();
    expect(within(card).getByText(/vodka/i)).toBeInTheDocument();
  });

  it("shows 'Add to Favorites' and 'Save Creation' buttons after generation", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    await user.type(screen.getByPlaceholderText(/search an ingredient/i), "Gin{Enter}");
    await user.click(screen.getByRole("button", { name: /generate recipe/i }));

    await screen.findByRole("article", { name: /generated recipe/i });

    expect(screen.getByRole("button", { name: /add to favorites/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save creation/i })).toBeInTheDocument();
  });

  // ── Error state ───────────────────────────────────────────────────────────

  it("shows an error alert when the API returns 500", async () => {
    server.use(
      http.post("/api/ai/generate-recipe", () =>
        HttpResponse.json({ error: "Server error" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderGenerateAI();

    await user.type(screen.getByPlaceholderText(/search an ingredient/i), "Rum{Enter}");
    await user.click(screen.getByRole("button", { name: /generate recipe/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
  });

  // ── Save to favorites ─────────────────────────────────────────────────────

  it("adds the recipe to favorites and shows a success notification", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    await user.type(screen.getByPlaceholderText(/search an ingredient/i), "Vodka{Enter}");
    await user.click(screen.getByRole("button", { name: /generate recipe/i }));
    await screen.findByRole("article", { name: /generated recipe/i });

    await user.click(screen.getByRole("button", { name: /add to favorites/i }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(/added to favorites/i),
    );

    const { favorites } = useAppStore.getState();
    expect(Object.keys(favorites)).toHaveLength(1);
  });

  // ── Save creation ─────────────────────────────────────────────────────────

  it("saves the recipe to My Creations and disables the button", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    await user.type(screen.getByPlaceholderText(/search an ingredient/i), "Rum{Enter}");
    await user.click(screen.getByRole("button", { name: /generate recipe/i }));
    await screen.findByRole("article", { name: /generated recipe/i });

    await user.click(screen.getByRole("button", { name: /save creation/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /saved/i })).toBeDisabled(),
    );

    expect(useAppStore.getState().aiRecipes).toHaveLength(1);
  });

  // ── Autocomplete ──────────────────────────────────────────────────────────

  it("shows autocomplete suggestions while typing", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    await user.type(screen.getByPlaceholderText(/search an ingredient/i), "Vo");

    expect(
      screen.getByRole("listbox", { name: /ingredient suggestions/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Vodka" })).toBeInTheDocument();
  });

  it("adds a suggestion on click", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    await user.type(screen.getByPlaceholderText(/search an ingredient/i), "Vo");
    await user.click(screen.getByRole("option", { name: "Vodka" }));

    expect(screen.getByText("Vodka")).toBeInTheDocument();
  });

  it("navigates suggestions with arrow keys and selects with Enter", async () => {
    const user = userEvent.setup();
    renderGenerateAI();

    const input = screen.getByPlaceholderText(/search an ingredient/i);
    await user.type(input, "Vo");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(screen.getByText("Vodka")).toBeInTheDocument();
  });
});
