import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

// ─── Groq client ──────────────────────────────────────────────────────────────

const groqClient = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

// ─── TheCocktailDB image resolver ─────────────────────────────────────────────

async function resolveImageFromCocktailDB(slug: string): Promise<string> {
  const FALLBACK =
    "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg";
  try {
    const res = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(slug)}`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as { drinks?: Array<{ strDrinkThumb?: string }> };
    return data.drinks?.[0]?.strDrinkThumb ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
}

// ─── Zod schema ───────────────────────────────────────────────────────────────

const IngredientSchema = z.object({
  name: z
    .string()
    .describe(
      "Ingredient name as in TheCocktailDB. Can be an ingredient NOT in the user list " +
        "if it is needed to balance the cocktail (e.g. 'Angostura bitters', 'Simple syrup', " +
        "'Egg white', 'Salt', 'Mint'). These additions are encouraged.",
    ),
  measure: z
    .string()
    .describe(
      "Precise professional measure:\n" +
        "- Spirits/liqueurs: oz (e.g. '1.5 oz', '0.75 oz')\n" +
        "- Bitters: dashes ONLY (e.g. '2 dashes', '3 dashes') — NEVER oz\n" +
        "- Syrups/sweeteners: oz (e.g. '0.5 oz', '0.25 oz')\n" +
        "- Citrus juice: oz (e.g. '0.75 oz', '1 oz')\n" +
        "- Carbonated mixers: oz or 'to fill' (e.g. '2 oz', 'to fill')\n" +
        "- Egg white: '1 white'\n" +
        "- Garnishes: descriptive ('sprig', 'twist', 'wedge', 'pinch')\n" +
        "NEVER use the same measure for every ingredient.",
    ),
});

const RecipeSchema = z.object({
  strDrink: z
    .string()
    .describe(
      "Creative cocktail name with narrative, elegance, or wit. Title Case. " +
        "FORBIDDEN: 'Classic Mix', 'House Special', 'Simple Cocktail', any generic name. " +
        "GOOD examples: 'Nebulosa de Agave', 'Retorno al Puerto', 'Pulso de Datos', " +
        "'Violeta Imperante', 'El Último Domingo', 'Marea Baja', 'Crepúsculo Ámbar'.",
    ),
  strCategory: z
    .enum(["Cocktail", "Shot", "Punch / Party Drink", "Soft Drink", "Other/Unknown"])
    .describe("Most accurate TheCocktailDB category for this drink."),
  strInstructions: z
    .string()
    .describe(
      "Professional preparation method as a single paragraph of sentences separated by '. '.\n" +
        "The technique MUST match the chemistry of the ingredients:\n" +
        "- If egg white → include DRY SHAKE first (no ice), then wet shake\n" +
        "- If cream/dairy → gentle roll, do not over-shake\n" +
        "- If Old Fashioned-style (spirit + bitters + sugar) → build in glass, slow stir, large ice\n" +
        "- If frutal/juicy → shake hard with ice, double-strain\n" +
        "- If effervescent mixer → build in glass, never shake\n" +
        "- If multiple fresh herbs → muddle first\n" +
        "Always specify: glass type, ice type, order of additions, technique with duration, " +
        "straining method, garnish. Minimum 5 sentences. Write like a head bartender training staff.",
    ),
  ingredients: z
    .array(IngredientSchema)
    .min(3)
    .max(12)
    .describe(
      "Use the user's ingredients as BASE, then ADD complementary ingredients " +
        "needed for proper balance (acid, sweetness, bitterness, body). " +
        "A cocktail without a balancing element is incomplete. " +
        "Total base spirit: 1.5–2.5 oz. Citrus: 0.5–1 oz. Sweetener: 0.25–0.75 oz.",
    ),
  imageSlug: z
    .string()
    .describe(
      "Name of a TheCocktailDB cocktail whose COLOR and VISUAL APPEARANCE closely matches " +
        "the final color of this drink based on its ingredients. " +
        "Think about the dominant color:\n" +
        "- Red/pink (grenadine, strawberry, cranberry) → 'Cosmopolitan' or 'Strawberry Margarita'\n" +
        "- Yellow/golden (citrus, honey, tequila) → 'Margarita' or 'Whiskey Sour'\n" +
        "- Green (mint, cucumber, midori) → 'Mojito' or 'Gimlet'\n" +
        "- Brown/amber (whiskey, rum, cola) → 'Old Fashioned' or 'Manhattan'\n" +
        "- White/frothy (cream, egg white, coconut) → 'Pisco Sour' or 'Clover Club'\n" +
        "- Orange (Aperol, triple sec, orange juice) → 'Aperol Spritz' or 'Tequila Sunrise'\n" +
        "- Clear/blue (gin, vodka, curacao) → 'Martini' or 'Blue Lagoon'\n" +
        "Return ONLY the cocktail name (e.g. 'Mojito', 'Cosmopolitan'). No extra text.",
    ),
});

// ─── System prompt ─────────────────────────────

const SYSTEM_PROMPT = `You are Don Aurelio, a legendary master mixologist with 50 years of experience.
You have worked at the Savoy in London, El Floridita in Havana, and Bar Hemingway in Paris.
Your cocktails have won the World's 50 Best Bars award three times.

YOUR PHILOSOPHY:
1. You NEVER create boring, generic cocktails. Every drink tells a story.
2. You treat the user's ingredients as a STARTING POINT, not a limitation.
   You add balancing elements (bitters, syrups, citrus, botanicals) without being asked.
   A cocktail without acid-sweet-spirit balance is not a cocktail.
3. Your names have SOUL — poetic, geographical, emotional, or playful.
   You never use: "Classic Mix", "House Special", "Simple Cocktail", or any generic name.
4. Your technique adapts to the chemistry: egg whites get a dry shake, cream gets a gentle roll,
   effervescent drinks are built in the glass, spirit-forward drinks are stirred not shaken.
5. You think in COLOR when choosing imageSlug — pick a TheCocktailDB cocktail that would
   look visually similar to the final drink in a glass.

You respond ONLY with the structured JSON object. No prose. No markdown. No explanations.`;

// ─── Retry call ───────────────────────────────────────────────────────────

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
        `A customer has these ingredients available: ${ingredients.join(", ")}.\n\n` +
        `Create a balanced, creative cocktail recipe. Remember:\n` +
        `- Use their ingredients as BASE but add whatever is needed for balance\n` +
        `- Invent a name with character and soul — NO generic names\n` +
        `- Choose a technique that fits the chemistry (dry shake if egg, build if carbonated, etc.)\n` +
        `- Think carefully about imageSlug: what TheCocktailDB drink LOOKS LIKE the final color?`,
      temperature: 0.85,
      maxOutputTokens: 1000,
    });

    return object;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isRateLimit =
      message.includes("429") ||
      message.toLowerCase().includes("rate limit") ||
      message.toLowerCase().includes("too many requests");

    if (isRateLimit && attempt < 2) {
      await new Promise((r) => setTimeout(r, 1500 * Math.pow(2, attempt)));
      return callGroqWithRetry(ingredients, attempt + 1);
    }
    throw err;
  }
}

// ─── Response types ───────────────────────────────────────────────────────────

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

// ─── Smart fallback ─────────────────────────────────────

function smartMeasure(ingredient: string): string {
  const lower = ingredient.toLowerCase();
  if (lower.includes("bitters")) return "2 dashes";
  if (lower.includes("syrup") || lower.includes("honey") || lower.includes("agave")) return "0.5 oz";
  if (lower.includes("lime juice") || lower.includes("lemon juice")) return "0.75 oz";
  if (lower.includes("juice")) return "1 oz";
  if (lower.includes("soda") || lower.includes("tonic") || lower.includes("ginger beer") || lower.includes("cola")) return "to fill";
  if (lower.includes("cream") || lower.includes("milk")) return "1 oz";
  if (lower.includes("egg")) return "1 white";
  if (["vodka","gin","rum","tequila","whiskey","bourbon","mezcal","brandy"].some(s => lower.includes(s))) return "1.5 oz";
  if (["triple sec","cointreau","curacao","kahlua","amaretto","aperol","campari","vermouth","limoncello"].some(s => lower.includes(s))) return "0.75 oz";
  return "1 oz";
}

function buildFallback(ingredients: string[]): AIRecipeResponse {
  return {
    recipe: {
      strDrink: "Solsticio Improvisado",
      strDrinkThumb: "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg",
      strCategory: "Cocktail",
      strInstructions:
        "Chill a coupe glass by filling it with ice water for 2 minutes, then discard. " +
        "Fill a cocktail shaker two-thirds with fresh ice cubes. " +
        "Add the ingredients in order, starting with the non-alcoholic components, then the spirits. " +
        "Shake vigorously for 15 seconds until the exterior is well-frosted. " +
        "Double-strain through a fine mesh strainer into the chilled coupe. " +
        "Express a citrus twist over the surface, run it along the rim, and drop it in as garnish.",
      ingredients: [
        ...ingredients.slice(0, 6).map(name => ({ name, measure: smartMeasure(name) })),
        { name: "Angostura bitters", measure: "2 dashes" },
        { name: "Simple syrup", measure: "0.5 oz" },
      ],
    },
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GROQ_API_KEY) {
    console.error("[generate-recipe] Missing GROQ_API_KEY");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const { ingredients } = (req.body ?? {}) as { ingredients?: unknown };

  if (
    !Array.isArray(ingredients) ||
    ingredients.length === 0 ||
    ingredients.length > 15 ||
    (ingredients as unknown[]).some((i) => typeof i !== "string" || !(i as string).trim())
  ) {
    return res.status(400).json({ error: "Provide between 1 and 15 non-empty ingredient strings." });
  }

  const sanitized = (ingredients as string[]).map((i) => i.trim());

  try {
    const recipe = await callGroqWithRetry(sanitized);

    const strDrinkThumb = await resolveImageFromCocktailDB(recipe.imageSlug);

    const payload: AIRecipeResponse = {
      recipe: {
        strDrink: recipe.strDrink,
        strDrinkThumb,
        strCategory: recipe.strCategory,
        strInstructions: recipe.strInstructions,
        ingredients: recipe.ingredients,
      },
    };

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(payload);
  } catch (err) {
    console.error("[generate-recipe] Error:", err instanceof Error ? err.message : err);
    return res.status(200).json(buildFallback(sanitized));
  }
}