import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";
import { createCategorySchema } from "@/lib/validations/categories";
import { BadRequestError } from "@/lib/errors";

export const DELETE = apiHandler(
  async (req, { params }, user) => {
    const { categoryId: id } = params;
    if (!id) throw new BadRequestError("Category ID is required");

    await prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  },
  { requiredRole: "ADMIN" },
);

export const PUT = apiHandler(
  async (req, { params }, user) => {
    const { categoryId: id } = params;
    if (!id) throw new BadRequestError("Category ID is required");

    const body = await req.json();
    const validatedData = createCategorySchema.parse(body);

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(category);
  },
  { requiredRole: "ADMIN" },
);
