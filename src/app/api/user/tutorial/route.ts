import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";
import { GAME_CONFIG } from "@/lib/constants";
import { CoinReason } from "@prisma/client";

export const POST = apiHandler(async (req, { params }, user) => {
  return await prisma.$transaction(async (tx) => {
    const result = await tx.user.updateMany({
      where: {
        id: user.id,
        hasCompletedTutorial: false,
      },
      data: {
        hasCompletedTutorial: true,
        coins: { increment: GAME_CONFIG.DEFAULT_CATEGORY_COST },
      },
    });

    if (result.count > 0) {
      await tx.coinTransaction.create({
        data: {
          userId: user.id,
          amount: GAME_CONFIG.DEFAULT_CATEGORY_COST,
          reason: CoinReason.TUTORIAL,
        },
      });
    }

    return NextResponse.json({ success: true });
  });
});
