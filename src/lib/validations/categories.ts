import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  parentId: z.string().nullish().nullable(),
  costCoins: z.number().int().nonnegative().default(0),
  maxCoinsPerUser: z.number().int().nonnegative().default(0),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
