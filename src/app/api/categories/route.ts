import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";
import { createCategorySchema } from "@/lib/validations/categories";

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
    const validatedData = createCategorySchema.parse(body);

    const category = await prisma.category.create({
      data: validatedData,
    });

    return NextResponse.json(category);
  },
  { requiredRole: "ADMIN" },
);
