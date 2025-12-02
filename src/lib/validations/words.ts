import { z } from "zod";

const translationSchema = z.object({
  languageCode: z.string().min(2, "Language code must be at least 2 characters"),
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
  imageUrl: z.string().url("Invalid image URL").nullish().or(z.literal("")),
  coinValue: z.number().int().min(0).default(1),
  maxCoinsPerUser: z.number().int().min(0).default(1),
  translations: z.array(translationSchema).default([]),
  isActive: z.boolean().default(true),
});

export type CreateWordInput = z.infer<typeof createWordSchema>;
