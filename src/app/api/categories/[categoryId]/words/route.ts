import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req, { params }, user) => {
  const userId = user.id;
  const categoryId = params.categoryId;

  const words = await prisma.word.findMany({
    where: { categoryId, isActive: true },
    include: {
      translations: true,
      wordProgress: userId
        ? {
            where: { userId },
          }
        : false,
    } as any,
    orderBy: { slug: "asc" },
  });

  const data = words.map(w => {
    const progress = userId && (w as any).wordProgress && (w as any).wordProgress[0] ? (w as any).wordProgress[0] : null;

    return {
      id: w.id,
      slug: w.slug,
      imageUrl: w.imageUrl,
      translations: w.translations,
      progress: progress
        ? {
            timesSeen: progress.timesSeen,
            timesCorrect: progress.timesCorrect,
            timesIncorrect: progress.timesIncorrect,
            mastered: progress.mastered,
          }
        : null,
    };
  });

  return NextResponse.json(data);
});
