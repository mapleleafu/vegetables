import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async (req, { params }, user) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "0");
  const limit = parseInt(url.searchParams.get("limit") || "12");

  const skip = page * limit;

  const [words, total] = await Promise.all([
    prisma.word.findMany({
      where: {
        image: { not: null },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: { name: "asc" },
      take: limit,
      skip,
    }),
    prisma.word.count({
      where: {
        image: { not: null },
        isActive: true,
      },
    }),
  ]);

  return NextResponse.json({
    words,
    hasMore: skip + words.length < total,
  });
});
