import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Params {
  params: { id: string };
}

export default async function CategoryPage({ params }: Params) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-4">
        <Link href="/" className="text-sm underline">
          ← Menu
        </Link>
        <h1 className="text-lg font-semibold uppercase">{category.name}</h1>
      </header>

      <div className="border border-green-700 rounded-2xl p-4">
        {/* Here you will render your 4x4 grid, play audio, run tests, etc. */}
        <p className="text-sm text-neutral-300">Build the vegetables UI here.</p>
      </div>
    </main>
  );
}
