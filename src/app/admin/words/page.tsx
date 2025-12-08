import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Image as ImageIcon, Plus } from "lucide-react";
import { Prisma } from "@prisma/client";
import { Search } from "@/components/ui/search";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { Button } from "@/components/ui/button";
import { WordDialog } from "@/components/admin/WordDialog";
import { Navigation } from "@/components/Navigation";

//TODO: cache or do pagination for categories so we don't load all for both editing and creating new words

export default async function AdminWordsPage({
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

  const where: Prisma.WordWhereInput = {
    isActive: true,
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [words, totalCount] = await prisma.$transaction([
    prisma.word.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      include: { translations: true },
      skip: (page - 1) * pageSize,
    }),
    prisma.word.count({ where }),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-md space-y-4 p-4">
      <Navigation
        items={[{ label: "Admin", href: "/admin" }, { label: "Words" }]}
      />

      <section className="space-y-4">
        <Search placeholder="Search name or slug..." />

        {words.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-xl border border-dashed py-8 text-center text-sm">
            {query ? `No results for "${query}"` : "No words found."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {words.map((word) => (
              <WordDialog key={word.id} word={word}>
                <Button
                  variant="outline"
                  className="h-auto w-full justify-between py-2"
                >
                  <div className="text-sm font-medium">{word.name}</div>
                  {word.imageUrl ? (
                    <Image
                      src={word.imageUrl}
                      alt={word.name}
                      width={30}
                      height={30}
                      className="h-[30px] w-[30px] rounded-md object-cover"
                    />
                  ) : (
                    <div className="bg-secondary text-muted-foreground flex h-[30px] w-[30px] items-center justify-center rounded-md">
                      <ImageIcon size={16} />
                    </div>
                  )}
                </Button>
              </WordDialog>
            ))}
          </div>
        )}

        <PaginationWithLinks
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
        />

        <div className="border-t pt-4">
          <WordDialog>
            <Button className="w-full" variant="secondary">
              <Plus className="mr-2 h-4 w-4" /> Create a New Word
            </Button>
          </WordDialog>
        </div>
      </section>
    </main>
  );
}
