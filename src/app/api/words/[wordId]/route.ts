import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";
import { createWordSchema } from "@/lib/validations/words";
import { BadRequestError } from "@/lib/errors";

export const PUT = apiHandler(
  async (req, { params }, user) => {
    const { wordId: id } = params;
    if (!id) throw new BadRequestError("Word ID is required");

    const body = await req.json();
    const validatedData = createWordSchema.parse(body);
    const { translations, ...updateData } = validatedData as any;

    const word = await prisma.word.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(word);
  },
  { requiredRole: "ADMIN" },
);
