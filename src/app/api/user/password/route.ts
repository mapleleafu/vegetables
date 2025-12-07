import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";
import { compare, hash } from "bcryptjs";
import { BadRequestError } from "@/lib/errors";
import { passwordChangeSchema } from "@/lib/validations/user";

export const PUT = apiHandler(async (req, { params }, user) => {
  const body = await req.json();
  const { currentPassword, newPassword } = passwordChangeSchema.parse(body);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser?.passwordHash) {
    throw new BadRequestError("User not found");
  }

  const isValid = await compare(currentPassword, dbUser.passwordHash);

  if (!isValid) {
    throw new BadRequestError("Incorrect current password");
  }

  const passwordHash = await hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ message: "Password updated successfully" });
});
