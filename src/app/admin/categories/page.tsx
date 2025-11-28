import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin · Categories</h1>
        <Link href="/admin" className="text-sm underline">
          Back
        </Link>
      </header>

      <section className="space-y-2">
        {categories.length === 0 && <p className="text-sm text-neutral-400">No categories yet.</p>}
        {categories.map(c => (
          <div key={c.id} className="rounded-xl border border-neutral-700 px-4 py-3 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs text-neutral-400">{c.slug}</div>
            </div>
            <div className="text-xs text-neutral-300 text-right">
              <div>Cost: {c.costCoins}</div>
              <div>Max coins: {c.maxCoinsPerUser}</div>
            </div>
          </div>
        ))}
      </section>

      <CategoryForm />
    </main>
  );
}
