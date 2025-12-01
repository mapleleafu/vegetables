import { z } from "zod";

export const wordProgressSchema = z.object({
  wordId: z.string().min(1, "Word ID is required"),
  isCorrect: z.boolean().or(z.string().transform(val => val === "true")),
});

export type WordProgressInput = z.infer<typeof wordProgressSchema>;
