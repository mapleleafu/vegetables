import { prisma } from "@/lib/prisma";
import { Navigation } from "@/components/Navigation";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DEFAULT_LANGUAGE_CODE } from "@/types/language";
import { CategoryFilters, CategoryCard } from "@/components/CategoryClient";
import { GAME_CONFIG } from "@/lib/constants";

const DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY =
  GAME_CONFIG.DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY;
const DEFAULT_MAX_COINS_PER_WORD = GAME_CONFIG.DEFAULT_MAX_COINS_PER_WORD;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    filter?: string;
    sort?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const query = params.query || "";
  const filter = params.filter || "all";
  const sort = params.sort || "name_asc";
  const pageSize = 6;
  const userId = session?.user?.id;

  const where: Prisma.CategoryWhereInput = {
    isActive: true,
    words: {
      some: {
        translations: {
          some: {
            languageCode:
              session?.user?.targetLanguage || DEFAULT_LANGUAGE_CODE,
          },
        },
      },
    },
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  if (userId && filter !== "all") {
    if (filter === "unlocked") {
      where.categoryProgress = { some: { userId: userId, isUnlocked: true } };
    } else if (filter === "locked") {
      where.AND = [
        {
          OR: [
            { categoryProgress: { none: { userId: userId } } },
            {
              categoryProgress: { some: { userId: userId, isUnlocked: false } },
            },
          ],
        },
      ];
    }
  }

  let orderBy: Prisma.CategoryOrderByWithRelationInput = { name: "asc" };
  switch (sort) {
    case "name_desc":
      orderBy = { name: "desc" };
      break;
    case "cost_asc":
      orderBy = { costCoins: "asc" };
      break;
    case "cost_desc":
      orderBy = { costCoins: "desc" };
      break;
    default:
      orderBy = { name: "asc" };
  }

  const [categoriesData, totalCount, user] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      orderBy,
      include: {
        categoryProgress: {
          where: { userId: userId },
          take: 1,
        },
        // We need words and their progress to calculate the layers
        words: {
          where: { isActive: true },
          select: {
            id: true,
            wordProgress: {
              where: { userId: userId },
              select: { coinsEarned: true },
            },
          },
        },
        _count: {
          select: {
            words: { where: { isActive: true } },
          },
        },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.category.count({ where }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    }),
  ]);

  const categories = categoriesData.map((c) => {
    const userProgress = c.categoryProgress[0];
    const isUnlocked = !!userProgress?.isUnlocked;
    const totalWords = c._count.words;

    let totalCoinsEarned = 0;
    let silverCoins = 0;
    let goldCoins = 0;

    c.words.forEach((w) => {
      const earned = w.wordProgress[0]?.coinsEarned || 0;
      totalCoinsEarned += earned;

      // Silver Layer: Cap at DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY
      silverCoins += Math.min(earned, DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY);

      // Gold Layer: The overflow
      if (earned > DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY) {
        goldCoins += earned - DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY;
      }
    });

    const silverProgress =
      totalWords > 0
        ? Math.round(
            (silverCoins /
              (totalWords * DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY)) *
              100,
          )
        : 0;

    const goldProgress =
      totalWords > 0
        ? Math.round(
            (goldCoins /
              (totalWords *
                (DEFAULT_MAX_COINS_PER_WORD -
                  DEFAULT_MAX_COINS_PER_WORD_PER_CATEGORY))) *
              100,
          )
        : 0;

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      costCoins: c.costCoins,
      isUnlocked,
      progress: isUnlocked ? silverProgress : 0,
      goldProgress: isUnlocked ? goldProgress : 0,
      totalWords,
    };
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-4 md:p-8">
      <Navigation items={[{ label: "Categories" }]} />

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">
            Browse categories to expand your vocabulary. Unlock new topics with
            coins.
          </p>
        </div>

        <CategoryFilters query={query} filter={filter} sort={sort} />

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                category={c}
                userCoins={user?.coins || 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-muted/40 flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-semibold">No categories found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        <PaginationWithLinks
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
        />
      </section>
    </main>
  );
}
