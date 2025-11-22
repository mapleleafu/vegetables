import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session && session.user ? ((session.user as any).id as string) : null;

  const query: any = {
    orderBy: { name: "asc" },
  };

  if (userId) {
    query.include = {
      categoryProgress: {
        where: { userId },
      },
    };
  }

  const categories = await prisma.category.findMany(query);

  const data = categories.map(c => {
    const progress = userId && (c as any).categoryProgress && (c as any).categoryProgress[0] ? (c as any).categoryProgress[0] : null;

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl,
      costCoins: c.costCoins,
      maxCoinsPerUser: c.maxCoinsPerUser,
      parentId: c.parentId,
      isUnlocked: progress ? progress.isUnlocked : false,
      coinsEarned: progress ? progress.coinsEarned : 0,
    };
  });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session && session.user ? ((session.user as any).id as string) : null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const name = body.name as string;
  const slug = body.slug as string;
  const imageUrl = body.imageUrl as string | undefined;
  const parentId = body.parentId as string | undefined;
  const costCoins = body.costCoins as number | undefined;
  const maxCoinsPerUser = body.maxCoinsPerUser as number | undefined;

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      imageUrl,
      parentId: parentId || null,
      costCoins: costCoins || 0,
      maxCoinsPerUser: maxCoinsPerUser || 0,
    },
  });

  return NextResponse.json(category);
}
