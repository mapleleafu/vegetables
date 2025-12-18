import { UserSession } from "@/types/user";
import { DefaultSession } from "next-auth";
import { LanguageCode } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: UserSession & DefaultSession["user"] & {
      targetLanguage: LanguageCode;
    };
  }

  interface User extends UserSession {
    targetLanguage: LanguageCode;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends UserSession {
    targetLanguage: LanguageCode;
  }
}