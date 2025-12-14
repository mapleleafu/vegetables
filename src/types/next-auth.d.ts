import { UserSession } from "@/types/user";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: UserSession & DefaultSession["user"];
  }

  interface User extends UserSession {}
}

declare module "next-auth/jwt" {
  interface JWT extends UserSession {}
}