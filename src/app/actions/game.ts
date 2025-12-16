"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GAME_CONFIG } from "@/lib/constants";
import { CoinReason, TestMode } from "@prisma/client";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { Word, WordProgress } from "@prisma/client";

export async function startTestSession(categoryId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  const newSession = await prisma.testSession.create({
    data: {
      userId: session.user.id,
      categoryId,
      mode: TestMode.CATEGORY,
      startedAt: new Date(),
    },
  });

  return newSession.id;
}

export type RewardType = "coin" | "point" | "none";
export type Status = "correct" | "wrong" | "idle" | "unauthorized";

interface SubmitResult {
  status: Status;
  rewardType?: RewardType;
  message?: string;
  newCoins?: number;
  newPoints?: number;
}

export async function checkWordReward(wordProgress: WordProgress, word: Word) {
  const globalWordCap =
    word.maxCoinsPerUser || GAME_CONFIG.DEFAULT_MAX_COINS_PER_WORD;
  const categoryModeCap = GAME_CONFIG.DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY;

  const isGlobalMaxed = wordProgress?.coinsEarned >= globalWordCap;
  const isCategoryModeMaxed = wordProgress?.coinsEarned >= categoryModeCap;

  let rewardType: RewardType = "none";
  let message = "";

  if (isGlobalMaxed) {
    rewardType = "point";
    message = "Word maxed out! +1 Point";
  } else if (isCategoryModeMaxed) {
    rewardType = "point";
    message = "Category coin limit reached for this word! +1 Point";
  } else {
    rewardType = "coin";
  }

  return { rewardType, message };
}

export async function submitAnswer(
  sessionId: string,
  wordId: string,
  categoryId: string,
  isCorrect: boolean,
  orderIndex: number,
): Promise<SubmitResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { status: "unauthorized" };

  const userId = session.user.id;

  try {
    const [word, user] = await Promise.all([
      prisma.word.findUnique({ where: { id: wordId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { coins: true, points: true },
      }),
    ]);

    if (!word || !user) throw new NotFoundError("Data not found");

    return await prisma.$transaction(async (tx) => {
      let wordProgress = await tx.wordProgress.findUnique({
        where: { userId_wordId: { userId, wordId } },
      });

      if (!wordProgress) {
        wordProgress = await tx.wordProgress.create({
          data: { userId, wordId },
        });
      }

      let categoryProgress = await tx.categoryProgress.findUnique({
        where: { userId_categoryId: { userId, categoryId } },
      });

      if (!categoryProgress) {
        categoryProgress = await tx.categoryProgress.create({
          data: { userId, categoryId, isUnlocked: true },
        });
      }

      await tx.testSession.update({
        where: { id: sessionId },
        data: {
          totalQuestions: { increment: 1 },
          totalCorrect: isCorrect ? { increment: 1 } : undefined,
          totalIncorrect: isCorrect ? undefined : { increment: 1 },
          testAnswers: {
            create: {
              wordId,
              isCorrect,
              orderIndex,
            },
          },
        },
      });

      if (!isCorrect) {
        await tx.wordProgress.update({
          where: { id: wordProgress.id },
          data: {
            timesSeen: { increment: 1 },
            timesIncorrect: { increment: 1 },
            lastTestedAt: new Date(),
          },
        });
        return { status: "wrong", rewardType: "none" };
      }

      const { rewardType, message } = await checkWordReward(wordProgress, word);

      if (rewardType === "coin") {
        await tx.user.update({
          where: { id: userId },
          data: { coins: { increment: word.coinValue } },
        });

        await tx.coinTransaction.create({
          data: {
            userId,
            amount: word.coinValue,
            reason: CoinReason.WORD_CORRECT,
            meta: { wordId, categoryId, sessionId },
          },
        });

        await tx.wordProgress.update({
          where: { id: wordProgress.id },
          data: {
            timesSeen: { increment: 1 },
            timesCorrect: { increment: 1 },
            coinsEarned: { increment: word.coinValue },
            lastTestedAt: new Date(),
          },
        });

        await tx.categoryProgress.update({
          where: { id: categoryProgress.id },
          data: {
            coinsEarned: { increment: word.coinValue },
            lastTestedAt: new Date(),
          },
        });
      } else {
        // Points
        await tx.user.update({
          where: { id: userId },
          data: { points: { increment: GAME_CONFIG.POINTS_PER_CORRECT_WORD } },
        });

        await tx.wordProgress.update({
          where: { id: wordProgress.id },
          data: {
            timesSeen: { increment: 1 },
            timesCorrect: { increment: 1 },
            lastTestedAt: new Date(),
          },
        });
      }

      return {
        status: "correct",
        rewardType,
        message,
        newCoins:
          rewardType === "coin" ? user.coins + word.coinValue : user.coins,
        newPoints:
          rewardType === "point"
            ? user.points + GAME_CONFIG.POINTS_PER_CORRECT_WORD
            : user.points,
      };
    });
  } catch (error) {
    console.error("Submit Answer Error:", error);
    return { status: "wrong", rewardType: "none" };
  }
}
