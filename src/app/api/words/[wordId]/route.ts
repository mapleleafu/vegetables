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
    const { translations, ...updateData } = validatedData;

    const word = await prisma.$transaction(async (tx) => {
      const updatedWord = await tx.word.update({
        where: { id },
        data: updateData,
      });

      if (translations && translations.length > 0) {
        await tx.wordTranslation.deleteMany({
          where: { wordId: id },
        });

        await tx.wordTranslation.createMany({
          data: translations.map((t) => ({
            wordId: id,
            languageCode: t.languageCode,
            text: t.text,
            audioUrl: t.audioUrl || null,
          })),
        });
      }

      return updatedWord;
    });

    return NextResponse.json(word);
  },
  { requiredRole: "ADMIN" },
);
