import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
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

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <Link href="/" className="text-sm underline">
          Back to menu
        </Link>
      </header>

      <section className="space-y-3">
        <Link href="/admin/categories" className="block rounded-xl border border-neutral-700 px-4 py-3">
          Manage Categories
        </Link>
        <Link href="/admin/words" className="block rounded-xl border border-neutral-700 px-4 py-3">
          Manage Words
        </Link>
      </section>
    </main>
  );
}
