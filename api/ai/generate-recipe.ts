/**
 * api/ai/generate-recipe.ts
 *
 * Vercel Serverless Function
 * Stack: @ai-sdk/groq + ai (Vercel AI SDK) + Zod generateObject
 *
 * Modelo principal: llama-3.3-70b-versatile
 *   → Reemplazo oficial de llama3-70b-8192 (deprecado el 30/08/2025)
 *   → Soporta structured outputs / json_object mode en Groq
 *
 * Imagen: URL real de TheCocktailDB según categoría del cóctel.
 *   Groq no ofrece generación de imágenes en su free tier.
 *   Usar imágenes reales de la DB garantiza coherencia visual con la app.
 *
 * Rate-limit: Free tier Groq ≈ 30 RPM → backoff exponencial automático.
 *
 * INSTALACIÓN REQUERIDA (una sola vez):
 *   npm install @ai-sdk/groq ai
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

// ─── Groq client (Vercel AI SDK) ──────────────────────────────────────────────

const groqClient = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

// ─── Imagen por categoría — URLs reales de TheCocktailDB ─────────────────────

const CATEGORY_IMAGES: Record<string, string> = {
  cocktail:
    "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg",
  shot:
    "https://www.thecocktaildb.com/images/media/drink/uqwuyp1454514591.jpg",
  "punch / party drink":
    "https://www.thecocktaildb.com/images/media/drink/tquyyt1451299548.jpg",
  "soft drink":
    "https://www.thecocktaildb.com/images/media/drink/2x8thr1504816928.jpg",
  "other/unknown":
    "https://www.thecocktaildb.com/images/media/drink/rhhwmp1493067619.jpg",
};

function getImageForCategory(category: string): string {
  const key = category.toLowerCase().trim();
  return (
    CATEGORY_IMAGES[key] ??
    CATEGORY_IMAGES["cocktail"]
  );
}

// ─── Zod schema de salida estructurada ───────────────────────────────────────

const IngredientSchema = z.object({
  name: z
    .string()
    .describe(
      "Ingredient name as it appears in TheCocktailDB. " +
        "Examples: 'Vodka', 'Angostura bitters', 'Simple syrup', 'Lime juice'.",
    ),
  measure: z
    .string()
    .describe(
      "Precise measure with correct professional bartender units:\n" +
        "- Spirits & liqueurs: oz (e.g. '1.5 oz', '0.75 oz', '0.5 oz')\n" +
        "- Bitters: dashes (e.g. '2 dashes', '3 dashes') — NEVER ounces\n" +
        "- Syrups: oz (e.g. '0.5 oz', '0.25 oz')\n" +
        "- Citrus juice: oz (e.g. '0.75 oz', '1 oz')\n" +
        "- Carbonated mixers: oz (e.g. '2 oz', '3 oz') or 'to fill'\n" +
        "- Garnishes: descriptive (e.g. 'twist', 'wedge', 'sprig')\n" +
        "NEVER use '1 oz' generically for all ingredients.",
    ),
});

const RecipeSchema = z.object({
  strDrink: z
    .string()
    .describe(
      "Creative, evocative cocktail name in Title Case. " +
        "Should reflect dominant flavors, mood, or technique. " +
        "Examples: 'Crimson Dusk', 'The Tokyo Mule', 'Midnight Sour'.",
    ),
  strCategory: z
    .enum(["Cocktail", "Shot", "Punch / Party Drink", "Soft Drink", "Other/Unknown"])
    .describe("The most accurate TheCocktailDB category for this drink."),
  strInstructions: z
    .string()
    .describe(
      "Full professional preparation method as a single paragraph. " +
        "Multiple sentences separated by '. ' (period + space). " +
        "Must include ALL of the following:\n" +
        "1. Glass type and whether to chill it\n" +
        "2. Ice preparation (cubes, crushed, no ice, etc.)\n" +
        "3. Order of adding ingredients to shaker/glass\n" +
        "4. Technique: shake, stir, build, or blend — with duration\n" +
        "5. Straining method if applicable\n" +
        "6. Garnish instruction\n" +
        "7. Serving suggestion\n" +
        "Minimum 5 sentences. Write like a head bartender training a junior. " +
        "Example: 'Chill a Nick & Nora glass in the freezer for 5 minutes. " +
        "Fill a mixing glass two-thirds with large ice cubes. " +
        "Add the gin, dry vermouth, and orange bitters in that order. " +
        "Stir gently with a bar spoon for 30 seconds to dilute and chill without bruising. " +
        "Strain into the chilled glass using a julep strainer. " +
        "Express a lemon twist over the surface and drop it in as garnish.'",
    ),
  ingredients: z
    .array(IngredientSchema)
    .min(2)
    .max(10)
    .describe(
      "Ingredients list. Use ONLY what the user provided, plus basic staples " +
        "(ice, water, a citrus garnish) if appropriate. " +
        "Do NOT introduce alcohol not in the user list. " +
        "Total base spirit should be 1.5–2.5 oz for a standard cocktail.",
    ),
});

// ─── System prompt — persona Marcus, bartender experto ───────────────────────

const SYSTEM_PROMPT = `You are Marcus, a world-class head bartender with 20+ years of experience working at award-winning cocktail bars in New York, London, and Tokyo.

YOUR CRAFT PHILOSOPHY:
- Every cocktail needs perfect balance: spirit, acid, sweetness, and dilution in harmony
- Measures are always precise and realistic:
  * Base spirits: 1.5–2 oz total per cocktail
  * Citrus juice: 0.5–1 oz
  * Sweeteners/syrups: 0.25–0.75 oz
  * Bitters: ALWAYS in dashes (2–5 dashes), NEVER in ounces — this is non-negotiable
  * Carbonated mixers: 2–4 oz or "to fill"
- You write instructions with the precision of a professional training a junior bartender
- You give cocktails evocative, creative names that reflect their character
- You only respond with structured JSON — no prose, no markdown, no explanations outside the JSON

You are responding to a JSON schema. Output ONLY the object the schema expects.`;

// ─── Call con retry para rate limiting ───────────────────────────────────────

async function callGroqWithRetry(
  ingredients: string[],
  attempt = 0,
): Promise<z.infer<typeof RecipeSchema>> {
  try {
    const { object } = await generateObject({
      model: groqClient("llama-3.3-70b-versatile"),
      schema: RecipeSchema,
      system: SYSTEM_PROMPT,
      prompt:
        `A customer has these ingredients available at home: ${ingredients.join(", ")}.\n\n` +
        `Create a balanced, professional cocktail recipe using ONLY those ingredients ` +
        `(you may add ice and a simple garnish like a citrus twist or mint sprig if it fits).\n\n` +
        `Critical reminders:\n` +
        `- Bitters must be measured in dashes, not oz\n` +
        `- Base spirit total: 1.5–2.5 oz maximum\n` +
        `- Instructions: minimum 5 detailed sentences covering glass, ice, technique, and garnish`,
      temperature: 0.65,
      maxOutputTokens: 900,
    });

    return object;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isRateLimit =
      message.includes("429") ||
      message.toLowerCase().includes("rate limit") ||
      message.toLowerCase().includes("too many requests");

    if (isRateLimit && attempt < 2) {
      const backoff = 1500 * Math.pow(2, attempt); // 1.5s → 3s
      await new Promise((r) => setTimeout(r, backoff));
      return callGroqWithRetry(ingredients, attempt + 1);
    }

    throw err;
  }
}

// ─── Response types (compatibles con el slice existente) ─────────────────────

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

function mapToResponse(recipe: z.infer<typeof RecipeSchema>): AIRecipeResponse {
  return {
    recipe: {
      strDrink: recipe.strDrink,
      strDrinkThumb: getImageForCategory(recipe.strCategory),
      strCategory: recipe.strCategory,
      strInstructions: recipe.strInstructions,
      ingredients: recipe.ingredients,
    },
  };
}

// ─── Fallback inteligente — medidas correctas por tipo de ingrediente ─────────

function smartMeasure(ingredient: string): string {
  const lower = ingredient.toLowerCase();
  if (lower.includes("bitters")) return "2 dashes";
  if (lower.includes("syrup") || lower.includes("honey") || lower.includes("agave"))
    return "0.5 oz";
  if (lower.includes("juice") && (lower.includes("lime") || lower.includes("lemon")))
    return "0.75 oz";
  if (lower.includes("juice")) return "1 oz";
  if (
    lower.includes("soda") ||
    lower.includes("tonic") ||
    lower.includes("ginger beer") ||
    lower.includes("cola")
  )
    return "3 oz";
  if (lower.includes("cream") || lower.includes("milk")) return "1 oz";
  if (lower.includes("egg")) return "1 whole";
  if (
    lower.includes("vodka") ||
    lower.includes("gin") ||
    lower.includes("rum") ||
    lower.includes("tequila") ||
    lower.includes("whiskey") ||
    lower.includes("bourbon") ||
    lower.includes("mezcal") ||
    lower.includes("brandy")
  )
    return "1.5 oz";
  if (
    lower.includes("triple sec") ||
    lower.includes("cointreau") ||
    lower.includes("curacao") ||
    lower.includes("kahlua") ||
    lower.includes("amaretto") ||
    lower.includes("aperol") ||
    lower.includes("campari") ||
    lower.includes("vermouth") ||
    lower.includes("limoncello")
  )
    return "0.75 oz";
  return "1 oz";
}

function buildFallback(ingredients: string[]): AIRecipeResponse {
  return {
    recipe: {
      strDrink: "Classic House Mix",
      strDrinkThumb: CATEGORY_IMAGES["cocktail"],
      strCategory: "Cocktail",
      strInstructions:
        "Chill a coupe or martini glass by filling it with ice water for 2 minutes, then discard the water. " +
        "Fill a cocktail shaker two-thirds with fresh ice cubes. " +
        "Add the measured ingredients in order, starting with the non-alcoholic components, then the spirits. " +
        "Seal the shaker and shake vigorously for 15 seconds until the exterior is frosted. " +
        "Double-strain through a fine mesh strainer into the chilled glass. " +
        "Garnish with a citrus twist expressed over the surface if available, and serve immediately.",
      ingredients: ingredients.slice(0, 8).map((name) => ({
        name,
        measure: smartMeasure(name),
      })),
    },
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GROQ_API_KEY) {
    console.error("[generate-recipe] Missing GROQ_API_KEY env variable");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const { ingredients } = (req.body ?? {}) as { ingredients?: unknown };

  if (
    !Array.isArray(ingredients) ||
    ingredients.length === 0 ||
    ingredients.length > 15 ||
    (ingredients as unknown[]).some((i) => typeof i !== "string" || !(i as string).trim())
  ) {
    return res.status(400).json({
      error: "Provide between 1 and 15 non-empty ingredient strings.",
    });
  }

  const sanitized = (ingredients as string[]).map((i) => i.trim());

  try {
    const recipe = await callGroqWithRetry(sanitized);
    const payload = mapToResponse(recipe);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-recipe] Groq error:", message);
    return res.status(200).json(buildFallback(sanitized));
  }
}
