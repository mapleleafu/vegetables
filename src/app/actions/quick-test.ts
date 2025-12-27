"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function startRandomCategory() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const unlockedProgress = await prisma.categoryProgress.findMany({
    where: {
      userId: session.user.id,
      isUnlocked: true,
    },
    select: { categoryId: true },
  });

  const unlockedIds = unlockedProgress.map((u) => u.categoryId);

  const categories = await prisma.category.findMany({
    where: {
      OR: [{ id: { in: unlockedIds } }, { costCoins: 0 }],
      words: { some: {} },
      isDeleted: false,
      isActive: true,
    },
    select: { slug: true },
  });

  if (categories.length === 0) {
    return { error: "No unlocked categories found." };
  }

  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];

  redirect(`/categories/${randomCategory.slug}`);
}

export async function startMixedWords() {
  redirect("/quick-test");
}
