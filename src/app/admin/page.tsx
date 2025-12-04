import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MenuButton } from "@/components/MenuButton";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto space-y-2">
      <header className="flex justify-between">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <MenuButton />
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
