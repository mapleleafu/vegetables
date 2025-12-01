import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(1, "Name is required"),
  password: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
