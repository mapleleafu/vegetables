import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LanguageCode, UserRole, Word } from "@prisma/client";

type BackgroundWordPreview = {
  id: string;
  name: string;
  image: string | null;
};

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
  backgroundWordId: string | null;
  backgroundWord: BackgroundWordPreview | null;
  backgroundGradient: string | null;
};

export async function getCurrentUserSafe(): Promise<SafeUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      backgroundWord: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

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
    backgroundWordId: user.backgroundWordId,
    backgroundWord: user.backgroundWord
      ? {
          id: user.backgroundWord.id,
          name: user.backgroundWord.name,
          image: user.backgroundWord.image,
        }
      : null,
    backgroundGradient: user.backgroundGradient,
  };
}
