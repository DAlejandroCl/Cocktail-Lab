import { z } from "zod";

const shortText = z.string().max(100);

/**
 * Shape of the optional `previousRecipe` sent when re-crafting. Only the
 * fields used to build the prompt are validated and kept; everything else
 * (image URLs, timestamps…) is stripped.
 */
const ingredientFields = Object.fromEntries(
  Array.from({ length: 15 }, (_, i) => i + 1).flatMap((n) => [
    [`strIngredient${n}`, shortText.nullish()],
    [`strMeasure${n}`, shortText.nullish()],
  ]),
) as Record<string, z.ZodOptional<z.ZodNullable<z.ZodString>>>;

export const PreviousRecipeSchema = z.object({
  strDrink: shortText.optional(),
  strInstructions: z.string().max(3000).optional(),
  ...ingredientFields,
});

export const RequestBodySchema = z.object({
  ingredients: z
    .array(z.string().trim().min(1).max(100))
    .min(1)
    .max(15),
  previousRecipe: PreviousRecipeSchema.nullish(),
});

export type PreviousRecipe = z.infer<typeof PreviousRecipeSchema>;
