"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TestMode } from "@prisma/client";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { WordProgress } from "@prisma/client";
import { checkWordReward, RewardType, Status } from "@/lib/gameUtilts";
import { GAME_CONFIG } from "@/lib/constants";

const POINTS_PER_CORRECT_WORD = GAME_CONFIG.POINTS_PER_CORRECT_WORD;
const POINTS_PER_MAXED_WORD = GAME_CONFIG.POINTS_PER_MAXED_WORD;
const POINTS_PER_GLOBAL_MAX_WORD = GAME_CONFIG.POINTS_PER_GLOBAL_MAX_WORD;

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

interface SubmitResult {
  status: Status;
  rewardType?: RewardType;
  message?: string;
  newCoins?: number;
  newPoints?: number;
}

export async function submitAnswer(
  sessionId: string,
  wordId: string,
  categoryId: string,
  isCorrect: boolean,
  orderIndex: number,
  isLastWord: boolean,
): Promise<SubmitResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { status: "unauthorized" };
  const userId = session.user.id;

  const [word, user, existingWordProgress, existingCategoryProgress] =
    await Promise.all([
      prisma.word.findUnique({ where: { id: wordId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { coins: true, points: true },
      }),
      prisma.wordProgress.findUnique({
        where: { userId_wordId: { userId, wordId } },
      }),
      prisma.categoryProgress.findUnique({
        where: { userId_categoryId: { userId, categoryId } },
      }),
    ]);

  if (!word || !user) throw new NotFoundError("Data not found");

  const reward = checkWordReward(existingWordProgress as WordProgress, word);
  const shouldGiveCoin = isCorrect && reward.rewardType === "coin";
  const shouldGivePoint = isCorrect && reward.rewardType === "point";
  const pointReason = reward?.pointReason;

  await prisma.$transaction(async (tx) => {
    const promises: Promise<any>[] = [];

    if (existingCategoryProgress) {
      promises.push(
        tx.categoryProgress.update({
          where: { id: existingCategoryProgress.id },
          data: {
            coinsEarned: shouldGiveCoin
              ? { increment: word.coinValue }
              : undefined,
            lastTestedAt: new Date(),
          },
        }),
      );
    } else {
      promises.push(
        tx.categoryProgress.create({
          data: {
            userId,
            categoryId,
            coinsEarned: shouldGiveCoin ? word.coinValue : 0,
            lastTestedAt: new Date(),
          },
        }),
      );
    }

    if (existingWordProgress) {
      promises.push(
        tx.wordProgress.update({
          where: { id: existingWordProgress.id },
          data: {
            timesSeen: { increment: 1 },
            timesCorrect: isCorrect ? { increment: 1 } : undefined,
            timesIncorrect: !isCorrect ? { increment: 1 } : undefined,
            coinsEarned: shouldGiveCoin
              ? { increment: word.coinValue }
              : undefined,
            lastTestedAt: new Date(),
          },
        }),
      );
    } else {
      promises.push(
        tx.wordProgress.create({
          data: {
            userId,
            wordId,
            timesSeen: 1,
            timesCorrect: isCorrect ? 1 : 0,
            timesIncorrect: !isCorrect ? 1 : 0,
            coinsEarned: shouldGiveCoin ? word.coinValue : 0,
            lastTestedAt: new Date(),
          },
        }),
      );
    }

    promises.push(
      tx.testSession.update({
        where: { id: sessionId },
        data: {
          totalQuestions: { increment: 1 },
          totalCorrect: isCorrect ? { increment: 1 } : undefined,
          totalIncorrect: !isCorrect ? { increment: 1 } : undefined,
          testAnswers: {
            create: {
              wordId,
              isCorrect,
              orderIndex,
            },
          },
          completedAt: isLastWord ? new Date() : undefined,
        },
      }),
    );

    if (shouldGiveCoin) {
      promises.push(
        tx.user.update({
          where: { id: userId },
          data: { coins: { increment: word.coinValue } },
        }),
        tx.coinTransaction.create({
          data: {
            userId,
            amount: word.coinValue,
            reason: "WORD_CORRECT",
            meta: { wordId, sessionId },
          },
        }),
      );
    }

    if (shouldGivePoint) {
      promises.push(
        tx.user.update({
          where: { id: userId },
          data: {
            points: {
              increment: (() => {
                switch (pointReason) {
                  case "globalMax":
                    return POINTS_PER_MAXED_WORD;
                  case "categoryMax":
                    return POINTS_PER_GLOBAL_MAX_WORD;
                  default:
                    return POINTS_PER_CORRECT_WORD;
                }
              })(),
            },
          },
        }),
      );
    }

    await Promise.all(promises);
  });

  return { status: isCorrect ? "correct" : "wrong" };
}
