import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Plus, Folder } from "lucide-react";
import { Prisma } from "@prisma/client";
import { Navigation } from "@/components/Navigation";
import { Search } from "@/components/ui/search";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { Button } from "@/components/ui/button";
import { CategoryDialog } from "@/components/admin/CategoryDialog";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const query = params.query || "";
  const pageSize = 20;

  const where: Prisma.CategoryWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
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
    <main className="mx-auto min-h-screen max-w-md space-y-4 p-4">
      <Navigation
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Categories"},
        ]}
      />

      <section className="space-y-4">
        <Search placeholder="Search name or slug..." />

        {categories.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-xl border border-dashed py-8 text-center text-sm">
            {query ? `No results for "${query}"` : "No categories found."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <div key={c.id} className="relative">
                <CategoryDialog category={c}>
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-between py-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Folder className="text-muted-foreground h-4 w-4" />
                      <div className="text-sm font-medium">{c.name}</div>
                    </div>
                  </Button>
                </CategoryDialog>

                <div className="absolute top-2 right-2">
                  <DeleteCategoryButton
                    categoryId={c.id}
                    categoryName={c.name}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <PaginationWithLinks
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
        />

        <div className="border-t pt-4">
          <CategoryDialog>
            <Button className="w-full" variant="secondary">
              <Plus className="mr-2 h-4 w-4" /> Create a New Category
            </Button>
          </CategoryDialog>
        </div>
      </section>
    </main>
  );
}
