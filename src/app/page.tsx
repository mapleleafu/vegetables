import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MenuActions from "@/components/MenuActions";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userId = session && session.user ? ((session.user as any).id as string) : null;

  let userCoins = 0;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });
    if (user) {
      userCoins = user.coins;
    }
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen p-4 flex flex-col gap-4 max-w-md mx-auto">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Menu</h1>
        <div className="flex items-center gap-2 rounded-full border border-amber-400 px-3 py-1">
          <span>🪙</span>
          <span className="font-mono">{userCoins}</span>
        </div>
      </header>

      <MenuActions />

      <section className="mt-4 space-y-2">
        {categories.map(c => (
          <Link key={c.id} href={`/categories/${c.id}`} className="block rounded-xl border border-green-700 bg-green-900/40 px-4 py-3">
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
