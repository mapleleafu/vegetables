import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";
import { NotFoundError } from "@/lib/errors";
import { wordProgressSchema } from "@/lib/validations/progress";

export const POST = apiHandler(async (req, { params }, user) => {
  const body = await req.json();
  const { wordId, isCorrect } = wordProgressSchema.parse(body);

  const word = await prisma.word.findUnique({
    where: { id: wordId },
    include: { category: true },
  });

  if (!word) {
    throw new NotFoundError("Word not found");
  }

  const userId = user.id;
  const categoryId = word.categoryId;

  const [progress, categoryProgress] = await Promise.all([
    prisma.wordProgress.upsert({
      where: { userId_wordId: { userId, wordId } },
      update: {},
      create: { userId, wordId },
    }),
    prisma.categoryProgress.upsert({
      where: { userId_categoryId: { userId, categoryId } },
      update: {},
      create: { userId, categoryId, isUnlocked: true },
    }),
  ]);

  let timesSeen = progress.timesSeen + 1;
  let timesCorrect = progress.timesCorrect;
  let timesIncorrect = progress.timesIncorrect;

  if (isCorrect) {
    timesCorrect += 1;
  } else {
    timesIncorrect += 1;
  }

  const mastered = timesCorrect >= 2;

  let coinsToAdd = 0;
  if (isCorrect) {
    const wordCoinsLeft = word.maxCoinsPerUser - progress.coinsEarned;
    const categoryCoinsLeft = (word.category?.maxCoinsPerUser || 0) - categoryProgress.coinsEarned;

    if (wordCoinsLeft > 0 && categoryCoinsLeft > 0) {
      coinsToAdd = word.coinValue;
      if (coinsToAdd > wordCoinsLeft) coinsToAdd = wordCoinsLeft;
      if (coinsToAdd > categoryCoinsLeft) coinsToAdd = categoryCoinsLeft;
    }
  }

  const result = await prisma.$transaction(async tx => {
    const updatedWordProgress = await tx.wordProgress.update({
      where: { id: progress.id },
      data: {
        timesSeen,
        timesCorrect,
        timesIncorrect,
        mastered,
        lastTestedAt: new Date(),
        coinsEarned: { increment: coinsToAdd },
      },
    });

    const updatedCatProgress = await tx.categoryProgress.update({
      where: { id: categoryProgress.id },
      data: {
        coinsEarned: { increment: coinsToAdd },
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        coins: { increment: coinsToAdd },
      },
    });

    if (coinsToAdd > 0) {
      await tx.coinTransaction.create({
        data: {
          userId,
          amount: coinsToAdd,
          reason: "WORD_CORRECT",
          meta: { wordId, categoryId },
        },
      });
    }

    return { updatedWordProgress, updatedCatProgress, updatedUser };
  });

  return NextResponse.json({
    progress: result.updatedWordProgress,
    categoryProgress: result.updatedCatProgress,
    user: {
      id: result.updatedUser.id,
      coins: result.updatedUser.coins,
    },
    coinsAdded: coinsToAdd,
  });
});
