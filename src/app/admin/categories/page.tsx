import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search } from "@/components/ui/search";
import { PaginationWithLinks } from "@/components/ui/paginationWithLinks";
import { Prisma } from "@prisma/client";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { MenuButton } from "@/components/MenuButton";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string; query?: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const query = params.query || "";
  const pageSize = 5;

  const where: Prisma.CategoryWhereInput = query
    ? {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }],
      }
    : {};

  const [categories, totalCount] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.category.count({ where }),
  ]);

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <header className="flex justify-between">
        <h1 className="text-xl font-semibold">Admin · Categories</h1>
        <MenuButton />
      </header>

      <section className="space-y-4">
        <Search placeholder="Search name or slug..." />

        {categories.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-sm border border-dashed border-neutral-700 rounded-xl">
            {query ? `No results for "${query}"` : "No categories found."}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map(c => (
              <Link
                href={`/admin/categories/${c.id}`}
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-neutral-700 px-4 py-3 transition-colors hover:bg-neutral-800">
                <div className="text-sm font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        )}

        <PaginationWithLinks page={page} pageSize={pageSize} totalCount={totalCount} />
      </section>

      <div className="pt-4 border-neutral-800">
        <CategoryForm />
      </div>
    </main>
  );
}
