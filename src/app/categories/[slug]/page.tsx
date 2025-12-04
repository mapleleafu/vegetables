import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Coins } from "@/components/ui/coins";
import { MenuButton } from "@/components/MenuButton";
import { Image as ImageIcon } from "lucide-react";

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
    orderBy: { slug: "asc" },
  });

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <MenuButton />

      <div className="border border-white/50 bg-green-950/50 rounded-2xl p-4">
        {words.length === 0 ? (
          <p className="text-center text-sm text-neutral-400">No words found in this category.</p>
        ) : (
          <>
            <ul className="grid grid-cols-4 gap-2">
              <div className="col-span-4 flex justify-between items-center mb-2">
                <h1 className="text-lg font-semibold uppercase">{category.name}</h1>
                <Coins userCoins={category.costCoins} />
              </div>
              {words.map(word => (
                <li key={word.id} className="p-3 rounded-lg border border-white/50 bg-green-800/50 flex flex-col items-center">
                  {word.imageUrl ? (
                    <div className="flex justify-center mt-2">
                      <Image
                        src={word.imageUrl}
                        alt={word.name}
                        width={200}
                        height={200}
                        className="rounded-md object-cover select-none cursor-pointer hover:scale-125 transition-transform duration-100"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-md cursor-pointer hover:scale-125 transition-transform duration-100">
                      <ImageIcon size={64} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <h1 className="text-lg font-semibold uppercase text-center mt-4 underline">{category.name}</h1>

            <div className="text-lg font-semibold border border-gray-200/50 bg-green-900/50 rounded-lg p-4 mt-4 text-center uppercase">
              Which Picture Is
            </div>
          </>
        )}
      </div>
    </main>
  );
}
