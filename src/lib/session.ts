import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LanguageCode, UserRole } from "@prisma/client";

export type SafeUser = {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  targetLanguage: LanguageCode;
  hasCompletedTutorial: boolean;
  coins: number;
  points: number;
  hasPassword: boolean;
};

export async function getCurrentUserSafe(): Promise<SafeUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return null;
  }

  // No use of {...user} because of Prisma extension
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    targetLanguage: user.targetLanguage,
    hasCompletedTutorial: user.hasCompletedTutorial,
    coins: user.coins,
    points: user.points,
    hasPassword: user.hasPassword,
  };
}
