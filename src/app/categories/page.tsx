import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MenuButton } from "@/components/MenuButton";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      costCoins: true,
      slug: true,
    },
  });

  return (
    <main className="min-h-screen p-4 flex flex-col gap-4 max-w-md mx-auto">
      <MenuButton />

      <section className="mt-4 space-y-2">
        {categories.map(c => (
          <Link key={c.slug} href={`/categories/${c.slug}`} className="block rounded-xl border border-green-700 bg-green-900/40 px-4 py-3">
            <div className="flex justify-between items-center">
              <span>{c.name}</span>
              <span className="text-xs text-neutral-300">Cost: {c.costCoins}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
