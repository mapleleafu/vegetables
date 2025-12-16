import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can only contain letters, numbers, dots, underscores, and dashes",
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long")
    .regex(/^\S*$/, "Password cannot contain spaces"),
});

export const authRegex = {
  username: /[^a-zA-Z0-9._-]/g,
  password: /\s/g,
};

export type RegisterInput = z.infer<typeof registerSchema>;
