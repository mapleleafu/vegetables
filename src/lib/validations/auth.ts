import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(1, "Name is required").max(30, "Name is too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
