import { z } from "zod";
import { registerSchema } from "@/lib/validations/auth";

export const passwordChangeSchema = z.object({
  currentPassword: registerSchema.shape.password,
  newPassword: registerSchema.shape.password,
});

export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;