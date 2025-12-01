import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { apiHandler } from "@/lib/apiHandler";
import { registerSchema } from "@/lib/validations/auth";
import { BadRequestError } from "@/lib/errors";

export const POST = apiHandler(
  async (req, { params }, user) => {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      throw new BadRequestError("Username already in use");
    }

    const passwordHash = await hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return NextResponse.json({ user: newUser });
  },
  { isPublic: true }
);
