import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */

interface AIIngredient {
  name: string;
  measure: string;
}

interface AIRecipeResponse {
  recipe: {
    strDrink: string;
    strDrinkThumb: string;
    strCategory: string;
    strInstructions: string;
    ingredients: AIIngredient[];
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROMPT
   - Forces strict JSON output (no markdown fences)
   - Restricts to provided ingredients only
   - Matches the AIRecipeResponse shape expected by generateAISlice.ts
───────────────────────────────────────────────────────────────────────────── */

function buildPrompt(ingredients: string[]): string {
  return `
You are a professional mixologist. Create a unique, creative cocktail recipe
using ONLY these ingredients (you may assume water, ice, and common garnishes
like lime wedge or mint are available as extras):
${ingredients.join(", ")}

Rules:
- The cocktail name must be original and creative (not a real existing cocktail).
- Instructions must be clear, step-by-step, in a single string separated by periods.
- Use a real cocktail image URL from thecocktaildb.com as placeholder thumbnail.
- Respond ONLY with a single valid JSON object. No markdown, no code fences,
  no explanation before or after. The JSON must exactly match this shape:

{
  "recipe": {
    "strDrink": "Name of the cocktail",
    "strDrinkThumb": "https://www.thecocktaildb.com/images/media/drink/tquyyt1451299548.jpg",
    "strCategory": "Cocktail",
    "strInstructions": "Step one. Step two. Step three.",
    "ingredients": [
      { "name": "ingredient name", "measure": "amount with unit" }
    ]
  }
}
`.trim();
}

/* ─────────────────────────────────────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────────────────────────────────────── */

function validateIngredients(ingredients: unknown): ingredients is string[] {
  return (
    Array.isArray(ingredients) &&
    ingredients.length > 0 &&
    ingredients.length <= 10 &&
    ingredients.every(
      (i) => typeof i === "string" && i.trim().length > 0 && i.length <= 50,
    )
  );
}

function parseGeminiResponse(raw: string): AIRecipeResponse {
  // Strip markdown code fences if Gemini adds them despite instructions
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  const parsed = JSON.parse(cleaned) as unknown;

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("recipe" in parsed)
  ) {
    throw new Error("Invalid response shape from AI");
  }

  return parsed as AIRecipeResponse;
}

/* ─────────────────────────────────────────────────────────────────────────────
   HANDLER
   Vercel Node.js Function — runs on the server, the API key never reaches
   the client bundle. Uses VercelRequest/VercelResponse (Node.js HTTP types)
   instead of the Web Fetch API, which is what Vercel provides by default
   for files inside /api/.
───────────────────────────────────────────────────────────────────────────── */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  // ── Method guard ────────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // ── API key guard ───────────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    res.status(503).json({ error: "AI service is not configured" });
    return;
  }

  // ── Validate body ───────────────────────────────────────────────────────────
  // Vercel parses JSON bodies automatically when Content-Type is application/json
  const { ingredients } = req.body as { ingredients?: unknown };

  if (!validateIngredients(ingredients)) {
    res.status(400).json({
      error: "Invalid ingredients. Provide between 1 and 10 non-empty strings.",
    });
    return;
  }

  // ── Call Gemini ─────────────────────────────────────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        // Lower temperature = more consistent JSON output
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    const result = await model.generateContent(buildPrompt(ingredients));
    const raw = result.response.text();
    const data = parseGeminiResponse(raw);

    res.status(200).json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown AI error";
    console.error("Gemini API error:", message);
    res.status(500).json({ error: `Generation failed: ${message}` });
  }
}
