import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";
import { createWordSchema } from "@/lib/validations/words";

export const POST = apiHandler(
  async (req, { params }, user) => {
    const body = await req.json();
    const data = createWordSchema.parse(body);

    const word = await prisma.word.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        imageUrl: data.imageUrl || null,
        coinValue: data.coinValue,
        maxCoinsPerUser: data.maxCoinsPerUser,
        translations: {
          create: data.translations.map(t => ({
            languageCode: t.languageCode,
            text: t.text,
            audioUrl: t.audioUrl || null,
          })),
        },
      },
      include: { translations: true },
    });

    return NextResponse.json(word);
  },
  { requiredRole: "ADMIN" }
);
