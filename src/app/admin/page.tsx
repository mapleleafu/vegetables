import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  return (
    <main className="mx-auto min-h-screen max-w-md space-y-2 p-4">
      <Navigation items={[{ label: "Admin" }]} />

      <section className="space-y-3">
        <Link
          href="/admin/categories"
          className="block rounded-xl border border-neutral-700 px-4 py-3"
        >
          Manage Categories
        </Link>
        <Link
          href="/admin/words"
          className="block rounded-xl border border-neutral-700 px-4 py-3"
        >
          Manage Words
        </Link>
      </section>
    </main>
  );
}
