import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/apiHandler";
import { uploadFile } from "@/lib/storage";
import { BadRequestError, InternalServerError } from "@/lib/errors";

export const PUT = apiHandler(async (req, { params }, user) => {
  const formData = await req.formData();
  const targetLanguage = formData.get("targetLanguage") as any;
  const image = formData.get("image") as File | null;

  let imageUrl = undefined;

  if (image) {
    const filename = `${user.id}`;
    try {
      imageUrl = await uploadFile(image, filename, "images", "avatars");
    } catch (error) {
      console.error("Upload failed:", error);
      throw new BadRequestError("Image upload failed");
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        targetLanguage: targetLanguage || undefined,
        imageUrl: imageUrl || undefined,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    throw new InternalServerError("Database Error");
  }
});

export const GET = apiHandler(async (req, { params }, user) => {
  const userId = user.id;

  if (userId) {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json(profile);
  }
});
