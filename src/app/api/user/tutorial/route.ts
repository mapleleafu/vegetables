import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UnauthorizedError, InternalServerError } from "@/lib/errors";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hasCompletedTutorial: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    throw new InternalServerError();
  }
}
