import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";
import { BadRequestError, NotFoundError } from "@/lib/errors";

export const POST = apiHandler(async (req, { params }, user) => {
  const { categoryId } = params;
  if (!categoryId) throw new BadRequestError("Category ID is required");

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, costCoins: true },
  });

  if (!category) throw new NotFoundError("Category not found");

  const existingProgress = await prisma.categoryProgress.findUnique({
    where: {
      userId_categoryId: { userId: user.id, categoryId },
    },
  });

  if (existingProgress?.isUnlocked) {
    return NextResponse.json({ message: "Already unlocked" });
  }

  const result = await prisma.$transaction(async (tx) => {
    const currentUser = await tx.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    if (currentUser.coins < category.costCoins) {
      throw new BadRequestError("Insufficient coins");
    }

    await tx.user.update({
      where: { id: user.id },
      data: { coins: { decrement: category.costCoins } },
    });

    await tx.coinTransaction.create({
      data: {
        userId: user.id,
        amount: -category.costCoins,
        reason: "CATEGORY_UNLOCK",
        meta: { categoryId },
      },
    });

    return tx.categoryProgress.upsert({
      where: {
        userId_categoryId: { categoryId, userId: user.id },
      },
      update: { isUnlocked: true },
      create: {
        categoryId,
        userId: user.id,
        isUnlocked: true,
      },
    });
  });

  return NextResponse.json(result);
});
