import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategoryGame } from "@/components/CategoryGame";
import { GAME_CONFIG } from "@/lib/constants";

// Fisher-Yates shuffle for unbiased randomization
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default async function MixedQuickTestPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { targetLanguage: true, coins: true },
  });

  if (!user) redirect("/login");

  const unlockedProgress = await prisma.categoryProgress.findMany({
    where: {
      userId: session.user.id,
      isUnlocked: true,
    },
    select: { categoryId: true },
  });

  const unlockedIds = unlockedProgress.map((u) => u.categoryId);

  const validCategories = await prisma.category.findMany({
    where: {
      OR: [{ id: { in: unlockedIds } }],
      isActive: true,
      isDeleted: false,
    },
    select: { id: true },
  });

  const validCategoryIds = validCategories.map((c) => c.id);

  const allWords = await prisma.word.findMany({
    where: {
      categoryId: { in: validCategoryIds },
      translations: {
        some: { languageCode: user.targetLanguage, audioUrl: { not: null } },
      },
      isActive: true,
    },
    take: 60,
    include: { translations: true },
  });

  const words = shuffleArray(allWords).slice(0, GAME_CONFIG.DEFAULT_GAME_WORD_COUNT);

  const indices = Array.from({ length: words.length }, (_, i) => i);
  const questionOrder = shuffleArray(indices);

  const wordsProgress = await prisma.wordProgress.findMany({
    where: {
      userId: session.user.id,
      wordId: { in: words.map((w) => w.id) },
    },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 p-4">
      <Navigation
        items={[
          { label: "Home", href: "/" },
          { label: "Quick Test" },
        ]}
      />

      {words.length === 0 ? (
        <Alert>
          <AlertTitle>No words found</AlertTitle>
          <AlertDescription>
            No words found in your unlocked categories. Unlock some categories.
          </AlertDescription>
        </Alert>
      ) : (
        <CategoryGame
          words={words}
          questionOrder={questionOrder}
          userTargetLanguage={user.targetLanguage}
          categoryName="Quick Test"
          userCoins={user.coins}
          categoryId="QUICK_TEST"
          wordsProgress={wordsProgress}
          isQuickTest={true}
        />
      )}
    </main>
  );
}
