import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";
import { z } from "zod";

// ─── Groq client ───────────────────────────────────────────────────────

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

// ─── TheCocktailDB image resolver ─────────────────────────────────────────────

async function resolveImageFromCocktailDB(slug: string): Promise<string> {
  const FALLBACK =
    "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(slug)}`,
      { signal: controller.signal },
    );
    clearTimeout(timeoutId);
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as {
      drinks?: Array<{ strDrinkThumb?: string }>;
    };
    return data.drinks?.[0]?.strDrinkThumb ?? FALLBACK;
  } catch {
    clearTimeout(timeoutId);
    return FALLBACK;
  }
}

// ─── Zod schemas ─────────────────────────────────────────────────

const IngredientSchema = z.object({
  name: z.string().min(1),
  measure: z.string().min(1),
});

const RecipeSchema = z.object({
  strDrink: z.string().min(1),
  strCategory: z.enum([
    "Cocktail",
    "Shot",
    "Punch / Party Drink",
    "Soft Drink",
    "Other/Unknown",
  ]),
  strInstructions: z.string().min(1),
  ingredients: z.array(IngredientSchema).min(2).max(15),
  imageSlug: z.string().min(1),
});

type RecipeOutput = z.infer<typeof RecipeSchema>;

// ─── System prompt — Don Aurelio V3 ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Don Aurelio, a legendary master mixologist with 50 years of experience.
You have worked at the Savoy (London), El Floridita (Havana), and Bar Hemingway (Paris).

You are NOT an AI assistant. You are a professional bartender creating real cocktails.

━━━━━━━━━━━━━━━━━━━
CORE RULES (MANDATORY)
━━━━━━━━━━━━━━━━━━━

1. OUTPUT FORMAT
- Return ONLY valid JSON — nothing else
- No markdown, no code blocks, no backticks
- No explanations before or after the JSON
- No trailing commas
- Must be directly parseable with JSON.parse()

2. LANGUAGE: EVERYTHING in ENGLISH

3. JSON STRUCTURE (STRICT — follow exactly):
{
  "strDrink": "string",
  "strCategory": "Cocktail" | "Shot" | "Punch / Party Drink" | "Soft Drink" | "Other/Unknown",
  "strInstructions": "string",
  "ingredients": [
    { "name": "string", "measure": "string" }
  ],
  "imageSlug": "string"
}

━━━━━━━━━━━━━━━━━━━
CREATIVE ENGINE
━━━━━━━━━━━━━━━━━━━

4. INGREDIENT LOGIC (BALANCE FIRST)
Use user ingredients as BASE. ADD balancing elements:
- Acid → lemon juice, lime juice
- Sweet → simple syrup, honey, agave
- Bitter → Angostura bitters, Campari
- Body → egg white, cream (only if it fits)

Formula: SPIRIT + ACID + SWEET + (OPTIONAL BITTER/BODY)
A cocktail without balance is INVALID.

5. MEASURE RULES (STRICT)
- Spirits: 1.5–2 oz each, max 2.5 oz total alcohol
- Citrus juice: 0.75 oz
- Syrups: 0.5 oz
- Bitters: 2 dashes (NEVER oz — NEVER "1 oz" for bitters)
- Egg white: 1 white
- Carbonated mixers: to fill
- NEVER use "1 oz" for every single ingredient

6. INSTRUCTIONS (MANDATORY QUALITY)
Single paragraph, minimum 5 sentences, separated by ". "
Must include in order:
1. Glass type (first sentence)
2. Ice preparation
3. Order of ingredients added
4. Technique + duration (ADAPT: dry shake for egg white; build for carbonation; stir for spirit-forward; shake+double strain for citrus)
5. Straining method
6. Garnish

7. NAMING RULES
Title Case, unique, creative, with narrative or personality.
GOOD: "Crimson Tide Reverie", "Cartagena Sunset", "Last Train Home"
FORBIDDEN: "Classic Mix", "House Special", "Simple Cocktail", generic names

8. imageSlug
A real TheCocktailDB drink name that LOOKS like the final drink color:
- Red/pink → "Cosmopolitan"
- Yellow → "Margarita"
- Green → "Mojito"
- Brown → "Old Fashioned"
- White/foamy → "Pisco Sour"
- Orange → "Tequila Sunrise"
- Clear → "Martini"
Return only the cocktail name.

━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━
Before responding verify:
- Output is pure JSON (no markdown, no backticks)
- Name is creative (not generic)
- Measures are varied and realistic
- Instructions ≥ 5 sentences with correct technique
- Cocktail is balanced

Return ONLY the JSON object.`;

// ─── Groq API Call using object mode ──────────────────────────────

async function callGroq(ingredients: string[], attempt = 0): Promise<RecipeOutput> {
  const userPrompt =
    `A customer has these ingredients available:\n\n` +
    `${ingredients.join(", ")}\n\n` +
    `Create a balanced, professional, and original cocktail recipe following ALL rules.\n` +
    `Return ONLY the JSON object — no markdown, no backticks, no extra text.`;

  let rawContent = "";

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    rawContent = completion.choices[0]?.message?.content ?? "";

    if (!rawContent) {
      throw new Error("Empty response from Groq");
    }

    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed: unknown = JSON.parse(cleaned);

    const result = RecipeSchema.safeParse(parsed);

    if (!result.success) {
      console.error(
        `[generate-recipe] Zod validation failed (attempt ${attempt + 1}):`,
        result.error.flatten(),
      );
      throw new Error(`Schema validation failed: ${result.error.message}`);
    }

    return result.data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    console.error(
      `[generate-recipe] Attempt ${attempt + 1} failed:`,
      message,
    );

    if (rawContent) {
      console.error("[generate-recipe] Raw content was:", rawContent.slice(0, 500));
    }

    const isRateLimit =
      message.includes("429") ||
      message.toLowerCase().includes("rate limit") ||
      message.toLowerCase().includes("too many requests");

    if (isRateLimit && attempt < 2) {
      const backoff = 1500 * Math.pow(2, attempt);
      console.warn(`[generate-recipe] Rate limited — retrying in ${backoff}ms`);
      await new Promise((r) => setTimeout(r, backoff));
      return callGroq(ingredients, attempt + 1);
    }

    if (
      message.includes("Schema validation failed") ||
      message.includes("JSON.parse") ||
      message.includes("Unexpected token")
    ) {
      if (attempt < 1) {
        console.warn("[generate-recipe] Parse/validation error — retrying once");
        return callGroq(ingredients, attempt + 1);
      }
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

// ─── Smart fallback ───────────────────────────────────────────────────────────

function smartMeasure(ingredient: string): string {
  const lower = ingredient.toLowerCase();
  if (lower.includes("bitters")) return "2 dashes";
  if (lower.includes("syrup") || lower.includes("honey") || lower.includes("agave")) return "0.5 oz";
  if (lower.includes("lime juice") || lower.includes("lemon juice")) return "0.75 oz";
  if (lower.includes("juice")) return "1 oz";
  if (lower.includes("soda") || lower.includes("tonic") || lower.includes("ginger beer") || lower.includes("cola")) return "to fill";
  if (lower.includes("cream") || lower.includes("milk")) return "1 oz";
  if (lower.includes("egg")) return "1 white";
  if (["vodka", "gin", "rum", "tequila", "whiskey", "bourbon", "mezcal", "brandy"].some((s) => lower.includes(s))) return "1.5 oz";
  if (["triple sec", "cointreau", "curacao", "kahlua", "amaretto", "aperol", "campari", "vermouth", "limoncello"].some((s) => lower.includes(s))) return "0.75 oz";
  return "1 oz";
}

function buildFallback(ingredients: string[]): AIRecipeResponse {
  return {
    recipe: {
      strDrink: "Solsticio Improvisado",
      strDrinkThumb:
        "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg",
      strCategory: "Cocktail",
      strInstructions:
        "Chill a coupe glass by filling it with ice water for 2 minutes, then discard. " +
        "Fill a cocktail shaker two-thirds with fresh ice cubes. " +
        "Add the ingredients in order, starting with the non-alcoholic components, then the spirits. " +
        "Shake vigorously for 15 seconds until the exterior is well-frosted. " +
        "Double-strain through a fine mesh strainer into the chilled coupe. " +
        "Express a citrus twist over the surface, run it along the rim, and drop it in as garnish.",
      ingredients: [
        ...ingredients.slice(0, 6).map((name) => ({
          name,
          measure: smartMeasure(name),
        })),
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
    (ingredients as unknown[]).some(
      (i) => typeof i !== "string" || !(i as string).trim(),
    )
  ) {
    return res.status(400).json({
      error: "Provide between 1 and 15 non-empty ingredient strings.",
    });
  }

  const sanitized = (ingredients as string[]).map((i) => i.trim());

  try {
    const recipe = await callGroq(sanitized);
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
    console.error(
      "[generate-recipe] Unrecoverable — using fallback:",
      err instanceof Error ? err.message : err,
    );
    return res.status(200).json(buildFallback(sanitized));
  }
}
