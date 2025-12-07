import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { Search } from "@/components/ui/search";
import { Prisma } from "@prisma/client";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const query = params.query || "";
  const pageSize = 5;

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
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        costCoins: true,
        slug: true,
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.category.count({ where }),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 pt-0">
      <Navigation items={[{ label: "Categories" }]} />

      <section className="grid grid-cols-1 gap-4 space-y-2">
        <Search placeholder="Search name or slug..." />

        {categories.map((c) => (
          <Link key={c.slug} href={`/categories/${c.slug}`}>
            <Card className="hover:bg-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{c.name}</CardTitle>
                <Badge variant="secondary">Cost: {c.costCoins}</Badge>
              </CardHeader>
            </Card>
          </Link>
        ))}

        <PaginationWithLinks
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
        />
      </section>
    </main>
  );
}
