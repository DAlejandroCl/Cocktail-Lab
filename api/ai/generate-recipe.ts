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
   CLIENT
───────────────────────────────────────────────────────────────────────────── */

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/* ─────────────────────────────────────────────────────────────────────────────
   PROMPT (STRICT JSON)
───────────────────────────────────────────────────────────────────────────── */

function buildPrompt(ingredients: string[]): string {
  return `
Return ONLY valid JSON.

Create a cocktail using ONLY these ingredients:
${ingredients.join(", ")}

Rules:
- No markdown
- No explanation
- No text outside JSON
- Must be valid JSON

Format:
{
  "recipe": {
    "strDrink": "Name",
    "strDrinkThumb": "https://www.thecocktaildb.com/images/media/drink/tquyyt1451299548.jpg",
    "strCategory": "Cocktail",
    "strInstructions": "Step 1. Step 2. Step 3.",
    "ingredients": [
      { "name": "ingredient", "measure": "amount" }
    ]
  }
}
`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SAFE PARSER
───────────────────────────────────────────────────────────────────────────── */

function safeParse(raw: string): AIRecipeResponse {
  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed?.recipe) {
      throw new Error("Invalid structure");
    }

    return parsed;
  } catch (error) {
    console.error("PARSE ERROR:", error);
    console.error("RAW RESPONSE:", raw);
    throw new Error("Invalid AI response format");
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   FALLBACK
───────────────────────────────────────────────────────────────────────────── */

function fallback(ingredients: string[]): AIRecipeResponse {
  return {
    recipe: {
      strDrink: "Simple Mix",
      strDrinkThumb:
        "https://www.thecocktaildb.com/images/media/drink/tquyyt1451299548.jpg",
      strCategory: "Cocktail",
      strInstructions: "Mix all ingredients. Shake with ice. Serve in a glass.",
      ingredients: ingredients.map((i) => ({
        name: i,
        measure: "to taste",
      })),
    },
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   HANDLER
───────────────────────────────────────────────────────────────────────────── */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("Missing GROQ_API_KEY");
    return res.status(500).json({
      error: "Server misconfiguration: missing API key",
    });
  }

  const { ingredients } = req.body as { ingredients?: string[] };

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "Invalid ingredients" });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "llama3-70b-8192",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: "You ONLY return JSON.",
        },
        {
          role: "user",
          content: buildPrompt(ingredients),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("Empty AI response");
    }

    const parsed = safeParse(raw);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("AI ERROR:", error);

    const data = fallback(ingredients);

    return res.status(200).json(data);
  }
}
