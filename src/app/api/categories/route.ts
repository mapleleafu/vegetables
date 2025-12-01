import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { BadRequestError } from "@/lib/errors";

export const GET = apiHandler(async (req, { params }, user) => {
  const userId = user.id;
  const query: any = { orderBy: { name: "asc" } };

  if (userId) {
    query.include = {
      categoryProgress: { where: { userId } },
    };
  }

  const categories = await prisma.category.findMany(query);

  const data = categories.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    isUnlocked: c.categoryProgress?.[0]?.isUnlocked ?? false,
  }));

  return NextResponse.json(data);
});

export const POST = apiHandler(
  async (req, { params }, user) => {
    const body = await req.json();

    if (!body.name || !body.slug) {
      throw new BadRequestError("Name and Slug are required");
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        parentId: body.parentId || null,
        costCoins: body.costCoins || 0,
        maxCoinsPerUser: body.maxCoinsPerUser || 0,
      },
    });

    return NextResponse.json(category);
  },
  { requiredRole: "ADMIN" }
);
