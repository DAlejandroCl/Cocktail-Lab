import { z } from "zod";

const nullableString = z
  .string()
  .trim()
  .min(1)
  .nullable()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : null));

export const CategoriesAPIResponseSchema = z.object({
  drinks: z
    .array(
      z.object({
        strCategory: z.string().trim().min(1),
      })
    )
    .nullable()
    .optional()
    .transform((val) => val ?? []),
});

export const SearchFiltersSchema = z
  .object({
    ingredient: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) => data.ingredient || data.category,
    "At least one filter must be provided"
  );

export const DrinkAPIResponse = z.object({
  idDrink: z.string().trim().min(1),
  strDrink: z.string().trim().min(1),
  strDrinkThumb: z.string().url().or(z.string().trim().min(1)),
  strCategory: z.string().trim().min(1).optional().nullable(),
});

export const DrinksAPIResponse = z.object({
  drinks: z
    .array(DrinkAPIResponse)
    .nullable()
    .optional()
    .transform((val) => val ?? []),
});

export const RecipeAPIResponseSchema = z.object({
  idDrink: z.string().trim().min(1),
  strDrink: z.string().trim().min(1),
  strDrinkThumb: z.string().url().or(z.string().trim().min(1)),
  strInstructions: z.string().trim().min(1),

  strCategory: z.string().trim().min(1).optional().nullable(),

  strIngredient1: nullableString,
  strIngredient2: nullableString,
  strIngredient3: nullableString,
  strIngredient4: nullableString,
  strIngredient5: nullableString,
  strIngredient6: nullableString,
  strIngredient7: nullableString,
  strIngredient8: nullableString,
  strIngredient9: nullableString,
  strIngredient10: nullableString,
  strIngredient11: nullableString,
  strIngredient12: nullableString,
  strIngredient13: nullableString,
  strIngredient14: nullableString,
  strIngredient15: nullableString,

  strMeasure1: nullableString,
  strMeasure2: nullableString,
  strMeasure3: nullableString,
  strMeasure4: nullableString,
  strMeasure5: nullableString,
  strMeasure6: nullableString,
  strMeasure7: nullableString,
  strMeasure8: nullableString,
  strMeasure9: nullableString,
  strMeasure10: nullableString,
  strMeasure11: nullableString,
  strMeasure12: nullableString,
  strMeasure13: nullableString,
  strMeasure14: nullableString,
  strMeasure15: nullableString,
});
