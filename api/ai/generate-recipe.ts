import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

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
───────────────────────────────────────────────────────────────────────────── */

function buildPrompt(ingredients: string[]): string {
  return `
You are a professional mixologist AI.

TASK:
Generate a creative cocktail recipe using ONLY these ingredients:
${ingredients.join(", ")}

STRICT RULES:
- Return ONLY valid JSON (no markdown, no text)
- No explanations
- No backticks
- No comments
- Output MUST be parseable JSON

FORMAT:
{
  "recipe": {
    "strDrink": "string",
    "strDrinkThumb": "https://www.thecocktaildb.com/images/media/drink/vrwquq1478252802.jpg",
    "strCategory": "Cocktail",
    "strInstructions": "Step 1. Step 2. Step 3.",
    "ingredients": [
      { "name": "ingredient", "measure": "amount" }
    ]
  }
}
`.trim();
}

/* ─────────────────────────────────────────────────────────────────────────────
   PARSER (LLAMA SAFE)
───────────────────────────────────────────────────────────────────────────── */

function parseAIResponse(raw: string): AIRecipeResponse {
  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed?.recipe) {
      throw new Error("Invalid AI structure");
    }

    return parsed;
  } catch {
    throw new Error("Failed to parse AI response");
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   FALLBACK
───────────────────────────────────────────────────────────────────────────── */

function fallbackRecipe(ingredients: string[]): AIRecipeResponse {
  return {
    recipe: {
      strDrink: "AI Fallback Cocktail",
      strDrinkThumb:
        "https://www.thecocktaildb.com/images/media/drink/vrwquq1478252802.jpg",
      strCategory: "Cocktail",
      strInstructions:
        "Mix all ingredients with ice. Shake well. Serve chilled.",
      ingredients: ingredients.map((i) => ({
        name: i,
        measure: "1 part",
      })),
    },
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   HANDLER
───────────────────────────────────────────────────────────────────────────── */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    res.status(503).json({ error: "AI not configured" });
    return;
  }

  const { ingredients } = req.body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    res.status(400).json({ error: "Invalid ingredients" });
    return;
  }

  const client = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
  });

  try {
    const completion = await client.chat.completions.create({
      model: "llama3-70b-8192",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are a JSON-only API.",
        },
        {
          role: "user",
          content: buildPrompt(ingredients),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "";
    const data = parseAIResponse(raw);

    res.status(200).json(data);
  } catch (error) {
    console.error("Groq error:", error);

    const fallback = fallbackRecipe(ingredients);

    res.status(200).json(fallback);
  }
}