import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { BadRequestError } from "@/lib/errors";

export const PUT = apiHandler(async (req, { params }, user) => {
  const { wordId } = await req.json();
  if (!wordId) {
    throw new BadRequestError("No wordId provided");
  }

  if (wordId) {
    const word = await prisma.word.findUnique({
      where: { id: wordId },
      select: { image: true },
    });
    if (!word?.image) {
      throw new BadRequestError("Word does not have an image");
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      backgroundWordId: wordId || null,
    },
  });

  return NextResponse.json({ success: true });
});
