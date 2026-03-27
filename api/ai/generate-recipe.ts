import { GoogleGenerativeAI } from "@google/generative-ai";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */

interface RequestBody {
  ingredients: string[];
}

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
   Vercel Edge Function — runs on the server, API key never reaches the client.
───────────────────────────────────────────────────────────────────────────── */

export default async function handler(req: Request): Promise<Response> {
  // ── Method guard ────────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── API key guard ───────────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return new Response(
      JSON.stringify({ error: "AI service is not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── Parse & validate body ───────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!validateIngredients(body.ingredients)) {
    return new Response(
      JSON.stringify({
        error:
          "Invalid ingredients. Provide between 1 and 10 non-empty strings.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
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

    const result = await model.generateContent(buildPrompt(body.ingredients));
    const raw = result.response.text();

    const data = parseGeminiResponse(raw);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown AI error";
    console.error("Gemini API error:", message);

    return new Response(
      JSON.stringify({ error: `Generation failed: ${message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
