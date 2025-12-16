import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";
import { BadRequestError, InternalServerError } from "@/lib/errors";

export const POST = apiHandler(async (req, { params }, user) => {
  const body = await req.json();
  const { username } = body;

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!currentUser?.username) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      throw new BadRequestError("Username already taken");
    }
  } else {
    return NextResponse.json(currentUser);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { username },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    if ((error as any).code === "P2002") {
      throw new BadRequestError("Username already taken");
    }
    throw new InternalServerError("Database Error");
  }
});