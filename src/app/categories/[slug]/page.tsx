import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Coins } from "@/components/ui/coins";
import { MenuButton } from "@/components/MenuButton";
import { Image as ImageIcon } from "lucide-react";
import { PlayAudioButton } from "@/components/PlayAudioButton";
import { LanguageCode, LANGUAGE_NAMES } from "@/types/word";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const words = await prisma.word.findMany({
    where: { categoryId: category.id },
    include: { translations: true },
    orderBy: { slug: "asc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-md p-4">
      <MenuButton />

      <div className="rounded-2xl border border-white/50 bg-green-950/50 p-4">
        {words.length === 0 ? (
          <p className="text-center text-sm text-neutral-400">
            No words found in this category.
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-4 gap-2">
              <div className="col-span-4 mb-2 flex items-center justify-between">
                <h1 className="text-lg font-semibold uppercase">
                  {category.name}
                </h1>
                <Coins userCoins={category.costCoins} />
              </div>
              {words.map((word) => {
                const audioUrl =
                  word.translations.find((t) => t.languageCode === "TR")
                    ?.audioUrl || word.translations[0]?.audioUrl;

                return (
                  <li
                    key={word.id}
                    className="relative flex flex-col items-center rounded-lg border border-white/50 bg-green-800/50 p-3"
                  >
                    {audioUrl && (
                      <div className="absolute top-1 right-1 z-10">
                        <PlayAudioButton audioUrl={audioUrl} />
                      </div>
                    )}

                    {word.imageUrl ? (
                      <div className="mt-2 flex w-full justify-center">
                        <Image
                          src={word.imageUrl}
                          alt={word.name}
                          width={200}
                          height={200}
                          className="aspect-square cursor-pointer rounded-md object-cover transition-transform duration-100 select-none hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-md bg-black/20 transition-transform duration-100 hover:scale-105">
                        <ImageIcon size={32} className="text-white/50" />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <h1 className="mt-4 text-center text-lg font-semibold uppercase underline">
              {category.name}
            </h1>

            <div className="mt-4 rounded-lg border border-gray-200/50 bg-green-900/50 p-4 text-center text-lg font-semibold uppercase">
              Which Picture Is
            </div>
          </>
        )}
      </div>
    </main>
  );
}
