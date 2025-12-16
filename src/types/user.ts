import { DefaultSession } from "next-auth";

export type UserRole = "USER" | "ADMIN";
export type UserSession = {
  id: string;
  role: UserRole;
  username: string | null;
} & DefaultSession["user"];
