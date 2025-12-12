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
    where: {
      categoryId: category.id,
    },
    include: { translations: true },
  });

  const words = allWords.sort(() => Math.random() - 0.5);

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
          userTargetLanguage={user.targetLanguage}
          categoryName={category.name}
          initialUserCoins={user.coins}
          categoryId={category.id}
        />
      )}
    </main>
  );
}
