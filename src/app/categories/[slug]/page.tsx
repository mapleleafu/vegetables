import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Coins } from "@/components/ui/coins";
import { Navigation } from "@/components/Navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WordCard } from "@/components/WordCard";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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
      // translations: {
      //   some: { languageCode: user.targetLanguage, audioUrl: { not: null } },
      // },
    },
    include: { translations: true },
    orderBy: { slug: "asc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-xl content-center">
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
          <div className="rounded-2xl border-[2.5px] border-[#422d2b] bg-[#ccb17c] p-4 shadow-[0_0px_55px_25px_#00000040]">
            <ul className="grid grid-cols-4 gap-2">
              <div className="relative col-span-4 mb-2 flex items-center justify-center">
                <h1 className="text-3xl font-semibold">{category.name}</h1>
                <div className="absolute right-0">
                  <Coins userCoins={category.costCoins} />
                </div>
              </div>

              {words.map((word) => {
                const audioUrl =
                  word.translations.find(
                    (t) => t.languageCode === user.targetLanguage,
                  )?.audioUrl || null;

                return (
                  <WordCard
                    key={word.id}
                    name={word.name.toUpperCase()}
                    imageUrl={word.imageUrl}
                    audioUrl={audioUrl}
                  />
                );
              })}
            </ul>

            <h1 className="mt-8 rounded-lg border border-[#3e3535] bg-[#937132] p-4 text-center text-3xl font-semibold shadow-[0_0px_5px_7px_#422d2b25]">
              <Tooltip>
                <TooltipTrigger>Patates</TooltipTrigger>
                <TooltipContent>
                  <p>Which image is Patates?</p>
                </TooltipContent>
              </Tooltip>
            </h1>
          </div>
        )}
      </div>
    </main>
  );
}
