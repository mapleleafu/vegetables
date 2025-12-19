import { z } from "zod";
import { LANGUAGE_CODES } from "@/types/language";

const translationSchema = z.object({
  languageCode: z.enum(LANGUAGE_CODES),
  text: z.string().min(1, "Translation text is required"),
  audioUrl: z.string().url("Invalid audio URL").nullish().or(z.literal("")),
});

export const createWordSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().nullish(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  image: z.string().url("Invalid image URL").nullish().or(z.literal("")),
  coinValue: z.number().int().min(0).default(1),
  maxCoinsPerUser: z.number().int().min(0).default(1),
  translations: z.array(translationSchema).default([]),
  isActive: z.boolean().default(true),
});

export const updateGradientSchema = z.object({
  gradient: z
    .string()
    .min(3, "Invalid gradient string")
    .max(100, "Gradient string too long")
    .regex(
      /^[a-zA-Z0-9\s#\-\[\]\:\(\)\,]+$/,
      "Invalid characters in style definition",
    ),
});

export type CreateWordInput = z.infer<typeof createWordSchema>;
