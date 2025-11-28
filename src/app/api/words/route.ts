import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const categoryId = body.categoryId as string;
  const slug = body.slug as string;
  const imageUrl = (body.imageUrl as string | undefined) || null;
  const translations = body.translations as {
    languageCode: string;
    text: string;
    audioUrl?: string;
  }[];

  const coinValue = typeof body.coinValue === "number" ? body.coinValue : 1;
  const maxCoinsPerUser = typeof body.maxCoinsPerUser === "number" ? body.maxCoinsPerUser : 1;

  if (!categoryId || !slug || !translations || translations.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const word = await prisma.word.create({
    data: {
      categoryId,
      slug,
      imageUrl,
      coinValue,
      maxCoinsPerUser,
      translations: {
        create: translations.map(t => ({
          languageCode: t.languageCode,
          text: t.text,
          audioUrl: t.audioUrl || null,
        })),
      },
    },
    include: { translations: true },
  });

  return NextResponse.json(word);
}
