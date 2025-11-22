import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const username = body.username;
  const password = body.password;

  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    return NextResponse.json({ error: "Username already in use" }, { status: 400 });
  }

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
    },
    select: {
      id: true,
      username: true,
    },
  });

  return NextResponse.json({ user });
}
