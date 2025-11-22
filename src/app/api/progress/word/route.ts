import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session && session.user ? ((session.user as any).id as string) : null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const wordId = body.wordId as string;
  const isCorrect = Boolean(body.isCorrect);

  const word = await prisma.word.findUnique({
    where: { id: wordId },
    include: { category: true },
  });

  if (!word) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  const categoryId = word.categoryId;

  const [progress, categoryProgress, user] = await Promise.all([
    prisma.wordProgress.upsert({
      where: {
        userId_wordId: {
          userId,
          wordId,
        },
      },
      update: {},
      create: {
        userId,
        wordId,
      },
    }),
    prisma.categoryProgress.upsert({
      where: {
        userId_categoryId: {
          userId,
          categoryId,
        },
      },
      update: {},
      create: {
        userId,
        categoryId,
        isUnlocked: true,
      },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let timesSeen = progress.timesSeen + 1;
  let timesCorrect = progress.timesCorrect;
  let timesIncorrect = progress.timesIncorrect;

  isCorrect ? (timesCorrect += 1) : (timesIncorrect += 1);

  const mastered = timesCorrect >= 2;

  let coinsToAdd = 0;

  if (isCorrect) {
    const wordCoinsLeft = word.maxCoinsPerUser - progress.coinsEarned;
    const categoryCoinsLeft = word.category.maxCoinsPerUser - categoryProgress.coinsEarned;

    if (wordCoinsLeft > 0 && categoryCoinsLeft > 0) {
      coinsToAdd = word.coinValue;
      if (coinsToAdd > wordCoinsLeft ) {
        coinsToAdd = wordCoinsLeft;
      }
      if (coinsToAdd > categoryCoinsLeft) {
        coinsToAdd = categoryCoinsLeft;
      }
    }
  }

  const [updatedProgress, updatedCategoryProgress, updatedUser] = await prisma.$transaction([
    prisma.wordProgress.update({
      where: { id: progress.id },
      data: {
        timesSeen,
        timesCorrect,
        timesIncorrect,
        mastered,
        lastTestedAt: new Date(),
        coinsEarned: progress.coinsEarned + coinsToAdd,
      },
    }),
    prisma.categoryProgress.update({
      where: { id: categoryProgress.id },
      data: {
        coinsEarned: categoryProgress.coinsEarned + coinsToAdd,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        coins: user.coins + coinsToAdd,
      },
    }),
    coinsToAdd
      ? prisma.coinTransaction.create({
          data: {
            userId,
            amount: coinsToAdd,
            reason: "WORD_CORRECT",
            meta: {
              wordId,
              categoryId,
            },
          },
        })
      : (null as any),
  ]);

  return NextResponse.json({
    progress: updatedProgress,
    categoryProgress: updatedCategoryProgress,
    user: {
      id: updatedUser.id,
      coins: updatedUser.coins,
    },
    coinsAdded: coinsToAdd,
  });
}
