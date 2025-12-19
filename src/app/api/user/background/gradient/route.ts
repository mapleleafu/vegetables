import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { BadRequestError } from "@/lib/errors";
import { updateGradientSchema} from "@/lib/validations/words";

export const PUT = apiHandler(async (req, { params }, user) => {
  const body = await req.json();

  const result = updateGradientSchema.safeParse(body);
  if (!result.success) {
    throw new BadRequestError(result.error.message);
  }

  const { gradient } = result.data;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      backgroundGradient: gradient,
    },
  });

  return NextResponse.json({ success: true });
});
