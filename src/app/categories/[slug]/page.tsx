import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
      <header className="flex justify-between items-center mb-4">
        <Link href="/" className="text-sm underline">
          ← Menu
        </Link>
        <h1 className="text-lg font-semibold uppercase">{category.name}</h1>
      </header>

      <div className="border border-green-700 rounded-2xl p-4">
        {words.length === 0 ? (
          <p className="text-center text-sm text-neutral-400">No words found in this category.</p>
        ) : (
          <ul className="grid grid-cols-4 gap-2">
            {words.map(word => (
              <li key={word.id} className="p-3 rounded-lg border border-neutral-800">
                {word.imageUrl && (
                  <div className="flex justify-center mt-2">
                    <Image
                      src={word.imageUrl}
                      alt={word.name}
                      width={200}
                      height={200}
                      className="rounded-md object-cover select-none cursor-pointer hover:scale-140 transition-transform duration-100"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
