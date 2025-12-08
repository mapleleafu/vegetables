import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Coins } from "@/components/ui/coins";
import { Navigation } from "@/components/Navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WordCard } from "@/components/WordCard";

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
    select: { targetLanguage: true },
  });

  if (!user) redirect("/login");

  const words = await prisma.word.findMany({
    where: {
      categoryId: category.id,
      translations: {
        some: { languageCode: user.targetLanguage, audioUrl: { not: null } },
      },
    },
    include: { translations: true },
    orderBy: { slug: "asc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-md p-4">
      <Navigation
        items={[
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      <div>
        {words.length === 0 ? (
          <Alert>
            <AlertTitle>No words found</AlertTitle>
            <AlertDescription>
              No words found in this category for your target language.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-2xl border border-white/50 bg-green-950/50 p-4">
            <ul className="grid grid-cols-4 gap-2">
              <div className="col-span-4 mb-2 flex items-center justify-between">
                <h1 className="text-lg font-semibold uppercase">
                  {category.name}
                </h1>
                <Coins userCoins={category.costCoins} />
              </div>

              {words.map((word) => {
                const audioUrl =
                  word.translations.find(
                    (t) => t.languageCode === user.targetLanguage,
                  )?.audioUrl || null;

                return (
                  <WordCard
                    key={word.id}
                    name={word.name}
                    imageUrl={word.imageUrl}
                    audioUrl={audioUrl}
                  />
                );
              })}
            </ul>

            <h1 className="mt-4 text-center text-lg font-semibold uppercase underline">
              {category.name}
            </h1>
            <div className="mt-4 rounded-lg border border-gray-200/50 bg-green-900/50 p-4 text-center text-lg font-semibold uppercase">
              Which Picture Is
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
