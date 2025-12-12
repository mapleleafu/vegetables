import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategoryGame } from "@/components/CategoryGame";

interface Props {
  params: Promise<{ slug: string }>;
}

// Fisher-Yates shuffle for unbiased randomization
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default async function CategoryPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { targetLanguage: true, coins: true },
  });

  if (!user) redirect("/login");

  const allWords = await prisma.word.findMany({
    where: { categoryId: category.id },
    include: { translations: true },
  });

  // Shuffle words for the Visual Grid
  const words = shuffleArray(allWords);

  // Shuffle indices for the Question Order
  // This ensures the first question isn't always the top-left card
  const indices = Array.from({ length: words.length }, (_, i) => i);
  const questionOrder = shuffleArray(indices);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 p-4">
      <Navigation
        items={[
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      {words.length === 0 ? (
        <Alert>
          <AlertTitle>No words found</AlertTitle>
          <AlertDescription>
            No words found in this category for your target language.
          </AlertDescription>
        </Alert>
      ) : (
        <CategoryGame
          words={words}
          questionOrder={questionOrder}
          userTargetLanguage={user.targetLanguage}
          categoryName={category.name}
          initialUserCoins={user.coins}
          categoryId={category.id}
        />
      )}
    </main>
  );
}
